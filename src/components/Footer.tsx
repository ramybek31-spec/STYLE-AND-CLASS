import React from "react";
import { ShieldCheck, Truck, QrCode, RefreshCw, Lock, MessageSquare, ExternalLink, FileText, Shield, Cookie } from "lucide-react";
import { TikTokBrandIcon, InstagramBrandIcon, FacebookBrandIcon } from "./BrandIcons";

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenPolicy?: (policy: "terms" | "privacy" | "cookies") => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenPolicy }) => {
  return (
    <footer className="bg-[#181716] text-stone-300 mt-20 border-t border-stone-800">
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
              UK Courier Delivery
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dispatched with tracked couriers: Evri, Royal Mail 1st Class, or InPost 24/7 Lockers with rapid London dispatch.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-1">
              Automated Address QR
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Every completed order generates a free delivery address QR code stored securely for zero delivery address errors.
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-serif text-2xl font-bold tracking-[0.2em] text-white uppercase">
              STYLE AND CLASS
            </h3>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              London&apos;s premier second-hand fashion boutique. We bridge timeless heritage tailoring, archival luxury, and responsible circular fashion.
            </p>
            <div className="text-xs text-stone-400 space-y-1.5 pt-2 border-t border-stone-800/80">
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

          {/* Social Channels with Official Brand Icons */}
          <div className="md:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest">
                Official Social Profiles
              </h4>
              <span className="text-[10px] text-amber-400/90 uppercase tracking-wider font-mono">
                Live Channels
              </span>
            </div>
            
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              Follow our official channels for daily live drop alerts, styling try-ons, and vintage lookbooks:
            </p>

            <div className="space-y-3">
              {/* Instagram Card */}
              <a
                href="https://www.instagram.com/danmark.uk?igsh=MXpsaXNib3JzcHFw"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-lg bg-stone-900/90 border border-stone-800 hover:border-pink-500/60 transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                    <InstagramBrandIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs tracking-wide">Instagram</span>
                      <span className="text-[10px] text-pink-400 font-mono">@danmark.uk</span>
                    </div>
                    <p className="text-[11px] text-stone-400 group-hover:text-stone-300 transition">
                      Daily Lookbooks &amp; New Arrivals
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-pink-400 transition" />
              </a>

              {/* TikTok Card */}
              <a
                href="https://www.tiktok.com/@danmark.fashion5?_r=1&_t=ZN-98Dxx0gz2XO"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-lg bg-stone-900/90 border border-stone-800 hover:border-cyan-400/60 transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-black border border-stone-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-pink-500/20 opacity-40" />
                    <TikTokBrandIcon className="w-5 h-5 text-white relative z-10 drop-shadow-[0_1px_1px_rgba(37,244,238,0.7)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs tracking-wide">TikTok</span>
                      <span className="text-[10px] text-cyan-400 font-mono">@danmark.fashion5</span>
                    </div>
                    <p className="text-[11px] text-stone-400 group-hover:text-stone-300 transition">
                      Live Try-Ons &amp; Vintage Styling
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-cyan-400 transition" />
              </a>

              {/* Facebook Card */}
              <a
                href="https://www.facebook.com/people/Dan-Danmark/61585382386134/?rdid=LStdMae3aAy4HdR3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DV7Qjem6m%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-lg bg-stone-900/90 border border-stone-800 hover:border-blue-500/60 transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1877F2] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                    <FacebookBrandIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs tracking-wide">Facebook</span>
                      <span className="text-[10px] text-blue-400 font-mono">Dan Danmark</span>
                    </div>
                    <p className="text-[11px] text-stone-400 group-hover:text-stone-300 transition">
                      Community Updates &amp; Special Drops
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-blue-400 transition" />
              </a>
            </div>
          </div>

          {/* Boutique Navigation & Legal Policies */}
          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
              Store &amp; Governance
            </h4>
            <ul className="text-xs space-y-2.5 text-stone-400">
              <li>
                <button onClick={onOpenAdmin} className="hover:text-white flex items-center gap-1.5 transition text-left">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Store Manager Login</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy?.("terms")} 
                  className="hover:text-white flex items-center gap-1.5 transition text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>Terms &amp; Conditions</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy?.("privacy")} 
                  className="hover:text-white flex items-center gap-1.5 transition text-left"
                >
                  <Shield className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy?.("cookies")} 
                  className="hover:text-white flex items-center gap-1.5 transition text-left"
                >
                  <Cookie className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>Cookie Policy</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Quick Official Brand Links & Certifications */}
        <div className="border-t border-stone-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span>&copy; {new Date().getFullYear()} STYLE AND CLASS London. All rights reserved.</span>
            <span className="hidden sm:inline text-stone-700">&bull;</span>
            <div className="flex items-center gap-4 text-stone-400">
              <a
                href="https://www.instagram.com/danmark.uk?igsh=MXpsaXNib3JzcHFw"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 flex items-center gap-1.5 transition"
                title="Instagram: @danmark.uk"
              >
                <InstagramBrandIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.tiktok.com/@danmark.fashion5?_r=1&_t=ZN-98Dxx0gz2XO"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 flex items-center gap-1.5 transition"
                title="TikTok: @danmark.fashion5"
              >
                <TikTokBrandIcon className="w-3.5 h-3.5" />
                <span>TikTok</span>
              </a>
              <a
                href="https://www.facebook.com/people/Dan-Danmark/61585382386134/?rdid=LStdMae3aAy4HdR3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DV7Qjem6m%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 flex items-center gap-1.5 transition"
                title="Facebook: Dan Danmark"
              >
                <FacebookBrandIcon className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <button onClick={() => onOpenPolicy?.("terms")} className="hover:text-stone-300 transition">
              Terms
            </button>
            <button onClick={() => onOpenPolicy?.("privacy")} className="hover:text-stone-300 transition">
              Privacy
            </button>
            <button onClick={() => onOpenPolicy?.("cookies")} className="hover:text-stone-300 transition">
              Cookies
            </button>
            <span className="text-stone-700">&bull;</span>
            <span>PayPal Certified</span>
            <span>Evri &middot; Royal Mail &middot; InPost</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
