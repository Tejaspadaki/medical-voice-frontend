import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Stethoscope, ShieldCheck, Activity, Lock, Mail, AlertCircle, Loader2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login(demoEmail, demoPass);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please ensure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-sky-50/60 via-slate-50 to-slate-100 text-slate-800">
      {/* Dynamic Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-teal-500 shadow-md shadow-sky-600/20 mb-3 group hover:scale-105 transition-transform">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-2">
            AuraDoc <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold border border-sky-200">Clinical AI</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Multilingual Medical Speech Transcription & Documentation System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl shadow-xl border border-slate-200 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">ವೈದ್ಯರ ಪ್ರವೇಶ (Sign In)</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Secure OAuth2 / JWT Gateway</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>HIPAA Compliant</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ಆಸ್ಪತ್ರೆಯ ಇಮೇಲ್ (Hospital Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ಪಾಸ್‌ವರ್ಡ್ (Password)
                </label>
                <span className="text-[10px] text-slate-400">Min. 8 characters</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ (Verifying)...</span>
                </>
              ) : (
                <>
                  <span>ಕ್ಲಿನಿಕಲ್ ವರ್ಕ್‌ಸ್ಪೇಸ್‌ಗೆ ಪ್ರವೇಶಿಸಿ</span>
                  <Activity className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Roles */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                ೧-ಕ್ಲಿಕ್ ತ್ವರಿತ ಲಾಗಿನ್ (1-Click Demo Access)
              </p>
              <span className="text-[10px] font-bold text-sky-700">Instant Test</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Doctor 1-Click Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin("doctor@hospital.org", "Doctor123!")}
                className="group text-left p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 transition-all flex items-center justify-between text-xs disabled:opacity-50 active:scale-[0.99] shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      🩺 ಡಾ. ಆನಂದ್ ದೇಶಮುಖ್ (Doctor)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    doctor@hospital.org • ಸಂಪೂರ್ಣ ಸಮಾಲೋಚನೆ & ಅನುಮೋದನೆ
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 group-hover:bg-sky-600 group-hover:text-white border border-sky-200 px-2.5 py-1 rounded-lg transition-all shrink-0 shadow-xs">
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Staff Nurse 1-Click Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin("staff@hospital.org", "Staff123!")}
                className="group text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between text-xs disabled:opacity-50 active:scale-[0.99] shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      📋 ಪೂಜಾ ಶರ್ಮಾ (Staff Nurse)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    staff@hospital.org • ರೋಗಿಗಳ ನೋಂದಣಿ ಪ್ರವೇಶ
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white border border-emerald-200 px-2.5 py-1 rounded-lg transition-all shrink-0 shadow-xs">
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Safety Note Footer */}
        <div className="text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-600" />
          <span>Mandatory Doctor Review Protocol Active (Safety Guard)</span>
        </div>
      </div>
    </div>
  );
}
