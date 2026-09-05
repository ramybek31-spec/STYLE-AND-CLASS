import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { 
  ArrowLeft, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  QrCode, 
  Sparkles, 
  Check, 
  Info, 
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  RotateCcw
} from "lucide-react";
import { TikTokBrandIcon, InstagramBrandIcon, FacebookBrandIcon } from "../components/BrandIcons";

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onBuyNow: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onBuyNow
}) => {
  const { addToCart, item } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.main_image);
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [zoomLevel, setZoomLevel] = useState<number>(2.2);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  const isSold = product.is_sold === 1 || product.is_sold === true || product.status === "SOLD";
  const isInBasket = item?.id === product.id;

  const allImages = [
    product.main_image,
    ...(Array.isArray(product.additional_images) ? product.additional_images : [])
  ].filter(Boolean);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSold) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseEnter = () => {
    if (!isSold) {
      setIsHoveringZoom(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHoveringZoom(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isSold || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleAddToCart = () => {
    if (!isSold) {
      addToCart(product);
    }
  };

  const handleBuyNowClick = () => {
    if (!isSold) {
      addToCart(product);
      onBuyNow();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-black uppercase tracking-wider transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Gallery Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div 
            className={`relative aspect-[4/5] bg-stone-100 rounded-lg overflow-hidden border border-stone-200 select-none ${
              isSold ? "cursor-default" : isHoveringZoom ? "cursor-crosshair" : "cursor-zoom-in"
            }`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchStart={handleMouseEnter}
            onTouchEnd={handleMouseLeave}
            onClick={() => !isSold && setIsLightboxOpen(true)}
            title={!isSold ? "Click for full-screen inspection" : undefined}
          >
            <img
              src={selectedImage}
              alt={product.name}
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                transform: isHoveringZoom ? `scale(${zoomLevel})` : "scale(1)",
              }}
              className={`w-full h-full object-cover object-center pointer-events-none transition-transform will-change-transform ${
                isHoveringZoom ? "duration-75 ease-out" : "duration-300 ease-in-out"
              } ${isSold ? "grayscale contrast-75 opacity-70" : ""}`}
            />

            {/* 1-of-1 Badge */}
            {!isSold && (
              <div className="absolute top-4 left-4 bg-[#1c1917]/90 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded shadow-sm flex items-center gap-1.5 pointer-events-none z-10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Unique 1-of-1 Piece</span>
              </div>
            )}

            {/* Top Right Zoom Controls & Fullscreen Lightbox Button */}
            {!isSold && (
              <div 
                className="absolute top-4 right-4 flex items-center gap-1.5 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Zoom Level Switcher */}
                <div className="bg-[#1c1917]/85 backdrop-blur-xs rounded-md p-0.5 flex items-center text-[10px] text-stone-300 border border-stone-700/60 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(2.0)}
                    className={`px-2 py-0.5 rounded font-mono font-medium transition ${
                      zoomLevel === 2.0 ? "bg-amber-400 text-stone-950 font-bold" : "hover:text-white"
                    }`}
                    title="2x Zoom Magnification"
                  >
                    2.0x
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(2.8)}
                    className={`px-2 py-0.5 rounded font-mono font-medium transition ${
                      zoomLevel === 2.8 ? "bg-amber-400 text-stone-950 font-bold" : "hover:text-white"
                    }`}
                    title="2.8x Ultra-Detail Zoom"
                  >
                    2.8x
                  </button>
                </div>

                {/* Lightbox Trigger */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="p-1.5 bg-[#1c1917]/85 hover:bg-stone-900 text-stone-300 hover:text-white rounded-md border border-stone-700/60 shadow-sm transition backdrop-blur-xs flex items-center justify-center"
                  title="Open Fullscreen Fabric Inspection"
                  aria-label="Open Fullscreen Fabric Inspection"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Bottom-Right Zoom Feedback Pill */}
            {!isSold && (
              <div className="absolute bottom-4 right-4 pointer-events-none z-10 transition-all duration-200">
                {isHoveringZoom ? (
                  <div className="bg-[#1c1917]/90 text-amber-300 text-[11px] font-mono font-semibold px-3 py-1 rounded-full shadow-lg border border-amber-400/30 flex items-center gap-1.5 backdrop-blur-xs animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Inspecting Fabric &middot; {zoomLevel}x</span>
                  </div>
                ) : (
                  <div className="bg-[#1c1917]/75 hover:bg-[#1c1917]/90 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 backdrop-blur-xs border border-white/10">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hover to examine fabric quality</span>
                  </div>
                )}
              </div>
            )}

            {/* Condition Tag on Image */}
            {!isSold && product.condition && (
              <div className="absolute bottom-4 left-4 bg-white/95 text-stone-900 text-[11px] font-medium px-2.5 py-1 rounded shadow-xs border border-stone-200 pointer-events-none z-10">
                {product.condition}
              </div>
            )}

            {/* SOLD Overlay */}
            {isSold && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-6 z-20">
                <div className="border-4 border-white px-8 py-3 text-white font-serif tracking-[0.3em] text-3xl font-bold uppercase rotate-[-8deg] shadow-2xl">
                  SOLD
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails if multiple */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded border overflow-hidden shrink-0 transition ${
                    selectedImage === img
                      ? "border-black ring-2 ring-black/20"
                      : "border-stone-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & SKU */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-widest">
              <span>{product.brand} &middot; {product.category}</span>
              <span className="font-mono text-stone-400">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#1c1917]">
                £{Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs uppercase text-stone-500 font-semibold tracking-wider">
                GBP &middot; Tax Included
              </span>
            </div>
          </div>

          {/* Key Attributes Pills */}
          <div className="grid grid-cols-2 gap-3 py-4 border-y border-stone-200 text-xs">
            <div className="bg-white p-3 rounded border border-stone-200">
              <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Size</span>
              <span className="font-bold text-stone-900 text-sm mt-0.5 block">{product.size}</span>
            </div>
            <div className="bg-white p-3 rounded border border-stone-200">
              <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Condition</span>
              <span className="font-bold text-stone-900 text-sm mt-0.5 block">{product.condition}</span>
            </div>
            {product.colour && (
              <div className="bg-white p-3 rounded border border-stone-200">
                <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Colour</span>
                <span className="font-medium text-stone-800 mt-0.5 block">{product.colour}</span>
              </div>
            )}
            {product.material && (
              <div className="bg-white p-3 rounded border border-stone-200">
                <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Material</span>
                <span className="font-medium text-stone-800 mt-0.5 block truncate">{product.material}</span>
              </div>
            )}
          </div>

          {/* Purchasing Actions */}
          <div className="space-y-3">
            {isSold ? (
              <div className="p-4 bg-stone-100 border border-stone-300 rounded text-center space-y-1">
                <div className="font-serif font-bold text-stone-900 text-lg uppercase tracking-widest">
                  This Piece Has Been Sold
                </div>
                <p className="text-xs text-stone-500">
                  Because STYLE AND CLASS specializes in unique physical items, this garment cannot be re-ordered.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={handleBuyNowClick}
                  className="w-full bg-[#1c1917] hover:bg-stone-800 text-white font-semibold py-3.5 px-6 rounded-md shadow-sm transition text-sm tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <span>Buy Unique Piece Now</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 px-6 rounded-md border font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 ${
                    isInBasket
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-white hover:bg-stone-50 text-stone-900 border-stone-300"
                  }`}
                >
                  {isInBasket ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Added to Basket</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Basket</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/447591878215?text=${encodeURIComponent(`Hello STYLE AND CLASS London, I am inquiring about piece: ${product.name} (SKU: ${product.sku}, £${product.price}). Is it currently available for viewing or dispatch?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 font-medium text-xs tracking-wide transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Enquire on WhatsApp (+44 7591 878215)</span>
                </a>
              </div>
            )}
          </div>

          {/* Garment Description */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Curator&apos;s Description
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* Physical Measurements */}
          {product.measurements && (
            <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs space-y-1">
              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-stone-500" />
                <span>Exact Physical Measurements</span>
              </div>
              <p className="text-stone-600 font-mono text-[11px]">{product.measurements}</p>
            </div>
          )}

          {/* Shipping & Delivery Notice */}
          <div className="border-t border-stone-200 pt-4 space-y-2.5 text-xs text-stone-600">
            <div className="flex items-center gap-2 text-stone-800 font-semibold">
              <Truck className="w-4 h-4 text-[#92400e]" />
              <span>UK Courier Dispatch</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-500">
              Select between <strong>Evri</strong>, <strong>Royal Mail 1st Class</strong>, or <strong>InPost 24/7 Lockers</strong> during checkout.
            </p>
            <div className="flex items-center gap-2 text-stone-800 font-semibold pt-1">
              <QrCode className="w-4 h-4 text-[#92400e]" />
              <span>Address QR Code Verification</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-500">
              A free delivery address QR code is automatically generated on our server to verify accurate courier delivery to your doorstep.
            </p>
          </div>

          {/* Social styling & video try-on links */}
          <div className="border-t border-stone-200 pt-4">
            <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200/80">
              <div className="text-[11px] font-semibold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>See Styling &amp; Live Drops</span>
                <span className="text-[10px] text-stone-500 font-normal">Daily Video Updates</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed mb-3">
                Watch video try-ons, styling reels, and new boutique arrivals on our official social channels:
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.instagram.com/danmark.uk?igsh=MXpsaXNib3JzcHFw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-stone-300 rounded text-[11px] font-medium text-stone-700 hover:text-pink-600 hover:border-pink-300 transition"
                >
                  <InstagramBrandIcon className="w-3.5 h-3.5 text-pink-600" />
                  <span>@danmark.uk</span>
                </a>
                <a
                  href="https://www.tiktok.com/@danmark.fashion5?_r=1&_t=ZN-98Dxx0gz2XO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-stone-300 rounded text-[11px] font-medium text-stone-700 hover:text-cyan-600 hover:border-cyan-300 transition"
                >
                  <TikTokBrandIcon className="w-3.5 h-3.5 text-cyan-600" />
                  <span>@danmark.fashion5</span>
                </a>
                <a
                  href="https://www.facebook.com/people/Dan-Danmark/61585382386134/?rdid=LStdMae3aAy4HdR3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DV7Qjem6m%2F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-stone-300 rounded text-[11px] font-medium text-stone-700 hover:text-blue-600 hover:border-blue-300 transition"
                >
                  <FacebookBrandIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dan Danmark</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Fabric & Stitching Inspection Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLightboxOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="High-Definition Garment Inspection Lightbox"
        >
          {/* Lightbox Top Header */}
          <div className="flex items-center justify-between text-white border-b border-stone-800 pb-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold block">
                Archival Garment Inspection
              </span>
              <h3 className="text-sm sm:text-base font-serif font-bold text-stone-100 truncate max-w-md">
                {product.name}
              </h3>
            </div>

            {/* Inspection Controls & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setLightboxZoom((prev) => Math.max(1, prev - 0.5))}
                  className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono text-[11px] text-amber-400 min-w-12 text-center">
                  {lightboxZoom.toFixed(1)}x
                </span>
                <button
                  onClick={() => setLightboxZoom((prev) => Math.min(3.5, prev + 0.5))}
                  className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightboxZoom(1)}
                  className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded border-l border-stone-800 ml-1 transition"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg border border-stone-800 transition"
                aria-label="Close Inspection Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image View */}
          <div 
            className="flex-grow flex items-center justify-center overflow-hidden my-4 relative select-none cursor-grab active:cursor-grabbing"
            onClick={() => setLightboxZoom((prev) => (prev > 1.2 ? 1 : 2.2))}
            title="Click to toggle 2.2x zoom"
          >
            <div 
              className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center"
              style={{ transform: `scale(${lightboxZoom})` }}
            >
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-[75vh] max-w-full object-contain rounded shadow-2xl"
              />
            </div>
          </div>

          {/* Lightbox Bottom Thumbnails & Instructions */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800 pt-3 text-xs text-stone-400">
            <span className="text-[11px] hidden sm:inline text-stone-500">
              Click image to toggle zoom &bull; Use zoom buttons for up to 3.5x magnification &bull; Press Esc to close
            </span>

            {/* Thumbnail switcher */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mx-auto sm:mx-0 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img);
                      setLightboxZoom(1);
                    }}
                    className={`w-12 h-14 rounded border overflow-hidden shrink-0 transition ${
                      selectedImage === img
                        ? "border-amber-400 ring-2 ring-amber-400/40 opacity-100"
                        : "border-stone-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
