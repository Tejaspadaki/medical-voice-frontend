"use client";

import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

export function SafetyBanner() {
  return (
    <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-white border border-amber-200/90 flex items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-100/90 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-amber-950 tracking-tight flex items-center gap-1.5">
            <span>ವೈದ್ಯರ ಕಡ್ಡಾಯ ಪರಿಶೀಲನಾ ಸುರಕ್ಷತಾ ನಿಯಮ (Clinical Safety Protocol)</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-amber-900/80 mt-0.5 leading-relaxed font-medium">
            ವೈದ್ಯರು ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿದರೂ/ಟೈಪ್ ಮಾಡಿದರೂ, AI ಅದನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪರಿಶುದ್ಧ ಕನ್ನಡ ವರದಿಯನ್ನಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.
          </p>
        </div>
      </div>
      <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold bg-amber-100 text-amber-850 px-3 py-1 rounded-full border border-amber-300 shadow-xs shrink-0">
        <Sparkles className="w-3 h-3 text-amber-600" />
        ಸುರಕ್ಷತಾ ಹಂತ ೧
      </span>
    </div>
  );
}
