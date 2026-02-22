import { Patient, Caregiver, HealthData, RiskAssessment, Appointment, Notification } from '@/types';

// Mock data storage (in production, use a real database)
export const mockPatients: Map<string, Patient> = new Map();
export const mockCaregivers: Map<string, Caregiver> = new Map();
export const mockHealthData: Map<string, HealthData[]> = new Map();
export const mockRiskAssessments: Map<string, RiskAssessment[]> = new Map();
export const mockAppointments: Map<string, Appointment[]> = new Map();
export const mockNotifications: Map<string, Notification[]> = new Map();
export const mockRelationships: Map<string, string[]> = new Map(); // patientId -> caregiverIds

// Initialize with sample data
export const initializeMockData = () => {
  // Sample patient
  const patientId = 'patient_1';
  const patient: Patient = {
    id: patientId,
    email: 'amina@example.com',
    name: 'Amina Okonkwo',
    phone: '+2348012345678',
    role: 'patient',
    uniqueCode: 'SC8K2X',
    dateOfBirth: new Date('1995-05-15'),
    genotype: 'SS',
    medicalHistory: ['Vaso-occlusive crisis (2023)', 'Acute chest syndrome (2022)'],
    emergencyContacts: ['+2347011223344'],
    createdAt: new Date('2024-01-15'),
  };
  mockPatients.set(patientId, patient);

  // Sample caregiver
  const caregiverId = 'caregiver_1';
  const caregiver: Caregiver = {
    id: caregiverId,
    email: 'mama@example.com',
    name: 'Mama Okonkwo',
    phone: '+2348098765432',
    role: 'caregiver',
    relationship: 'Mother',
    linkedPatients: [patientId],
    createdAt: new Date('2024-01-16'),
  };
  mockCaregivers.set(caregiverId, caregiver);

  // Sample health data
  const healthDataList: HealthData[] = [
    {
      id: 'health_1',
      patientId,
      date: new Date(new Date().setDate(new Date().getDate() - 2)),
      hydrationLevel: 45,
      hydrationStatus: 'low',
      painLevel: 4,
      fatigueLevel: 5,
      sleepHours: 6,
      temperature: 37.2,
      medicationAdherence: true,
      eyeJaundiceLevel: 3,
      activityLevel: 'moderate',
      notes: 'Feeling slightly tired',
    },
    {
      id: 'health_2',
      patientId,
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
      hydrationLevel: 60,
      hydrationStatus: 'normal',
      painLevel: 2,
      fatigueLevel: 3,
      sleepHours: 7,
      temperature: 37.0,
      medicationAdherence: true,
      eyeJaundiceLevel: 2,
      activityLevel: 'low',
      notes: 'Feeling better today',
    },
    {
      id: 'health_3',
      patientId,
      date: new Date(),
      hydrationLevel: 55,
      hydrationStatus: 'normal',
      painLevel: 3,
      fatigueLevel: 4,
      sleepHours: 7.5,
      temperature: 37.1,
      medicationAdherence: true,
      eyeJaundiceLevel: 2.5,
      activityLevel: 'moderate',
      notes: 'Morning check-in',
    },
  ];
  mockHealthData.set(patientId, healthDataList);

  // Sample risk assessments
  const riskAssessments: RiskAssessment[] = [
    {
      id: 'risk_1',
      patientId,
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
      riskScore: 35,
      riskLevel: 'low',
      predictedCrisisIn48h: false,
      triggerFactors: ['Mild fatigue reported'],
      recommendations: ['Maintain current hydration routine', 'Continue medication adherence'],
    },
    {
      id: 'risk_2',
      patientId,
      date: new Date(),
      riskScore: 28,
      riskLevel: 'low',
      predictedCrisisIn48h: false,
      triggerFactors: [],
      recommendations: ['Keep up with current health habits', 'Drink at least 3 liters of water daily'],
    },
  ];
  mockRiskAssessments.set(patientId, riskAssessments);

  // Sample appointments
  const appointments: Appointment[] = [
    {
      id: 'apt_1',
      patientId,
      caregiverId,
      doctorName: 'Dr. Oluwaseun Adeyemi',
      facility: 'Lagos University Teaching Hospital',
      date: new Date(new Date().setDate(new Date().getDate() + 10)),
      time: '14:30',
      reason: 'Routine check-up',
      status: 'scheduled',
      notes: 'Bring previous medical records',
    },
  ];
  mockAppointments.set(patientId, appointments);

  // Sample notifications
  const notifications: Notification[] = [
    {
      id: 'notif_1',
      caregiverId,
      patientId,
      type: 'general',
      title: 'Daily Check-in Reminder',
      message: 'Remember to check in on Amina\'s health status today',
      severity: 'low',
      read: false,
      createdAt: new Date(),
    },
  ];
  mockNotifications.set(caregiverId, notifications);

  // Relationships
  mockRelationships.set(patientId, [caregiverId]);
};
