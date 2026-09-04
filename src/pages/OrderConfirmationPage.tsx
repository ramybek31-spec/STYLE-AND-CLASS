import React from "react";
import { CheckCircle, Download, ArrowRight, Truck, QrCode, ShieldCheck, Mail } from "lucide-react";
import { Product } from "../types";

interface OrderConfirmationPageProps {
  orderData: {
    orderId: string;
    orderNumber: string;
    qrDataUrl?: string;
    customerName: string;
    shippingCompany: string;
    totalAmount: number;
    currency: string;
    item?: Product;
  };
  onReturnHome: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderData,
  onReturnHome
}) => {
  const downloadQrCode = () => {
    if (!orderData.qrDataUrl) return;
    const link = document.createElement("a");
    link.href = orderData.qrDataUrl;
    link.download = `STYLE_AND_CLASS_QR_${orderData.orderNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle className="w-8 h-8" />
        </div>
        <span className="text-[10px] tracking-[0.3em] font-semibold text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Payment Confirmed &middot; Item Sold
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 uppercase">
          Thank You, {orderData.customerName}
        </h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Your order has been recorded. This unique physical piece has now been marked <strong>SOLD</strong> and removed from the public storefront.
        </p>
      </div>

      {/* Main Order Confirmation Card */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
              Official Order Reference
            </span>
            <div className="font-mono text-xl font-bold text-stone-900 mt-0.5">
              #{orderData.orderNumber}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
              Total Paid Amount
            </span>
            <div className="text-xl font-bold text-[#1c1917] mt-0.5">
              £{Number(orderData.totalAmount).toFixed(2)} {orderData.currency || "GBP"}
            </div>
          </div>
        </div>

        {/* Courier & Address QR Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-stone-50 p-6 rounded-lg border border-stone-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900">
              <Truck className="w-4 h-4 text-[#92400e]" />
              <span>Selected UK Courier</span>
            </div>
            <div className="text-sm font-semibold text-stone-800">
              {orderData.shippingCompany}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Your parcel is being prepared in our Mayfair facility. Courier tracking details will be dispatched to your email.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-stone-500">
              <Mail className="w-3.5 h-3.5" />
              <span>Manager notified via official dispatch workflow</span>
            </div>
          </div>

          {/* Delivery Address QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-md text-center shadow-xs">
            {orderData.qrDataUrl ? (
              <>
                <img
                  src={orderData.qrDataUrl}
                  alt={`Address QR for Order ${orderData.orderNumber}`}
                  className="w-36 h-36 object-contain"
                />
                <div className="mt-2 text-[10px] font-mono uppercase text-stone-500">
                  Address Delivery QR Code
                </div>
                <button
                  onClick={downloadQrCode}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs text-stone-700 hover:text-black font-semibold border border-stone-300 hover:border-stone-400 px-3 py-1 rounded transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download QR Code
                </button>
              </>
            ) : (
              <div className="text-xs text-stone-400 p-4">
                Address QR Code generated and attached to packing slip.
              </div>
            )}
          </div>
        </div>

        {/* Purchased Item Summary */}
        {orderData.item && (
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Unique Garment Purchased
            </h3>
            <div className="flex gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <img
                src={orderData.item.main_image}
                alt={orderData.item.name}
                className="w-16 h-20 object-cover rounded border border-stone-200 shrink-0"
              />
              <div className="flex flex-col justify-between flex-1 min-w-0 text-xs">
                <div>
                  <div className="font-semibold text-stone-900 text-sm">
                    {orderData.item.name}
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    SKU: {orderData.item.sku} &middot; Size: {orderData.item.size} &middot; Brand: {orderData.item.brand}
                  </div>
                </div>
                <div className="text-stone-900 font-bold">
                  Price: £{Number(orderData.item.price).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return to Boutique Button */}
      <div className="text-center pt-4">
        <button
          onClick={onReturnHome}
          className="inline-flex items-center gap-2 bg-[#1c1917] hover:bg-stone-800 text-white px-8 py-3.5 rounded text-xs font-semibold uppercase tracking-wider shadow-sm transition"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
