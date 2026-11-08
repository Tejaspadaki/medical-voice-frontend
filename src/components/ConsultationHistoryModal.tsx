"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Printer,
  Trash2,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";
import { ConsultationsApi } from "@/lib/api";
import { Patient } from "@/types";
import { useToast } from "@/context/ToastContext";
import { PrescriptionLetterheadModal } from "./PrescriptionLetterheadModal";

interface ConsultationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export function ConsultationHistoryModal({ isOpen, onClose, patient }: ConsultationHistoryModalProps) {
  const { success, error: toastError } = useToast();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [letterheadOpen, setLetterheadOpen] = useState(false);

  useEffect(() => {
    if (isOpen && patient) {
      loadHistory();
    }
  }, [isOpen, patient]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !patient) return null;

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await ConsultationsApi.getPatientConsultations(patient.patient_id);
      setConsultations(data || []);
      if (data && data.length > 0) {
        setSelectedConsultation(data[0]);
      } else {
        setSelectedConsultation(null);
      }
    } catch (err: any) {
      toastError(err.message || "Failed to load consultation history.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsultation = async (consultationId: number) => {
    if (!confirm("ನೀವು ಖಚಿತವಾಗಿ ಈ ಸಮಾಲೋಚನೆ ದಾಖಲೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ? (Delete this record?)")) return;

    try {
      await ConsultationsApi.delete(consultationId);
      success("Consultation record deleted.", "Deleted");
      loadHistory();
    } catch (err: any) {
      toastError(err.message || "Failed to delete consultation.", "Delete Error");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-6 animate-in zoom-in-95 duration-200 text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  ವೈದ್ಯಕೀಯ ಸಮಾಲೋಚನೆಗಳ ಇತಿಹಾಸ ಮತ್ತು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು (Consultation Records)
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  ರೋಗಿ: <strong className="text-slate-900">{patient.full_name}</strong> • ಐಡಿ: #PT-
                  {String(patient.patient_id).padStart(4, "0")} • ಭಾಷೆ: {patient.preferred_language || "ಕನ್ನಡ"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
              title="Close history"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
            {/* Sidebar list */}
            <div className="md:col-span-4 border-r border-slate-200 overflow-y-auto p-3.5 bg-slate-50/60 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-2">
                ದಾಖಲಾದ ಭೇಟಿಗಳು ({consultations.length})
              </h3>

              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</p>
                </div>
              ) : consultations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-4">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">ಯಾವುದೇ ಸಮಾಲೋಚನೆಗಳಿಲ್ಲ</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    AI ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಅಥವಾ ಟಿಪ್ಪಣಿಗಳ ಮೂಲಕ ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ.
                  </p>
                </div>
              ) : (
                consultations.map((c) => {
                  const isSelected = selectedConsultation?.consultation_id === c.consultation_id;
                  const dateStr = new Date(c.created_at || c.signed_at).toLocaleDateString("kn-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <button
                      key={c.consultation_id}
                      onClick={() => setSelectedConsultation(c)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? "bg-sky-50 border-sky-300 shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-bold text-slate-900 font-mono">{c.report_id}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            SIGNED
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-sky-600" /> {dateStr}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-1 font-semibold">
                          {c.diagnosis?.[0]?.entity || "ಸಾಮಾನ್ಯ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ"}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? "text-sky-600 translate-x-0.5" : "text-slate-400"
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>

            {/* Details Panel */}
            <div className="md:col-span-8 overflow-y-auto p-5 sm:p-6 bg-white flex flex-col justify-between">
              {selectedConsultation ? (
                <div className="space-y-5">
                  {/* Top Bar with Prominent Print & PDF Download Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 font-mono">{selectedConsultation.report_id}</h3>
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ವೈದ್ಯರಿಂದ ದೃಢೀಕರಿಸಲಾಗಿದೆ
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        ದಿನಾಂಕ: {new Date(selectedConsultation.created_at).toLocaleString("kn-IN")} • ವೈದ್ಯರು:{" "}
                        <strong className="text-slate-900">{selectedConsultation.signed_by_name || "ಡಾ. ಆನಂದ್ ದೇಶಮುಖ್"}</strong> (
                        {selectedConsultation.signed_doctor_reg || "KMC"})
                      </p>
                    </div>

                    {/* Action Buttons: Print, View Letterhead, Delete */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Print Option */}
                      <button
                        onClick={() => setLetterheadOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-all active:scale-95"
                        title="Print official hospital prescription"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>ಮುದ್ರಿಸಿ (Print)</span>
                      </button>

                      {/* View Prescription Letterhead */}
                      <button
                        onClick={() => setLetterheadOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all active:scale-95"
                        title="Preview formal letterhead"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-600" />
                        <span>ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ವೀಕ್ಷಿಸಿ</span>
                      </button>

                      {/* Delete Record */}
                      <button
                        onClick={() => handleDeleteConsultation(selectedConsultation.consultation_id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-colors ml-1 active:scale-95"
                        title="Delete consultation record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯ (Clinical Diagnosis)
                    </h4>
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
                      {selectedConsultation.diagnosis?.map((d: any, i: number) => (
                        <div key={i}>• {d.entity}</div>
                      ))}
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      ರೋಗಲಕ್ಷಣಗಳು (Symptoms & Duration)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedConsultation.symptoms?.map((s: any, i: number) => (
                        <div key={i} className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
                          <p className="font-bold text-slate-900">{s.entity}</p>
                          {s.duration && <p className="text-amber-800 font-semibold mt-0.5 text-[11px]">ಅವಧಿ: {s.duration}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medications Table */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      ಔಷಧಿ ವಿವರಗಳು (Prescribed Medications & Rx)
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">ಔಷಧ (Medicine)</th>
                            <th className="p-2.5">ಪ್ರಮಾಣ (Dose)</th>
                            <th className="p-2.5">ಸಮಯ (Frequency)</th>
                            <th className="p-2.5">ದಿನಗಳು (Duration)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {selectedConsultation.medications?.map((m: any, i: number) => (
                            <tr key={i} className="hover:bg-sky-50/40">
                              <td className="p-2.5 font-bold text-slate-900">{m.drug_name}</td>
                              <td className="p-2.5 font-mono text-sky-800 font-semibold">{m.dosage}</td>
                              <td className="p-2.5 text-slate-600">{m.frequency}</td>
                              <td className="p-2.5 text-emerald-700 font-bold">{m.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Advice */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      ವೈದ್ಯರ ವಿಶೇಷ ಸಲಹೆಗಳು (Doctor Instructions)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {selectedConsultation.advice?.map((a: any, i: number) => (
                        <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{a.instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Transcript box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      ಕನ್ನಡ ಧ್ವನಿ ಮುದ್ರಣ ವಿವರಣೆ (Kannada Transcription)
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      "{selectedConsultation.kannada_transcript}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                  <FileText className="w-12 h-12 mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">ವಿವರಗಳನ್ನು ನೋಡಲು ಎಡಭಾಗದಿಂದ ಸಮಾಲೋಚನೆ ಆಯ್ಕೆಮಾಡಿ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Prescription Letterhead Modal (Print Ready) */}
      {selectedConsultation && (
        <PrescriptionLetterheadModal
          isOpen={letterheadOpen}
          onClose={() => setLetterheadOpen(false)}
          patient={patient}
          reportData={{
            report_id: selectedConsultation.report_id,
            status: selectedConsultation.status,
            doctor_sign_off: {
              signed_by: selectedConsultation.signed_by_name || "ಡಾ. ಆನಂದ್ ದೇಶಮುಖ್, MD",
              registration_no: selectedConsultation.signed_doctor_reg || "KMC-84920",
              timestamp: selectedConsultation.signed_at,
            },
            report_data: {
              transcript_text: selectedConsultation.kannada_transcript,
              symptoms: selectedConsultation.symptoms,
              diagnosis: selectedConsultation.diagnosis,
              medications: selectedConsultation.medications,
              advice: selectedConsultation.advice,
            },
          }}
        />
      )}
    </>
  );
}
