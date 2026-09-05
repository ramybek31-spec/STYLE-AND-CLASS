import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { X, ShoppingBag, Check, Sparkles, Truck, ShieldCheck, ArrowRight, MessageSquare, Info } from "lucide-react";

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (product: Product) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onViewFullDetails
}) => {
  const { addToCart, item } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Sync selected image when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.main_image);
    }
  }, [product]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const isSold = product.is_sold === 1 || product.is_sold === true || product.status === "SOLD";
  const isInBasket = item?.id === product.id;

  const allImages = [
    product.main_image,
    ...(Array.isArray(product.additional_images) ? product.additional_images : [])
  ].filter(Boolean);

  const handleAddToCart = () => {
    if (!isSold) {
      addToCart(product);
    }
  };

  const handleGoToFullPage = () => {
    onViewFullDetails(product);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      <div 
        className="relative bg-white rounded-xl shadow-2xl border border-stone-200 max-w-4xl w-full overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-[#1c1917] text-white px-5 py-3 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-amber-300 block">
                Quick View &middot; 1-of-1 Physical Stock
              </span>
              <span className="text-xs text-stone-300 font-mono">
                {product.brand} &middot; SKU: {product.sku}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition"
            aria-label="Close Quick View"
            id="close-quick-view-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Image Display & Thumbnails */}
          <div className="md:col-span-6 space-y-3">
            <div className="relative aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
              <img
                src={selectedImage || product.main_image}
                alt={product.name}
                className={`w-full h-full object-cover object-center transition-all duration-300 ${
                  isSold ? "grayscale contrast-75 opacity-70" : ""
                }`}
              />

              {/* 1-of-1 Unique Badge */}
              {!isSold && (
                <div className="absolute top-3 left-3 bg-[#1c1917]/90 text-white text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Unique 1-of-1</span>
                </div>
              )}

              {/* Condition Tag */}
              {!isSold && product.condition && (
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-stone-800 text-[10px] font-medium px-2 py-0.5 rounded border border-stone-200">
                  {product.condition}
                </div>
              )}

              {/* SOLD Banner */}
              {isSold && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                  <div className="border-2 border-white px-6 py-2 text-white font-serif tracking-[0.25em] text-xl font-bold uppercase rotate-[-6deg] shadow-xl">
                    SOLD
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail switcher if multiple images */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-16 rounded border overflow-hidden shrink-0 transition ${
                      selectedImage === img
                        ? "border-stone-900 ring-2 ring-stone-900/20"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Essential Product Specs & Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Category and Title */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  <span>{product.category} &middot; {product.brand}</span>
                  <span className="font-sans text-stone-900 font-bold bg-stone-100 px-2 py-0.5 rounded">
                    Size: {product.size}
                  </span>
                </div>

                <h2 
                  id="quickview-title" 
                  className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug"
                >
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="mt-2.5 flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold text-[#1c1917]">
                    £{Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                    GBP &middot; Tax Included
                  </span>
                </div>
              </div>

              {/* Key Attributes Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Condition</span>
                  <span className="font-semibold text-stone-900 mt-0.5 block truncate">{product.condition}</span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Size / Fit</span>
                  <span className="font-semibold text-stone-900 mt-0.5 block">{product.size}</span>
                </div>
                {product.colour && (
                  <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                    <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Colour</span>
                    <span className="font-medium text-stone-800 mt-0.5 block truncate">{product.colour}</span>
                  </div>
                )}
                {product.material && (
                  <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                    <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Material</span>
                    <span className="font-medium text-stone-800 mt-0.5 block truncate">{product.material}</span>
                  </div>
                )}
              </div>

              {/* Physical Measurements if available */}
              {product.measurements && (
                <div className="p-2.5 bg-amber-50/70 rounded border border-amber-200/80 text-xs space-y-1">
                  <div className="font-semibold text-amber-900 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    <span>Exact Measurements</span>
                  </div>
                  <p className="text-stone-700 font-mono text-[11px] leading-relaxed">
                    {product.measurements}
                  </p>
                </div>
              )}

              {/* Description Excerpt */}
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
                  Item Summary
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-light line-clamp-3">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Actions & Basket */}
            <div className="space-y-2.5 pt-3 border-t border-stone-200">
              {isSold ? (
                <div className="p-3 bg-stone-100 border border-stone-300 rounded text-center">
                  <span className="font-semibold text-stone-700 text-xs uppercase tracking-wider block">
                    Piece Sold
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    1-of-1 archival item no longer in stock.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-3 px-4 rounded-md font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 ${
                      isInBasket
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : "bg-[#1c1917] hover:bg-stone-800 text-white shadow-xs"
                    }`}
                  >
                    {isInBasket ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Piece Added To Basket</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>Add To Basket &middot; £{Number(product.price).toFixed(2)}</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleGoToFullPage}
                      className="w-full py-2 px-3 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs tracking-wide transition flex items-center justify-center gap-1.5"
                    >
                      <span>Full Page Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`https://wa.me/447591878215?text=${encodeURIComponent(
                        `Hello STYLE AND CLASS London, I am viewing ${product.name} (SKU: ${product.sku}, £${product.price}) and have a question.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 font-medium text-xs tracking-wide transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Enquire</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Guarantees Bar */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-stone-500 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  1-of-1 Authenticated
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#92400e]" />
                  UK Courier Dispatch
                </span>
                <span>7-Day Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
