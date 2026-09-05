import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

interface ContactConfig {
  whatsappPhone: string;
}

export const FloatingWhatsAppButton: React.FC = () => {
  // Initial fallback from client env or boutique default
  const defaultPhone =
    ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_MANAGER_WHATSAPP_PHONE) ||
    "+447591878215";
  const [phone, setPhone] = useState<string>(defaultPhone);

  useEffect(() => {
    // Fetch runtime environment configuration from server
    fetch("/api/config/contact")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data: ContactConfig | null) => {
        if (data?.whatsappPhone) {
          setPhone(data.whatsappPhone);
        }
      })
      .catch((err) => {
        // Silently fallback to defaultPhone
        console.warn("[STYLE AND CLASS] Could not fetch contact config, using default:", err);
      });
  }, []);

  // Clean phone number: remove all non-numeric characters for wa.me URL
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  const prefilledMessage = encodeURIComponent(
    "Hello STYLE AND CLASS London, I am browsing your unique 1-of-1 pieces and would like to ask a question."
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${prefilledMessage}`;

  return (
    <aside aria-label="WhatsApp Concierge" className="fixed bottom-6 right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        aria-label="Message store manager on WhatsApp"
        className="group relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 border border-emerald-500/50 backdrop-blur-xs select-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
        title={`Message Us on WhatsApp (${phone})`}
      >
        {/* Pulsing Online Indicator Dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200" />
        </span>

        {/* Message Icon */}
        <MessageCircle className="w-5 h-5 text-white transition-transform group-hover:scale-110" />

        {/* Label */}
        <span className="font-semibold text-xs tracking-wider uppercase whitespace-nowrap">
          Message Us
        </span>
      </a>
    </aside>
  );
};
