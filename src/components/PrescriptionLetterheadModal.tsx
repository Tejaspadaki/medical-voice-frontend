import React, { useRef, useEffect } from "react";
import { Patient } from "@/types";
import { CheckCircle, Printer, X, Activity, ClipboardList, Check } from "lucide-react";

interface PrescriptionLetterheadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  user?: any;
  editableSymptoms?: any[];
  editableDiagnosis?: string;
  editableMedications?: any[];
  editableAdvice?: any[];
  reportData?: {
    report_id?: string;
    status?: string;
    doctor_sign_off?: {
      signed_by?: string;
      registration_no?: string;
      timestamp?: string;
    };
    report_data?: {
      transcript_text?: string;
      symptoms?: any[];
      diagnosis?: any[];
      medications?: any[];
      advice?: any[];
    };
  };
}

export function PrescriptionLetterheadModal({
  isOpen,
  onClose,
  patient,
  user,
  editableSymptoms,
  editableDiagnosis,
  editableMedications,
  editableAdvice,
  reportData,
}: PrescriptionLetterheadModalProps) {
  const letterheadRef = useRef<HTMLDivElement>(null);

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

  // Extract from reportData or direct props
  const symptoms = reportData?.report_data?.symptoms || editableSymptoms || [];
  const diagnosis =
    reportData?.report_data?.diagnosis?.[0]?.entity ||
    (typeof editableDiagnosis === "string" ? editableDiagnosis : "ಸಾಮಾನ್ಯ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ (General Follow-up)");
  const medications = reportData?.report_data?.medications || editableMedications || [];
  const advice = reportData?.report_data?.advice || editableAdvice || [];

  const doctorName =
    reportData?.doctor_sign_off?.signed_by ||
    user?.full_name ||
    "ಡಾ. ಆನಂದ್ ದೇಶಮುಖ್, MD (Dr. Anand Deshmukh)";
  const doctorReg =
    reportData?.doctor_sign_off?.registration_no ||
    user?.doctor_profile?.registration_no ||
    "KMC-84920";
  const doctorSpecialization =
    user?.doctor_profile?.specialization || "ಮುಖ್ಯ ವೈದ್ಯಾಧಿಕಾರಿ (Chief Medical Officer)";

  const currentDate = reportData?.doctor_sign_off?.timestamp
    ? new Date(reportData.doctor_sign_off.timestamp).toLocaleDateString("kn-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("kn-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Floating Top-Right Close Button */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-[70] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95 print:hidden"
        title="Close prescription view (Esc)"
      >
        <X className="w-4 h-4" />
        <span>ಮುಚ್ಚಿ (Close)</span>
      </button>

      <div className="w-full max-w-3xl rounded-2xl bg-white text-slate-900 shadow-2xl p-8 my-8 space-y-6 animate-in fade-in duration-200 border border-slate-300 font-sans relative">
        {/* Sticky Action Controls Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 flex flex-wrap items-center justify-between gap-3 pb-4 pt-1 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>ವೈದ್ಯರಿಂದ ಅಧಿಕೃತವಾಗಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಕನ್ನಡ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>ಮುದ್ರಿಸಿ (Print)</span>
            </button>

            {/* Close Button in Header */}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-300 active:scale-95"
              title="Close window"
            >
              <X className="w-4 h-4" />
              <span>ಮುಚ್ಚಿ</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE LETTERHEAD CONTAINER */}
        <div id="printable-prescription" ref={letterheadRef} className="printable-prescription space-y-6 p-4 bg-white rounded-xl">
          {/* FORMAL HOSPITAL CLINICAL LETTERHEAD */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-lg">
                    +
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      ಕರ್ನಾಟಕ ಆರೋಗ್ಯ ಮತ್ತು ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ
                    </h1>
                    <p className="text-xs font-semibold text-sky-800 tracking-wide uppercase">
                      Karnataka Clinical Health & Research Institute (OPD Care)
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  ಮಲ್ಲೇಶ್ವರಂ ೧೮ನೇ ಕ್ರಾಸ್, ಬೆಂಗಳೂರು - ೫೬೦೦೦೩ | ದೂರವಾಣಿ: ೦೮೦-೨೩೪೫೬೭೮೯ | ನೋಂದಣಿ ಸಂ: KMC/GOV/2026/894
                </p>
              </div>

              <div className="text-right space-y-0.5">
                <h2 className="text-sm font-bold text-slate-900">{doctorName}</h2>
                <p className="text-xs text-slate-700 font-medium">{doctorSpecialization}</p>
                <p className="text-[11px] font-mono font-semibold text-sky-700">KMC Reg: {doctorReg}</p>
              </div>
            </div>
          </div>

          {/* PATIENT DEMOGRAPHICS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">ರೋಗಿಯ ಹೆಸರು (Name)</span>
              <strong className="text-slate-900 font-bold text-sm">{patient.full_name}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">ರೋಗಿ ಐಡಿ (Patient ID)</span>
              <span className="font-mono font-bold text-sky-800 text-xs">
                #PT-{String(patient.patient_id).padStart(4, "0")}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">ವಯಸ್ಸು / ಲಿಂಗ (Gender/Age)</span>
              <span className="text-slate-800 font-medium">
                <span>{patient.gender === "Male" ? "ಪುರುಷ (Male)" : patient.gender === "Female" ? "ಮಹಿಳೆ (Female)" : patient.gender}</span>
                {patient.dob && <span> • {patient.dob}</span>}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">ದಿನಾಂಕ (Date)</span>
              <span className="text-slate-800 font-medium">{currentDate}</span>
            </div>
          </div>

          {/* 1. CHIEF SYMPTOMS & COMPLAINTS */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-700" />
              ೧. ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು (Chief Complaints & Symptoms)
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-800 space-y-1 pl-2">
              {symptoms.map((sym: any, idx: number) => (
                <li key={idx}>
                  <span className="font-semibold text-slate-900">{sym.entity}</span>
                  {sym.duration && <span className="text-slate-600 font-normal"> (ಅವಧಿ: {sym.duration})</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* 2. CLINICAL DIAGNOSIS */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-sky-700" />
              ೨. ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯ (Provisional / Final Diagnosis)
            </h3>
            <div className="bg-sky-50/70 border-l-4 border-sky-600 p-2.5 rounded-r-lg">
              <p className="text-xs font-bold text-sky-950">{diagnosis}</p>
            </div>
          </div>

          {/* 3. RX PRESCRIPTION TABLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="font-serif italic font-bold text-sky-800 text-sm">℞</span>
                ೩. ಔಷಧೀಯ ಚೀಟಿ (Prescribed Medications & Dosages)
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">ಕನ್ನಡ ಸ್ಪಷ್ಟ ಪ್ರಮಾಣ ವಿವರಣೆ</span>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-200">ಕ್ರ.ಸಂ</th>
                  <th className="py-2 px-3 border-r border-slate-200">ಔಷಧಿ ಹೆಸರು (Drug Name)</th>
                  <th className="py-2 px-3 border-r border-slate-200">ಪ್ರಮಾಣ (Dosage)</th>
                  <th className="py-2 px-3 border-r border-slate-200">ಸೇವಿಸುವ ಸಮಯ (Frequency)</th>
                  <th className="py-2 px-3">ದಿನಗಳು (Duration)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {medications.map((med: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/50" : ""}>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">{med.drug_name}</td>
                    <td className="py-2 px-3 border-r border-slate-200">{med.dosage}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-sky-900 font-semibold">{med.frequency}</td>
                    <td className="py-2 px-3">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. DOCTOR'S INSTRUCTIONS */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              ೪. ಪಥ್ಯ ಮತ್ತು ಸಾಮಾನ್ಯ ಸಲಹೆಗಳು (Special Advice & Follow-up)
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-800 space-y-1 pl-2">
              {advice.map((adv: any, idx: number) => (
                <li key={idx} className="text-slate-700 font-medium">
                  {adv.instruction}
                </li>
              ))}
            </ul>
          </div>

          {/* DIGITAL SIGNATURE & OFFICIAL STAMP */}
          <div className="pt-6 border-t-2 border-dashed border-slate-300 flex justify-between items-end">
            <div className="text-[10px] text-slate-500 space-y-0.5 max-w-xs">
              <p>• ಈ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ AI ಧ್ವನಿ ಸಮಾಲೋಚನೆಯಿಂದ ರಚಿಸಲ್ಪಟ್ಟು ವೈದ್ಯರಿಂದ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿದೆ.</p>
              <p>• ಯಾವುದೇ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ತಕ್ಷಣ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.</p>
            </div>

            <div className="text-center space-y-1">
              <div className="w-48 h-12 flex items-center justify-center border-b border-slate-800 mx-auto">
                <span className="font-serif italic text-base text-sky-900 tracking-wider font-bold">
                  {doctorName.split(" ")[0]} MD
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900">{doctorName}</p>
              <p className="text-[10px] font-mono text-slate-600">Reg No: {doctorReg} (Digital Signature)</p>
            </div>
          </div>
        </div>

        {/* Bottom Close Button Bar */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>ವಿಂಡೋ ಮುಚ್ಚಿ (Close View)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
