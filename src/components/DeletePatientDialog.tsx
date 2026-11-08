import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X, AlertOctagon } from "lucide-react";
import { PatientsApi } from "@/lib/api";
import { Patient } from "@/types";
import { useToast } from "@/context/ToastContext";

interface DeletePatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onPatientDeleted: () => void;
}

export function DeletePatientDialog({ isOpen, onClose, patient, onPatientDeleted }: DeletePatientDialogProps) {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

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

  const handleDelete = async () => {
    setLoading(true);
    try {
      await PatientsApi.delete(patient.patient_id);
      success(`Patient ${patient.full_name} and associated records deleted.`, "Patient Removed");
      onPatientDeleted();
      onClose();
    } catch (err: any) {
      toastError(err.message || "Failed to delete patient.", "Deletion Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-200 space-y-5 text-slate-900">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">ರೋಗಿಯ ದಾಖಲೆ ಅಳಿಸುವಿಕೆ (Delete Record)</h3>
            <p className="text-xs text-slate-600 font-medium mt-1">
              ನೀವು ಖಚಿತವಾಗಿ <strong className="text-slate-900 font-bold">{patient.full_name}</strong> (ID #PT-
              {String(patient.patient_id).padStart(4, "0")}) ರವರ ದಾಖಲೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲು ಬಯಸುವಿರಾ?
            </p>
            <div className="text-[11px] text-rose-900 bg-rose-50 border border-rose-200 rounded-xl p-3 mt-3 space-y-1">
              <span className="font-bold block text-rose-700">⚠️ ಎಚ್ಚರಿಕೆ (Warning):</span>
              <p>
                ಈ ಕ್ರಿಯೆಯು ಈ ರೋಗಿಗೆ ಸಂಬಂಧಿಸಿದ ಎಲ್ಲಾ ಸಮಾಲೋಚನೆಗಳು, ಆಡಿಯೋಗಳು, ಟ್ರಾನ್ಸ್‌ಕ್ರಿಪ್ಟ್‌ಗಳು ಮತ್ತು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ತೆಗೆದುಹಾಕುತ್ತದೆ.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            ರದ್ದುಮಾಡಿ (Cancel)
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? "ತೆಗೆದುಹಾಕಲಾಗುತ್ತಿದೆ..." : "ದಾಖಲೆ ಅಳಿಸಿ (Delete)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
