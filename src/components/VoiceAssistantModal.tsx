"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Send,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Stethoscope,
  Pill,
  Activity,
  User,
  UserPlus,
  Phone,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { VoiceAgentApi } from "@/lib/api";
import { Patient } from "@/types";

interface VoiceTurn {
  speaker: "doctor" | "assistant";
  text: string;
  intent?: string;
  time: string;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePatient?: Patient | null;
  onConsultationCreated?: () => void;
}

export function VoiceAssistantModal({
  isOpen,
  onClose,
  activePatient,
  onConsultationCreated,
}: VoiceAssistantModalProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("kn");
  const [inputText, setInputText] = useState("");
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pendingAction, setPendingAction] = useState<any | null>(null);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Initialize or resume voice session
  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopListening();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    }
  }, [isOpen, activePatient]);

  // Scroll to bottom on new turns
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, pendingAction]);

  const startSession = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const res = await VoiceAgentApi.startSession(
        activePatient?.patient_id,
        language
      );
      setSessionId(res.session_id);

      const patientName = activePatient?.full_name || res.patient_name || null;
      if (activePatient) {
        setSelectedPatientInfo({
          patient_id: activePatient.patient_id,
          name: activePatient.full_name,
        });
      }

      const initialGreeting = patientName
        ? `ನಮಸ್ಕಾರ ಡಾಕ್ಟರ್. ರೋಗಿ ${patientName} ಅವರ ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗಿದೆ (Gemini 3.8 Flash & Sarvam AI ಸಕ್ರಿಯವಾಗಿದೆ). ಅವರ ಬಿಪಿ, ರೋಗಲಕ್ಷಣ ಅಥವಾ ಔಷಧಿಗಳನ್ನು ತಿಳಿಸಿ.`
        : `ನಮಸ್ಕಾರ ಡಾಕ್ಟರ್! ನಾನು ನಿಮ್ಮ ಕ್ಲಿನಿಕಲ್ ಧ್ವನಿ ಸಹಾಯಕ (Powered by Gemini 3.8 Flash & Sarvam AI). ರೋಗಿಯ ಹೆಸರು ಅಥವಾ ತಪಾಸಣೆ ವಿವರಗಳನ್ನು ಮಾತನಾಡಿ.`;

      setTurns([
        {
          speaker: "assistant",
          text: initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      if (!isMuted) {
        speakText(initialGreeting);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize voice session.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Play Sarvam AI Base64 Audio
  const playAudioB64 = (b64Audio: string) => {
    if (isMuted) return;
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      const audio = new Audio(`data:audio/wav;base64,${b64Audio}`);
      audioPlayerRef.current = audio;
      audio.play().catch((err) => {
        console.warn("Sarvam audio play error:", err);
      });
    } catch (e) {
      console.warn("Audio element initialization warning:", e);
    }
  };

  // Text-To-Speech (Sarvam AI first, fallback to browser speech synthesis)
  const speakText = async (text: string, b64Audio?: string) => {
    if (isMuted) return;
    if (b64Audio) {
      playAudioB64(b64Audio);
      return;
    }

    try {
      const res = await VoiceAgentApi.synthesizeSpeech(text, language);
      if (res.audio_b64) {
        playAudioB64(res.audio_b64);
        return;
      }
    } catch (err) {
      // Fallback to browser Web Speech API
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === "kn" ? "kn-IN" : "en-IN";
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Browser TTS playback warning:", e);
      }
    }
  };

  // Toggle Microphone Listening (Sarvam AI STT via MediaRecorder)
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = async () => {
    // Try MediaRecorder for Sarvam AI Saaras:v3 STT
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
            await handleSendAudio(audioBlob);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsListening(true);
        setErrorMsg(null);
        return;
      } catch (err: any) {
        console.warn("Microphone stream error, falling back to Web Speech:", err);
      }
    }

    // Fallback: Web Speech Recognition
    startWebSpeechRecognition();
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    stopWebSpeechRecognition();
    setIsListening(false);
  };

  const startWebSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg("Please type in the input box below (Microphone access not available).");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "kn" ? "kn-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendTurn(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopWebSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const handleTurnSuccess = (res: any, userPromptText: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append Doctor's and Assistant's Turn
    setTurns((prev) => [
      ...prev,
      { speaker: "doctor", text: userPromptText, time: currentTime },
      {
        speaker: "assistant",
        text: res.assistant_reply_text,
        intent: res.intent_detected,
        time: currentTime,
      },
    ]);

    if (res.patient) {
      setSelectedPatientInfo(res.patient);
    }

    if (res.requires_confirmation && res.pending_action) {
      setPendingAction(res.pending_action);
    } else if (res.intent_detected === "CONFIRM_ACTION") {
      setPendingAction(null);
      if (onConsultationCreated) onConsultationCreated();
    } else if (res.intent_detected === "REJECT_ACTION") {
      setPendingAction(null);
    }

    speakText(res.assistant_tts_prompt || res.assistant_reply_text, res.assistant_audio_b64);
  };

  const handleSendAudio = async (blob: Blob) => {
    if (!sessionId) return;
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("language", language);
      formData.append("audio_file", blob, "voice_command.wav");

      const res = await VoiceAgentApi.sendAudioTurn(formData);
      handleTurnSuccess(res, res.user_transcript || "ಧ್ವನಿ ಸೂಚನೆ");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process audio recording via Sarvam STT.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendTurn = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !sessionId) return;

    setInputText("");
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append Doctor's Turn
    setTurns((prev) => [
      ...prev,
      { speaker: "doctor", text, time: currentTime },
    ]);

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const res = await VoiceAgentApi.sendTurnText(sessionId, text, language);

      // Append Assistant's Turn
      setTurns((prev) => [
        ...prev,
        {
          speaker: "assistant",
          text: res.assistant_reply_text,
          intent: res.intent_detected,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      if (res.patient) {
        setSelectedPatientInfo(res.patient);
      }

      if (res.requires_confirmation && res.pending_action) {
        setPendingAction(res.pending_action);
      } else if (res.intent_detected === "CONFIRM_ACTION") {
        setPendingAction(null);
        if (onConsultationCreated) onConsultationCreated();
      } else if (res.intent_detected === "REJECT_ACTION") {
        setPendingAction(null);
      }

      speakText(res.assistant_tts_prompt || res.assistant_reply_text, res.assistant_audio_b64);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process speech input.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Two-Phase Confirmation Handlers
  const handleConfirmAction = async (confirmed: boolean) => {
    if (!sessionId || !pendingAction) return;

    try {
      setIsProcessing(true);
      const res = await VoiceAgentApi.confirmAction(
        sessionId,
        pendingAction.action_id,
        confirmed
      );

      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const confirmReply = res.tts_confirmation || res.message;

      setTurns((prev) => [
        ...prev,
        {
          speaker: "assistant",
          text: confirmReply,
          intent: confirmed ? "CONFIRM_ACTION" : "REJECT_ACTION",
          time: currentTime,
        },
      ]);

      speakText(confirmReply, res.assistant_audio_b64);
      setPendingAction(null);

      if (confirmed && onConsultationCreated) {
        onConsultationCreated();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to commit clinical action.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg leading-tight">ವೈದ್ಯ ಸಂವಾದಿ (Clinical Voice AI)</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  <span>Gemini 2.5 Flash</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Two-Phase Gate
                </span>
              </div>
              <p className="text-xs text-teal-200/80">
                {selectedPatientInfo
                  ? `Active Patient: ${selectedPatientInfo.name} (#${selectedPatientInfo.patient_id})`
                  : "Hands-Free Voice Transcription & EHR Staging"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "kn" ? "en" : "kn")}
              className="text-xs px-2.5 py-1 rounded-lg bg-teal-900/60 hover:bg-teal-900 border border-teal-500/30 font-medium transition-colors"
              title="Toggle language"
            >
              {language === "kn" ? "ಕನ್ನಡ (KN)" : "English (EN)"}
            </button>

            {/* Mute Toggle */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (typeof window !== "undefined") window.speechSynthesis.cancel();
              }}
              className="p-1.5 rounded-lg bg-teal-900/60 hover:bg-teal-900 border border-teal-500/30 transition-colors"
              title={isMuted ? "Unmute TTS" : "Mute TTS"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-teal-300" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="underline hover:text-rose-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Dialogue Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {turns.map((turn, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${turn.speaker === "doctor" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1 text-[11px] text-slate-400">
                <span>{turn.speaker === "doctor" ? "Dr. Anand Deshmukh" : "ವೈದ್ಯ ಸಂವಾದಿ AI"}</span>
                <span>•</span>
                <span>{turn.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  turn.speaker === "doctor"
                    ? "bg-teal-700 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}
              >
                {turn.text}
              </div>
            </div>
          ))}

          {/* Pending Clinical Action Gate Card */}
          {pendingAction && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-md animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-200 text-amber-800 rounded-lg">
                    {pendingAction.action_type === "CREATE_PATIENT" ? (
                      <UserPlus className="w-5 h-5 text-amber-900" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-amber-900" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-950">
                      {pendingAction.action_type === "CREATE_PATIENT"
                        ? "ಹೊಸ ರೋಗಿ ನೋಂದಣಿ (New Patient Registration Gate)"
                        : "Two-Phase Clinical Confirmation Gate"}
                    </h4>
                    <p className="text-xs text-amber-700">
                      {pendingAction.action_type === "CREATE_PATIENT"
                        ? "Doctor verbal confirmation required to create EHR profile"
                        : "Mandatory doctor sign-off before EHR commitment"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded-full">
                  Action Pending
                </span>
              </div>

              {/* Action Content Preview */}
              <div className="py-3 space-y-2 text-xs">
                {pendingAction.action_type === "CREATE_PATIENT" ? (
                  <div className="space-y-2 py-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-sky-600" />
                      <span className="font-semibold text-slate-700">ರೋಗಿಯ ಹೆಸರು (Name):</span>
                      <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-amber-200">
                        {pendingAction.payload?.full_name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div>
                        <span className="font-medium text-slate-500">ಲಿಂಗ (Gender):</span>{" "}
                        <span className="font-bold text-slate-850">
                          {pendingAction.payload?.gender === "Male" ? "ಪುರುಷ (Male)" : "ಮಹಿಳೆ (Female)"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500">ವಯಸ್ಸು (Age):</span>{" "}
                        <span className="font-bold text-slate-850">{pendingAction.payload?.age} yrs</span>
                      </div>
                      {pendingAction.payload?.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-slate-800">{pendingAction.payload?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {pendingAction.payload?.vitals?.bp && (
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-rose-500" />
                        <span className="font-semibold text-slate-700">Vitals:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-slate-800">
                          BP: {pendingAction.payload.vitals.bp}
                        </span>
                      </div>
                    )}

                    {pendingAction.payload?.diagnosis?.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-700">ರೋಗನಿರ್ಣಯ (Diagnosis):</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                          {pendingAction.payload.diagnosis[0].entity}
                        </span>
                      </div>
                    )}

                    {pendingAction.payload?.medications?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">
                          ಶಿಫಾರಸು ಮಾಡಿದ ಮಾತ್ರೆಗಳು (Medications):
                        </span>
                        <div className="space-y-1">
                          {pendingAction.payload.medications.map((m: any, i: number) => (
                            <div
                              key={i}
                              className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <Pill className="w-3.5 h-3.5 text-teal-600" />
                                <span className="font-semibold text-slate-800">{m.drug_name}</span>
                                <span className="text-slate-500">({m.dosage})</span>
                              </div>
                              <span className="text-amber-800 font-medium">{m.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Confirmation CTAs */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleConfirmAction(false)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>ರದ್ದುಮಾಡಿ (Cancel)</span>
                </button>
                <button
                  onClick={() => handleConfirmAction(true)}
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {pendingAction.action_type === "CREATE_PATIENT"
                      ? "ರೋಗಿ ರಚಿಸಿ (Confirm & Create)"
                      : "ಖಚಿತಪಡಿಸಿ & Save EHR (Confirm)"}
                  </span>
                </button>
              </div>
            </div>
          )}

          <div ref={turnsEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto text-[11px] text-slate-600">
          <span className="text-slate-400 font-medium shrink-0">Quick prompts:</span>
          <button
            onClick={() => handleSendTurn("Create patient Tejas Padaki, 28 years male")}
            className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 font-semibold rounded border border-sky-300 shrink-0 transition-colors flex items-center space-x-1"
          >
            <span>➕ ರೋಗಿ Tejas Padaki ರಚಿಸಿ</span>
          </button>
          <button
            onClick={() => handleSendTurn("He has high fever and severe headache. Prescribe Paracetamol 650mg TDS and Cetirizine 10mg OD. BP 120/80.")}
            className="px-2 py-1 bg-white hover:bg-slate-200 rounded border border-slate-200 shrink-0 transition-colors"
          >
            💊 ಜ್ವರ, Paracetamol 650mg TDS
          </button>
          <button
            onClick={() => handleSendTurn("ರೋಗಿ ಬಸವರಾಜ್ ಅವರ ಹಿಸ್ಟರಿ ತೋರಿಸಿ")}
            className="px-2 py-1 bg-white hover:bg-slate-200 rounded border border-slate-200 shrink-0 transition-colors"
          >
            📋 ಬಸವರಾಜ್ ಹಿಸ್ಟರಿ
          </button>
          <button
            onClick={() => handleSendTurn("ಹೌದು, ಖಚಿತಪಡಿಸಿ")}
            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded border border-emerald-300 shrink-0 font-medium transition-colors"
          >
            ✅ ಹೌದು (Yes)
          </button>
        </div>

        {/* Bottom Input & Voice Mic Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2">
          {/* Pulsing Mic Button */}
          <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all duration-200 ${
              isListening
                ? "bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse"
                : "bg-teal-700 hover:bg-teal-800 text-white"
            }`}
            title={isListening ? "Listening... click to stop" : "Click to speak in Kannada/English"}
          >
            {isListening ? <Mic className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendTurn();
            }}
            placeholder={
              isListening
                ? "ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ (Listening)..."
                : "ಧ್ವನಿಯನ್ನು ಬಳಸಿ ಅಥವಾ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ (Type clinical note)..."
            }
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendTurn()}
            disabled={isProcessing || !inputText.trim()}
            className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

