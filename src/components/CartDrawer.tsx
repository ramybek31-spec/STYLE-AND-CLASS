import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { X, Trash2, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { item, removeFromCart, isCartOpen, setIsCartOpen, recheckAvailability } = useCart();
  const [checking, setChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckoutClick = async () => {
    setChecking(true);
    setErrorMessage(null);

    const isStillAvailable = await recheckAvailability();
    setChecking(false);

    if (!isStillAvailable) {
      setErrorMessage("We apologize, but this unique piece has just been purchased by another customer.");
      return;
    }

    setIsCartOpen(false);
    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf9f6] text-stone-900 shadow-2xl flex flex-col justify-between border-l border-stone-200">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold tracking-wider uppercase">Your Basket</h2>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-sans font-semibold">
                {item ? "1 Item (Max)" : "Empty"}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition"
              aria-label="Close basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {item ? (
              <div className="space-y-4">
                {/* 1-of-1 Notice */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-md flex items-center gap-2 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Unique 1-of-1 Piece:</strong> Held for you while checking out. Quantity strictly limited to 1.
                  </span>
                </div>

                {/* Item Card */}
                <div className="flex gap-4 p-4 bg-white border border-stone-200 rounded-lg shadow-xs">
                  <img
                    src={item.main_image}
                    alt={item.name}
                    className="w-20 h-24 object-cover object-center rounded border border-stone-100 shrink-0"
                  />
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                        <span>{item.brand}</span>
                        <span>{item.size}</span>
                      </div>
                      <h4 className="text-sm font-medium text-stone-900 line-clamp-2 leading-snug mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1">Condition: {item.condition}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                      <div className="text-sm font-bold text-stone-900">
                        £{Number(item.price).toFixed(2)}
                      </div>
                      <button
                        onClick={removeFromCart}
                        className="text-stone-400 hover:text-rose-600 p-1 transition"
                        title="Remove from basket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delivery partners notice */}
                <div className="text-xs text-stone-500 bg-stone-100 p-3 rounded-md space-y-1">
                  <div className="font-semibold text-stone-700">Supported UK Delivery:</div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span>Evri Standard Tracked</span>
                    <span>Royal Mail 1st Class</span>
                    <span>InPost 24/7 Locker</span>
                  </div>
                  <div className="text-[10px] text-stone-400 pt-1">
                    Courier selected at checkout. Address QR code generated automatically upon payment.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-stone-800">Your basket is empty</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Discover our rare London vintage and second-hand pieces.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {item && (
            <div className="p-6 border-t border-stone-200 bg-white space-y-4">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-stone-500">Item Total</span>
                <span className="font-bold text-lg text-stone-900">
                  £{Number(item.price).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-stone-500">
                <span>UK Courier Shipping</span>
                <span>Calculated at checkout (from £3.50)</span>
              </div>

              <button
                onClick={handleCheckoutClick}
                disabled={checking}
                className="w-full bg-[#1c1917] hover:bg-stone-800 text-white font-medium py-3.5 px-4 rounded-md shadow-sm transition flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-50"
              >
                {checking ? (
                  <span>Checking Availability...</span>
                ) : (
                  <>
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted PayPal &amp; Card Checkout &middot; Instant Address QR</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
