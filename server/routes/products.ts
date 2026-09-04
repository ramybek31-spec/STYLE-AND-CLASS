import { Router, Request, Response } from "express";
import { getDb, persistDb } from "../db";
import { v4 as uuidv4 } from "uuid";

export const productsRouter = Router();

// GET /api/products - Get all active/available products for the storefront
productsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();

    // Clean up expired reservations
    db.run(`DELETE FROM reservations WHERE expires_at < '${now}';`);

    const { category, search, minPrice, maxPrice, condition, brand, includeSold } = req.query;

    let query = `
      SELECT p.id, p.sku, p.name, p.category, p.subcategory, p.brand, p.gender,
             p.size, p.condition, p.description, p.price, p.currency, p.main_image,
             p.additional_images, p.colour, p.material, p.measurements, p.tags,
             p.quantity, p.status, p.is_sold, p.created_at,
             (SELECT COUNT(*) FROM reservations r WHERE r.product_id = p.id AND r.expires_at > '${now}') as is_reserved
      FROM products p
      WHERE 1=1
    `;

    if (includeSold !== "true") {
      query += ` AND p.is_sold = 0 AND p.status != 'ARCHIVED'`;
    }

    if (category && typeof category === "string" && category !== "ALL") {
      query += ` AND UPPER(p.category) = '${category.toUpperCase().replace(/'/g, "''")}'`;
    }

    if (condition && typeof condition === "string") {
      query += ` AND p.condition LIKE '%${condition.replace(/'/g, "''")}%'`;
    }

    if (brand && typeof brand === "string") {
      query += ` AND UPPER(p.brand) = '${brand.toUpperCase().replace(/'/g, "''")}'`;
    }

    if (minPrice) {
      query += ` AND p.price >= ${Number(minPrice)}`;
    }

    if (maxPrice) {
      query += ` AND p.price <= ${Number(maxPrice)}`;
    }

    if (search && typeof search === "string" && search.trim()) {
      const s = search.toLowerCase().replace(/'/g, "''");
      query += ` AND (LOWER(p.name) LIKE '%${s}%' OR LOWER(p.brand) LIKE '%${s}%' OR LOWER(p.description) LIKE '%${s}%' OR LOWER(p.sku) LIKE '%${s}%')`;
    }

    query += ` ORDER BY p.is_sold ASC, p.created_at DESC;`;

    const result = db.exec(query);
    if (!result || !result[0]) {
      return res.json({ products: [] });
    }

    const columns = result[0].columns;
    const products = result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      obj.is_reserved = obj.is_reserved > 0;
      try {
        obj.additional_images = JSON.parse(obj.additional_images);
      } catch {
        obj.additional_images = [];
      }
      return obj;
    });

    res.json({ products });
  } catch (err: any) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// GET /api/products/:id - Single product view
productsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();

    const result = db.exec(`
      SELECT p.*,
             (SELECT COUNT(*) FROM reservations r WHERE r.product_id = p.id AND r.expires_at > '${now}') as is_reserved
      FROM products p
      WHERE p.id = '${req.params.id}' OR p.sku = '${req.params.id}';
    `);

    if (!result || !result[0] || !result[0].values[0]) {
      return res.status(404).json({ error: "Product not found" });
    }

    const columns = result[0].columns;
    const row = result[0].values[0];
    const product: any = {};
    columns.forEach((col, idx) => {
      product[col] = row[idx];
    });

    product.is_reserved = product.is_reserved > 0;
    try {
      product.additional_images = JSON.parse(product.additional_images);
    } catch {
      product.additional_images = [];
    }

    res.json({ product });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load product details" });
  }
});

// POST /api/products/:id/reserve - Hold 15-minute unique reservation
productsRouter.post("/:id/reserve", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    const sessionId = req.body.sessionId || uuidv4();
    const timeoutMinutes = 15;
    const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000).toISOString();

    // Clean expired reservations
    db.run(`DELETE FROM reservations WHERE expires_at < '${now}';`);

    // Verify item is not sold
    const checkSold = db.exec(`SELECT id, is_sold, status FROM products WHERE id = '${req.params.id}';`);
    if (!checkSold || !checkSold[0] || !checkSold[0].values[0]) {
      return res.status(404).json({ error: "Product not found." });
    }

    const isSold = checkSold[0].values[0][1] as number;
    if (isSold === 1) {
      return res.status(409).json({ error: "This unique item has already been sold." });
    }

    // Check if reserved by someone else
    const checkRes = db.exec(`
      SELECT id, session_id, expires_at 
      FROM reservations 
      WHERE product_id = '${req.params.id}' AND expires_at > '${now}';
    `);

    if (checkRes && checkRes[0] && checkRes[0].values[0]) {
      const activeSession = checkRes[0].values[0][1] as string;
      if (activeSession !== sessionId) {
        return res.status(409).json({
          error: "This unique piece is currently in another customer's checkout basket. Please check back in a few minutes."
        });
      }
    }

    // Upsert reservation
    const resId = `res-${uuidv4()}`;
    db.run(`DELETE FROM reservations WHERE product_id = '${req.params.id}' OR session_id = '${sessionId}';`);
    db.run(`
      INSERT INTO reservations (id, product_id, session_id, expires_at, created_at)
      VALUES ('${resId}', '${req.params.id}', '${sessionId}', '${expiresAt}', '${now}');
    `);

    persistDb();

    res.json({
      success: true,
      sessionId,
      expiresAt
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reserve item" });
  }
});

// DELETE /api/products/:id/reserve - Release reservation
productsRouter.delete("/:id/reserve", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { sessionId } = req.body;
    if (sessionId) {
      db.run(`DELETE FROM reservations WHERE product_id = '${req.params.id}' AND session_id = '${sessionId}';`);
    } else {
      db.run(`DELETE FROM reservations WHERE product_id = '${req.params.id}';`);
    }
    persistDb();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to release reservation" });
  }
});
