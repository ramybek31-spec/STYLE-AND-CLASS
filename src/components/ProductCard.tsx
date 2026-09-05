import React, { useState } from "react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { ShoppingBag, Check, Sparkles, Eye, Image as ImageIcon } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelectProduct,
  onQuickView 
}) => {
  const { addToCart, item } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isSold = product.is_sold === 1 || product.is_sold === true || product.status === "SOLD";
  const isInBasket = item?.id === product.id;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSold) {
      addToCart(product);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      onSelectProduct(product);
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group flex flex-col bg-white border border-[#e7e5e4] rounded-lg overflow-hidden hover:border-stone-400 hover:shadow-md transition-all duration-300 cursor-pointer relative"
    >
      {/* Visual Image Container */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        {/* Shimmer skeleton while image is loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center z-0">
            <div className="w-full h-full bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <ImageIcon className="w-8 h-8 text-stone-400 animate-pulse" />
            </div>
          </div>
        )}

        {/* Fallback if image fails to load */}
        {imageError && (
          <div className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center p-4 text-center z-0">
            <ImageIcon className="w-8 h-8 text-stone-300 mb-2" />
            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
              {product.brand || "Garment Photo"}
            </span>
          </div>
        )}

        <img
          src={product.main_image}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${
            isSold ? "grayscale contrast-75 opacity-70" : ""
          }`}
          loading="lazy"
        />

        {/* 1-of-1 Unique Piece Badge */}
        {!isSold && (
          <div className="absolute top-3 left-3 bg-[#1c1917]/85 backdrop-blur-xs text-white text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-sm shadow-xs flex items-center gap-1 z-10">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Unique 1-of-1
          </div>
        )}

        {/* Top-Right Quick View Button (Quick access) */}
        <button
          type="button"
          onClick={handleQuickViewClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-sm border border-stone-200 flex items-center justify-center transition-transform hover:scale-110 z-20"
          title="Quick View"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="w-4 h-4 text-stone-700" />
        </button>

        {/* Desktop Quick View Floating Action Bar */}
        <div className="hidden sm:flex absolute inset-x-3 bottom-3 justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="w-full py-2 px-3 bg-stone-900/90 hover:bg-stone-900 text-white text-xs font-semibold tracking-wider uppercase rounded shadow-lg backdrop-blur-xs flex items-center justify-center gap-1.5 transition border border-stone-700"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Condition Tag */}
        {!isSold && product.condition && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-medium px-2 py-0.5 rounded-sm border border-stone-200">
            {product.condition}
          </div>
        )}

        {/* SOLD Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="border-2 border-white px-5 py-2 text-white font-serif tracking-[0.25em] text-lg font-bold uppercase rotate-[-6deg] shadow-lg">
              SOLD
            </div>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">
            <span className="truncate">{product.brand || product.category}</span>
            <span className="font-sans font-semibold text-stone-700">{product.size}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-medium text-stone-900 line-clamp-2 leading-snug group-hover:text-stone-700 transition">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-stone-400 tracking-wider">GBP</span>
            <span className="text-base font-semibold text-[#1c1917]">
              £{Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick View Button for Mobile / Compact */}
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-black bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-md transition"
              title="Quick View"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>Quick View</span>
            </button>

            {isSold ? (
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Sold
              </span>
            ) : isInBasket ? (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
              </span>
            ) : (
              <button
                onClick={handleQuickAdd}
                className="inline-flex items-center gap-1 text-xs font-medium text-white bg-[#1c1917] hover:bg-stone-800 px-2.5 py-1.5 rounded-md transition"
                aria-label="Add unique piece to basket"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col bg-white border border-[#e7e5e4] rounded-lg overflow-hidden relative animate-pulse shadow-xs"
    >
      {/* Visual Image Area Skeleton */}
      <div className="relative aspect-[3/4] bg-stone-200 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-b from-stone-200 via-stone-100 to-stone-200" />

        {/* 1-of-1 Badge Skeleton */}
        <div className="absolute top-3 left-3 h-5 w-24 bg-stone-300/80 rounded-sm" />

        {/* Top-Right Quick View Button Skeleton */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-300/80" />

        {/* Condition Tag Skeleton */}
        <div className="absolute bottom-3 left-3 h-4 w-16 bg-stone-300/80 rounded-sm" />
      </div>

      {/* Content Details Skeleton */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          {/* Brand & Size */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-stone-200 rounded" />
            <div className="h-3 w-8 bg-stone-200 rounded" />
          </div>

          {/* Product Name (2 lines) */}
          <div className="space-y-1.5 pt-1">
            <div className="h-4 w-full bg-stone-200 rounded" />
            <div className="h-4 w-3/4 bg-stone-200 rounded" />
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="h-2.5 w-7 bg-stone-200 rounded" />
            <div className="h-5 w-16 bg-stone-300/80 rounded" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-7 w-20 bg-stone-200 rounded-md" />
            <div className="h-7 w-14 bg-stone-200 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
