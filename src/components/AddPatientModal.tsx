"use client";

import React, { useState } from "react";
import { UserPlus, X, User, Phone, Calendar, Heart, Languages, MapPin, Mail, AlertCircle, Loader2 } from "lucide-react";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  isPending: boolean;
  formError: string | null;
}

export function AddPatientModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  formError,
}: AddPatientModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    gender: "Male",
    dob: "",
    blood_group: "O+",
    preferred_language: "Kannada",
    email: "",
    address: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dob: formData.dob || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in zoom-in-95 duration-200 text-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                ಹೊಸ ರೋಗಿ ನೋಂದಣಿ (New Patient Registration)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ರೋಗಿಯ ವೈದ್ಯಕೀಯ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ ಮತ್ತು ಧ್ವನಿ ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ
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

        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
                placeholder="ಉದಾ: ಬಸವರಾಜ್ ಪಾಟೀಲ್ / Basavaraj Patil"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                <option value="Other">ಇತರ (Other)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ಮಾತೃಭಾಷೆ (Language)</label>
              <div className="relative">
                <Languages className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-medium"
                >
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Kannada-English">ಕನ್ನಡ-ಇಂಗ್ಲಿಷ್ ಮಿಶ್ರಿತ</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ರಕ್ತದ ಗುಂಪು (Blood Group)</label>
              <div className="relative">
                <Heart className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs font-medium"
                >
                  <option value="O+">O +ve</option>
                  <option value="O-">O -ve</option>
                  <option value="A+">A +ve</option>
                  <option value="A-">A -ve</option>
                  <option value="B+">B +ve</option>
                  <option value="B-">B -ve</option>
                  <option value="AB+">AB +ve</option>
                  <option value="AB-">AB -ve</option>
                </select>
              </div>
            </div>

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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">ವಿಳಾಸ / ಊರು (Address)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="ಉದಾ: ಜಯನಗರ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              ರದ್ದುಮಾಡಿ (Cancel)
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>ರೋಗಿಯನ್ನು ಉಳಿಸಿ (Save Patient)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
