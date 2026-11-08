"use client";

import React from "react";
import { Users, Languages, Activity, Stethoscope, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StatsCardsProps {
  totalPatients?: number;
}

export function StatsCards({ totalPatients = 0 }: StatsCardsProps) {
  const { user } = useAuth();
  const doctorSpecialization = user?.doctor_profile?.specialization || "General Medicine & Pulmonology";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
      {/* 1. Total Registered Patients */}
      <div className="bg-white p-5 rounded-2xl relative group border border-slate-200/90 hover:border-sky-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between min-h-[148px]">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-bold text-slate-600 leading-normal">
            ನೋಂದಾಯಿತ ರೋಗಿಗಳು (Total Patients)
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5 flex items-baseline justify-between">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
            {totalPatients}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ಲೈವ್ (Live)
          </span>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 leading-normal font-medium">
          <span>ಸಕ್ರಿಯ ರೋಗಿಗಳ ಪಟ್ಟಿ (Active Registry)</span>
        </p>
      </div>

      {/* 2. Translation & NMT Engine */}
      <div className="bg-white p-5 rounded-2xl relative group border border-slate-200/90 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between min-h-[148px]">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-bold text-slate-600 leading-normal">
            AI ಭಾಷಾಂತರ (NMT Engine)
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
            <Languages className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5 flex items-baseline justify-between">
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>English</span> <span className="text-emerald-600 font-bold">➔</span> <span>ಕನ್ನಡ</span>
          </p>
        </div>

        <p className="text-[11px] text-emerald-800 flex items-center gap-1.5 font-semibold leading-normal">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>IndicTrans2 & IndicWhisper ASR</span>
        </p>
      </div>

      {/* 3. Medical NER Classifier */}
      <div className="bg-white p-5 rounded-2xl relative group border border-slate-200/90 hover:border-indigo-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between min-h-[148px]">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-bold text-slate-600 leading-normal">
            ಕ್ಲಿನಿಕಲ್ NER (Clinical NLP)
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shrink-0">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5 flex items-center justify-between">
          <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            4 ವರ್ಗಗಳು (4 Classes)
          </p>
          <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 shadow-xs">
            Rx & Advice
          </span>
        </div>

        <p className="text-[11px] text-slate-500 font-medium leading-normal">
          ರೋಗಲಕ್ಷಣ, ರೋಗನಿರ್ಣಯ & ಔಷಧಿ
        </p>
      </div>

      {/* 4. Active Duty Physician */}
      <div className="bg-white p-5 rounded-2xl relative group border border-slate-200/90 hover:border-purple-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between min-h-[148px]">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-bold text-slate-600 leading-normal">
            ಕರ್ತವ್ಯನಿರತ ವೈದ್ಯರು (Attending Doctor)
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2" title={doctorSpecialization}>
            {doctorSpecialization}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-600 leading-normal pt-1">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>ಖಾತೆ (Role): {user?.role?.name || "Doctor"}</span>
          </span>
          <span className="text-[10px] font-mono text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-semibold">
            {user?.doctor_profile?.registration_no || "KMC-84920"}
          </span>
        </div>
      </div>
    </div>
  );
}
