import React, { useState } from "react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, QrCode, Sparkles, Check, Info, MessageSquare, Instagram, Video, Facebook } from "lucide-react";

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
          <div className="relative aspect-[4/5] bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
            <img
              src={selectedImage}
              alt={product.name}
              className={`w-full h-full object-cover object-center ${
                isSold ? "grayscale contrast-75 opacity-70" : ""
              }`}
            />

            {/* 1-of-1 Badge */}
            {!isSold && (
              <div className="absolute top-4 left-4 bg-[#1c1917]/90 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Unique 1-of-1 Piece</span>
              </div>
            )}

            {/* SOLD Overlay */}
            {isSold && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-6">
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
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>@danmark.uk</span>
                </a>
                <a
                  href="https://www.tiktok.com/@danmark.fashion5?_r=1&_t=ZN-98Dxx0gz2XO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-stone-300 rounded text-[11px] font-medium text-stone-700 hover:text-cyan-600 hover:border-cyan-300 transition"
                >
                  <Video className="w-3.5 h-3.5 text-cyan-600" />
                  <span>@danmark.fashion5</span>
                </a>
                <a
                  href="https://www.facebook.com/people/Dan-Danmark/61585382386134/?rdid=LStdMae3aAy4HdR3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DV7Qjem6m%2F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-stone-300 rounded text-[11px] font-medium text-stone-700 hover:text-blue-600 hover:border-blue-300 transition"
                >
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dan Danmark</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
