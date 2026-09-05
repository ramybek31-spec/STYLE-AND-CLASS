import React, { useState } from "react";
import { ShoppingBag, Search, ShieldCheck, Lock, Menu, X, ArrowRight, MessageSquare, Instagram, Facebook, Video } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCategory } from "../types";

interface NavbarProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onNavigateHome: () => void;
  onOpenAdmin: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  onNavigateHome,
  onOpenAdmin,
  searchTerm,
  onSearchChange
}) => {
  const { item, setIsCartOpen } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories: { label: string; value: ProductCategory | "ALL" }[] = [
    { label: "All Pieces", value: "ALL" },
    { label: "Women", value: "WOMEN" },
    { label: "Men", value: "MEN" },
    { label: "Kids", value: "KIDS" },
    { label: "Accessories", value: "ACCESSORIES" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#e7e5e4] transition-all">
      {/* Top Boutique Announcement Bar */}
      <div className="bg-[#1c1917] text-[#f5f5f4] text-xs py-1.5 px-4 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>London Boutique &middot; 100% Unique Second-Hand Pieces &middot; 1 Item = 1 Physical Sale</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-stone-300">
            <a
              href="https://wa.me/447591878215?text=Hello%20STYLE%20AND%20CLASS%20London%2C%20I%20have%20an%20enquiry%20regarding%20a%20piece."
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1.5 transition text-emerald-400 font-mono text-[11px]"
              title="Chat with Store Manager on WhatsApp"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp: +44 7591 878215</span>
            </a>
            <span>&middot;</span>
            <div className="flex items-center gap-2 text-stone-400">
              <a
                href="https://www.instagram.com/danmark.uk?igsh=MXpsaXNib3JzcHFw"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition"
                title="Instagram @danmark.uk"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.tiktok.com/@danmark.fashion5?_r=1&_t=ZN-98Dxx0gz2XO"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition"
                title="TikTok @danmark.fashion5"
              >
                <Video className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.facebook.com/people/Dan-Danmark/61585382386134/?rdid=LStdMae3aAy4HdR3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DV7Qjem6m%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
                title="Facebook Dan Danmark"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
            <span>&middot;</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-white underline underline-offset-2 flex items-center gap-1 transition"
            >
              <Lock className="w-3 h-3" /> Store Manager
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 rounded-md"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Boutique Brand Logo */}
          <div className="flex flex-col items-center md:items-start cursor-pointer" onClick={onNavigateHome}>
            <span className="font-serif tracking-[0.2em] text-2xl sm:text-3xl font-bold text-[#1c1917] uppercase">
              STYLE AND CLASS
            </span>
            <span className="text-[10px] tracking-[0.35em] text-stone-500 uppercase font-sans">
              London &middot; Second-Hand Boutique
            </span>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  onSelectCategory(cat.value);
                }}
                className={`text-sm font-medium tracking-wider uppercase transition-colors relative py-1 ${
                  currentCategory === cat.value
                    ? "text-[#1c1917] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1c1917]"
                    : "text-stone-600 hover:text-[#1c1917]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Right Controls: Search, Cart, Admin */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center border border-stone-300 rounded-full bg-white px-3 py-1.5 shadow-sm">
                  <Search className="w-4 h-4 text-stone-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search designer, coat, silk..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="text-xs bg-transparent focus:outline-none w-36 sm:w-48 text-stone-800"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSearchChange("");
                    }}
                    className="text-stone-400 hover:text-stone-600 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-stone-700 hover:text-stone-900 rounded-full hover:bg-stone-100 transition"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Shopping Basket Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-stone-800 hover:text-black rounded-full hover:bg-stone-100 transition flex items-center"
              aria-label="View Shopping Basket"
            >
              <ShoppingBag className="w-5 h-5" />
              {item && (
                <span className="absolute top-1.5 right-1.5 bg-[#92400e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  1
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#faf9f6] border-b border-stone-200 px-4 pt-2 pb-6 space-y-3">
          <div className="text-xs font-semibold text-stone-400 tracking-wider uppercase mb-2">
            Categories
          </div>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                onSelectCategory(cat.value);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 px-3 rounded text-sm font-medium tracking-wide ${
                currentCategory === cat.value
                  ? "bg-stone-200 text-stone-900 font-semibold"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <a
              href="https://wa.me/447591878215?text=Hello%20STYLE%20AND%20CLASS%20London%2C%20I%20have%20an%20enquiry%20regarding%20a%20piece."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between text-xs py-2 px-3 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded font-medium"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Store Concierge
              </span>
              <span className="font-mono text-[11px]">+44 7591 878215</span>
            </a>

            <button
              onClick={() => {
                onOpenAdmin();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between text-xs py-2 px-3 text-stone-600 hover:bg-stone-100 rounded"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Store Manager Dashboard
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {/* Social channels row in mobile menu */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-around py-1">
              <a
                href="https://www.instagram.com/danmark.uk?igsh=MXpsaXNib3JzcHFw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-pink-600 font-medium"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.tiktok.com/@danmark.fashion5?_r=1&_t=ZN-98Dxx0gz2XO"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-cyan-600 font-medium"
              >
                <Video className="w-4 h-4 text-cyan-600" />
                <span>TikTok</span>
              </a>
              <a
                href="https://www.facebook.com/people/Dan-Danmark/61585382386134/?rdid=LStdMae3aAy4HdR3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DV7Qjem6m%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-blue-600 font-medium"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
