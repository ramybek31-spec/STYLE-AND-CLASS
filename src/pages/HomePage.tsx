import React from "react";
import { Product, ProductCategory } from "../types";
import { ProductCard } from "../components/ProductCard";
import { HeroSlideshow } from "../components/HeroSlideshow";
import { ArrowRight, ShieldCheck, Truck, QrCode } from "lucide-react";

interface HomePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (cat: ProductCategory | "ALL") => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectProduct,
  onSelectCategory
}) => {
  const availableProducts = products.filter((p) => !p.is_sold && p.status !== "SOLD");
  const newArrivals = availableProducts.slice(0, 6);

  const categoryCards: { title: string; category: ProductCategory; image: string; count: number }[] = [
    {
      title: "Women's Collection",
      category: "WOMEN",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
      count: availableProducts.filter((p) => p.category === "WOMEN").length
    },
    {
      title: "Men's Heritage",
      category: "MEN",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
      count: availableProducts.filter((p) => p.category === "MEN").length
    },
    {
      title: "Kids & Childrenswear",
      category: "KIDS",
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
      count: availableProducts.filter((p) => p.category === "KIDS").length
    },
    {
      title: "Archival Accessories",
      category: "ACCESSORIES",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      count: availableProducts.filter((p) => p.category === "ACCESSORIES").length
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Editorial Boutique Hero Section with Photos Slideshow & Effects */}
      <HeroSlideshow onSelectCategory={onSelectCategory} />

      {/* Trust & Dispatch Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-[#e7e5e4] p-6 rounded-lg shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900 shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#92400e]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">
                100% Unique Physical Items
              </h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Strict 1 item = 1 physical sale inventory model. Atomically verified to prevent double orders.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900 shrink-0">
              <Truck className="w-5 h-5 text-[#92400e]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">
                Dedicated UK Couriers
              </h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Choose Evri, Royal Mail 1st Class, or InPost 24/7 Lockers with tracked UK delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900 shrink-0">
              <QrCode className="w-5 h-5 text-[#92400e]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">
                Automatic Free Address QR
              </h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Every sale instantly generates a free delivery address QR code stored directly on our server.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Categories Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-stone-900 uppercase">
              Curated Departments
            </h2>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest">
              Second-Hand &middot; Authenticated &middot; London Boutique
            </p>
          </div>
          <button
            onClick={() => onSelectCategory("ALL")}
            className="text-xs font-semibold text-stone-900 hover:text-amber-800 uppercase tracking-wider flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryCards.map((cat) => (
            <div
              key={cat.category}
              onClick={() => onSelectCategory(cat.category)}
              className="group relative aspect-[4/5] rounded-lg overflow-hidden cursor-pointer shadow-xs border border-stone-200"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-amber-300">
                  {cat.count} {cat.count === 1 ? "Piece Available" : "Pieces Available"}
                </span>
                <h3 className="font-serif text-lg font-bold tracking-wide mt-1">
                  {cat.title}
                </h3>
                <div className="mt-2 text-xs font-medium text-stone-300 flex items-center gap-1 group-hover:text-white transition">
                  <span>Explore Department</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-stone-900 uppercase">
              New Unique Arrivals
            </h2>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest">
              Physical inventory &middot; 1 piece per listing
            </p>
          </div>
          <button
            onClick={() => onSelectCategory("ALL")}
            className="text-xs font-semibold text-stone-900 hover:text-amber-800 uppercase tracking-wider flex items-center gap-1"
          >
            <span>View All Pieces ({availableProducts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
