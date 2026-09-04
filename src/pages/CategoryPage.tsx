import React, { useState, useMemo } from "react";
import { Product, ProductCategory } from "../types";
import { ProductCard } from "../components/ProductCard";
import { Filter, X, SlidersHorizontal } from "lucide-react";

interface CategoryPageProps {
  currentCategory: ProductCategory | "ALL";
  onSelectCategory: (cat: ProductCategory | "ALL") => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  searchTerm: string;
  onClearSearch: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  currentCategory,
  onSelectCategory,
  products,
  onSelectProduct,
  searchTerm,
  onClearSearch
}) => {
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "PRICE_ASC" | "PRICE_DESC">("NEWEST");

  const categories: { label: string; value: ProductCategory | "ALL" }[] = [
    { label: "All Pieces", value: "ALL" },
    { label: "Women", value: "WOMEN" },
    { label: "Men", value: "MEN" },
    { label: "Kids", value: "KIDS" },
    { label: "Accessories", value: "ACCESSORIES" }
  ];

  // Distinct Brands
  const distinctBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (currentCategory !== "ALL" && p.category !== currentCategory) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const match =
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term);
        if (!match) return false;
      }
      // Condition filter
      if (selectedCondition !== "ALL" && !p.condition.toLowerCase().includes(selectedCondition.toLowerCase())) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== "ALL" && p.brand !== selectedBrand) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "PRICE_ASC") return a.price - b.price;
      if (sortBy === "PRICE_DESC") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, currentCategory, searchTerm, selectedCondition, selectedBrand, sortBy]);

  const activeFilterCount =
    (currentCategory !== "ALL" ? 1 : 0) +
    (selectedCondition !== "ALL" ? 1 : 0) +
    (selectedBrand !== "ALL" ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  const resetFilters = () => {
    onSelectCategory("ALL");
    setSelectedCondition("ALL");
    setSelectedBrand("ALL");
    onClearSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.3em] font-semibold text-stone-500 uppercase">
            Curated Catalogue
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 uppercase mt-1">
            {currentCategory === "ALL" ? "All Unique Pieces" : `${currentCategory} Collection`}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "physical item" : "physical items"} &middot; 1 item = 1 physical sale
          </p>
        </div>

        {/* Category Pill Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium tracking-wide uppercase transition ${
                currentCategory === cat.value
                  ? "bg-[#1c1917] text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-300 hover:border-stone-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white p-4 rounded-lg border border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-stone-700">
            <SlidersHorizontal className="w-4 h-4 text-stone-500" />
            <span>Refine:</span>
          </div>

          {/* Brand Selector */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="border border-stone-300 rounded px-2.5 py-1.5 bg-white text-stone-800 focus:outline-none focus:border-stone-500"
          >
            <option value="ALL">All Brands</option>
            {distinctBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Condition Selector */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="border border-stone-300 rounded px-2.5 py-1.5 bg-white text-stone-800 focus:outline-none focus:border-stone-500"
          >
            <option value="ALL">All Conditions</option>
            <option value="Pristine">Pristine / Like New</option>
            <option value="Excellent">Excellent Vintage</option>
            <option value="Very Good">Very Good Pre-Loved</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-stone-500 hover:text-stone-900 flex items-center gap-1 underline underline-offset-2 ml-1"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-stone-300 rounded px-2.5 py-1.5 bg-white text-stone-800 focus:outline-none focus:border-stone-500 font-medium"
          >
            <option value="NEWEST">Newest Additions</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-lg space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-800">No matching pieces found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try adjusting your filter settings or search terms to explore other authenticated London pieces.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="bg-stone-900 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-stone-800 transition"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
