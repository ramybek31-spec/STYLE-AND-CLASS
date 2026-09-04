import QRCode from "qrcode";

export interface DeliveryAddressData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  streetAddress: string;
  city: string;
  postcode: string;
  country: string;
  shippingCompany: string;
}

export interface QrGenerationResult {
  success: boolean;
  qrDataUrl?: string;
  qrText?: string;
  error?: string;
}

/**
 * Format delivery information for scanning by couriers and store handlers.
 * Follows postal delivery layout conventions with clear identifiers.
 */
export function formatDeliveryQrText(data: DeliveryAddressData): string {
  return [
    `STYLE AND CLASS - LONDON`,
    `ORDER: ${data.orderNumber}`,
    `CUSTOMER: ${data.customerName}`,
    `PHONE: ${data.customerPhone}`,
    `STREET: ${data.streetAddress}`,
    `CITY: ${data.city}`,
    `POSTCODE: ${data.postcode}`,
    `COUNTRY: ${data.country || "United Kingdom"}`,
    `COURIER: ${data.shippingCompany}`
  ].join("\n");
}

/**
 * Generate high-resolution, self-hosted QR code data URL.
 * 100% Free, zero external API, runs fully in Node process.
 */
export async function generateDeliveryQrCode(data: DeliveryAddressData): Promise<QrGenerationResult> {
  try {
    const qrText = formatDeliveryQrText(data);
    
    // Generate high-resolution data URL with clean margin and optimal error correction
    const qrDataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "M", // Good balance of scan reliability and density
      margin: 2,                 // Clean quiet zone
      width: 400,                // Crisp 400x400 for printing or scanning from screen
      color: {
        dark: "#1c1917",         // Deep charcoal
        light: "#ffffff"         // Pure white background for maximum optical contrast
      }
    });

    return {
      success: true,
      qrDataUrl,
      qrText
    };
  } catch (err: any) {
    console.error("Local QR generation failed:", err);
    return {
      success: false,
      error: err?.message || "Failed to generate QR code"
    };
  }
}
