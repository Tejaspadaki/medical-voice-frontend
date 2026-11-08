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
  created_at: string;
  updated_at: string;
}

export interface PatientListResponse {
  items: Patient[];
  total: number;
  page: number;
  size: number;
}
