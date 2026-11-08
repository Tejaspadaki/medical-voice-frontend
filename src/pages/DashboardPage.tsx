import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient, ConsultationsApi } from "@/lib/api";
import { Patient, PatientListResponse } from "@/types";
import { useToast } from "@/context/ToastContext";

// Modular React Components
import { Header } from "@/components/Header";
import { SafetyBanner } from "@/components/SafetyBanner";
import { StatsCards } from "@/components/StatsCards";
import { PatientTable } from "@/components/PatientTable";
import { AddPatientModal } from "@/components/AddPatientModal";
import { EditPatientModal } from "@/components/EditPatientModal";
import { DeletePatientDialog } from "@/components/DeletePatientDialog";
import { ConsultationHistoryModal } from "@/components/ConsultationHistoryModal";
import { ConsultationModal } from "@/components/ConsultationModal";
import { PrescriptionLetterheadModal } from "@/components/PrescriptionLetterheadModal";
import { VoiceAssistantModal } from "@/components/VoiceAssistantModal";

export function DashboardPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  // Selected Patient for Consultation & Recording
  const [activeConsultationPatient, setActiveConsultationPatient] = useState<Patient | null>(null);

  // Audio Recording, Upload & Direct English Text State
  const [consultationMode, setConsultationMode] = useState<"record" | "upload" | "text">("record");
  const [englishTextInput, setEnglishTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [, setRecordedAudioUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("kn");

  // MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Processing & Review State
  const [isProcessingASR, setIsProcessingASR] = useState(false);
  const [consultationResult, setConsultationResult] = useState<any | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Editable Doctor Review State
  const [editableTranscript, setEditableTranscript] = useState("");
  const [originalEnglishSpeech, setOriginalEnglishSpeech] = useState<string | null>(null);
  const [editableDiagnosis, setEditableDiagnosis] = useState("");
  const [editableSymptoms, setEditableSymptoms] = useState<any[]>([]);
  const [editableMedications, setEditableMedications] = useState<any[]>([]);
  const [editableAdvice, setEditableAdvice] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Patients Query
  const { data: patientData, isLoading, isError } = useQuery<PatientListResponse>({
    queryKey: ["patients", searchTerm],
    queryFn: () => ApiClient.get<PatientListResponse>(`/patients?search=${encodeURIComponent(searchTerm)}&size=50`),
  });

  // Create Patient Mutation
  const createPatientMutation = useMutation({
    mutationFn: (patient: any) => ApiClient.post<Patient>("/patients", patient),
    onSuccess: (newPatient: Patient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setIsAddPatientOpen(false);
      setFormError(null);
      success(`Patient ${newPatient.full_name} registered successfully.`, "Patient Created");
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to register patient");
      toastError(err.message || "Failed to register patient", "Registration Error");
    },
  });

  const handleCreatePatient = (formData: any) => {
    setFormError(null);
    createPatientMutation.mutate(formData);
  };

  // Timer Effect for Live Recording
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Open Consultation Workflow
  const handleStartConsultation = (patient: Patient) => {
    setActiveConsultationPatient(patient);
    setSelectedLanguage("en");
    setConsultationResult(null);
    setOriginalEnglishSpeech(null);
    setIsApproved(false);
    setShowPrintModal(false);
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setUploadedFile(null);
    setRecordingTime(0);
    setIsRecording(false);

    if (patient.patient_id === 1) {
      setEnglishTextInput(
        "Patient Basavaraj presents for hypertension and type 2 diabetes follow-up with complaints of headache and fatigue for 3 days. Blood pressure is 150/95. Prescribed Telmisartan 40mg once daily in the morning and Metformin 500mg once daily at night for 30 days. Advice low salt diet and 30 mins daily walking."
      );
    } else if (patient.patient_id === 2) {
      setEnglishTextInput(
        "Patient Lakshmi complains of high fever 101.5 F, sore throat and dry cough for 3 days. Diagnosed with acute upper respiratory tract infection. Prescribed Paracetamol 650mg TDS for 3 days, Cetirizine 10mg OD for 5 days and warm saline gargles. Advised warm fluids and rest."
      );
    } else if (patient.patient_id === 3) {
      setEnglishTextInput(
        "Patient Mohammed Farooq presents with acute burning epigastric pain, nausea and vomiting sensation for 2 days. Diagnosed with acute acid peptic disease and gastritis. Prescribed Pantoprazole 40mg OD before breakfast and Domperidone 10mg BD before meals for 5 days. Advised to avoid spicy oily foods and drink plenty of water."
      );
    } else {
      setEnglishTextInput(
        `Patient ${patient.full_name} presents with complaints of high fever and severe headache for 3 days. Diagnosed with viral fever. Prescribed Paracetamol 650mg TDS for 3 days and Cetirizine 10mg OD for 5 days. Advised warm water, rest, and follow up if fever persists.`
      );
    }
  };

  // Start Live Mic Recording
  const startLiveRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.warn("Microphone fallback active:", err);
      setIsRecording(true);
      setRecordingTime(0);
    }
  };

  // Stop Live Mic Recording
  const stopLiveRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      const fakeBlob = new Blob(["sample audio bytes"], { type: "audio/wav" });
      setRecordedAudioBlob(fakeBlob);
      setRecordedAudioUrl("sample_audio");
    }
    setIsRecording(false);
  };

  // Load Pre-generated Patient Audio File
  const handleLoadSampleAudioForPatient = async (patientId: number, lang: "en" | "kn" = "en") => {
    let filename = "";
    if (lang === "en") {
      filename = `PT-${String(patientId).padStart(4, "0")}_Doctor_English_Consultation.mp3`;
    } else {
      if (patientId === 1) filename = "PT-0001_Basavaraj_Patil.mp3";
      else if (patientId === 2) filename = "PT-0002_Lakshmi_Gowda.mp3";
      else if (patientId === 3) filename = "PT-0003_Mohammed_Farooq.mp3";
      else filename = "PT-0001_Basavaraj_Patil.mp3";
    }

    try {
      const res = await fetch(`/sample_audios/${filename}`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "audio/mp3" });
      setUploadedFile(file);
      setConsultationMode("upload");
    } catch (e) {
      const mockFile = new File(["audio bytes"], filename, { type: "audio/mp3" });
      setUploadedFile(mockFile);
      setConsultationMode("upload");
    }
  };

  // Process Direct English Text to Kannada Report
  const handleProcessEnglishText = async (textToProcess?: string) => {
    if (!activeConsultationPatient) return;
    const text = textToProcess || englishTextInput;
    if (!text.trim()) {
      toastError("Please enter English clinical notes.", "Missing Notes");
      return;
    }

    setIsProcessingASR(true);
    try {
      const data = await ConsultationsApi.processEnglishText(
        activeConsultationPatient.patient_id,
        text
      );

      setConsultationResult(data);
      setEditableTranscript(data.transcription?.text || "");
      setOriginalEnglishSpeech(data.transcription?.original_english_speech || text);
      setEditableDiagnosis(data.entities?.diagnosis?.[0]?.entity || "ಸಾಮಾನ್ಯ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ");
      setEditableSymptoms(data.entities?.symptoms || []);
      setEditableMedications(data.entities?.medications || []);
      setEditableAdvice(data.entities?.advice || []);
      setIsApproved(false);
      success("Doctor notes translated and Kannada clinical entities extracted.", "AI Processing Complete");
    } catch (err: any) {
      toastError(err.message || "Failed to translate English notes into Kannada", "AI Error");
    } finally {
      setIsProcessingASR(false);
    }
  };

  // Trigger ASR & NER Processing (Audio / Mic)
  const handleProcessAudio = async () => {
    if (!activeConsultationPatient) return;
    setIsProcessingASR(true);

    try {
      const formData = new FormData();
      formData.append("patient_id", String(activeConsultationPatient.patient_id));
      formData.append("language", selectedLanguage);

      if (consultationMode === "upload" && uploadedFile) {
        formData.append("audio_file", uploadedFile);
      } else if (recordedAudioBlob) {
        formData.append("audio_file", recordedAudioBlob, "live_recording.wav");
      }

      const data = await ConsultationsApi.processAudio(formData);

      setConsultationResult(data);
      setEditableTranscript(data.transcription?.text || "");
      setOriginalEnglishSpeech(data.transcription?.original_english_speech || null);
      setEditableDiagnosis(data.entities?.diagnosis?.[0]?.entity || "ಸಾಮಾನ್ಯ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ");
      setEditableSymptoms(data.entities?.symptoms || []);
      setEditableMedications(data.entities?.medications || []);
      setEditableAdvice(data.entities?.advice || []);
      setIsApproved(false);
      success("Speech transcribed with IndicWhisper and Clinical NER extracted.", "Transcription Ready");
    } catch (err: any) {
      toastError(err.message || "Failed to process audio transcription", "ASR Processing Error");
    } finally {
      setIsProcessingASR(false);
    }
  };

  // Finalize & Approve Report (Mandatory Doctor Sign-off)
  const handleApproveReport = async () => {
    if (!activeConsultationPatient) return;
    try {
      const res = await ConsultationsApi.approveReport({
        patient_id: activeConsultationPatient.patient_id,
        transcript_text: editableTranscript,
        language: "kn",
        original_english_speech: originalEnglishSpeech,
        symptoms: editableSymptoms,
        diagnosis: [{ entity: editableDiagnosis }],
        medications: editableMedications,
        advice: editableAdvice,
        doctor_signature_confirmed: true,
      });

      setIsApproved(true);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      success(
        `ವೈದ್ಯಕೀಯ ವರದಿ #${res.report_id || "APPROVED"} ಯಶಸ್ವಿಯಾಗಿ ಡಿಜಿಟಲ್ ಸಹಿಯೊಂದಿಗೆ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸಂಗ್ರಹವಾಗಿದೆ.`,
        "ವರದಿ ಅನುಮೋದನೆಗೊಂಡಿದೆ (Approved)"
      );
    } catch (err: any) {
      toastError(err.message || "Failed to approve and save report", "Approval Error");
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getPatientSampleFilename = (id: number) => {
    if (id === 1) return "PT-0001_Basavaraj_Patil.mp3";
    if (id === 2) return "PT-0002_Lakshmi_Gowda.mp3";
    if (id === 3) return "PT-0003_Mohammed_Farooq.mp3";
    return "PT-0001_Basavaraj_Patil.mp3";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <Header />

      {/* 2. Main Clinical Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Clinical Safety Protocol Alert */}
        <SafetyBanner />

        {/* Real-time Statistics Cards */}
        <StatsCards totalPatients={patientData?.total ?? patientData?.items?.length ?? (Array.isArray(patientData) ? (patientData as any).length : 0)} />

        {/* Patient Directory & Consultation Registry */}
        <PatientTable
          patients={patientData?.items}
          isLoading={isLoading}
          isError={isError}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenAddPatient={() => setIsAddPatientOpen(true)}
          onStartConsultation={handleStartConsultation}
          onEditPatient={(patient) => setEditingPatient(patient)}
          onDeletePatient={(patient) => setDeletingPatient(patient)}
          onViewHistory={(patient) => setHistoryPatient(patient)}
        />
      </main>

      {/* 3. Audio & English Consultation Workspace Modal */}
      {activeConsultationPatient && (
        <ConsultationModal
          patient={activeConsultationPatient}
          onClose={() => {
            if (isRecording) stopLiveRecording();
            setActiveConsultationPatient(null);
          }}
          user={user}
          consultationMode={consultationMode}
          setConsultationMode={setConsultationMode}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          isRecording={isRecording}
          recordingTime={recordingTime}
          formatSeconds={formatSeconds}
          startLiveRecording={startLiveRecording}
          stopLiveRecording={stopLiveRecording}
          recordedAudioBlob={recordedAudioBlob}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          englishTextInput={englishTextInput}
          setEnglishTextInput={setEnglishTextInput}
          handleLoadSampleAudioForPatient={handleLoadSampleAudioForPatient}
          getPatientSampleFilename={getPatientSampleFilename}
          handleProcessAudio={handleProcessAudio}
          handleProcessEnglishText={handleProcessEnglishText}
          isProcessingASR={isProcessingASR}
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
          onApproveReport={handleApproveReport}
          onOpenPrintModal={() => setShowPrintModal(true)}
        />
      )}

      {/* 4. Official Clinical Letterhead Prescription Modal (Print Ready) */}
      {showPrintModal && activeConsultationPatient && (
        <PrescriptionLetterheadModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          patient={activeConsultationPatient}
          user={user}
          editableSymptoms={editableSymptoms}
          editableDiagnosis={editableDiagnosis}
          editableMedications={editableMedications}
          editableAdvice={editableAdvice}
        />
      )}

      {/* 5. Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onSubmit={handleCreatePatient}
        isPending={createPatientMutation.isPending}
        formError={formError}
      />

      {/* 6. Edit Patient Modal */}
      <EditPatientModal
        isOpen={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        onPatientUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ["patients"] });
        }}
      />

      {/* 7. Delete Patient Confirmation Dialog */}
      <DeletePatientDialog
        isOpen={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        patient={deletingPatient}
        onPatientDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ["patients"] });
        }}
      />

      {/* 8. Patient Consultation History Modal */}
      <ConsultationHistoryModal
        isOpen={Boolean(historyPatient)}
        onClose={() => setHistoryPatient(null)}
        patient={historyPatient}
      />

      {/* 9. Floating Clinical Voice AI Assistant Button */}
      <button
        onClick={() => setIsVoiceAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 hover:from-teal-800 hover:to-indigo-950 text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center space-x-3 border-2 border-teal-400/30 transition-all duration-300 hover:scale-105 group"
        title="Open ವೈದ್ಯ ಸಂವಾದಿ (Powered by Gemini 2.5 Flash)"
      >
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-sm tracking-wide flex items-center space-x-1.5">
          <span>ವೈದ್ಯ ಸಂವಾದಿ (Voice AI)</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-md border border-indigo-400/30 font-mono font-semibold">
            Gemini
          </span>
        </span>
      </button>

      {/* 10. Voice Assistant Interactive Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        activePatient={activeConsultationPatient}
        onConsultationCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["patients"] });
          success("Voice Consultation saved to EHR successfully!", "EHR Updated");
        }}
      />
    </div>
  );
}
