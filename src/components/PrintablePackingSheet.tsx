import React from "react";
import { Order } from "../types";
import { Printer, X } from "lucide-react";

interface PrintablePackingSheetProps {
  order: Order;
  onClose: () => void;
}

export const PrintablePackingSheet: React.FC<PrintablePackingSheetProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const formattedTime = new Date(order.created_at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      {/* Container */}
      <div className="bg-white text-stone-900 w-full max-w-2xl rounded-lg shadow-2xl p-8 border border-stone-300 print:shadow-none print:border-none print:w-full print:max-w-none print:p-6 my-8">
        {/* Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Official Dispatch Packing Sheet</h2>
            <p className="text-xs text-stone-500">Includes server-generated address delivery QR code</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-[#1c1917] text-white px-4 py-2 rounded text-xs font-semibold hover:bg-stone-800 transition"
            >
              <Printer className="w-4 h-4" /> Print Sheet (A4 / Thermal)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Starts Here */}
        <div className="space-y-6 text-stone-900">
          {/* Header Banner */}
          <div className="flex items-start justify-between border-b-2 border-black pb-4">
            <div>
              <h1 className="font-serif tracking-[0.25em] text-2xl font-bold uppercase">
                STYLE AND CLASS
              </h1>
              <p className="text-[11px] tracking-widest text-stone-500 uppercase">
                London UK &middot; Second-Hand Boutique &middot; Physical Dispatch
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-stone-500 uppercase">Order Number</div>
              <div className="font-mono text-xl font-bold text-black">#{order.order_number}</div>
              <div className="text-xs text-stone-600 mt-0.5">
                {formattedDate} at {formattedTime}
              </div>
            </div>
          </div>

          {/* Courier & Delivery Address Section with QR CODE */}
          <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 border border-stone-200 rounded">
            {/* Customer & Address Details */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-stone-500 tracking-wider uppercase">
                Recipient Delivery Address
              </div>
              <div className="text-sm font-bold text-black">{order.customer_name}</div>
              <div className="text-xs text-stone-700 leading-relaxed">
                <div>{order.street_address}</div>
                <div>{order.city}</div>
                <div className="font-bold text-stone-900 mt-0.5 text-sm">{order.postcode}</div>
                <div>{order.country || "United Kingdom"}</div>
              </div>
              <div className="pt-2 text-xs text-stone-600">
                <span className="font-semibold">Phone:</span> {order.customer_phone}
                <br />
                <span className="font-semibold">Email:</span> {order.customer_email}
              </div>
            </div>

            {/* Prominent QR Code for Couriers / Handlers */}
            <div className="flex flex-col items-center justify-center text-center p-2 bg-white border border-stone-200 rounded">
              {order.qr_code_data ? (
                <>
                  <img
                    src={order.qr_code_data}
                    alt={`Delivery Address QR Code for #${order.order_number}`}
                    className="w-36 h-36 object-contain"
                  />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mt-1">
                    Scan for Delivery Address
                  </span>
                </>
              ) : (
                <div className="text-xs text-amber-700 p-4">
                  QR Pending / Re-generating...
                </div>
              )}
            </div>
          </div>

          {/* Shipping Courier Badge */}
          <div className="flex items-center justify-between border-y border-stone-300 py-3 px-2">
            <div>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Selected UK Courier:
              </span>{" "}
              <span className="font-bold text-sm text-black tracking-wide">
                {order.shipping_company}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Payment Status:
              </span>{" "}
              <span className="font-bold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {order.payment_status} ({order.payment_method})
              </span>
            </div>
          </div>

          {/* Unique Physical Item Details */}
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Sold Unique Physical Item
            </div>
            <div className="border border-stone-200 rounded p-4 flex gap-4 items-start">
              {order.image_snapshot && (
                <img
                  src={order.image_snapshot}
                  alt={order.product_name || "Garment"}
                  className="w-20 h-24 object-cover rounded border border-stone-200 shrink-0"
                />
              )}
              <div className="space-y-1 text-xs text-stone-700 flex-1">
                <div className="text-sm font-bold text-black">{order.product_name || "Unique Piece"}</div>
                <div><span className="font-semibold text-stone-900">SKU:</span> {order.sku || "SC-UNKNOWN"}</div>
                <div><span className="font-semibold text-stone-900">Category:</span> {order.category || "N/A"}</div>
                <div><span className="font-semibold text-stone-900">Size:</span> {order.size || "One Size"}</div>
                {order.condition && <div><span className="font-semibold text-stone-900">Condition:</span> {order.condition}</div>}
                <div className="text-sm font-bold text-black pt-1">
                  Item Price: £{Number(order.product_price).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border-t border-stone-200 pt-4 flex justify-between items-center text-xs text-stone-600">
            <div>
              <div>PayPal Order ID: {order.paypal_order_id || "N/A"}</div>
              <div>Capture ID: {order.paypal_capture_id || "N/A"}</div>
            </div>
            <div className="text-right space-y-0.5">
              <div>Shipping: £{Number(order.shipping_cost).toFixed(2)}</div>
              <div className="text-sm font-bold text-black">
                Total Paid: £{Number(order.total_amount).toFixed(2)} GBP
              </div>
            </div>
          </div>

          {/* Packing Inspection Signature */}
          <div className="pt-6 border-t border-dashed border-stone-300 grid grid-cols-2 gap-6 text-[11px] text-stone-500">
            <div>
              <div>Inspected &amp; Packed By: ___________________</div>
            </div>
            <div className="text-right">
              <div>Dispatch Date: ___________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
