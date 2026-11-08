"use client";

import React from "react";
import { Patient } from "@/types";
import {
  Stethoscope,
  X,
  Volume2,
  Mic,
  UploadCloud,
  FileText,
  Languages,
  ArrowRightLeft,
  Play,
  Square,
  Sparkles,
  Loader2,
  FileAudio,
} from "lucide-react";
import { DoctorReviewWorkspace } from "./DoctorReviewWorkspace";

interface ConsultationModalProps {
  patient: Patient | null;
  onClose: () => void;
  user: any;
  consultationMode: "record" | "upload" | "text";
  setConsultationMode: (mode: "record" | "upload" | "text") => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  isRecording: boolean;
  recordingTime: number;
  formatSeconds: (sec: number) => string;
  startLiveRecording: () => void;
  stopLiveRecording: () => void;
  recordedAudioBlob: Blob | null;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  englishTextInput: string;
  setEnglishTextInput: (text: string) => void;
  handleLoadSampleAudioForPatient: (patientId: number, lang?: "en" | "kn") => void;
  getPatientSampleFilename: (id: number) => string;
  handleProcessAudio: () => void;
  handleProcessEnglishText: (text?: string) => void;
  isProcessingASR: boolean;
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
}

export function ConsultationModal({
  patient,
  onClose,
  user,
  consultationMode,
  setConsultationMode,
  selectedLanguage,
  setSelectedLanguage,
  isRecording,
  recordingTime,
  formatSeconds,
  startLiveRecording,
  stopLiveRecording,
  recordedAudioBlob,
  uploadedFile,
  setUploadedFile,
  englishTextInput,
  setEnglishTextInput,
  handleLoadSampleAudioForPatient,
  getPatientSampleFilename,
  handleProcessAudio,
  handleProcessEnglishText,
  isProcessingASR,
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
}: ConsultationModalProps) {
  if (!patient) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl p-5 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-6 animate-in zoom-in-95 duration-200 text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-xs">
              <Stethoscope className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>ವೈದ್ಯಕೀಯ ಸಮಾಲೋಚನೆ: {patient.full_name}</span>
                <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  #PT-{String(patient.patient_id).padStart(4, "0")}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {patient.gender === "Male" ? "ಪುರುಷ" : "ಮಹಿಳೆ"} • {patient.phone} • ಭಾಷಾಂತರ: ಕನ್ನಡ (Pure Kannada Output)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all active:scale-95"
            title="Close consultation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Audio Picker: English Doctor Voice vs Kannada */}
        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-sky-900 font-bold">
              <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                ರೋಗಿ #{String(patient.patient_id).padStart(4, "0")} ರವರ ಮಾದರಿ ಆಡಿಯೋಗಳು (Doctor English & Kannada Sample Audios):
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit">
              ವೈದ್ಯರ ಇಂಗ್ಲಿಷ್ & ಕನ್ನಡ ಧ್ವನಿ (English & Kannada Available)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. English Doctor Voice Audio Card */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[11px] font-bold text-sky-900 block truncate flex items-center gap-1">
                  <span>🇬🇧 ವೈದ್ಯರ ಇಂಗ್ಲಿಷ್ ಧ್ವನಿ (Doctor English Voice)</span>
                </span>
                <audio
                  controls
                  src={`/sample_audios/PT-${String(patient.patient_id).padStart(4, "0")}_Doctor_English_Consultation.mp3`}
                  className="h-7 w-full max-w-[170px] rounded"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage("en");
                  handleLoadSampleAudioForPatient(patient.patient_id, "en");
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold px-3 py-2 rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
              >
                ⚡ English ಆಯ್ಕೆ (Select)
              </button>
            </div>

            {/* 2. Kannada Audio Card */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[11px] font-bold text-emerald-900 block truncate flex items-center gap-1">
                  <span>🇮🇳 ಕನ್ನಡ ಸಮಾಲೋಚನೆ ಧ್ವನಿ (Kannada Audio)</span>
                </span>
                <audio
                  controls
                  src={`/sample_audios/${getPatientSampleFilename(patient.patient_id)}`}
                  className="h-7 w-full max-w-[170px] rounded"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage("kn");
                  handleLoadSampleAudioForPatient(patient.patient_id, "kn");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-2 rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
              >
                ⚡ ಕನ್ನಡ ಆಯ್ಕೆ (Select)
              </button>
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setConsultationMode("record")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              consultationMode === "record"
                ? "bg-white text-sky-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>೧. ಲೈವ್ ಮೈಕ್ (Live Microphone)</span>
          </button>
          <button
            onClick={() => setConsultationMode("upload")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              consultationMode === "upload"
                ? "bg-white text-sky-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>೨. ಆಡಿಯೋ ಅಪ್ಲೋಡ್ (Audio File)</span>
          </button>
          <button
            onClick={() => setConsultationMode("text")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              consultationMode === "text"
                ? "bg-white text-sky-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>೩. ಇಂಗ್ಲಿಷ್ ಟಿಪ್ಪಣಿಗಳು (English Notes)</span>
          </button>
        </div>

        {/* Doctor Language Selection */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-slate-700">ವೈದ್ಯರ ಭಾಷೆ (Doctor Spoken / Written Language):</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="en">English (ಇಂಗ್ಲಿಷ್ ಇನ್‌ಪುಟ್ ➔ ಕನ್ನಡಕ್ಕೆ ಭಾಷಾಂತರ / English Input)</option>
              <option value="kn">ಕನ್ನಡ (Pure Kannada)</option>
              <option value="kannada-english">ಕನ್ನಡ-ಇಂಗ್ಲಿಷ್ ಮಿಶ್ರಿತ (Code-Mixed)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>ಅಂತಿಮ ವರದಿ: ಪರಿಶುದ್ಧ ಕನ್ನಡ (100% Pure Kannada Clinical Report)</span>
          </div>
        </div>

        {/* CONSULTATION INPUT PANELS */}
        {consultationMode === "record" ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
            {isRecording ? (
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-rose-500/20 animate-ping absolute inset-0" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg text-white relative z-10 glow-rose">
                  <Mic className="w-8 h-8 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                <Mic className="w-8 h-8 text-sky-600" />
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {isRecording ? "ವೈದ್ಯರ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ (English / ಕನ್ನಡ)..." : "ರೆಕಾರ್ಡಿಂಗ್ ಮಾಡಲು ಸಿದ್ಧವಾಗಿದೆ"}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-md">
                {isRecording
                  ? "ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ. AI ಅದನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಕನ್ನಡ ವರದಿಯಾಗಿ ಭಾಷಾಂತರಿಸುತ್ತದೆ."
                  : "ಪ್ರಾರಂಭಿಸಲು 'ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ' ಬಟನ್ ಒತ್ತಿ"}
              </p>
              <div className="font-mono text-2xl font-black text-sky-700 mt-2">
                {formatSeconds(recordingTime)}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={startLiveRecording}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ</span>
                </button>
              ) : (
                <button
                  onClick={stopLiveRecording}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ</span>
                </button>
              )}

              {recordedAudioBlob && !isRecording && (
                <button
                  onClick={handleProcessAudio}
                  disabled={isProcessingASR}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
                >
                  {isProcessingASR ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ಕನ್ನಡ ವರದಿ ಭಾಷಾಂತರಗೊಳ್ಳುತ್ತಿದೆ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>ಕನ್ನಡ ವರದಿ ರಚಿಸಿ (Generate Kannada Report)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : consultationMode === "upload" ? (
          <div className="p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-sky-100/80 border border-sky-200 flex items-center justify-center text-sky-700">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">ಆಡಿಯೋ ಫೈಲ್ ಅಪ್ಲೋಡ್ ಮಾಡಿ (English or Kannada)</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">WAV, MP3, M4A ಮಾದರಿಯ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ</p>
            </div>

            <input
              type="file"
              id="audio-file-input"
              accept="audio/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setUploadedFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <label
                htmlFor="audio-file-input"
                className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-300 transition-all flex items-center gap-2 active:scale-95 shadow-xs"
              >
                <FileAudio className="w-4 h-4 text-sky-600" />
                <span>{uploadedFile ? uploadedFile.name : "ಗಣಕಯಂತ್ರದಿಂದ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ"}</span>
              </label>

              <button
                type="button"
                onClick={() => handleLoadSampleAudioForPatient(patient.patient_id, "en")}
                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-xs"
              >
                ⚡ ರೋಗಿ #{patient.patient_id} ರವರ English ಆಡಿಯೋ ಲೋಡ್ ಮಾಡಿ
              </button>
            </div>

            {uploadedFile && (
              <div className="mt-4 flex flex-col items-center space-y-2">
                <span className="text-xs text-emerald-700 font-semibold">
                  ✓ ಆಯ್ಕೆಮಾಡಲಾದ ಫೈಲ್: {uploadedFile.name} ({(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button
                  onClick={handleProcessAudio}
                  disabled={isProcessingASR}
                  className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
                >
                  {isProcessingASR ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ಆಡಿಯೋ ಸಂಸ್ಕರಣೆಗೊಳ್ಳುತ್ತಿದೆ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>ಕನ್ನಡ ವರದಿ ರಚಿಸಿ (Generate Kannada Report)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  ವೈದ್ಯರ ಇಂಗ್ಲಿಷ್ ಕ್ಲಿನಿಕಲ್ ಟಿಪ್ಪಣಿಗಳು (Direct English Doctor Notes)
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  ವೈದ್ಯರು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿದರೂ, AI ಅದನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಕನ್ನಡ ವರದಿ ಮತ್ತು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗೆ ಪರಿವರ್ತಿಸುತ್ತದೆ.
                </p>
              </div>

              {/* Quick Clinical Preset Shortcuts */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const t = "Patient complains of high fever 101 F, sore throat and dry cough for 3 days. Diagnosed with acute URTI. Prescribed Paracetamol 650mg TDS for 3 days and Cetirizine 10mg OD at night for 5 days. Advice warm water and rest.";
                    setEnglishTextInput(t);
                    handleProcessEnglishText(t);
                  }}
                  className="bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all shadow-xs"
                >
                  ⚡ ಜ್ವರ / URTI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = "Patient presents for hypertension follow-up with complaints of headache and fatigue for 3 days. Blood pressure 150/95. Diagnosed with essential hypertension. Prescribed Telmisartan 40mg once daily in morning for 30 days. Advice low salt diet and walking.";
                    setEnglishTextInput(t);
                    handleProcessEnglishText(t);
                  }}
                  className="bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all shadow-xs"
                >
                  ⚡ ಹೈಪರ್‌ಟೆನ್ಷನ್
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = "Patient complains of epigastric burning pain and nausea for 2 days. Diagnosed with acute gastritis. Prescribed Pantoprazole 40mg OD before food and Domperidone 10mg BD before meals. Advice avoid spicy oily foods and drink plenty of water.";
                    setEnglishTextInput(t);
                    handleProcessEnglishText(t);
                  }}
                  className="bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all shadow-xs"
                >
                  ⚡ ಗ್ಯಾಸ್ಟ್ರೈಟಿಸ್
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={englishTextInput}
              onChange={(e) => setEnglishTextInput(e.target.value)}
              placeholder="Type or paste English doctor notes here... e.g. Patient presents with high fever and cough for 3 days. Prescribed Paracetamol 650mg TDS..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-mono shadow-xs"
            />

            <div className="flex justify-end">
              <button
                onClick={() => handleProcessEnglishText()}
                disabled={isProcessingASR}
                className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
              >
                {isProcessingASR ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ಕನ್ನಡ ವರದಿ ಭಾಷಾಂತರಗೊಳ್ಳುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>ಇಂಗ್ಲಿಷ್‌ನಿಂದ ಕನ್ನಡ ವರದಿ ರಚಿಸಿ (Generate Kannada Report)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Doctor Review Workspace */}
        <DoctorReviewWorkspace
          user={user}
          consultationResult={consultationResult}
          isApproved={isApproved}
          originalEnglishSpeech={originalEnglishSpeech}
          editableTranscript={editableTranscript}
          setEditableTranscript={setEditableTranscript}
          editableDiagnosis={editableDiagnosis}
          setEditableDiagnosis={setEditableDiagnosis}
          editableSymptoms={editableSymptoms}
          editableMedications={editableMedications}
          editableAdvice={editableAdvice}
          onApproveReport={onApproveReport}
          onOpenPrintModal={onOpenPrintModal}
          onReTranslateEnglish={handleProcessEnglishText}
          isProcessingASR={isProcessingASR}
        />
      </div>
    </div>
  );
}
