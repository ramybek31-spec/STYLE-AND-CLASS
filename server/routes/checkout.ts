import { Router, Request, Response } from "express";
import { getDb, persistDb } from "../db";
import { v4 as uuidv4 } from "uuid";

export const checkoutRouter = Router();

// Standard UK Postcode regex validation
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

// GET /api/checkout/shipping-rates - Retrieve active shipping methods and configurable rates
checkoutRouter.get("/shipping-rates", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT company, name, cost, estimated_days FROM shipping_rates WHERE active = 1 ORDER BY cost ASC;");
    if (!result || !result[0]) {
      return res.json({ rates: [] });
    }

    const columns = result[0].columns;
    const rates = result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    res.json({ rates });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch shipping rates" });
  }
});

// POST /api/checkout/validate-address - Sensible UK address validation
checkoutRouter.post("/validate-address", (req: Request, res: Response) => {
  const { customerName, customerPhone, customerEmail, streetAddress, city, postcode } = req.body;

  const errors: Record<string, string> = {};

  if (!customerName || customerName.trim().length < 2) {
    errors.customerName = "Full recipient name is required.";
  }
  if (!customerPhone || customerPhone.trim().length < 7) {
    errors.customerPhone = "A valid contact phone number is required for courier delivery updates.";
  }
  if (!customerEmail || !customerEmail.includes("@") || !customerEmail.includes(".")) {
    errors.customerEmail = "A valid email address is required for order confirmation.";
  }
  if (!streetAddress || streetAddress.trim().length < 3) {
    errors.streetAddress = "Street name and house/flat number is required.";
  }
  if (!city || city.trim().length < 2) {
    errors.city = "Town / City is required.";
  }
  if (!postcode || !UK_POSTCODE_REGEX.test(postcode.trim())) {
    errors.postcode = "Please enter a valid UK postcode (e.g. SW1A 1AA, EC1A 1BB, W1K 1DA).";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ isValid: false, errors });
  }

  res.json({ isValid: true });
});

// POST /api/checkout/initialize-order - Server-side order verification & creation
checkoutRouter.post("/initialize-order", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();

    const {
      productId,
      customerName,
      customerPhone,
      customerEmail,
      streetAddress,
      city,
      postcode,
      country = "United Kingdom",
      shippingCompany,
      sessionId = uuidv4()
    } = req.body;

    // 1. Verify item availability
    const prodRes = db.exec(`SELECT id, sku, name, price, is_sold, status, category, size, brand, condition, main_image FROM products WHERE id = '${productId}';`);
    if (!prodRes || !prodRes[0] || !prodRes[0].values[0]) {
      return res.status(404).json({ error: "Product not found" });
    }

    const prodRow = prodRes[0].values[0];
    const product = {
      id: prodRow[0] as string,
      sku: prodRow[1] as string,
      name: prodRow[2] as string,
      price: prodRow[3] as number,
      isSold: prodRow[4] as number,
      status: prodRow[5] as string,
      category: prodRow[6] as string,
      size: prodRow[7] as string,
      brand: prodRow[8] as string,
      condition: prodRow[9] as string,
      mainImage: prodRow[10] as string
    };

    if (product.isSold === 1 || product.status === "SOLD") {
      return res.status(409).json({ error: "This unique item has already been sold." });
    }

    // 2. Fetch server-controlled shipping rate
    const validCouriers = ["EVRI", "ROYAL_MAIL", "INPOST"];
    if (!shippingCompany || !validCouriers.includes(shippingCompany.toUpperCase())) {
      return res.status(400).json({ error: "Please select one of the supported UK couriers: Evri, Royal Mail, or InPost." });
    }

    const rateRes = db.exec(`SELECT cost, name FROM shipping_rates WHERE company = '${shippingCompany.toUpperCase()}';`);
    if (!rateRes || !rateRes[0] || !rateRes[0].values[0]) {
      return res.status(400).json({ error: "Selected courier rate is unavailable." });
    }

    const shippingCost = rateRes[0].values[0][0] as number;
    const shippingName = rateRes[0].values[0][1] as string;

    // 3. Calculate server-controlled total
    const productPrice = Number(product.price);
    const totalAmount = Math.round((productPrice + shippingCost) * 100) / 100;

    // 4. Create Order Record
    const orderId = `ord-${uuidv4()}`;
    // Format human-friendly order number, e.g. SC-82914
    const randDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SC-${randDigits}`;

    db.run(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_phone, customer_email,
        street_address, city, postcode, country, shipping_company,
        shipping_cost, product_price, total_amount, currency,
        payment_method, payment_status, fulfillment_status, qr_status,
        created_at, updated_at
      ) VALUES (
        '${orderId}', '${orderNumber}', '${customerName.replace(/'/g, "''")}',
        '${customerPhone.replace(/'/g, "''")}', '${customerEmail.replace(/'/g, "''")}',
        '${streetAddress.replace(/'/g, "''")}', '${city.replace(/'/g, "''")}',
        '${postcode.toUpperCase().replace(/'/g, "''")}', '${country.replace(/'/g, "''")}',
        '${shippingCompany.toUpperCase()}', ${shippingCost}, ${productPrice},
        ${totalAmount}, 'GBP', 'PENDING', 'PENDING', 'NEW', 'QR_PENDING',
        '${now}', '${now}'
      );
    `);

    // 5. Create Order Item snapshot
    const itemId = `item-${uuidv4()}`;
    const initialSnapshot = JSON.stringify(product);
    db.run(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name, sku, price,
        category, size, brand, condition, image_snapshot, snapshot_json
      ) VALUES (
        '${itemId}', '${orderId}', '${product.id}', '${product.name.replace(/'/g, "''")}',
        '${product.sku}', ${productPrice}, '${product.category}', '${product.size}',
        '${product.brand.replace(/'/g, "''")}', '${product.condition.replace(/'/g, "''")}',
        '${product.mainImage}', '${initialSnapshot.replace(/'/g, "''")}'
      );
    `);

    // 6. Hold reservation for 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    db.run(`DELETE FROM reservations WHERE product_id = '${product.id}';`);
    db.run(`
      INSERT INTO reservations (id, product_id, session_id, expires_at, created_at)
      VALUES ('res-${uuidv4()}', '${product.id}', '${sessionId}', '${expiresAt}', '${now}');
    `);

    persistDb();

    res.json({
      orderId,
      orderNumber,
      productPrice,
      shippingCost,
      shippingName,
      totalAmount,
      currency: "GBP",
      expiresAt
    });
  } catch (err: any) {
    console.error("Order initialization error:", err);
    res.status(500).json({ error: "Failed to initialize order." });
  }
});
