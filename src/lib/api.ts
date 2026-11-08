// Production live backend endpoint on Render
const DEFAULT_BACKEND_URL = "https://medical-voice-backend-jvnd.onrender.com/api/v1";

const envUrl = (import.meta.env?.VITE_API_URL as string | undefined)?.trim();
// If VITE_API_URL is missing or set to local 127.0.0.1/localhost, automatically route to the live Render backend
const rawUrl = (!envUrl || envUrl.includes("127.0.0.1") || envUrl.includes("localhost"))
  ? DEFAULT_BACKEND_URL
  : envUrl;

const normalizedUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

const API_BASE_URL = normalizedUrl.endsWith("/api/v1")
  ? normalizedUrl
  : normalizedUrl.endsWith("/api")
  ? `${normalizedUrl}/v1`
  : `${normalizedUrl}/api/v1`;

export interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface PatientRecord {
  patient_id: number;
  full_name: string;
  dob?: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  blood_group?: string;
  preferred_language: string;
  created_at?: string;
}

export interface ClinicalSymptom {
  entity: string;
  english?: string;
  duration?: string;
  confidence?: number;
}

export interface ClinicalDiagnosis {
  entity: string;
  english?: string;
  confidence?: number;
}

export interface ClinicalMedication {
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface ClinicalAdvice {
  instruction: string;
}

export interface ConsultationRecord {
  consultation_id: number;
  patient_id: number;
  doctor_id?: number;
  report_id: string;
  input_language: string;
  original_english_speech?: string;
  kannada_transcript: string;
  symptoms: ClinicalSymptom[];
  diagnosis: ClinicalDiagnosis[];
  medications: ClinicalMedication[];
  advice: ClinicalAdvice[];
  status: string;
  signed_by_name?: string;
  signed_doctor_reg?: string;
  audio_filename?: string;
  created_at: string;
  signed_at: string;
}

export class ApiClient {
  private static getHeaders(customHeaders: Record<string, string> = {}, isFormData: boolean = false): HeadersInit {
    const headers: Record<string, string> = {};

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return { ...headers, ...customHeaders };
  }

  private static handleAuthError() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (res.status === 401) {
      this.handleAuthError();
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  static async post<T>(endpoint: string, body: any, customHeaders: Record<string, string> = {}): Promise<T> {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(customHeaders, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });

    if (res.status === 401) {
      this.handleAuthError();
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  static async put<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      this.handleAuthError();
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  static async delete<T = void>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (res.status === 401) {
      this.handleAuthError();
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }
}

// Patients API
export const PatientsApi = {
  list: (skip: number = 0, limit: number = 100) => 
    ApiClient.get<{ items: PatientRecord[]; total: number }>(`/patients?skip=${skip}&limit=${limit}`),
  
  get: (patientId: number) => 
    ApiClient.get<PatientRecord>(`/patients/${patientId}`),
  
  create: (data: Partial<PatientRecord>) => 
    ApiClient.post<PatientRecord>(`/patients`, data),
  
  update: (patientId: number, data: Partial<PatientRecord>) => 
    ApiClient.put<PatientRecord>(`/patients/${patientId}`, data),
  
  delete: (patientId: number) => 
    ApiClient.delete(`/patients/${patientId}`),
};

// Consultations API
export const ConsultationsApi = {
  processAudio: (formData: FormData) => 
    ApiClient.post<any>(`/consultations/process-audio`, formData),
  
  processEnglishText: (patientId: number, englishText: string) => 
    ApiClient.post<any>(`/consultations/process-english-text`, {
      patient_id: patientId,
      english_text: englishText,
    }),
  
  approveReport: (data: any) => 
    ApiClient.post<any>(`/consultations/approve-report`, data),
  
  getPatientConsultations: (patientId: number) => 
    ApiClient.get<ConsultationRecord[]>(`/consultations/patient/${patientId}`),
  
  getById: (consultationId: number) => 
    ApiClient.get<ConsultationRecord>(`/consultations/${consultationId}`),
  
  delete: (consultationId: number) => 
    ApiClient.delete(`/consultations/${consultationId}`),
};

// Voice Agent API (Interactive Clinical Orchestrator)
export const VoiceAgentApi = {
  startSession: (patientId?: number, language: string = "kn") =>
    ApiClient.post<{
      session_id: string;
      doctor_id?: number;
      patient_id?: number;
      patient_name?: string;
      language: string;
      status: string;
      created_at: string;
    }>(`/voice-agent/session/start`, { patient_id: patientId, language }),

  getSession: (sessionId: string) =>
    ApiClient.get<any>(`/voice-agent/session/${sessionId}`),

  sendTurnText: (sessionId: string, textInput: string, language: string = "kn") =>
    ApiClient.post<{
      session_id: string;
      turn_id: string;
      user_transcript: string;
      assistant_reply_text: string;
      assistant_tts_prompt: string;
      assistant_audio_b64?: string;
      language: string;
      intent_detected: string;
      pending_action?: any;
      patient?: any;
      requires_confirmation: boolean;
    }>(`/voice-agent/turn/text`, {
      session_id: sessionId,
      text_input: textInput,
      language,
    }),

  sendAudioTurn: (formData: FormData) =>
    ApiClient.post<{
      session_id: string;
      turn_id: string;
      user_transcript: string;
      assistant_reply_text: string;
      assistant_tts_prompt: string;
      assistant_audio_b64?: string;
      language: string;
      intent_detected: string;
      pending_action?: any;
      patient?: any;
      requires_confirmation: boolean;
    }>(`/voice-agent/turn`, formData),

  confirmAction: (sessionId: string, actionId: string, confirmed: boolean = true) =>
    ApiClient.post<{
      success: boolean;
      action_id: string;
      status: string;
      message: string;
      consultation_id?: number;
      report_id?: string;
      tts_confirmation?: string;
      assistant_audio_b64?: string;
    }>(`/voice-agent/confirm`, {
      session_id: sessionId,
      action_id: actionId,
      confirmed,
    }),

  synthesizeSpeech: (text: string, language: string = "kn") =>
    ApiClient.post<{
      text: string;
      audio_b64?: string;
      provider: string;
    }>(`/voice-agent/tts`, { text, language }),
};
