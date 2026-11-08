"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRightLeft,
  FileText,
  Activity,
  ClipboardList,
  Pill,
  FileCheck2,
  Sparkles,
  Clock,
  HeartHandshake,
} from "lucide-react";

interface DoctorReviewWorkspaceProps {
  user: any;
  consultationResult: any;
  isApproved: boolean;
  originalEnglishSpeech: string | null;
  editableTranscript: string;
  setEditableTranscript: (val: string) => void;
  editableDiagnosis: string;
  setEditableDiagnosis: (val: string) => void;
  editableSymptoms: any[];
  editableMedications: any[];
  editableAdvice: any[];
  onApproveReport: () => void;
  onOpenPrintModal: () => void;
  onReTranslateEnglish?: (text: string) => void;
  isProcessingASR: boolean;
}

export function DoctorReviewWorkspace({
  user,
  consultationResult,
  isApproved,
  originalEnglishSpeech,
  editableTranscript,
  setEditableTranscript,
  editableDiagnosis,
  setEditableDiagnosis,
  editableSymptoms,
  editableMedications,
  editableAdvice,
  onApproveReport,
  onOpenPrintModal,
  onReTranslateEnglish,
  isProcessingASR,
}: DoctorReviewWorkspaceProps) {
  if (!consultationResult) return null;

  const doctorReg = user?.doctor_profile?.registration_no || "KMC-84920";

  return (
    <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-md animate-in fade-in duration-300">
      {/* Doctor Verification Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ವೈದ್ಯರ ಕಡ್ಡಾಯ ಪರಿಶೀಲನಾ ವರದಿ (Clinical Review & Sign-Off)
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-1">
            ಕನ್ನಡ ವೈದ್ಯಕೀಯ ವರದಿಯ ಪರಿಶೀಲನೆ ಮತ್ತು ದೃಢೀಕರಣ (Doctor Review & Verification)
          </h4>
        </div>

        {isApproved ? (
          <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಸಹಿ ಮಾಡಲಾಗಿದೆ (Verified & Signed)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-xl shadow-xs animate-pulse-subtle">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>ವೈದ್ಯರ ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ (Pending Review)</span>
          </div>
        )}
      </div>

      {/* Optional Original Spoken English Reference Banner */}
      {originalEnglishSpeech && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-sky-800 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
              ಮೂಲ ಇಂಗ್ಲಿಷ್ ಮಾತುಕತೆ / ಟಿಪ್ಪಣಿ (Original English Input):
            </span>
            <p className="text-slate-700 italic font-mono text-[11px] leading-relaxed">
              "{originalEnglishSpeech}"
            </p>
          </div>

          {onReTranslateEnglish && (
            <button
              type="button"
              onClick={() => onReTranslateEnglish(originalEnglishSpeech)}
              disabled={isProcessingASR}
              className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>🔄 ಮರು-ಭಾಷಾಂತರಿಸಿ (Re-translate)</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Transcribed Consultation Text in Pure Kannada */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-600" />
            ಕನ್ನಡಕ್ಕೆ ಭಾಷಾಂತರಿಸಲಾದ ವೈದ್ಯಕೀಯ ಸಂಭಾಷಣೆ (Translated Kannada Consultation)
          </label>
          <span className="text-[11px] text-slate-500 font-medium">ವೈದ್ಯರು ಅಗತ್ಯವಿದ್ದರೆ ಇಲ್ಲಿ ತಿದ್ದಬಹುದು (Doctor Editable)</span>
        </div>
        <textarea
          rows={3}
          value={editableTranscript}
          onChange={(e) => setEditableTranscript(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-sans leading-relaxed shadow-xs"
        />
      </div>

      {/* 2. Structured Clinical Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Symptoms Card */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/90 space-y-3 shadow-xs">
          <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-600" />
            ರೋಗಲಕ್ಷಣಗಳು ಮತ್ತು ಕಾಲಾವಧಿ (Symptoms & Duration)
          </span>
          <div className="space-y-2">
            {editableSymptoms.length === 0 ? (
              <p className="text-xs text-slate-500 italic">ರೋಗಲಕ್ಷಣಗಳು ದಾಖಲಾಗಿಲ್ಲ (No symptoms recorded)</p>
            ) : (
              editableSymptoms.map((symptom, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{symptom.entity}</span>
                    {symptom.english && <span className="text-slate-500 ml-1.5 text-[11px]">({symptom.english})</span>}
                  </div>
                  <span className="text-[11px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md font-semibold border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" />
                    {symptom.duration}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Diagnosis Card */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/90 space-y-3 shadow-xs">
          <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯ (Clinical Diagnosis)
          </span>
          <input
            type="text"
            value={editableDiagnosis}
            onChange={(e) => setEditableDiagnosis(e.target.value)}
            className="w-full bg-white border border-emerald-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          />
          <p className="text-[11px] text-slate-600 font-medium">
            ಕನ್ನಡ ಮೆಡಿಕಲ್ NER & Gemini ಮಾದರಿಯ ಮೂಲಕ ರಚಿಸಲಾಗಿದೆ (AI Generated)
          </p>
        </div>
      </div>

      {/* 3. Prescribed Medications Table in Kannada */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
          <Pill className="w-4 h-4 text-rose-600" />
          ಸೂಚಿಸಲಾದ ಔಷಧಗಳು ಮತ್ತು ಮಾತ್ರೆಗಳ ಪಟ್ಟಿ (Prescription Details & Rx)
        </span>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">ಔಷಧ ಹೆಸರು (Drug Name)</th>
                <th className="py-2.5 px-3">ಪ್ರಮಾಣ (Dosage)</th>
                <th className="py-2.5 px-3">ತೆಗೆದುಕೊಳ್ಳುವ ವಿಧಾನ (Frequency)</th>
                <th className="py-2.5 px-3">ಅವಧಿ (Duration)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {editableMedications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500 italic">
                    ಯಾವುದೇ ಔಷಧಗಳನ್ನು ಸೂಚಿಸಲಾಗಿಲ್ಲ (No medications prescribed)
                  </td>
                </tr>
              ) : (
                editableMedications.map((med, idx) => (
                  <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{med.drug_name}</td>
                    <td className="py-2.5 px-3 font-mono text-sky-800 font-semibold">{med.dosage}</td>
                    <td className="py-2.5 px-3 text-slate-700">{med.frequency}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">{med.duration}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Clinical Advice in Kannada */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-indigo-600" />
          ರೋಗಿಗೆ ನೀಡಲಾದ ಕನ್ನಡ ವೈದ್ಯಕೀಯ ಸಲಹೆಗಳು (Patient Instructions & Advice)
        </span>
        <div className="space-y-1.5">
          {editableAdvice.length === 0 ? (
            <p className="text-xs text-slate-500 italic">ವಿಶೇಷ ಸಲಹೆಗಳಿಲ್ಲ (No advice recorded)</p>
          ) : (
            editableAdvice.map((adv, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                <span>{adv.instruction}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Doctor Sign-Off and PDF Export Footer */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-600 font-medium">
          <span>ಪರಿಶೀಲಿಸಿದ ವೈದ್ಯರು (Signed Doctor): </span>
          <strong className="text-slate-900 font-bold">{user?.full_name || "ಡಾ. ಆನಂದ್ ದೇಶಮುಖ್, MD"}</strong>
          {doctorReg && <span className="ml-2 font-mono text-sky-700 font-semibold">(KMC: {doctorReg})</span>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenPrintModal}
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-200" />
            <span>ಅಧಿಕೃತ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ / PDF (View Letterhead)</span>
          </button>

          <button
            onClick={onApproveReport}
            disabled={isApproved}
            className={`text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs ${
              isApproved
                ? "bg-emerald-700 text-white cursor-default"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-95"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isApproved ? "ದೃಢೀಕರಿಸಲಾಗಿದೆ (Verified & Signed)" : "ದೃಢೀಕರಿಸಿ ಸಹಿ ಮಾಡಿ (Approve & Sign)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
