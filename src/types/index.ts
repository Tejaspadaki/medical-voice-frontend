export interface Role {
  role_id: number;
  name: string;
  description?: string;
  permissions: string[];
}

export interface DoctorProfile {
  doctor_id: number;
  specialization: string;
  registration_no: string;
  department?: string;
  contact_phone?: string;
}

export interface User {
  user_id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  role_id: number;
  role?: Role;
  doctor_profile?: DoctorProfile;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Patient {
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
  allergies?: string[];
  existing_conditions?: string[];
  medical_history?: string[];
  current_medications?: string[];
  weight_kg?: number;
  pregnancy_status?: string;
  created_at: string;
  updated_at: string;
}

export interface PossibleCondition {
  condition_id: string;
  condition_name: string;
  kannada_name: string;
  icd10_code?: string;
  likelihood: string;
  confidence_score?: number;
  supporting_symptoms: string[];
  rationale: string;
  is_preliminary: boolean;
}

export interface EmergencyWarningSign {
  sign: string;
  kannada_sign: string;
  severity: string;
  action_required: string;
  matched_triggers: string[];
}

export interface RecommendedInvestigation {
  investigation_id: string;
  test_name: string;
  kannada_name: string;
  rationale: string;
  priority: string;
  review_status: string;
}

export interface MedicationOption {
  option_id: string;
  generic_name: string;
  kannada_name: string;
  drug_class: string;
  indication: string;
  suggested_dosage_reference?: string;
  suggested_frequency_reference?: string;
  suggested_duration_reference?: string;
  contraindications: string[];
  side_effects: string[];
  interaction_warnings: any[];
  allergy_alerts: any[];
  precautions: string[];
  local_availability: Record<string, any>;
  evidence_references: string[];
  safety_status: string;
  review_status: "pending_review" | "approved" | "edited" | "rejected" | string;
  doctor_edited_dosage?: string;
  doctor_edited_frequency?: string;
  doctor_edited_duration?: string;
  doctor_notes?: string;
}

export interface ClinicalAssessment {
  assessment_id: string;
  patient_id: number;
  patient_snapshot: Record<string, any>;
  extracted_symptoms: any[];
  clinical_assessment_summary: string;
  kannada_summary: string;
  disclaimer: string;
  possible_conditions: PossibleCondition[];
  differential_diagnosis: PossibleCondition[];
  supporting_clinical_findings: string[];
  missing_clinical_information: string[];
  recommended_investigations: RecommendedInvestigation[];
  emergency_warning_signs: EmergencyWarningSign[];
  has_emergency_flags: boolean;
  uncertainty_and_confidence: Record<string, any>;
  medication_options: MedicationOption[];
  drug_interaction_alerts: any[];
  allergy_warnings: any[];
  unsupported_requests: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PatientListResponse {
  items: Patient[];
  total: number;
  page: number;
  size: number;
}
