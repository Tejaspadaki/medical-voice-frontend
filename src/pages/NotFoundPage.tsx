import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope, ArrowLeft, Home, ShieldAlert } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-4">
        <div className="w-16 h-16 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Stethoscope className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-800/80 inline-block">
          404 Page Not Found
        </span>
        <h1 className="text-xl font-bold text-white tracking-tight">ಪುಟ ಲಭ್ಯವಿಲ್ಲ (Resource Missing)</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          ನೀವು ಹುಡುಕುತ್ತಿರುವ ವೈದ್ಯಕೀಯ ದಾಖಲೆ ಅಥವಾ ಪುಟವು ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ ಅಥವಾ ಸ್ಥಳಾಂತರಿಸಲಾಗಿದೆ.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg glow-blue transition-all active:scale-95"
          >
            <Home className="w-4 h-4" /> ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> ಲಾಗಿನ್ ಪುಟ
          </Link>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mt-6 font-medium">
        AuraDoc Clinical AI • AI-Based Multilingual Medical Speech Transcription System
      </p>
    </div>
  );
}
