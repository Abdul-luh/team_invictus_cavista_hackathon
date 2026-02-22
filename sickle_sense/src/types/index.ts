export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'patient' | 'caregiver';
  createdAt: Date;
}

export interface Patient extends User {
  role: 'patient';
  uniqueCode: string;
  dateOfBirth: Date;
  genotype: string;
  medicalHistory: string[];
  emergencyContacts: string[];
}

export interface Caregiver extends User {
  role: 'caregiver';
  relationship: string;
  linkedPatients: string[];
}

export interface HealthData {
  id: string;
  patientId: string;
  date: Date;
  hydrationLevel: number; // 0-100
  hydrationStatus: 'low' | 'normal' | 'optimal';
  painLevel: number; // 0-100 percentage
  fatigueLevel: number; // 0-10
  sleepHours: number;
  sleepStart?: string; // e.g. "22:00"
  sleepEnd?: string;   // e.g. "06:00"
  temperature: number;
  medicationAdherence: boolean;
  eyeJaundiceLevel: number; // 0-10 (jaundice intensity)
  activityLevel: 'low' | 'moderate' | 'high';
  notes: string;
}

export interface RiskAssessment {
  id: string;
  patientId: string;
  date: Date;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  predictedCrisisIn48h: boolean;
  triggerFactors: string[];
  recommendations: string[];
}

export interface Notification {
  id: string;
  caregiverId: string;
  patientId: string;
  type: 'risk_alert' | 'medication_reminder' | 'appointment' | 'general';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  caregiverId: string;
  doctorName: string;
  facility: string;
  date: Date;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

export interface PatientCaregiverRelationship {
  id: string;
  patientId: string;
  caregiverId: string;
  relationship: string;
  linkedAt: Date;
  permissions: {
    viewHealth: boolean;
    receiveAlerts: boolean;
    bookAppointments: boolean;
  };
}
export interface ClinicalReport {
  user_id: string;
  detailed_report: string;
  metrics: {
    water_percent_drop: number;
    bilirubin_percent_rise: number;
  };
}

export interface NavItem {
  label: string;
  href: string;
  icon: any; // Using any for LucideIcon to avoid import complexities in types
  badge?: number;
}
