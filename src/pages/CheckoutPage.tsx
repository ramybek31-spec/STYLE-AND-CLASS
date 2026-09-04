import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { ShippingRate, ShippingCompany, Order } from "../types";
import { ArrowLeft, ShieldCheck, Truck, Lock, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (order: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderSuccess }) => {
  const { item, sessionId, clearCart } = useCart();

  // Address State
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    streetAddress: "",
    city: "",
    postcode: "",
    country: "United Kingdom"
  });

  // Shipping Rates
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<ShippingCompany>("EVRI");
  const [shippingLoading, setShippingLoading] = useState(true);

  // Form Validation & Order State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isInitializing, setIsInitializing] = useState(false);
  const [serverOrder, setServerOrder] = useState<any>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // PayPal config from server
  const [paypalConfig, setPaypalConfig] = useState<{ clientId: string; mode: string }>({
    clientId: "test",
    mode: "sandbox"
  });

  // Load active shipping rates and PayPal config on mount
  useEffect(() => {
    fetch("/api/checkout/shipping-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates && data.rates.length > 0) {
          setShippingRates(data.rates);
          setSelectedCourier(data.rates[0].company);
        }
      })
      .catch((err) => console.error("Failed to load shipping rates:", err))
      .finally(() => setShippingLoading(false));

    fetch("/api/paypal/config")
      .then((res) => res.json())
      .then((data) => {
        setPaypalConfig({
          clientId: data.clientId || "test",
          mode: data.mode || "sandbox"
        });
      })
      .catch((err) => console.error("Failed to load PayPal config:", err));
  }, []);

  const activeRate = shippingRates.find((r) => r.company === selectedCourier);
  const shippingCost = activeRate ? activeRate.cost : 3.80;
  const productPrice = item ? Number(item.price) : 0;
  const calculatedTotal = Math.round((productPrice + shippingCost) * 100) / 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Step 1: Validate UK Address and Initialize Server Order
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!item) {
      setGeneralError("Your basket is empty. Please select an available unique piece.");
      return;
    }

    setIsInitializing(true);

    try {
      // 1. Client & Server validation of address
      const valRes = await fetch("/api/checkout/validate-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const valData = await valRes.json();
      if (!valRes.ok || !valData.isValid) {
        setValidationErrors(valData.errors || {});
        setIsInitializing(false);
        return;
      }

      // 2. Initialize Order on server with server-side price control
      const initRes = await fetch("/api/checkout/initialize-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.id,
          ...formData,
          shippingCompany: selectedCourier,
          sessionId
        })
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        setGeneralError(initData.error || "Failed to initialize order.");
        setIsInitializing(false);
        return;
      }

      setServerOrder(initData);
    } catch (err: any) {
      setGeneralError("Connection error while preparing checkout. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  // Test Mode Simulator checkout (Sandbox verification QA)
  const handleSimulateTestSale = async (method: "PAYPAL" | "CREDIT_DEBIT_CARD") => {
    if (!serverOrder) return;
    setIsProcessingPayment(true);
    setGeneralError(null);

    try {
      const res = await fetch("/api/paypal/simulate-test-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: serverOrder.orderId,
          paymentMethod: method
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error || "Payment verification failed.");
        setIsProcessingPayment(false);
        return;
      }

      clearCart();
      onOrderSuccess({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        qrDataUrl: data.qrDataUrl,
        customerName: formData.customerName,
        shippingCompany: selectedCourier,
        totalAmount: serverOrder.totalAmount,
        currency: "GBP",
        item
      });
    } catch (err: any) {
      setGeneralError("Simulation failed: " + err.message);
      setIsProcessingPayment(false);
    }
  };

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Your Basket is Empty</h2>
        <p className="text-xs text-stone-500">
          Please select an available unique piece from our London boutique.
        </p>
        <button
          onClick={onBack}
          className="bg-stone-900 text-white px-6 py-2.5 rounded text-xs font-semibold uppercase tracking-wider"
        >
          Return to Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-black uppercase tracking-wider transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Product
      </button>

      {/* Main Grid: Form Left (7 cols), Order Summary Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-[10px] tracking-[0.3em] font-semibold text-stone-500 uppercase">
              Official London Dispatch
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 uppercase mt-1">
              Secure UK Checkout
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Please provide recipient delivery details. A free address QR code will be generated automatically.
            </p>
          </div>

          {generalError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Unable to complete checkout</strong>
                <span>{generalError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleProceedToPayment} className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span>1. Recipient &amp; Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-stone-600 font-medium mb-1">
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lady Victoria Spencer"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    className="w-full p-2.5 border rounded border-stone-300 focus:outline-none focus:border-stone-800 text-stone-900"
                  />
                  {validationErrors.customerName && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">
                      {validationErrors.customerName}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Mobile Phone (For Courier Updates) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 07123 456789"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    className="w-full p-2.5 border rounded border-stone-300 focus:outline-none focus:border-stone-800 text-stone-900"
                  />
                  {validationErrors.customerPhone && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">
                      {validationErrors.customerPhone}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Email Address (For Order Receipt) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. victoria@example.co.uk"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    className="w-full p-2.5 border rounded border-stone-300 focus:outline-none focus:border-stone-800 text-stone-900"
                  />
                  {validationErrors.customerEmail && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">
                      {validationErrors.customerEmail}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span>2. UK Delivery Address</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Street Address &amp; House/Flat Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24 Mount Street, Flat 3B"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    className="w-full p-2.5 border rounded border-stone-300 focus:outline-none focus:border-stone-800 text-stone-900"
                  />
                  {validationErrors.streetAddress && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">
                      {validationErrors.streetAddress}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">
                      Town / City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. London"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full p-2.5 border rounded border-stone-300 focus:outline-none focus:border-stone-800 text-stone-900"
                    />
                    {validationErrors.city && (
                      <span className="text-rose-600 text-[11px] mt-0.5 block">
                        {validationErrors.city}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-stone-600 font-medium mb-1">
                      UK Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. W1K 2PB"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange("postcode", e.target.value.toUpperCase())}
                      className="w-full p-2.5 border rounded border-stone-300 focus:outline-none focus:border-stone-800 text-stone-900 font-mono"
                    />
                    {validationErrors.postcode && (
                      <span className="text-rose-600 text-[11px] mt-0.5 block">
                        {validationErrors.postcode}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Country</label>
                  <input
                    type="text"
                    readOnly
                    value="United Kingdom"
                    className="w-full p-2.5 border rounded border-stone-200 bg-stone-50 text-stone-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Courier Selection */}
            <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-600" />
                <span>3. Select UK Shipping Courier</span>
              </h2>

              <div className="space-y-2.5">
                {shippingRates.map((rate) => (
                  <label
                    key={rate.company}
                    className={`flex items-center justify-between p-3.5 rounded border cursor-pointer transition ${
                      selectedCourier === rate.company
                        ? "border-stone-900 bg-stone-50 ring-1 ring-stone-900"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courier"
                        value={rate.company}
                        checked={selectedCourier === rate.company}
                        onChange={() => setSelectedCourier(rate.company)}
                        className="accent-stone-900"
                      />
                      <div>
                        <div className="font-semibold text-xs text-stone-900">{rate.name}</div>
                        <div className="text-[11px] text-stone-500">{rate.estimated_days}</div>
                      </div>
                    </div>
                    <div className="font-bold text-xs text-stone-900">
                      £{Number(rate.cost).toFixed(2)}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step Confirmation Button */}
            {!serverOrder ? (
              <button
                type="submit"
                disabled={isInitializing}
                className="w-full bg-[#1c1917] hover:bg-stone-800 text-white font-semibold py-4 px-6 rounded-md shadow-sm transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isInitializing ? (
                  <span>Reserving Item &amp; Verifying Address...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm Address &amp; Proceed to Payment (£{calculatedTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Address &amp; Courier Confirmed: Order #{serverOrder.orderNumber} Reserved</span>
                </div>
                <button
                  type="button"
                  onClick={() => setServerOrder(null)}
                  className="text-emerald-700 underline hover:text-emerald-900 font-medium"
                >
                  Edit Details
                </button>
              </div>
            )}
          </form>

          {/* Payment Section (Rendered when server order is confirmed) */}
          {serverOrder && (
            <div className="bg-white p-6 rounded-lg border-2 border-stone-900 shadow-md space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>4. Complete Payment &middot; £{serverOrder.totalAmount.toFixed(2)} GBP</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Server-controlled amount. Card details handled securely by PayPal.
                </p>
              </div>

              {/* Sandbox Quick Simulator QA Banner */}
              <div className="bg-stone-50 p-4 rounded border border-stone-300 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">
                    PayPal Sandbox Verification Mode
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                    SANDBOX ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  You can test the entire atomic purchase pipeline immediately. Clicking below executes real server-side unique inventory lock, generates the delivery address QR code, creates the order snapshot, and queues the manager notification!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => handleSimulateTestSale("PAYPAL")}
                    className="bg-[#0070ba] hover:bg-[#005ea6] text-white py-2.5 px-4 rounded text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <span>Test Pay with PayPal</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => handleSimulateTestSale("CREDIT_DEBIT_CARD")}
                    className="bg-stone-800 hover:bg-black text-white py-2.5 px-4 rounded text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <span>Test Credit/Debit Card</span>
                  </button>
                </div>
              </div>

              {/* Official PayPal SDK Buttons */}
              <div className="pt-2">
                <div className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold mb-3 text-center">
                  Official PayPal Hosted Smart Buttons
                </div>
                <PayPalScriptProvider
                  options={{
                    clientId: paypalConfig.clientId || "test",
                    currency: "GBP",
                    intent: "capture"
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", height: 42 }}
                    createOrder={async () => {
                      const res = await fetch("/api/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: serverOrder.orderId })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Failed to create PayPal order.");
                      return data.paypalOrderId;
                    }}
                    onApprove={async (data) => {
                      setIsProcessingPayment(true);
                      const res = await fetch("/api/paypal/capture-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId: serverOrder.orderId,
                          paypalOrderId: data.orderID,
                          paymentMethod: "PAYPAL"
                        })
                      });
                      const captureData = await res.json();
                      if (!res.ok) {
                        setGeneralError(captureData.error || "Payment capture failed.");
                        setIsProcessingPayment(false);
                        return;
                      }
                      clearCart();
                      onOrderSuccess({
                        orderId: captureData.orderId,
                        orderNumber: captureData.orderNumber,
                        qrDataUrl: captureData.qrDataUrl,
                        customerName: formData.customerName,
                        shippingCompany: selectedCourier,
                        totalAmount: serverOrder.totalAmount,
                        currency: "GBP",
                        item
                      });
                    }}
                    onError={(err: any) => {
                      console.error("PayPal button error:", err);
                      setGeneralError("PayPal interaction failed. Please use sandbox test mode above or check credentials.");
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>
          )}
        </div>

        {/* Right Order Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-6 sticky top-28">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
              Order Summary
            </h2>

            {/* Unique Item Card */}
            <div className="flex gap-4">
              <img
                src={item.main_image}
                alt={item.name}
                className="w-20 h-24 object-cover object-center rounded border border-stone-200 shrink-0"
              />
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                    <span>{item.brand}</span>
                    <span>{item.size}</span>
                  </div>
                  <h4 className="text-xs font-medium text-stone-900 line-clamp-2 mt-0.5 leading-snug">
                    {item.name}
                  </h4>
                  <span className="inline-block mt-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                    1-of-1 Physical Piece
                  </span>
                </div>
                <div className="font-bold text-sm text-stone-900 pt-1">
                  £{Number(item.price).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-stone-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Unique Item Price</span>
                <span>£{Number(item.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Courier Shipping ({selectedCourier})</span>
                <span>£{shippingCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline font-bold text-sm text-stone-900">
                <span>Total Amount Due</span>
                <span className="text-lg">£{calculatedTotal.toFixed(2)} GBP</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-stone-50 p-3.5 rounded-md border border-stone-200 space-y-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5 font-semibold text-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>STYLE AND CLASS Assurance</span>
              </div>
              <p className="leading-relaxed">
                Unique physical items are held exclusively during checkout. Once paid, the piece is marked SOLD across the entire store.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
