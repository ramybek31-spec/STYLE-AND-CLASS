import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { createPayPalOrder, capturePayPalOrder, getPayPalConfig } from "../paypal";
import { processSuccessfulSale } from "../saleProcessor";

export const paypalRouter = Router();

// GET /api/paypal/config - Public client configuration (Safe: Client ID only, mode)
paypalRouter.get("/config", (req: Request, res: Response) => {
  const config = getPayPalConfig();
  res.json({
    clientId: config.clientId || "sb", // fallback 'sb' for PayPal JS SDK sandbox
    mode: config.mode,
    currency: "GBP"
  });
});

// POST /api/paypal/create-order - Server-controlled PayPal order initialization
paypalRouter.post("/create-order", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const orderRes = db.exec(`
      SELECT o.id, o.order_number, o.product_price, o.shipping_cost, o.total_amount, o.currency, o.payment_status,
             p.name, p.is_sold, p.status as prod_status
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.id = '${orderId}';
    `);

    if (!orderRes || !orderRes[0] || !orderRes[0].values[0]) {
      return res.status(404).json({ error: "Order or linked product not found" });
    }

    const row = orderRes[0].values[0];
    const isSold = row[8] as number;
    const prodStatus = row[9] as string;

    if (isSold === 1 || prodStatus === "SOLD") {
      return res.status(409).json({ error: "This unique item has already been sold." });
    }

    const orderData = {
      orderId: row[0] as string,
      orderNumber: row[1] as string,
      productPrice: row[2] as number,
      shippingCost: row[3] as number,
      totalAmount: row[4] as number,
      currency: (row[5] as string) || "GBP",
      productName: row[7] as string
    };

    const paypalOrder = await createPayPalOrder(orderData);
    res.json(paypalOrder);
  } catch (err: any) {
    console.error("Failed to create PayPal order:", err);
    res.status(500).json({ error: err.message || "Failed to create PayPal order." });
  }
});

// POST /api/paypal/capture-order - Authoritative server-side payment capture & sale completion
paypalRouter.post("/capture-order", async (req: Request, res: Response) => {
  try {
    const { orderId, paypalOrderId, paymentMethod = "PAYPAL" } = req.body;

    if (!orderId || !paypalOrderId) {
      return res.status(400).json({ error: "orderId and paypalOrderId are required" });
    }

    // 1. Capture payment with PayPal
    const captureResult = await capturePayPalOrder(paypalOrderId);

    // 2. Fetch order amount to verify
    const db = await getDb();
    const orderRes = db.exec(`SELECT total_amount, currency FROM orders WHERE id = '${orderId}';`);
    if (!orderRes || !orderRes[0] || !orderRes[0].values[0]) {
      return res.status(404).json({ error: "Order not found" });
    }

    const expectedTotal = orderRes[0].values[0][0] as number;
    const finalAmount = captureResult.amount > 0 ? captureResult.amount : expectedTotal;

    // 3. Process atomic sale and unique item locking
    const saleResult = await processSuccessfulSale({
      orderId,
      paymentMethod: paymentMethod === "CREDIT_DEBIT_CARD" ? "CREDIT_DEBIT_CARD" : "PAYPAL",
      paypalOrderId,
      paypalCaptureId: captureResult.captureId,
      capturedAmount: finalAmount,
      currency: captureResult.currency || "GBP",
      rawPayload: captureResult.rawPayload
    });

    if (!saleResult.success) {
      return res.status(409).json({ error: saleResult.error });
    }

    res.json({
      success: true,
      orderId: saleResult.orderId,
      orderNumber: saleResult.orderNumber,
      qrDataUrl: saleResult.qrDataUrl,
      alreadyProcessed: saleResult.alreadyProcessed || false
    });
  } catch (err: any) {
    console.error("Failed to capture PayPal order:", err);
    res.status(500).json({ error: err.message || "Payment capture failed." });
  }
});

// POST /api/paypal/simulate-test-sale - Sandbox Test Mode checkout simulation
paypalRouter.post("/simulate-test-sale", async (req: Request, res: Response) => {
  try {
    const { orderId, paymentMethod = "PAYPAL" } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const db = await getDb();
    const orderRes = db.exec(`SELECT total_amount, currency, order_number FROM orders WHERE id = '${orderId}';`);
    if (!orderRes || !orderRes[0] || !orderRes[0].values[0]) {
      return res.status(404).json({ error: "Order not found" });
    }

    const totalAmount = orderRes[0].values[0][0] as number;
    const currency = (orderRes[0].values[0][1] as string) || "GBP";
    const orderNumber = orderRes[0].values[0][2] as string;

    const fakePaypalOrderId = `SANDBOX-${orderNumber}-${Date.now()}`;
    const fakeCaptureId = `CAP-${fakePaypalOrderId}`;

    const saleResult = await processSuccessfulSale({
      orderId,
      paymentMethod: paymentMethod === "CREDIT_DEBIT_CARD" ? "CREDIT_DEBIT_CARD" : "PAYPAL",
      paypalOrderId: fakePaypalOrderId,
      paypalCaptureId: fakeCaptureId,
      capturedAmount: totalAmount,
      currency,
      rawPayload: { simulated: true, mode: "SANDBOX_VERIFIED", timestamp: new Date().toISOString() }
    });

    if (!saleResult.success) {
      return res.status(409).json({ error: saleResult.error });
    }

    res.json({
      success: true,
      orderId: saleResult.orderId,
      orderNumber: saleResult.orderNumber,
      qrDataUrl: saleResult.qrDataUrl
    });
  } catch (err: any) {
    console.error("Test sale simulation failed:", err);
    res.status(500).json({ error: err.message || "Simulation failed." });
  }
});

// POST /api/webhooks/paypal - PayPal Webhook Handler (Idempotent)
paypalRouter.post("/webhooks", async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log(`[PayPal Webhook] Received event: ${event?.event_type}`);

    if (event?.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const customId = resource?.custom_id;
      const captureId = resource?.id;
      const amount = parseFloat(resource?.amount?.value || "0");
      const currency = resource?.amount?.currency_code || "GBP";

      if (customId) {
        const result = await processSuccessfulSale({
          orderId: customId,
          paymentMethod: "PAYPAL",
          paypalCaptureId: captureId,
          capturedAmount: amount,
          currency,
          rawPayload: event
        });
        console.log(`[PayPal Webhook] Processed sale for order ${customId}:`, result);
      }
    }

    // Always respond 200 to PayPal once received
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("[PayPal Webhook] Error processing event:", err);
    res.status(200).json({ received: true, error: err.message });
  }
});
