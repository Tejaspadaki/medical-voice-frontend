"use client";

import React, { useState, useEffect } from "react";
import { X, User, Phone, Calendar, Heart, Languages, MapPin, Mail, ShieldAlert, Loader2, Save } from "lucide-react";
import { PatientsApi } from "@/lib/api";
import { Patient } from "@/types";
import { useToast } from "@/context/ToastContext";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onPatientUpdated: () => void;
}

export function EditPatientModal({ isOpen, onClose, patient, onPatientUpdated }: EditPatientModalProps) {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    emergency_contact: "",
    blood_group: "",
    preferred_language: "Kannada",
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || "",
        dob: patient.dob || "",
        gender: patient.gender || "Male",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        emergency_contact: patient.emergency_contact || "",
        blood_group: patient.blood_group || "",
        preferred_language: patient.preferred_language || "Kannada",
      });
    }
  }, [patient]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await PatientsApi.update(patient.patient_id, {
        full_name: formData.full_name,
        dob: formData.dob || undefined,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        emergency_contact: formData.emergency_contact || undefined,
        blood_group: formData.blood_group || undefined,
        preferred_language: formData.preferred_language,
      });

      success(`Patient profile for ${formData.full_name} updated successfully.`, "Profile Updated");
      onPatientUpdated();
      onClose();
    } catch (err: any) {
      toastError(err.message || "Failed to update patient record.", "Update Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-8 animate-in zoom-in-95 duration-200 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                ರೋಗಿಯ ವಿವರಗಳ ತಿದ್ದುಪಡಿ (Edit Patient Profile)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ರೋಗಿ ಐಡಿ: <span className="font-mono text-sky-700 font-bold">#PT-{String(patient.patient_id).padStart(4, "0")}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ಪೂರ್ಣ ಹೆಸರು (English / ಕನ್ನಡ) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g., Basavaraj Patil (ಬಸವರಾಜ್ ಪಾಟೀಲ್)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-medium"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ಜನ್ಮ ದಿನಾಂಕ (DOB)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ಲಿಂಗ <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-medium"
              >
                <option value="Male">ಪುರುಷ (Male)</option>
                <option value="Female">ಮಹಿಳೆ (Female)</option>
                <option value="Other">ಇತರೆ (Other)</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ಮೊಬೈಲ್ ಸಂಖ್ಯೆ <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98801 23456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-mono font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ಇಮೇಲ್ (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ರಕ್ತದ ಗುಂಪು</label>
              <div className="relative">
                <Heart className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-medium"
                >
                  <option value="A+">A +ve</option>
                  <option value="A-">A -ve</option>
                  <option value="B+">B +ve</option>
                  <option value="B-">B -ve</option>
                  <option value="AB+">AB +ve</option>
                  <option value="AB-">AB -ve</option>
                  <option value="O+">O +ve</option>
                  <option value="O-">O -ve</option>
                </select>
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ಸಮಾಲೋಚನೆ ಭಾಷೆ <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Languages className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-medium"
                >
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Kannada-English">ಕನ್ನಡ + ಇಂಗ್ಲಿಷ್ Bilingual</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ತುರ್ತು ಸಂಪರ್ಕ (Emergency Contact)</label>
              <div className="relative">
                <ShieldAlert className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="ಉದಾ: +91 99000 11223 (ಪತ್ನಿ / Wife)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-mono"
                />
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ವಿಳಾಸ (Address)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="ಪೂರ್ಣ ವಸತಿ ವಿಳಾಸ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ಉಳಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ (Save Changes)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
