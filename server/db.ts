import initSqlJs, { Database as SqlDatabase } from "sql.js";
import fs from "fs";
import path from "path";

let dbInstance: SqlDatabase | null = null;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "store.sqlite");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function getDb(): Promise<SqlDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error("Failed to load existing SQLite database from disk, creating new:", err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  initSchema(dbInstance);
  persistDb();
  return dbInstance;
}

export function persistDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error("Error persisting SQLite database to disk:", err);
  }
}

function initSchema(db: SqlDatabase) {
  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      brand TEXT NOT NULL,
      gender TEXT NOT NULL,
      size TEXT NOT NULL,
      condition TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GBP',
      main_image TEXT NOT NULL,
      additional_images TEXT NOT NULL,
      colour TEXT NOT NULL,
      material TEXT NOT NULL,
      measurements TEXT NOT NULL,
      tags TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      is_sold INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Unique item reservations (prevents concurrent double purchases)
  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      street_address TEXT NOT NULL,
      city TEXT NOT NULL,
      postcode TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'United Kingdom',
      shipping_company TEXT NOT NULL,
      shipping_cost REAL NOT NULL,
      product_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GBP',
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PENDING',
      fulfillment_status TEXT NOT NULL DEFAULT 'NEW',
      paypal_order_id TEXT,
      paypal_capture_id TEXT,
      paypal_payer_id TEXT,
      qr_code_data TEXT,
      qr_status TEXT NOT NULL DEFAULT 'QR_PENDING',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Order items historical snapshot
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      size TEXT NOT NULL,
      brand TEXT NOT NULL,
      condition TEXT NOT NULL,
      image_snapshot TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    );
  `);

  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GBP',
      status TEXT NOT NULL,
      reference_id TEXT,
      capture_id TEXT,
      payment_method TEXT NOT NULL,
      raw_payload TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    );
  `);

  // Shipping rates (Configurable by admin)
  db.run(`
    CREATE TABLE IF NOT EXISTS shipping_rates (
      company TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cost REAL NOT NULL,
      estimated_days TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Notifications queue
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      attempts INTEGER NOT NULL DEFAULT 0,
      payload TEXT NOT NULL,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Audit logs
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  // Admin settings
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default shipping rates if empty
  const countRates = db.exec("SELECT COUNT(*) FROM shipping_rates");
  const numRates = countRates[0]?.values[0]?.[0] as number;
  if (!numRates || numRates === 0) {
    db.run(`
      INSERT INTO shipping_rates (company, name, cost, estimated_days, active)
      VALUES 
        ('EVRI', 'Evri Standard Tracked', 3.80, '2-3 Business Days', 1),
        ('ROYAL_MAIL', 'Royal Mail Signed For 1st Class', 4.95, '1-2 Business Days', 1),
        ('INPOST', 'InPost 24/7 Locker Delivery', 3.50, '2-3 Business Days', 1);
    `);
  }

  // Seed default products if empty
  const countProducts = db.exec("SELECT COUNT(*) FROM products");
  const numProducts = countProducts[0]?.values[0]?.[0] as number;
  if (!numProducts || numProducts === 0) {
    seedInitialProducts(db);
  }
}

function seedInitialProducts(db: SqlDatabase) {
  const sampleProducts = [
    {
      id: "prod-001",
      sku: "SC-W-BUR-001",
      name: "Burberry London Vintage Gabardine Trench Coat",
      category: "WOMEN",
      subcategory: "Coats & Outerwear",
      brand: "Burberry",
      gender: "Women",
      size: "UK 10 / EU 38",
      condition: "Excellent Vintage Condition",
      description: "Authentic double-breasted honey gabardine cotton trench coat featuring the iconic vintage Nova check lining, storm flap, horn buttons, and belted waist with brass D-rings. Inspected and professionally dry-cleaned in Mayfair, London.",
      price: 345.0,
      main_image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Honey Beige",
      material: "100% Gabardine Cotton, Cupro lining",
      measurements: "Pit-to-Pit: 19.5 in, Length: 42 in, Sleeve: 23 in",
      tags: "burberry,trench,vintage,luxury,london,designer"
    },
    {
      id: "prod-002",
      sku: "SC-M-BAR-002",
      name: "Barbour Beaufort Classic Waxed Cotton Jacket",
      category: "MEN",
      subcategory: "Jackets",
      brand: "Barbour",
      gender: "Men",
      size: "UK 40 / Medium",
      condition: "Very Good - Freshly Rewaxed",
      description: "Quintessential British countryside jacket in deep sage green waxed Sylkoil cotton. Features pure cotton tartan lining, corduroy collar with throat latch, chunky two-way brass zip, and rear game pocket. Rewaxed in South Shields.",
      price: 185.0,
      main_image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Sage Green",
      material: "Heavyweight 6oz Waxed Cotton",
      measurements: "Chest: 44 in, Length: 33 in, Raglan Sleeve: 32 in",
      tags: "barbour,waxed,jacket,heritage,british,classic"
    },
    {
      id: "prod-003",
      sku: "SC-A-MUL-003",
      name: "Mulberry Bayswater Oak Natural Leather Handbag",
      category: "ACCESSORIES",
      subcategory: "Bags",
      brand: "Mulberry",
      gender: "Unisex",
      size: "Classic / One Size",
      condition: "Pristine - Lightly Carried",
      description: "The timeless British Mulberry Bayswater crafted from exquisite Oak natural grain-tanned leather. Includes iconic Postman's Lock in soft gold hardware, hidden padlock in leather fob, internal zip pocket, and pristine suede interior.",
      price: 495.0,
      main_image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Oak Tan",
      material: "Natural Grain Vegetable Tanned Bovine Leather",
      measurements: "Height: 26.5 cm, Width: 36 cm, Depth: 16.5 cm, Handle Drop: 15.5 cm",
      tags: "mulberry,bayswater,handbag,leather,oak,london"
    },
    {
      id: "prod-004",
      sku: "SC-W-CASH-004",
      name: "Johnstons of Elgin 100% Cashmere Rollneck",
      category: "WOMEN",
      subcategory: "Knitwear",
      brand: "Johnstons of Elgin",
      gender: "Women",
      size: "UK 12 / Large",
      condition: "Excellent Condition",
      description: "Knit in Hawick, Scotland from the softest 2-ply Mongolian cashmere yarns. Ribbed rollneck collar, cuffs, and hem. Weightless luxury warmth in a rich heather oat shade.",
      price: 135.0,
      main_image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Heather Oat",
      material: "100% Pure Scottish Cashmere",
      measurements: "Pit-to-Pit: 21 in, Length: 25 in",
      tags: "cashmere,scotland,knitwear,luxury,winter"
    },
    {
      id: "prod-005",
      sku: "SC-K-RALPH-005",
      name: "Ralph Lauren Cable-Knit Wool-Cotton Jumper",
      category: "KIDS",
      subcategory: "Knitwear",
      brand: "Ralph Lauren",
      gender: "Kids",
      size: "Age 7-8 Years (128-134cm)",
      condition: "Very Good Pre-Loved",
      description: "Classic Polo Ralph Lauren crewneck cable-knit sweater in navy blue with contrast signature embroidered pony in crimson red on the left chest. Thick, durable knit perfect for smart weekend outings.",
      price: 38.0,
      main_image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Navy Blue",
      material: "80% Cotton, 20% Merino Wool",
      measurements: "Chest: 16 in across, Length: 20 in",
      tags: "ralph lauren,kids,cable knit,polo,navy"
    },
    {
      id: "prod-006",
      sku: "SC-M-GIEV-006",
      name: "Gieves & Hawkes Savile Row Pure Wool Navy Blazer",
      category: "MEN",
      subcategory: "Tailoring",
      brand: "Gieves & Hawkes",
      gender: "Men",
      size: "UK 42R",
      condition: "Pristine Savile Row Tailoring",
      description: "Hand-finished tailored two-button blazer crafted at No. 1 Savile Row, London. Midnight navy Super 130s wool with genuine mother-of-pearl crested buttons, double rear vents, and full cupro lining.",
      price: 275.0,
      main_image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Midnight Navy",
      material: "100% Super 130s Pure Virgin Wool",
      measurements: "Shoulders: 18.5 in, Chest: 43 in, Length: 31 in, Sleeve: 25.5 in",
      tags: "savile row,gieves & hawkes,blazer,tailoring,suit"
    },
    {
      id: "prod-007",
      sku: "SC-W-ZIM-007",
      name: "Zimmermann Tiered Floral Silk Georgette Midi Dress",
      category: "WOMEN",
      subcategory: "Dresses",
      brand: "Zimmermann",
      gender: "Women",
      size: "UK 8 (Zimmermann Size 1)",
      condition: "Like New Without Tags",
      description: "Romantic printed silk georgette dress with blouson sleeves, elasticated cuffs, delicate picot edging, and self-tie waist belt. Worn once to a Chelsea wedding.",
      price: 320.0,
      main_image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Dusty Rose & Sage Floral",
      material: "100% Silk with detachable viscose slip",
      measurements: "Bust: 34 in, Waist: 27-29 in (adjustable), Length: 48 in",
      tags: "zimmermann,silk,dress,floral,occasion"
    },
    {
      id: "prod-008",
      sku: "SC-A-CHUR-008",
      name: "Church's Shannon Polished Calf Derby Shoes",
      category: "ACCESSORIES",
      subcategory: "Footwear",
      brand: "Church's",
      gender: "Men",
      size: "UK 9 / EU 43",
      condition: "Very Good - Goodyear Welted",
      description: "Classic English handcrafted wholecut derby shoes made in Northampton, England. Polished binder finish in deep burgundy cordovan hue, blind eyelets, Goodyear welted double leather sole with rubber storm welt.",
      price: 260.0,
      main_image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Burgundy / Dark Cherry",
      material: "Polished Calfskin Leather",
      measurements: "Outsole Length: 31.5 cm, Width: 11 cm",
      tags: "church's,shoes,derby,northampton,oxford,footwear"
    },
    {
      id: "prod-009",
      sku: "SC-K-BON-009",
      name: "Bonpoint Paris Embroidered Smocked Liberty Dress",
      category: "KIDS",
      subcategory: "Dresses",
      brand: "Bonpoint",
      gender: "Kids",
      size: "Age 5-6 Years",
      condition: "Pristine Pre-Loved",
      description: "Exquisite French couture childrenswear piece in genuine Liberty of London Tana Lawn cotton. Hand-smocked yoke with delicate floral embroidery and mother-of-pearl buttons along back.",
      price: 65.0,
      main_image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Powder Blue & White",
      material: "100% Liberty Tana Lawn Cotton",
      measurements: "Chest: 14 in, Length: 24 in",
      tags: "bonpoint,kids,liberty,dress,paris,smocked"
    },
    {
      id: "prod-010",
      sku: "SC-A-HERM-010",
      name: "Hermès Vintage 'Grand Apparat' Silk Carré 90",
      category: "ACCESSORIES",
      subcategory: "Scarves",
      brand: "Hermès Paris",
      gender: "Unisex",
      size: "90cm x 90cm",
      condition: "Excellent Vintage Condition",
      description: "Authentic Hermès Paris silk twill scarf designed by Jacques Eudel in 1962. Depicts imperial equestrian livery in royal navy, gold, and ivory with plump hand-rolled edges intact.",
      price: 295.0,
      main_image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80",
      additional_images: JSON.stringify([
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80"
      ]),
      colour: "Navy, Gold & Ivory",
      material: "100% Silk Twill with Hand-rolled Hem",
      measurements: "90 cm x 90 cm (35.5 in x 35.5 in)",
      tags: "hermes,silk,scarf,vintage,paris,equestrian"
    }
  ];

  const now = new Date().toISOString();
  const insertSql = `
    INSERT INTO products (
      id, sku, name, category, subcategory, brand, gender, size,
      condition, description, price, currency, main_image, additional_images,
      colour, material, measurements, tags, quantity, status, is_sold,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GBP', ?, ?, ?, ?, ?, ?, 1, 'AVAILABLE', 0, ?, ?);
  `;

  for (const p of sampleProducts) {
    db.run(insertSql, [
      p.id,
      p.sku,
      p.name,
      p.category,
      p.subcategory,
      p.brand,
      p.gender,
      p.size,
      p.condition,
      p.description,
      p.price,
      p.main_image,
      p.additional_images,
      p.colour,
      p.material,
      p.measurements,
      p.tags,
      now,
      now
    ]);
  }
}
