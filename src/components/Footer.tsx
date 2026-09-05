import React from "react";
import { ShieldCheck, Truck, QrCode, RefreshCw, Lock, MessageSquare, Instagram, Facebook, Video } from "lucide-react";

export const Footer: React.FC<{ onOpenAdmin: () => void }> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-[#1c1917] text-stone-300 mt-20 border-t border-stone-800">
      {/* 4 Core Boutique Guarantees */}
      <div className="border-b border-stone-800 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-1">
              1-of-1 Unique Inventory
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Every item is a singular physical vintage or second-hand piece. When purchased, it is marked SOLD permanently.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-1">
              UK Shipping Partners
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dedicated tracking via Evri, Royal Mail, and InPost 24/7 Lockers with accurate postal delivery throughout the UK.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-1">
              Address QR Generation
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Every sale automatically generates an address QR code directly on our server for courier and packing sheet accuracy.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-1">
              Hand-Inspected in London
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Each garment undergoes rigorous authentication, dry-cleaning inspection, and detailed measurement before listing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-bold tracking-[0.2em] text-white uppercase mb-2">
              STYLE AND CLASS
            </h3>
            <p className="text-xs text-stone-400 max-w-sm mb-4 leading-relaxed">
              London&apos;s premier second-hand fashion boutique. We bridge timeless heritage tailoring, archival luxury, and responsible circular fashion.
            </p>
            <div className="text-xs text-stone-400 space-y-1.5">
              <p>Registered in England &amp; Wales</p>
              <p>Boutique HQ: Mayfair &amp; Chelsea, London, United Kingdom</p>
              <p>Customer Enquiries: support@styleandclass.co.uk</p>
              <p className="flex items-center gap-1.5 pt-1 text-stone-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-stone-400">WhatsApp Concierge:</span>
                <a
                  href="https://wa.me/447591878215?text=Hello%20STYLE%20AND%20CLASS%20London%2C%20I%20have%20an%20enquiry%20regarding%20a%20piece."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-400" />
                  <span>+44 7591 878215</span>
                </a>
              </p>
            </div>
          </div>

          {/* Social Channels */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
              Social Channels
            </h4>
            <ul className="text-xs space-y-3 text-stone-400">
              <li>
                <a
                  href="https://www.instagram.com/danmark.uk?igsh=MXpsaXNib3JzcHFw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-2 transition group"
                >
                  <span className="w-7 h-7 rounded-md bg-stone-900 border border-stone-800 group-hover:border-pink-500/50 flex items-center justify-center text-pink-400 transition">
                    <Instagram className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-stone-200 block font-medium">Instagram</span>
                    <span className="text-[10px] text-stone-500 font-mono">@danmark.uk</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@danmark.fashion5?_r=1&_t=ZN-98Dxx0gz2XO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-2 transition group"
                >
                  <span className="w-7 h-7 rounded-md bg-stone-900 border border-stone-800 group-hover:border-cyan-500/50 flex items-center justify-center text-cyan-400 transition">
                    <Video className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-stone-200 block font-medium">TikTok</span>
                    <span className="text-[10px] text-stone-500 font-mono">@danmark.fashion5</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/people/Dan-Danmark/61585382386134/?rdid=LStdMae3aAy4HdR3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DV7Qjem6m%2F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-2 transition group"
                >
                  <span className="w-7 h-7 rounded-md bg-stone-900 border border-stone-800 group-hover:border-blue-500/50 flex items-center justify-center text-blue-400 transition">
                    <Facebook className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-stone-200 block font-medium">Facebook</span>
                    <span className="text-[10px] text-stone-500 font-mono">Dan Danmark</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
              Curated Collections
            </h4>
            <ul className="text-xs space-y-2.5 text-stone-400">
              <li>Women&apos;s Vintage Coats &amp; Silk</li>
              <li>Men&apos;s Savile Row &amp; Heritage Wax</li>
              <li>Designer Handbags &amp; Footwear</li>
              <li>Curated Childrenswear</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
              Store Management
            </h4>
            <ul className="text-xs space-y-2.5 text-stone-400">
              <li>
                <button onClick={onOpenAdmin} className="hover:text-white flex items-center gap-1.5 transition">
                  <Lock className="w-3.5 h-3.5" /> Staff Login &amp; Sales Dashboard
                </button>
              </li>
              <li>Address QR Dispatch Generator</li>
              <li>PayPal Payment Reconciliation</li>
              <li>UK Courier Dispatch Center</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span>&copy; {new Date().getFullYear()} STYLE AND CLASS London. All rights reserved.</span>
            <span className="hidden sm:inline text-stone-700">&bull;</span>
            <div className="flex items-center gap-4 text-stone-400">
              <a
                href="https://www.instagram.com/danmark.uk?igsh=MXpsaXNib3JzcHFw"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 flex items-center gap-1 transition"
                title="Instagram @danmark.uk"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">@danmark.uk</span>
              </a>
              <a
                href="https://www.tiktok.com/@danmark.fashion5?_r=1&_t=ZN-98Dxx0gz2XO"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 flex items-center gap-1 transition"
                title="TikTok @danmark.fashion5"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">@danmark.fashion5</span>
              </a>
              <a
                href="https://www.facebook.com/people/Dan-Danmark/61585382386134/?rdid=LStdMae3aAy4HdR3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DV7Qjem6m%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 flex items-center gap-1 transition"
                title="Facebook Dan Danmark"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Dan Danmark</span>
              </a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span>Official PayPal Certified</span>
            <span>Evri &middot; Royal Mail &middot; InPost</span>
            <span>GBP (£) Default</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
