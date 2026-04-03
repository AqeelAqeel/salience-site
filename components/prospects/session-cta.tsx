"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarCheck, MessageSquare, PhoneCall, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

function useCalendly() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src*="calendly"]')) {
      setLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  const openCalendly = useCallback(() => {
    if (loaded && (window as unknown as { Calendly?: { initPopupWidget: (opts: { url: string }) => void } }).Calendly) {
      (window as unknown as { Calendly: { initPopupWidget: (opts: { url: string }) => void } }).Calendly.initPopupWidget({
        url: "https://calendly.com/aqeelali/aa-30",
      });
    }
  }, [loaded]);

  return openCalendly;
}

interface SessionCTAProps {
  className?: string;
}

export function SessionCTA({ className }: SessionCTAProps) {
  const openCalendly = useCalendly();

  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto",
        "rounded-3xl overflow-hidden",
        "bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10",
        "border border-white/[0.06]",
        "px-8 py-10 md:px-12 md:py-14",
        "text-center",
        "animate-in fade-in slide-in-from-bottom-4 duration-700",
        className
      )}
    >
      <h3 className="text-2xl md:text-3xl font-bold text-white/90 mb-3">
        See what&apos;s possible.
      </h3>
      <p className="text-base md:text-lg text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
        Book a quick call. We&apos;ll map your workflow, show you where AI
        creates leverage, and give you a clear picture — no strings attached.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <button
          onClick={openCalendly}
          className={cn(
            "w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg",
            "bg-gradient-to-r from-amber-500 to-amber-600 text-black",
            "hover:from-amber-400 hover:to-amber-500",
            "active:scale-[0.97] transition-all duration-200",
            "shadow-lg shadow-amber-500/20",
            "flex items-center justify-center gap-2"
          )}
        >
          <CalendarCheck className="w-5 h-5" />
          Book a Free Consultation
        </button>
        <a
          href="sms:+14087180712?body=Hi, I want to learn more about Salience"
          className={cn(
            "w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg",
            "border border-white/20 text-white",
            "hover:bg-white/10",
            "active:scale-[0.97] transition-all duration-200",
            "flex items-center justify-center gap-2"
          )}
        >
          <MessageSquare className="w-5 h-5" />
          Text Us
        </a>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/40 text-sm">
        <a
          href="tel:+14087180712"
          className="flex items-center gap-2 hover:text-amber-400 transition-colors"
        >
          <PhoneCall className="w-4 h-4" />
          <span>+1 (408) 718-0712</span>
        </a>
        <span className="hidden sm:block text-white/20">|</span>
        <a
          href="mailto:aqeel@aqeelali.com"
          className="flex items-center gap-2 hover:text-amber-400 transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>aqeel@aqeelali.com</span>
        </a>
      </div>
    </div>
  );
}
