import React from "react";
import { Patient } from "@/types";
import { Users, Search, Plus, Mic, Edit, Trash2, FileText, Heart, Languages, UserX, AlertCircle, X } from "lucide-react";

interface PatientTableProps {
  patients?: Patient[];
  isLoading: boolean;
  isError: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenAddPatient: () => void;
  onStartConsultation: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
}

export function PatientTable({
  patients = [],
  isLoading,
  isError,
  searchTerm,
  onSearchChange,
  onOpenAddPatient,
  onStartConsultation,
  onEditPatient,
  onDeletePatient,
  onViewHistory,
}: PatientTableProps) {
  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-5 border border-slate-200/90 shadow-xs transition-all">
      {/* Table Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-sky-600" />
            <span>ರೋಗಿಗಳ ವಿವರ ಮತ್ತು ಧ್ವನಿ ಸಮಾಲೋಚನೆಗಳ ಪಟ್ಟಿ (Patient Directory)</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ (Record English or Kannada Voice for Clinical AI Documentation)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹುಡುಕಿ (Search by Name / Phone)..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Patient Button */}
          <button
            onClick={onOpenAddPatient}
            className="bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ಹೊಸ ರೋಗಿ (Add Patient)</span>
          </button>
        </div>
      </div>

      {/* Patient Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">ರೋಗಿ ಐಡಿ (Patient ID)</th>
              <th className="py-3 px-4">ಪೂರ್ಣ ಹೆಸರು (Full Name)</th>
              <th className="py-3 px-4">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone)</th>
              <th className="py-3 px-4">ಲಿಂಗ / ವಯಸ್ಸು (Gender/Age)</th>
              <th className="py-3 px-4">ಮಾತೃಭಾಷೆ (Language)</th>
              <th className="py-3 px-4">ರಕ್ತದ ಗುಂಪು (Blood)</th>
              <th className="py-3 px-4 text-right">ಕ್ರಮಗಳು (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded-md skeleton-shimmer" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-32 bg-slate-200 rounded-md skeleton-shimmer" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded-md skeleton-shimmer" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded-md skeleton-shimmer" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded-md skeleton-shimmer" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-10 bg-slate-200 rounded-md skeleton-shimmer" /></td>
                  <td className="py-4 px-4 text-right"><div className="h-7 w-28 bg-slate-200 rounded-lg ml-auto skeleton-shimmer" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-rose-600">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-1" />
                    <span className="font-semibold">ದೋಷ ಕಂಡುಬಂದಿದೆ / Connection Error. Please check backend status.</span>
                  </div>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <UserX className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">ಯಾವುದೇ ರೋಗಿಯ ವಿವರಗಳು ದೊರೆತಿಲ್ಲ (No Patients Found)</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {searchTerm ? `"${searchTerm}" ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುವ ರೋಗಿ ಇಲ್ಲ.` : "ಹೊಸ ರೋಗಿಯನ್ನು ಸೇರಿಸಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ."}
                      </p>
                    </div>
                    <button
                      onClick={onOpenAddPatient}
                      className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ಹೊಸ ರೋಗಿ ನೋಂದಣಿ (Add Patient)</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.patient_id} className="hover:bg-sky-50/40 transition-colors group">
                  <td className="py-3.5 px-4 font-mono text-sky-700 font-bold">
                    #PT-{String(patient.patient_id).padStart(4, "0")}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{patient.full_name}</div>
                    {patient.preferred_language && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {patient.preferred_language === "Kannada" ? "ಕನ್ನಡ" : patient.preferred_language}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                    {patient.phone}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-medium text-slate-800">
                      {patient.gender === "Male"
                        ? "ಪುರುಷ (Male)"
                        : patient.gender === "Female"
                        ? "ಮಹಿಳೆ (Female)"
                        : patient.gender}
                    </div>
                    {patient.dob && (
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        {calculateAge(patient.dob) !== null && (
                          <span className="font-bold text-sky-700">{calculateAge(patient.dob)} yrs</span>
                        )}
                        <span>({patient.dob})</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 shadow-xs">
                      <Languages className="w-3 h-3 text-sky-600" />
                      <span>{patient.preferred_language || "Kannada"}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-rose-700">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold shadow-xs">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                      <span>{patient.blood_group || "N/A"}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Start AI Speech Consultation */}
                      <button
                        onClick={() => onStartConsultation(patient)}
                        className="bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-sky-600/20 transition-all inline-flex items-center gap-1.5 shadow-xs shadow-sky-600/15 active:scale-95 group/btn whitespace-nowrap"
                        title="Start AI Voice & Note Consultation (ಧ್ವನಿ ಸಮಾಲೋಚನೆ)"
                      >
                        <Mic className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
                        <span>ರೆಕಾರ್ಡ್ / AI (Consult)</span>
                      </button>

                      {/* View Medical History */}
                      <button
                        onClick={() => onViewHistory(patient)}
                        className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl transition-all"
                        title="ಇತಿಹಾಸ & ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು (View History & Prescriptions)"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Edit Patient Demographics */}
                      <button
                        onClick={() => onEditPatient(patient)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl transition-all"
                        title="ವಿವರ ತಿದ್ದುಪಡಿ (Edit Patient Details)"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Patient */}
                      <button
                        onClick={() => onDeletePatient(patient)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl transition-all"
                        title="ದಾಖಲೆ ಅಳಿಸಿ (Delete Patient Record)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
