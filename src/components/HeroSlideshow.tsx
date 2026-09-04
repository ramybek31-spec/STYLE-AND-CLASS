import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  Check
} from "lucide-react";
import { ProductCategory } from "../types";

export interface HeroSlideData {
  id: string;
  image: string;
  tag: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  categoryTarget: ProductCategory | "ALL";
  details: string[];
  caption: string;
}

export const HERO_SLIDES: HeroSlideData[] = [
  {
    id: "slide-1-display",
    image: "/assets/slideshow/slide-1-display.jpg",
    tag: "Mayfair Showroom Selection",
    badge: "Curated Wall & Tailored Shirts",
    title: "Heritage Tailoring & Folded Silks",
    subtitle: "Hand-curated shirts, pastel knits & archival British cottons",
    description: "Every shelf reflects meticulously pressed, one-off vintage pieces. Once an authenticated garment leaves our Mayfair boutique, no duplicates exist in circulation.",
    categoryTarget: "ALL",
    details: ["Folded Pastel Shirts", "Patterned Blouses", "Heritage Tailoring"],
    caption: "Boutique showcase featuring curated folded shirts, statement printed blouses, and hand-selected trousers."
  },
  {
    id: "slide-2-mannequin",
    image: "/assets/slideshow/slide-2-mannequin.jpg",
    tag: "Archive Runway & Street Style",
    badge: "Couture Mannequin & Vintage Skirts",
    title: "Sculptural Evening & Pleated Silhouettes",
    subtitle: "Chic black cutout tailoring paired with pleated tartans, gingham & polka dots",
    description: "From vintage pleated Scottish tartans to contemporary European silhouettes, explore striking vintage pieces curated for discerning collectors.",
    categoryTarget: "WOMEN",
    details: ["Pleated Tartan Skirts", "Evening Cutout Blouse", "Archive Houndstooth"],
    caption: "Styling installation showcasing a couture black silhouette with curated rails of pleated vintage skirts."
  },
  {
    id: "slide-3-knitwear",
    image: "/assets/slideshow/slide-3-knitwear.jpg",
    tag: "Heritage Knit Studio",
    badge: "Fine Gauge Knitwear & Cashmere",
    title: "Pure Scottish Wool & Cashmere Edit",
    subtitle: "Color-coordinated palette in cobalt, powder blue, deep black & camel",
    description: "Soft tactile luxury knits hand-inspected for pristine weave integrity. Featuring genuine Hawick cashmeres, lambswool crewnecks, and seasonal cardigans.",
    categoryTarget: "MEN",
    details: ["Cobalt & Sky Knits", "100% Pure Cashmere", "Pristine Weave Quality"],
    caption: "Precision-calibrated knitwear rail illuminated under warm ambient London showroom lighting."
  },
  {
    id: "slide-4-designer",
    image: "/assets/slideshow/slide-4-designer.jpg",
    tag: "Mayfair Studio Inspection",
    badge: "Archival Silks & Evening Pieces",
    title: "Textured Gowns, Lace & Studio Blouses",
    subtitle: "Archival silk blouses, lace embroidery & tailored jackets on solid beech hangers",
    description: "Each item carries its unique provenance tag with precise measurements and material certifications. Ready for next-day dispatch across the UK.",
    categoryTarget: "WOMEN",
    details: ["Powder Blue Evening Dress", "Fine Black Lace Overlay", "Silk Archival Blouse"],
    caption: "Curated studio rail of authenticated dresses, silk garments, and jackets bearing archival boutique tags."
  }
];

interface HeroSlideshowProps {
  onSelectCategory: (category: ProductCategory | "ALL") => void;
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ onSelectCategory }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [fullscreenImage, setFullscreenImage] = useState<HeroSlideData | null>(null);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION_MS = 6000;
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentSlide = HERO_SLIDES[currentIndex];

  const goToSlide = useCallback((newIndex: number, newDirection: 1 | -1 = 1) => {
    setDirection(newDirection);
    setCurrentIndex(newIndex);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const nextSlide = useCallback(() => {
    const nextIdx = (currentIndex + 1) % HERO_SLIDES.length;
    goToSlide(nextIdx, 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIdx = (currentIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    goToSlide(prevIdx, -1);
  }, [currentIndex, goToSlide]);

  // Slideshow timer & progress tracker
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    setProgress(0);

    // Progress bar animation interval (updates every 50ms)
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION_MS) * 100);
      setProgress(pct);
    }, 50);

    // Automatic slide advancement
    timerRef.current = window.setTimeout(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, nextSlide]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenImage) {
        if (e.key === "Escape") setFullscreenImage(null);
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
        return;
      }

      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenImage, nextSlide, prevSlide]);

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 1.04,
      x: dir > 0 ? 30 : -30
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        opacity: { duration: 0.7, ease: "easeOut" },
        scale: { duration: 6, ease: "easeOut" },
        x: { duration: 0.6, ease: "easeOut" }
      }
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.98,
      x: dir > 0 ? -30 : 30,
      transition: {
        opacity: { duration: 0.5, ease: "easeIn" },
        x: { duration: 0.5, ease: "easeIn" }
      }
    })
  };

  return (
    <section 
      id="boutique-hero-slideshow"
      aria-label="Editorial Boutique Slideshow"
      className="relative overflow-hidden bg-[#181716] text-[#faf9f6]"
    >
      {/* Background ambient lighting and subtle texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none scale-105"
        style={{ backgroundImage: `url(${currentSlide.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#181716]/90 via-[#181716]/80 to-[#181716] pointer-events-none" />

      {/* Top Boutique Announcement & Progress Bar */}
      <div className="relative z-20 border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono uppercase tracking-widest text-[11px] text-amber-200">
              London Mayfair Boutique
            </span>
            <span className="hidden sm:inline text-stone-600">&bull;</span>
            <span className="hidden sm:inline text-stone-400 text-[11px]">
              Every Piece 100% Unique &middot; Single-Physical Inventory
            </span>
          </div>

          {/* Controls: Play/Pause, Slide count, Fullscreen */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 text-[11px] font-mono text-stone-400 hover:text-white px-2 py-0.5 rounded transition"
              title={isPlaying ? "Pause automatic slideshow" : "Play automatic slideshow"}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="hidden md:inline">{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <div className="text-[11px] font-mono text-amber-300/90 tracking-wider">
              <span className="font-bold text-white">{String(currentIndex + 1).padStart(2, "0")}</span>
              <span className="text-stone-500 mx-1">/</span>
              <span>{String(HERO_SLIDES.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        {/* Global Progress Strip */}
        <div className="h-0.5 w-full bg-stone-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-200 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Hero Stage */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Storytelling */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/90 text-amber-200 text-xs tracking-wider uppercase font-medium border border-stone-700/80 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentSlide.tag}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#faf9f6] leading-[1.12]">
                {currentSlide.title}
              </h1>

              <p className="text-sm sm:text-base text-amber-100/80 font-light leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light line-clamp-3">
              {currentSlide.description}
            </p>

            {/* Curated Highlights Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {currentSlide.details.map((detail, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900/80 border border-stone-700/70 text-[11px] text-stone-300 font-mono"
                >
                  <Check className="w-3 h-3 text-amber-400" />
                  <span>{detail}</span>
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectCategory(currentSlide.categoryTarget)}
                className="bg-[#faf9f6] hover:bg-white text-[#181716] font-semibold px-6 py-3.5 rounded-md transition text-xs tracking-wider uppercase inline-flex items-center gap-2 shadow-sm hover:gap-2.5 duration-200"
              >
                <span>Explore This Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectCategory("ALL")}
                className="border border-stone-700 hover:border-white text-stone-300 hover:text-white font-medium px-5 py-3.5 rounded-md transition text-xs tracking-wider uppercase inline-flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All 1-of-1 Pieces</span>
              </button>
            </div>

            {/* Mini dots selector */}
            <div className="pt-3 flex items-center gap-2">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx, idx > currentIndex ? 1 : -1)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx 
                      ? "w-8 bg-amber-400" 
                      : "w-2 bg-stone-700 hover:bg-stone-500"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Visual Stage with Effects */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative group/stage">
              
              {/* Outer Golden Glow & Border Accent */}
              <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-stone-800/30 to-amber-700/20 blur-sm opacity-75 group-hover/stage:opacity-100 transition duration-500" />

              {/* Main Photo Card Display */}
              <div 
                className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/9] rounded-lg overflow-hidden bg-stone-950 border border-stone-700/80 shadow-2xl select-none"
                onMouseEnter={() => setIsPlaying(false)}
                onMouseLeave={() => setIsPlaying(true)}
              >
                <AnimatePresence custom={direction} initial={false} mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                  >
                    {/* The Active Photograph */}
                    <img
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform transition-transform duration-700"
                    />

                    {/* Gradient Shading for Depth & Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-950/50 via-transparent to-stone-950/40" />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                      <span className="bg-stone-900/85 backdrop-blur-md border border-stone-700/80 text-amber-200 text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded shadow-md flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{currentSlide.badge}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenImage(currentSlide);
                        }}
                        className="pointer-events-auto bg-stone-900/80 hover:bg-stone-900 text-stone-300 hover:text-white backdrop-blur-md border border-stone-700 p-1.5 rounded transition shadow-md"
                        title="View photo high resolution"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Metadata within the Photo Frame */}
                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 z-10">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] tracking-[0.25em] font-semibold uppercase text-amber-300 block font-mono">
                            STYLE &amp; CLASS &middot; ARCHIVE PHOTOGRAPHY
                          </span>
                          <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                            {currentSlide.title}
                          </h2>
                          <p className="text-xs text-stone-300 line-clamp-1 max-w-lg font-light">
                            {currentSlide.caption}
                          </p>
                        </div>

                        <button
                          onClick={() => onSelectCategory(currentSlide.categoryTarget)}
                          className="self-start sm:self-auto shrink-0 bg-stone-900/90 hover:bg-white text-white hover:text-stone-950 px-3.5 py-1.5 rounded text-[11px] font-semibold tracking-wider uppercase border border-stone-700 hover:border-white transition flex items-center gap-1.5 backdrop-blur-sm"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Left & Right Arrow Navigation Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-stone-950/70 hover:bg-stone-900 text-white backdrop-blur-md border border-stone-700/80 shadow-lg transition transform hover:scale-105 active:scale-95 focus:outline-none"
                  aria-label="Previous boutique photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-stone-950/70 hover:bg-stone-900 text-white backdrop-blur-md border border-stone-700/80 shadow-lg transition transform hover:scale-105 active:scale-95 focus:outline-none"
                  aria-label="Next boutique photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Four-Photo Interactive Thumbnail Strip */}
              <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = currentIndex === idx;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => goToSlide(idx, idx > currentIndex ? 1 : -1)}
                      className={`relative rounded-md overflow-hidden p-1 transition-all text-left border ${
                        isActive
                          ? "bg-stone-900 border-amber-400 ring-1 ring-amber-400/50 shadow-md scale-[1.02]"
                          : "bg-stone-950/70 border-stone-800 hover:border-stone-600 opacity-70 hover:opacity-100"
                      }`}
                      title={slide.title}
                    >
                      <div className="aspect-[16/10] rounded overflow-hidden mb-1.5 bg-stone-900">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            isActive ? "scale-105" : "group-hover:scale-105"
                          }`}
                        />
                      </div>
                      
                      <div className="px-1 pb-1">
                        <div className="text-[10px] font-mono text-amber-300 font-semibold truncate leading-none">
                          0{idx + 1}
                        </div>
                        <div className="text-[10px] font-medium text-stone-200 truncate mt-0.5 leading-tight">
                          {slide.badge.split("&")[0].trim()}
                        </div>
                      </div>

                      {/* Active slide progress indicator pill */}
                      {isActive && isPlaying && (
                        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Lightbox / Fullscreen Image Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setFullscreenImage(null)}
          >
            <div 
              className="relative max-w-5xl w-full bg-stone-950 border border-stone-800 rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-stone-900">
                <img
                  src={fullscreenImage.image}
                  alt={fullscreenImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />

                <button
                  onClick={() => setFullscreenImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-stone-700 transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 bg-stone-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-800">
                <div>
                  <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest">
                    {fullscreenImage.badge}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white mt-0.5">
                    {fullscreenImage.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 max-w-xl">
                    {fullscreenImage.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setFullscreenImage(null);
                      onSelectCategory(fullscreenImage.categoryTarget);
                    }}
                    className="bg-white hover:bg-stone-100 text-stone-950 px-5 py-2.5 rounded font-semibold text-xs uppercase tracking-wider transition inline-flex items-center gap-2"
                  >
                    <span>Browse Department</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
