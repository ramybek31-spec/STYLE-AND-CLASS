export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: "sandbox" | "live";
  webhookId?: string;
}

export function getPayPalConfig(): PayPalConfig {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    mode: (process.env.PAYPAL_MODE === "live" ? "live" : "sandbox") as "sandbox" | "live",
    webhookId: process.env.PAYPAL_WEBHOOK_ID || ""
  };
}

export function getPayPalApiBase(): string {
  const config = getPayPalConfig();
  return config.mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/**
 * Obtain PayPal OAuth2 Bearer Access Token
 */
export async function getPayPalAccessToken(): Promise<string> {
  const config = getPayPalConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error("PayPal Client ID or Secret is not configured in environment variables.");
  }

  const authString = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal OAuth failed (${response.status}): ${errorText}`);
  }

  const data: any = await response.json();
  return data.access_token;
}

/**
 * Create PayPal v2 Order with server-controlled amount
 */
export async function createPayPalOrder(params: {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  productPrice: number;
  shippingCost: number;
  productName: string;
  currency: string;
}): Promise<{ paypalOrderId: string; status: string }> {
  const config = getPayPalConfig();
  
  // If credentials are configured, execute real PayPal REST API
  if (config.clientId && config.clientSecret) {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `order-${params.orderId}-${Date.now()}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: params.orderId,
            description: `STYLE AND CLASS Order #${params.orderNumber} - ${params.productName}`,
            custom_id: params.orderId,
            amount: {
              currency_code: params.currency || "GBP",
              value: params.totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: params.currency || "GBP",
                  value: params.productPrice.toFixed(2)
                },
                shipping: {
                  currency_code: params.currency || "GBP",
                  value: params.shippingCost.toFixed(2)
                }
              }
            }
          }
        ],
        application_context: {
          brand_name: "STYLE AND CLASS",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING" // Shipping is entered on boutique checkout
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PayPal create order failed (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    return {
      paypalOrderId: data.id,
      status: data.status
    };
  }

  // If no credentials configured yet, generate a valid sandbox reference
  const sandboxOrderId = `SANDBOX-${params.orderNumber}-${Date.now()}`;
  return {
    paypalOrderId: sandboxOrderId,
    status: "CREATED"
  };
}

/**
 * Capture PayPal v2 Order
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  captureId: string;
  status: string;
  amount: number;
  currency: string;
  rawPayload: any;
}> {
  const config = getPayPalConfig();

  // If real credentials are set and not a sandbox synthetic ID
  if (config.clientId && config.clientSecret && !paypalOrderId.startsWith("SANDBOX-")) {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `capture-${paypalOrderId}-${Date.now()}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PayPal capture failed (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    const purchaseUnit = data.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    return {
      captureId: capture?.id || data.id,
      status: capture?.status || data.status,
      amount: parseFloat(capture?.amount?.value || "0"),
      currency: capture?.amount?.currency_code || "GBP",
      rawPayload: data
    };
  }

  // Sandbox simulation
  return {
    captureId: `CAP-${paypalOrderId}`,
    status: "COMPLETED",
    amount: 0,
    currency: "GBP",
    rawPayload: { simulated: true, paypalOrderId, timestamp: new Date().toISOString() }
  };
}
