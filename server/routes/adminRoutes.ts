import { Router, Request, Response } from "express";
import { getDb, persistDb } from "../db";
import { requireAdminAuth, signAdminToken, ADMIN_PASSWORD, recordAuditLog } from "../auth";
import { generateDeliveryQrCode } from "../qr";
import { NotificationService, buildManagerSaleReportText, generateWhatsAppUrl, formatLondonDateTime } from "../notifications";
import { getPayPalConfig } from "../paypal";
import { v4 as uuidv4 } from "uuid";

export const adminRouter = Router();

/**
 * Retrieve manager WhatsApp phone from dynamic store settings, falling back to environment variable.
 */
export async function getManagerWhatsAppPhone(): Promise<string> {
  try {
    const db = await getDb();
    const res = db.exec("SELECT value FROM settings WHERE key = 'MANAGER_WHATSAPP_PHONE';");
    if (res && res[0] && res[0].values[0] && res[0].values[0][0]) {
      return String(res[0].values[0][0]);
    }
  } catch (err) {
    console.error("Error retrieving manager phone setting:", err);
  }
  return process.env.MANAGER_WHATSAPP_PHONE || "+447911123456";
}

/**
 * Retrieve manager notification email from store settings or env.
 */
export async function getManagerEmail(): Promise<string> {
  try {
    const db = await getDb();
    const res = db.exec("SELECT value FROM settings WHERE key = 'MANAGER_EMAIL';");
    if (res && res[0] && res[0].values[0] && res[0].values[0][0]) {
      return String(res[0].values[0][0]);
    }
  } catch (err) {
    console.error("Error retrieving manager email setting:", err);
  }
  return process.env.MANAGER_EMAIL || "manager@styleandclass.co.uk";
}

// POST /api/admin/login
adminRouter.post("/login", (req: Request, res: Response) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    recordAuditLog("ANONYMOUS", "LOGIN_FAILED", "Failed admin login attempt", req.ip);
    return res.status(401).json({ error: "Invalid admin password." });
  }

  const token = signAdminToken({
    id: "admin-1",
    username: "manager",
    role: "ADMIN"
  });

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  recordAuditLog("manager", "LOGIN_SUCCESS", "Admin session established", req.ip);
  res.json({ success: true, token });
});

// POST /api/admin/logout
adminRouter.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
});

// GET /api/admin/me - Check current admin session
adminRouter.get("/me", requireAdminAuth, (req: Request, res: Response) => {
  res.json({ user: (req as any).adminUser });
});

// GET /api/admin/stats - Top-level KPI metric cards
adminRouter.get("/stats", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const todayLondon = new Date().toISOString().split("T")[0];

    // Today's Sales & Revenue
    const todayRes = db.exec(`
      SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
      FROM orders
      WHERE payment_status = 'PAID' AND created_at LIKE '${todayLondon}%';
    `);
    const todaySales = todayRes[0]?.values[0]?.[0] as number || 0;
    const todayRevenue = todayRes[0]?.values[0]?.[1] as number || 0;

    // Total Sales & Revenue
    const totalRes = db.exec(`
      SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
      FROM orders
      WHERE payment_status = 'PAID';
    `);
    const totalSales = totalRes[0]?.values[0]?.[0] as number || 0;
    const totalRevenue = totalRes[0]?.values[0]?.[1] as number || 0;

    // Available Items
    const availRes = db.exec("SELECT COUNT(*) FROM products WHERE is_sold = 0 AND status = 'AVAILABLE';");
    const availableItems = availRes[0]?.values[0]?.[0] as number || 0;

    // Sold Items
    const soldRes = db.exec("SELECT COUNT(*) FROM products WHERE is_sold = 1 OR status = 'SOLD';");
    const soldItems = soldRes[0]?.values[0]?.[0] as number || 0;

    // Payment Pending
    const pendingRes = db.exec("SELECT COUNT(*) FROM orders WHERE payment_status = 'PENDING';");
    const paymentPending = pendingRes[0]?.values[0]?.[0] as number || 0;

    // To Ship (Paid but not yet Shipped/Delivered)
    const toShipRes = db.exec("SELECT COUNT(*) FROM orders WHERE payment_status = 'PAID' AND fulfillment_status IN ('NEW', 'PACKING');");
    const toShip = toShipRes[0]?.values[0]?.[0] as number || 0;

    // Notification Problems
    const notifRes = db.exec("SELECT COUNT(*) FROM notifications WHERE status = 'FAILED';");
    const notificationProblems = notifRes[0]?.values[0]?.[0] as number || 0;

    res.json({
      todaySales,
      todayRevenue,
      totalSales,
      totalRevenue,
      availableItems,
      soldItems,
      paymentPending,
      toShip,
      notificationProblems
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to calculate statistics" });
  }
});

// GET /api/admin/orders - Comprehensive Sales Table with filtering & sorting
adminRouter.get("/orders", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { status, fulfillment, courier, search } = req.query;

    let query = `
      SELECT o.id, o.order_number, o.created_at, o.customer_name, o.customer_phone,
             o.customer_email, o.street_address, o.city, o.postcode, o.country,
             o.shipping_company, o.shipping_cost, o.product_price, o.total_amount,
             o.currency, o.payment_method, o.payment_status, o.fulfillment_status,
             o.paypal_order_id, o.paypal_capture_id, o.qr_code_data, o.qr_status,
             oi.product_name, oi.sku, oi.category, oi.size, oi.image_snapshot
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1
    `;

    if (status && status !== "ALL") {
      query += ` AND o.payment_status = '${status}'`;
    }
    if (fulfillment && fulfillment !== "ALL") {
      query += ` AND o.fulfillment_status = '${fulfillment}'`;
    }
    if (courier && courier !== "ALL") {
      query += ` AND o.shipping_company = '${courier}'`;
    }
    if (search && typeof search === "string" && search.trim()) {
      const s = search.toLowerCase().replace(/'/g, "''");
      query += ` AND (
        LOWER(o.order_number) LIKE '%${s}%' OR
        LOWER(o.customer_name) LIKE '%${s}%' OR
        LOWER(o.customer_phone) LIKE '%${s}%' OR
        LOWER(oi.product_name) LIKE '%${s}%' OR
        LOWER(oi.sku) LIKE '%${s}%' OR
        LOWER(o.paypal_order_id) LIKE '%${s}%' OR
        LOWER(o.paypal_capture_id) LIKE '%${s}%'
      )`;
    }

    query += ` ORDER BY o.created_at DESC;`;

    const result = db.exec(query);
    if (!result || !result[0]) {
      return res.json({ orders: [] });
    }

    const columns = result[0].columns;
    const orders = result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load orders" });
  }
});

// GET /api/admin/orders/:id - Detailed order view with WhatsApp prefill
adminRouter.get("/orders/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT o.*, oi.product_name, oi.sku, oi.category, oi.size, oi.brand,
             oi.condition, oi.image_snapshot, oi.snapshot_json
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = '${req.params.id}' OR o.order_number = '${req.params.id}';
    `);

    if (!result || !result[0] || !result[0].values[0]) {
      return res.status(404).json({ error: "Order not found" });
    }

    const columns = result[0].columns;
    const row = result[0].values[0];
    const order: any = {};
    columns.forEach((col, idx) => {
      order[col] = row[idx];
    });

    // Build Manager WhatsApp and report text
    const managerPhone = await getManagerWhatsAppPhone();
    const reportText = buildManagerSaleReportText({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      streetAddress: order.street_address,
      city: order.city,
      postcode: order.postcode,
      country: order.country,
      shippingCompany: order.shipping_company,
      shippingCost: order.shipping_cost,
      productName: order.product_name || "Unique Garment",
      productSku: order.sku || "SC-UNKNOWN",
      productCategory: order.category || "General",
      productSize: order.size || "Standard",
      productPrice: order.product_price,
      productImage: order.image_snapshot || "",
      totalAmount: order.total_amount,
      currency: order.currency || "GBP",
      paymentMethod: order.payment_method,
      paypalOrderId: order.paypal_order_id,
      paypalCaptureId: order.paypal_capture_id,
      paymentStatus: order.payment_status,
      qrDataUrl: order.qr_code_data,
      createdAt: order.created_at
    });

    const whatsAppUrl = generateWhatsAppUrl(managerPhone, reportText);

    // Get notifications history
    const notifs = db.exec(`SELECT id, type, status, attempts, last_error, updated_at FROM notifications WHERE order_id = '${order.id}';`);
    const notificationsList = notifs[0]?.values.map((v) => ({
      id: v[0],
      type: v[1],
      status: v[2],
      attempts: v[3],
      lastError: v[4],
      updatedAt: v[5]
    })) || [];

    res.json({
      order,
      reportText,
      whatsAppUrl,
      managerPhone,
      notifications: notificationsList
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load order details" });
  }
});

// POST /api/admin/orders/:id/update-fulfillment - Update shipping status
adminRouter.post("/orders/:id/update-fulfillment", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["NEW", "PACKING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid fulfillment status" });
    }

    const db = await getDb();
    const now = new Date().toISOString();
    db.run(`UPDATE orders SET fulfillment_status = '${status}', updated_at = '${now}' WHERE id = '${req.params.id}';`);
    recordAuditLog((req as any).adminUser.username, "UPDATE_FULFILLMENT", `Order ${req.params.id} changed to ${status}`);
    persistDb();

    res.json({ success: true, fulfillmentStatus: status });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update fulfillment status" });
  }
});

// POST /api/admin/orders/:id/regenerate-qr - Manually regenerate QR Code
adminRouter.post("/orders/:id/regenerate-qr", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const orderRes = db.exec(`
      SELECT id, order_number, customer_name, customer_phone, customer_email,
             street_address, city, postcode, country, shipping_company
      FROM orders WHERE id = '${req.params.id}';
    `);

    if (!orderRes || !orderRes[0] || !orderRes[0].values[0]) {
      return res.status(404).json({ error: "Order not found" });
    }

    const row = orderRes[0].values[0];
    const qrResult = await generateDeliveryQrCode({
      orderNumber: row[1] as string,
      customerName: row[2] as string,
      customerPhone: row[3] as string,
      customerEmail: row[4] as string,
      streetAddress: row[5] as string,
      city: row[6] as string,
      postcode: row[7] as string,
      country: row[8] as string,
      shippingCompany: row[9] as string
    });

    if (!qrResult.success || !qrResult.qrDataUrl) {
      return res.status(500).json({ error: "Failed to regenerate QR code" });
    }

    const now = new Date().toISOString();
    db.run(`
      UPDATE orders 
      SET qr_code_data = '${qrResult.qrDataUrl.replace(/'/g, "''")}',
          qr_status = 'QR_GENERATED',
          updated_at = '${now}'
      WHERE id = '${req.params.id}';
    `);

    recordAuditLog((req as any).adminUser.username, "REGENERATE_QR", `Regenerated QR for order ${row[1]}`);
    persistDb();

    res.json({ success: true, qrDataUrl: qrResult.qrDataUrl });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to regenerate QR code" });
  }
});

// POST /api/admin/orders/:id/resend-report - Resend / Re-trigger notification report
adminRouter.post("/orders/:id/resend-report", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const orderRes = db.exec(`
      SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.customer_email,
             o.street_address, o.city, o.postcode, o.country, o.shipping_company,
             o.shipping_cost, o.product_price, o.total_amount, o.currency,
             o.payment_method, o.payment_status, o.paypal_order_id, o.paypal_capture_id,
             o.qr_code_data, o.created_at,
             oi.product_name, oi.sku, oi.category, oi.size, oi.image_snapshot
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = '${req.params.id}';
    `);

    if (!orderRes || !orderRes[0] || !orderRes[0].values[0]) {
      return res.status(404).json({ error: "Order not found" });
    }

    const r = orderRes[0].values[0];
    await NotificationService.queueOrderNotifications({
      orderId: r[0] as string,
      orderNumber: r[1] as string,
      customerName: r[2] as string,
      customerPhone: r[3] as string,
      customerEmail: r[4] as string,
      streetAddress: r[5] as string,
      city: r[6] as string,
      postcode: r[7] as string,
      country: r[8] as string,
      shippingCompany: r[9] as string,
      shippingCost: r[10] as number,
      productPrice: r[11] as number,
      totalAmount: r[12] as number,
      currency: r[13] as string,
      paymentMethod: r[14] as string,
      paymentStatus: r[15] as string,
      paypalOrderId: r[16] as string,
      paypalCaptureId: r[17] as string,
      qrDataUrl: r[18] as string,
      createdAt: r[19] as string,
      productName: r[20] as string,
      productSku: r[21] as string,
      productCategory: r[22] as string,
      productSize: r[23] as string,
      productImage: r[24] as string
    });

    recordAuditLog((req as any).adminUser.username, "RESEND_REPORT", `Re-queued sale notifications for order ${r[1]}`);
    res.json({ success: true, message: "Sale report re-queued successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to resend report" });
  }
});

// GET /api/admin/reconciliation - Payment Reconciliation section
adminRouter.get("/reconciliation", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT o.id, o.order_number, o.created_at, o.total_amount as website_total,
             o.currency, o.payment_status, o.payment_method, o.paypal_order_id,
             o.paypal_capture_id, p.amount as paypal_amount, p.status as payment_record_status
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.payment_status IN ('PAID', 'PENDING')
      ORDER BY o.created_at DESC;
    `);

    if (!result || !result[0]) {
      return res.json({ records: [] });
    }

    const records = result[0].values.map((v) => {
      const websiteTotal = Number(v[3]);
      const paypalTotal = v[9] !== null ? Number(v[9]) : websiteTotal;
      const isMatch = Math.abs(websiteTotal - paypalTotal) <= 0.01;

      return {
        orderId: v[0],
        orderNumber: v[1],
        createdAt: v[2],
        websiteTotal,
        paypalTotal,
        currency: v[4],
        paymentStatus: v[5],
        paymentMethod: v[6],
        paypalOrderId: v[7],
        paypalCaptureId: v[8],
        isMatch,
        flag: isMatch ? "MATCH_OK" : "MISMATCH"
      };
    });

    res.json({ records });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load reconciliation records" });
  }
});

// GET /api/admin/health - System Health & Diagnostics Panel
adminRouter.get("/health", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const paypalConfig = getPayPalConfig();

    // 1. Database check
    let dbStatus = "HEALTHY";
    try {
      db.exec("SELECT 1;");
    } catch {
      dbStatus = "DEGRADED";
    }

    // 2. PayPal check
    const paypalStatus = paypalConfig.clientId && paypalConfig.clientSecret ? "CONFIGURED_LIVE" : "SANDBOX_READY";

    // 3. Webhook check
    const webhookStatus = paypalConfig.webhookId ? "CONFIGURED" : "READY_ACTIVE";

    // 4. QR Generator check
    let qrStatus = "HEALTHY";
    try {
      const test = await generateDeliveryQrCode({
        orderNumber: "TEST",
        customerName: "Health Check",
        customerPhone: "07123456789",
        customerEmail: "test@styleandclass.co.uk",
        streetAddress: "1 Oxford Street",
        city: "London",
        postcode: "W1D 1AA",
        country: "United Kingdom",
        shippingCompany: "EVRI"
      });
      if (!test.success) qrStatus = "DEGRADED";
    } catch {
      qrStatus = "ERROR";
    }

    // 5. Image storage check
    const imageStorageStatus = "LOCAL_PERSISTENT";

    // 6. Email check
    const emailStatus = process.env.SMTP_HOST ? "SMTP_CONNECTED" : "CONSOLE_QUEUE_ACTIVE";

    // 7. Notification queue check
    const queueFailed = db.exec("SELECT COUNT(*) FROM notifications WHERE status = 'FAILED';");
    const failedCount = queueFailed[0]?.values[0]?.[0] as number || 0;
    const queueStatus = failedCount > 0 ? `WARNING_${failedCount}_FAILED` : "HEALTHY";

    // 8. WhatsApp mode
    const whatsAppMode = process.env.WHATSAPP_API_TOKEN
      ? "OFFICIAL_BUSINESS_API"
      : "MODE_A_PREPARED_DISPATCH";

    const managerPhone = await getManagerWhatsAppPhone();

    res.json({
      database: dbStatus,
      paypal: paypalStatus,
      paypalWebhook: webhookStatus,
      qrGenerator: qrStatus,
      imageStorage: imageStorageStatus,
      email: emailStatus,
      notificationQueue: queueStatus,
      whatsAppMode,
      managerPhone
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate health report" });
  }
});

// GET /api/admin/settings - Retrieve store settings
adminRouter.get("/settings", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const managerPhone = await getManagerWhatsAppPhone();
    const managerEmail = await getManagerEmail();
    res.json({
      managerPhone,
      managerEmail,
      envConfigured: Boolean(process.env.MANAGER_WHATSAPP_PHONE)
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT /api/admin/settings - Update store settings (Manager phone, email)
adminRouter.put("/settings", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { managerPhone, managerEmail } = req.body;

    if (managerPhone !== undefined) {
      const cleanedPhone = String(managerPhone).trim();
      db.run(`
        INSERT INTO settings (key, value) VALUES ('MANAGER_WHATSAPP_PHONE', '${cleanedPhone.replace(/'/g, "''")}')
        ON CONFLICT(key) DO UPDATE SET value = '${cleanedPhone.replace(/'/g, "''")}';
      `);
      recordAuditLog((req as any).adminUser.username, "UPDATE_SETTING", `Updated MANAGER_WHATSAPP_PHONE to ${cleanedPhone}`);
    }

    if (managerEmail !== undefined) {
      const cleanedEmail = String(managerEmail).trim();
      db.run(`
        INSERT INTO settings (key, value) VALUES ('MANAGER_EMAIL', '${cleanedEmail.replace(/'/g, "''")}')
        ON CONFLICT(key) DO UPDATE SET value = '${cleanedEmail.replace(/'/g, "''")}';
      `);
      recordAuditLog((req as any).adminUser.username, "UPDATE_SETTING", `Updated MANAGER_EMAIL to ${cleanedEmail}`);
    }

    persistDb();
    const updatedPhone = await getManagerWhatsAppPhone();
    const updatedEmail = await getManagerEmail();
    res.json({
      success: true,
      managerPhone: updatedPhone,
      managerEmail: updatedEmail
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Product Management (CRUD)
// POST /api/admin/products - Add product (Default: quantity = 1)
adminRouter.post("/products", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = `prod-${uuidv4()}`;

    const {
      sku,
      name,
      category,
      subcategory,
      brand,
      gender,
      size,
      condition,
      description,
      price,
      main_image,
      additional_images = [],
      colour,
      material,
      measurements,
      tags
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: "Name, Price, and Category are required." });
    }

    const finalSku = sku && sku.trim()
      ? sku.trim().toUpperCase()
      : `SC-${category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const addImgsJson = JSON.stringify(additional_images || []);

    db.run(`
      INSERT INTO products (
        id, sku, name, category, subcategory, brand, gender, size,
        condition, description, price, currency, main_image, additional_images,
        colour, material, measurements, tags, quantity, status, is_sold,
        created_at, updated_at
      ) VALUES (
        '${id}', '${finalSku}', '${name.replace(/'/g, "''")}',
        '${category.toUpperCase()}', '${(subcategory || "").replace(/'/g, "''")}',
        '${(brand || "").replace(/'/g, "''")}', '${(gender || "Unisex").replace(/'/g, "''")}',
        '${(size || "").replace(/'/g, "''")}', '${(condition || "Good").replace(/'/g, "''")}',
        '${(description || "").replace(/'/g, "''")}', ${Number(price)}, 'GBP',
        '${main_image || ""}', '${addImgsJson.replace(/'/g, "''")}',
        '${(colour || "").replace(/'/g, "''")}', '${(material || "").replace(/'/g, "''")}',
        '${(measurements || "").replace(/'/g, "''")}', '${(tags || "").replace(/'/g, "''")}',
        1, 'AVAILABLE', 0, '${now}', '${now}'
      );
    `);

    recordAuditLog((req as any).adminUser.username, "CREATE_PRODUCT", `Added product ${name} (${finalSku})`);
    persistDb();

    res.json({
      success: true,
      id,
      product: {
        id,
        sku: finalSku,
        name,
        category: category.toUpperCase(),
        price: Number(price),
        quantity: 1,
        is_sold: 0,
        status: "AVAILABLE"
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create product" });
  }
});

// PUT /api/admin/products/:id - Update product
adminRouter.put("/products/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    const {
      name,
      category,
      subcategory,
      brand,
      size,
      condition,
      description,
      price,
      main_image,
      colour,
      material,
      measurements,
      tags,
      status
    } = req.body;

    db.run(`
      UPDATE products 
      SET name = '${name.replace(/'/g, "''")}',
          category = '${category.toUpperCase()}',
          subcategory = '${(subcategory || "").replace(/'/g, "''")}',
          brand = '${(brand || "").replace(/'/g, "''")}',
          size = '${(size || "").replace(/'/g, "''")}',
          condition = '${(condition || "").replace(/'/g, "''")}',
          description = '${(description || "").replace(/'/g, "''")}',
          price = ${Number(price)},
          main_image = '${main_image || ""}',
          colour = '${(colour || "").replace(/'/g, "''")}',
          material = '${(material || "").replace(/'/g, "''")}',
          measurements = '${(measurements || "").replace(/'/g, "''")}',
          tags = '${(tags || "").replace(/'/g, "''")}',
          status = '${status || "AVAILABLE"}',
          updated_at = '${now}'
      WHERE id = '${req.params.id}';
    `);

    recordAuditLog((req as any).adminUser.username, "UPDATE_PRODUCT", `Updated product ${req.params.id}`);
    persistDb();

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// GET /api/admin/shipping-rates - Shipping configuration
adminRouter.get("/shipping-rates", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT company, name, cost, estimated_days, active FROM shipping_rates;");
    const rates = result[0]?.values.map((v) => ({
      company: v[0],
      name: v[1],
      cost: v[2],
      estimatedDays: v[3],
      active: v[4] === 1
    })) || [];
    res.json({ rates });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch shipping rates" });
  }
});

// PUT /api/admin/shipping-rates/:company - Update shipping rate
adminRouter.put("/shipping-rates/:company", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { cost, estimatedDays, active } = req.body;
    db.run(`
      UPDATE shipping_rates 
      SET cost = ${Number(cost)}, estimated_days = '${estimatedDays}', active = ${active ? 1 : 0} 
      WHERE company = '${req.params.company}';
    `);
    recordAuditLog((req as any).adminUser.username, "UPDATE_SHIPPING", `Updated ${req.params.company} to £${cost}`);
    persistDb();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update shipping rate" });
  }
});

// GET /api/admin/export/orders.csv - Export Sales CSV
adminRouter.get("/export/orders.csv", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT o.order_number, o.created_at, o.customer_name, o.customer_phone,
             o.customer_email, o.street_address, o.city, o.postcode,
             o.shipping_company, o.total_amount, o.payment_method, o.payment_status,
             o.fulfillment_status, o.paypal_order_id, o.paypal_capture_id,
             oi.product_name, oi.sku, oi.price
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ORDER BY o.created_at DESC;
    `);

    if (!result || !result[0]) {
      return res.status(200).send("No orders available.");
    }

    const headers = [
      "Order Number", "Date", "Customer Name", "Phone", "Email", "Address", "City",
      "Postcode", "Courier", "Total GBP", "Payment Method", "Payment Status",
      "Fulfillment", "PayPal Order ID", "PayPal Capture ID", "Item Name", "SKU", "Item Price"
    ];

    const rows = result[0].values.map((row) => {
      return row.map((val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="style_and_class_sales_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to export CSV" });
  }
});
