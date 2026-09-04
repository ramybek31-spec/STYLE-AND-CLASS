import React from "react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { ShoppingBag, Check, Sparkles } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart, item } = useCart();
  const isSold = product.is_sold === 1 || product.is_sold === true || product.status === "SOLD";
  const isInBasket = item?.id === product.id;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSold) {
      addToCart(product);
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group flex flex-col bg-white border border-[#e7e5e4] rounded-lg overflow-hidden hover:border-stone-400 hover:shadow-md transition-all duration-300 cursor-pointer relative"
    >
      {/* Visual Image Container */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        <img
          src={product.main_image}
          alt={product.name}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
            isSold ? "grayscale contrast-75 opacity-70" : ""
          }`}
          loading="lazy"
        />

        {/* 1-of-1 Unique Piece Badge */}
        {!isSold && (
          <div className="absolute top-3 left-3 bg-[#1c1917]/85 backdrop-blur-xs text-white text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-sm shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Unique 1-of-1
          </div>
        )}

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
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-stone-400 tracking-wider">GBP</span>
            <span className="text-base font-semibold text-[#1c1917]">
              £{Number(product.price).toFixed(2)}
            </span>
          </div>

          {isSold ? (
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              No Longer Available
            </span>
          ) : isInBasket ? (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <Check className="w-3.5 h-3.5 mr-1" /> In Basket
            </span>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-800 hover:text-black bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-md transition"
              aria-label="Add unique piece to basket"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
