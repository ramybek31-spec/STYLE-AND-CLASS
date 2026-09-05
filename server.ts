import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { getDb } from "./server/db";
import { productsRouter } from "./server/routes/products";
import { checkoutRouter } from "./server/routes/checkout";
import { paypalRouter } from "./server/routes/paypalRoutes";
import { adminRouter } from "./server/routes/adminRoutes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database on startup
  try {
    await getDb();
    console.log("[STYLE AND CLASS] SQLite database engine initialized successfully.");
  } catch (err) {
    console.error("[STYLE AND CLASS] Database initialization warning:", err);
  }

  // Middleware for body parsing and cookies
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // API Routes
  app.use("/api/products", productsRouter);
  app.use("/api/checkout", checkoutRouter);
  app.use("/api/paypal", paypalRouter);
  app.use("/api/webhooks/paypal", paypalRouter);
  app.use("/api/admin", adminRouter);

  // Store contact & WhatsApp configuration
  app.get("/api/config/contact", (req, res) => {
    const whatsappPhone =
      process.env.MANAGER_WHATSAPP_PHONE ||
      process.env.VITE_MANAGER_WHATSAPP_PHONE ||
      "+447591878215";
    res.json({
      whatsappPhone,
      email: process.env.MANAGER_EMAIL || "manager@styleandclass.co.uk"
    });
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      brand: "STYLE AND CLASS",
      store: "London UK",
      time: new Date().toISOString()
    });
  });

  // Vite Middleware for development vs Static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[STYLE AND CLASS] Storefront and management server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
  process.exit(1);
});
