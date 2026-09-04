export type ProductCategory = "WOMEN" | "MEN" | "KIDS" | "ACCESSORIES";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  brand: string;
  gender: string;
  size: string;
  condition: string;
  description: string;
  price: number;
  currency: string;
  main_image: string;
  additional_images: string[];
  colour: string;
  material: string;
  measurements: string;
  tags: string;
  quantity: number;
  status: "AVAILABLE" | "RESERVED" | "PAYMENT_PENDING" | "PAID" | "SOLD" | "ARCHIVED";
  is_sold: number | boolean;
  is_reserved?: boolean;
  created_at: string;
  updated_at: string;
}

export type ShippingCompany = "EVRI" | "ROYAL_MAIL" | "INPOST";

export interface ShippingRate {
  company: ShippingCompany;
  name: string;
  cost: number;
  estimated_days: string;
  active?: boolean;
}

export interface CustomerAddress {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  streetAddress: string;
  city: string;
  postcode: string;
  country: string;
  shippingCompany: ShippingCompany;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  street_address: string;
  city: string;
  postcode: string;
  country: string;
  shipping_company: ShippingCompany;
  shipping_cost: number;
  product_price: number;
  total_amount: number;
  currency: string;
  payment_method: "PAYPAL" | "CREDIT_DEBIT_CARD";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "REVERSED";
  fulfillment_status: "NEW" | "PACKING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paypal_order_id?: string;
  paypal_capture_id?: string;
  qr_code_data?: string;
  qr_status: "QR_PENDING" | "QR_GENERATED" | "QR_FAILED";
  created_at: string;
  updated_at: string;
  product_name?: string;
  sku?: string;
  category?: string;
  size?: string;
  brand?: string;
  condition?: string;
  image_snapshot?: string;
}

export interface AdminStats {
  todaySales: number;
  todayRevenue: number;
  totalSales: number;
  totalRevenue: number;
  availableItems: number;
  soldItems: number;
  paymentPending: number;
  toShip: number;
  notificationProblems: number;
}

export interface ReconciliationRecord {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  websiteTotal: number;
  paypalTotal: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  paypalOrderId: string;
  paypalCaptureId: string;
  isMatch: boolean;
  flag: "MATCH_OK" | "MISMATCH";
}

export interface SystemHealth {
  database: string;
  paypal: string;
  paypalWebhook: string;
  qrGenerator: string;
  imageStorage: string;
  email: string;
  notificationQueue: string;
  whatsAppMode: string;
  managerPhone?: string;
}
