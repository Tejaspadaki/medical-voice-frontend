"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Stethoscope, LogOut, User, Globe2 } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const doctorReg = user?.doctor_profile?.registration_no || "KMC-84920";
  const doctorSpecialization = user?.doctor_profile?.specialization || "ಮುಖ್ಯ ವೈದ್ಯಾಧಿಕಾರಿ (Chief Medical Officer)";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & AI Pipeline Bilingual Badge */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-teal-500 flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition-all">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="System Operational" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                AuraDoc <span className="text-sky-600 font-black text-sm tracking-normal">Clinical AI</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2.5 py-0.5 rounded-full shadow-xs">
                <Globe2 className="w-3 h-3 text-emerald-600" />
                English ➔ ಕನ್ನಡ (Bilingual NMT)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[320px] sm:max-w-none">
              ಧ್ವನಿ ಸಮಾಲೋಚನೆ & ವೈದ್ಯಕೀಯ ದಾಖಲೀಕರಣ (Medical Speech Transcription & Documentation)
            </p>
          </div>
        </div>

        {/* Practitioner Profile & Sign Out (Bilingual) */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 pr-3 border-r border-slate-200">
            <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-xs">
              <User className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex flex-col text-right leading-tight">
              <span className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                {user?.full_name || "ಡಾ. ಆನಂದ್ ದೇಶಮುಖ್ (Dr. Anand Deshmukh)"}
              </span>
              <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 mt-0.5">
                <span className="text-sky-700 font-semibold">{doctorSpecialization}</span>
                {doctorReg && (
                  <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    KMC: {doctorReg}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all active:scale-95 shadow-xs"
            title="ಲಾಗ್‌ಔಟ್ ಮಾಡಿ / Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ಲಾಗ್‌ಔಟ್ (Sign Out)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
