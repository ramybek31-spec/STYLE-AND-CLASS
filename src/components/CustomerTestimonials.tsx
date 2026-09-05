import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";

export interface Testimonial {
  id: string;
  author: string;
  location: string;
  role: string;
  itemPurchased: string;
  quote: string;
  rating: number;
  date: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "review-1",
    author: "Lady Eleanor Vance",
    location: "Kensington, London",
    role: "Verified Collector",
    itemPurchased: "Vintage 1980s Pure Cashmere Trench Coat",
    quote:
      "The single-piece physical inventory promise is genuine. The garment arrived impeccably dry-cleaned, hand-steamed, and wrapped with boutique care. It is impossible to find archival tailoring in this pristine condition anywhere else in London.",
    rating: 5,
    date: "August 2024"
  },
  {
    id: "review-2",
    author: "Marcus Brookfield",
    location: "Richmond upon Thames, UK",
    role: "Verified Buyer",
    itemPurchased: "Savile Row Hand-Tailored Wool Blazer",
    quote:
      "Ordered on Tuesday evening via PayPal, and the address QR code appeared immediately on my receipt. Dispatched next morning via tracked Royal Mail. The measurements provided on the listing were millimeter-accurate.",
    rating: 5,
    date: "July 2024"
  },
  {
    id: "review-3",
    author: "Sophie Lin",
    location: "Marylebone, London",
    role: "Verified Buyer",
    itemPurchased: "Archival Mulberry Embossed Leather Bag",
    quote:
      "I was skeptical about buying second-hand luxury online, but STYLE AND CLASS London exceeded expectations. The authenticity check tag and leather condition were flawless. A true hidden treasure for sustainable British fashion.",
    rating: 5,
    date: "August 2024"
  },
  {
    id: "review-4",
    author: "Alastair & Fiona Campbell",
    location: "Chelsea, London",
    role: "Verified Collectors",
    itemPurchased: "Scottish Heritage Tartan Pleated Wool Skirt",
    quote:
      "Knowing that once you buy a piece it is immediately reserved and taken off sale gives total peace of mind. No dropshipping, no duplicate stock. Genuine 1-of-1 Mayfair curation.",
    rating: 5,
    date: "June 2024"
  },
  {
    id: "review-5",
    author: "Chloe Davenport",
    location: "Islington, London",
    role: "Verified Buyer",
    itemPurchased: "1990s Italian Silk Printed Evening Blouse",
    quote:
      "Followed their daily drops on Instagram and TikTok, then secured this silk blouse here. The quality of curation is unmatched—arrived in 48 hours via InPost locker with courier QR tracking.",
    rating: 5,
    date: "September 2024"
  }
];

export const CustomerTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      nextTestimonial();
    }, 6500);
    return () => clearInterval(interval);
  }, [isAutoplay, currentIndex]);

  const active = TESTIMONIALS[currentIndex];

  return (
    <section 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
      id="customer-testimonials"
    >
      <div className="bg-white border border-[#e7e5e4] rounded-xl shadow-xs overflow-hidden">
        {/* Header Strip */}
        <div className="bg-[#1c1917] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-amber-300 block">
                Customer Testimonials &middot; Client Feedback
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold tracking-wide">
                Trusted by London&apos;s Discerning Vintage Enthusiasts
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-300">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-white font-mono">4.9 / 5.0</span>
            <span className="text-stone-500">&bull;</span>
            <span className="text-stone-400">100% Verified Authenticity</span>
          </div>
        </div>

        {/* Carousel Body */}
        <div className="p-8 sm:p-12 relative bg-gradient-to-b from-[#faf9f6] to-white">
          <Quote className="absolute top-6 left-6 w-12 h-12 text-stone-200 -z-0 opacity-70" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            {/* Stars */}
            <div className="flex justify-center items-center gap-1 text-amber-500">
              {[...Array(active.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>

            {/* Quote */}
            <p className="font-serif text-lg sm:text-xl md:text-2xl text-stone-800 leading-relaxed italic font-normal">
              &ldquo;{active.quote}&rdquo;
            </p>

            {/* Author details */}
            <div className="pt-2">
              <div className="font-semibold text-stone-900 tracking-wide text-sm flex items-center justify-center gap-1.5">
                <span>{active.author}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="Verified Customer" />
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                {active.location} &middot; <span className="font-mono text-stone-400">{active.date}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[11px] text-stone-700">
                <span className="text-stone-400 font-normal">Purchased:</span>
                <span className="font-medium text-stone-800 font-serif">{active.itemPurchased}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200 max-w-3xl mx-auto">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 transition"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? "w-6 bg-stone-900" : "w-2 bg-stone-300 hover:bg-stone-400"
                  }`}
                  aria-label={`View feedback ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 transition"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Pillars Footer Bar */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-stone-600">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1-of-1 Authenticated Stock</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Dispatch QR Tracking</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-600 font-bold">7-Day</span>
            <span>UK Return Guarantee Under Policy</span>
          </div>
        </div>
      </div>
    </section>
  );
};
