import React from "react";
import { Instagram, Facebook } from "lucide-react";

// Official TikTok brand mark SVG
export const TikTokBrandIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.6a6.34 6.34 0 0 0 9.25 5.56 6.32 6.32 0 0 0 3.42-5.6V8.69a8.28 8.28 0 0 0 4.78 1.5v-3.5z" />
  </svg>
);

// Official Instagram brand icon (Lucide with Instagram brand gradient styling)
export const InstagramBrandIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <Instagram className={className} />
);

// Official Facebook brand icon
export const FacebookBrandIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <Facebook className={className} />
);
