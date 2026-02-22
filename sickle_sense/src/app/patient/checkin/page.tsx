'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar } from '@/components';
import { HydrationCard } from '@/components/HydrationCard';
import { EyeJaundiceCard } from '@/components/JaundiceCard';
import { calculateRiskScore, getTriggerFactors } from '@/lib/utils';
import { mockHealthData, mockRiskAssessments, mockRelationships, mockNotifications } from '@/lib/mockData';
import { HealthData, RiskAssessment, Notification, Patient } from '@/types';

interface JaundiceStats {
  verified: boolean;
  current_level: number;
  status: 'Normal' | 'Mild' | 'Elevated' | 'Critical';
  message: string;
  weekly_data: { date: string; level: number }[];
}
// --- Professional SVG Icons ---
const Icons = {
  Pill: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5 20.5 10.5c1.6-1.6 1.6-4.1 0-5.7l-4.3-4.3c-1.6-1.6-4.1-1.6-5.7 0L.5 10.5c-1.6 1.6-1.6 4.1 0 5.7l4.3 4.3c1.6 1.6 4.1 1.6 5.7 0Z" />
      <path d="m5.5 10.5 10-10" />
    </svg>
  ),
  Eye: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Moon: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  Activity: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Notes: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
};

// Interfaces
interface HydrationStats {
  verified: boolean;
  ml_added: number;
  drinks_today: number;
  progress_percentage: number;
  message: string;
  daily_goal_ml: number;
  weekly_data: { date: string; ml: number; drinks: number; }[];
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary-50: #f0f9ff; --primary-100: #e0f2fe; --primary-200: #bae6fd; --primary-300: #7dd3fc;
    --primary-400: #38bdf8; --primary-500: #0ea5e9; --primary-600: #0284c7; --primary-700: #0369a1;
    --primary-800: #075985; --primary-900: #0c4a6e;
    
    --success-50: #f0fdf4; --success-100: #dcfce7; --success-200: #bbf7d0; --success-500: #22c55e;
    --success-600: #16a34a; --success-700: #15803d;
    
    --warning-50: #fefce8; --warning-100: #fef9c3; --warning-200: #fde047; --warning-500: #eab308;
    --warning-600: #ca8a04; --warning-700: #a16207;
    
    --danger-50: #fef2f2; --danger-100: #fee2e2; --danger-200: #fecaca; --danger-500: #ef4444;
    --danger-600: #dc2626; --danger-700: #b91c1c;
    
    --purple-50: #faf5ff; --purple-100: #f3e8ff; --purple-600: #9333ea;
    
    --white: #ffffff;
    --gray-50: #f9fafb; --gray-100: #f3f4f6; --gray-200: #e5e7eb; --gray-300: #d1d5db;
    --gray-400: #9ca3af; --gray-500: #6b7280; --gray-600: #4b5563; --gray-700: #374151;
    --gray-800: #1f2937; --gray-900: #111827;
    
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    
    --radius-sm: 0.375rem; --radius-md: 0.5rem; --radius-lg: 0.75rem; 
    --radius-xl: 1rem; --radius-2xl: 1.5rem;
  }

  body { font-family: 'Inter', sans-serif; background: var(--gray-50); color: var(--gray-900); line-height: 1.5; }

  .inner { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; padding: 2rem 1rem; }

  /* Header Section */
  .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1rem; }
  .header-left { flex: 1; }
  .page-title { font-size: clamp(1.75rem, 4vw, 2.25rem); font-weight: 800; letter-spacing: -0.02em; color: var(--gray-900); margin-bottom: 0.5rem; }
  .page-description { color: var(--gray-500); font-size: 0.9375rem; font-weight: 400; max-width: 550px; line-height: 1.6; }

  /* Progress Tracker */
  .progress-tracker { display: flex; align-items: center; gap: 0.5rem; background: var(--white); padding: 0.75rem 1.25rem; border-radius: 2rem; border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); }
  .progress-step { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--gray-200); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .progress-step.completed { background: var(--success-500); transform: scale(1.2); }
  .progress-step.current { background: var(--primary-500); box-shadow: 0 0 0 3px var(--primary-100); }
  .progress-count { font-size: 0.875rem; font-weight: 600; color: var(--gray-600); margin-left: 0.5rem; }

  /* Form Layout */
  .checkin-form { display: flex; flex-direction: column; gap: 1.75rem; padding-bottom: 4rem; }

  /* Cards */
  .card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-2xl); padding: clamp(1.5rem, 4vw, 2rem); box-shadow: var(--shadow-sm); transition: box-shadow 0.2s ease; }
  .card:hover { box-shadow: var(--shadow-md); }
  .card-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.75rem; }
  .card-icon { width: 3.5rem; height: 3.5rem; border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; background: var(--gray-50); color: var(--gray-700); }
  
  .card-icon.blue { background: var(--primary-50); color: var(--primary-600); }
  .card-icon.green { background: var(--success-50); color: var(--success-600); }
  .card-icon.red { background: var(--danger-50); color: var(--danger-600); }
  .card-icon.yellow { background: var(--warning-50); color: var(--warning-600); }
  .card-icon.purple { background: var(--purple-50); color: var(--purple-600); }

  .card-title { font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: 0.25rem; }
  .card-subtitle { font-size: 0.875rem; color: var(--gray-500); font-weight: 400; }

  /* UI Components */
  
  /* Sliders */
  .slider-container { display: flex; flex-direction: column; gap: 1rem; }
  .slider-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .field-label { font-size: 1rem; font-weight: 600; color: var(--gray-800); display: block; margin-bottom: 0.375rem; }
  .slider-value { font-size: 1.5rem; font-weight: 700; }
  .slider-value.pain { color: var(--danger-600); }
  .slider-value.jaundice { color: var(--warning-600); }
  
  .slider {
    -webkit-appearance: none; width: 100%; height: 8px; border-radius: 4px;
    background: linear-gradient(to right, var(--primary-500) var(--progress), var(--gray-200) var(--progress));
    outline: none; transition: background 0.15s ease-in-out; margin: 0.5rem 0;
  }
  .slider.pain { background: linear-gradient(to right, var(--danger-500) var(--progress), var(--gray-200) var(--progress)); }
  .slider.jaundice { background: linear-gradient(to right, var(--warning-500) var(--progress), var(--gray-200) var(--progress)); }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%;
    background: var(--white); border: 2px solid var(--gray-300); cursor: pointer; box-shadow: var(--shadow-sm); transition: transform 0.1s;
  }
  .slider::-webkit-slider-thumb:hover { transform: scale(1.1); border-color: var(--primary-500); }
  .slider.pain::-webkit-slider-thumb:hover { border-color: var(--danger-500); }
  .slider.jaundice::-webkit-slider-thumb:hover { border-color: var(--warning-500); }

  /* Checkbox */
  .checkbox-toggle { display: flex; align-items: center; gap: 1rem; cursor: pointer; padding: 1.25rem; border: 1px solid var(--gray-200); border-radius: var(--radius-xl); transition: all 0.2s; }
  .checkbox-toggle:hover { background: var(--gray-50); border-color: var(--gray-300); }
  .checkbox-toggle.checked { border-color: var(--success-500); background: var(--success-50); }
  .checkbox-box { width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--gray-300); display: flex; justify-content: center; align-items: center; transition: all 0.2s; background: var(--white); }
  .checkbox-toggle.checked .checkbox-box { background: var(--success-500); border-color: var(--success-500); }
  .checkbox-label { font-weight: 500; font-size: 0.9375rem; color: var(--gray-700); }

  /* Number Inputs */
  .number-input-group { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
  .number-stepper { width: 3.5rem; height: 3.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); background: var(--gray-50); font-size: 1.5rem; font-weight: 300; color: var(--gray-700); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .number-stepper:hover { background: var(--gray-100); color: var(--gray-900); }
  .number-input { width: 6rem; height: 3.5rem; text-align: center; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); font-size: 1.25rem; font-weight: 600; color: var(--gray-900); background: var(--white); }
  .number-input:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px var(--primary-100); }

  /* Textarea */
  .textarea { width: 100%; padding: 1.25rem; border: 1px solid var(--gray-200); border-radius: var(--radius-xl); font-family: inherit; font-size: 0.9375rem; transition: all 0.2s; resize: vertical; background: var(--gray-50); color: var(--gray-900); line-height: 1.5; }
  .textarea:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px var(--primary-100); background: var(--white); }
  .textarea::placeholder { color: var(--gray-400); }

  /* Badges */
  .status-badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.025em; }
  .status-badge.good { background: var(--success-100); color: var(--success-700); }
  .status-badge.warning { background: var(--warning-100); color: var(--warning-700); }
  .status-badge.danger { background: var(--danger-100); color: var(--danger-700); }

  /* Buttons */
  .button-group { display: flex; gap: 1rem; margin-top: 1rem; }
  .btn-primary { flex: 1; padding: 1.25rem; background: var(--primary-600); color: white; border: none; border-radius: var(--radius-xl); font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-sm); }
  .btn-primary:hover:not(:disabled) { background: var(--primary-700); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  .btn-secondary { flex: 1; padding: 1.25rem; background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-200); border-radius: var(--radius-xl); font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
  .btn-secondary:hover { background: var(--gray-50); border-color: var(--gray-300); }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .fade-in-1 { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards; opacity: 0; }
  .fade-in-2 { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
  .fade-in-3 { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; opacity: 0; }
  .fade-in-4 { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
  .fade-in-5 { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards; opacity: 0; }

  /* Success Overlay */
  .success-overlay { background: var(--white); border: 1px solid var(--success-200); border-radius: var(--radius-2xl); padding: clamp(3rem, 6vw, 4rem) 2rem; text-align: center; box-shadow: var(--shadow-lg); }
  .success-icon { display: inline-flex; align-items: center; justify-content: center; width: 5rem; height: 5rem; border-radius: 50%; background: var(--success-100); color: var(--success-600); margin-bottom: 1.5rem; animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
  .success-title { font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 700; color: var(--gray-900); margin-bottom: 0.75rem; }
  .success-message { color: var(--gray-500); font-size: 1.0625rem; line-height: 1.6; max-width: 450px; margin: 0 auto; }
  
  @keyframes scaleIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

  /* Spinner */
  .spinner { display: inline-block; width: 1.25rem; height: 1.25rem; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 0.5rem; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Medication List Styles */
  .med-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .med-item {
    display: flex; align-items: center; gap: 1rem; padding: 1rem;
    border: 1px solid var(--gray-200); border-radius: var(--radius-xl);
    cursor: pointer; transition: all 0.2s;
  }
  .med-item:hover { background: var(--gray-50); border-color: var(--gray-300); }
  .med-item.completed { background: var(--success-50); border-color: var(--success-500); }
  .med-checkbox {
    width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--gray-300);
    display: flex; justify-content: center; align-items: center; transition: all 0.2s;
    background: var(--white); flex-shrink: 0;
  }
  .med-item.completed .med-checkbox { background: var(--success-500); border-color: var(--success-500); color: white; }
  .med-info { flex: 1; }
  .med-name { font-weight: 600; font-size: 0.9375rem; color: var(--gray-800); }
  .med-time { font-size: 0.75rem; color: var(--gray-500); }
  .med-status { font-size: 0.75rem; font-weight: 500; margin-top: 0.25rem; font-style: italic; }
  
  @media (max-width: 640px) {
    .button-group { flex-direction: column; }
    .page-header { flex-direction: column; align-items: flex-start; }
    .progress-tracker { width: 100%; justify-content: space-between; }
  }
`;

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  colorClass: string;
  onChange: (value: number) => void;
}

function SliderField({ label, value, min, max, step = 1, unit = '', colorClass, onChange }: SliderFieldProps) {
  const progress = ((value - min) / (max - min)) * 100;

  const getStatusHint = () => {
    if (colorClass === 'pain') {
      if (value > 7) return { type: 'danger', text: 'Severe' };
      if (value > 3) return { type: 'warning', text: 'Moderate' };
      return { type: 'good', text: 'Minimal' };
    }
    if (colorClass === 'jaundice') {
      if (value > 5) return { type: 'danger', text: 'Elevated' };
      if (value > 2) return { type: 'warning', text: 'Mild' };
      return { type: 'good', text: 'Normal' };
    }
    return null;
  };

  const status = getStatusHint();

  return (
    <div className="slider-container">
      <div className="slider-header">
        <div>
          <span className="field-label">{label}</span>
          {status && <span className={`status-badge ${status.type}`}>{status.text}</span>}
        </div>
        <span className={`slider-value ${colorClass}`}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`slider ${colorClass}`}
        style={{ '--progress': `${progress}%` } as React.CSSProperties}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--gray-400)', fontWeight: 500 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

interface SectionCardProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
  animClass?: string;
}

function SectionCard({ icon, iconClass, title, sub, children, animClass }: SectionCardProps) {
  return (
    <div className={`card ${animClass || ''}`}>
      <div className="card-header">
        <div className={`card-icon ${iconClass}`}>{icon}</div>
        <div>
          <div className="card-title">{title}</div>
          {sub && <div className="card-subtitle">{sub}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function DailyCheckin() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hydrationStats, setHydrationStats] = useState<HydrationStats | null>(null);

  const [medications, setMedications] = useState([
    { id: '1', name: 'Hydroxyurea', taken: false, time: '08:00 AM', status: '' },
    { id: '2', name: 'Folic Acid', taken: false, time: '08:30 AM', status: '' },
    { id: '3', name: 'Penicillin', taken: false, time: '09:00 AM', status: '' },
    { id: '4', name: 'Pain Medication (as needed)', taken: false, time: 'Flexible', status: '' },
  ]);

  const toggleMedication = (id: string) => {
    setMedications(meds => meds.map(m =>
      m.id === id ? {
        ...m,
        taken: !m.taken,
        status: !m.taken ? 'Waiting for caregiver/family to confirm' : ''
      } : m
    ));
  };

  const [formData, setFormData] = useState({
    hydrationLevel: 50,
    painLevel: 0,
    fatigueLevel: 0,
    sleepHours: 7,
    temperature: 37.0,
    medicationAdherence: true,
    eyeJaundiceLevel: 0,
    activityLevel: 'moderate' as 'low' | 'moderate' | 'high',
    notes: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const uid = localStorage.getItem('userId');
    if (!userStr || !uid) { router.push('/auth'); return; }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'patient') { router.push('/auth'); return; }
      setPatient(user); setUserId(uid);
    } catch (error) { router.push('/auth'); }
  }, [router]);

  const handleJaundiceUpdate = (stats: JaundiceStats) => {
    // Update the jaundice level in the main form state
    // This connects the AI analysis result to the data sent to the backend/mock
    setFormData(prev => ({ ...prev, eyeJaundiceLevel: stats.current_level }));
  };

  const updateField = (key: string) => (value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleHydrationUpdate = (stats: HydrationStats) => {
    setHydrationStats(stats);
    const newHydrationLevel = stats.progress_percentage || Math.min(100, Math.round((stats.drinks_today * 250 / 2000) * 100));
    setFormData(prev => ({ ...prev, hydrationLevel: newHydrationLevel }));

    // Proactively update latestHealth in localStorage so dashboard updates immediately
    const userId = localStorage.getItem('userId');
    if (userId) {
      const storedLatest = localStorage.getItem('latestHealth');
      let currentLatest = storedLatest ? JSON.parse(storedLatest) : { patientId: userId, date: new Date() };
      const updatedLatest = { ...currentLatest, hydrationLevel: newHydrationLevel };
      localStorage.setItem('latestHealth', JSON.stringify(updatedLatest));
    }
  };

  const getRecommendations = (level: string, triggers: string[]): string[] => {
    const recommendations: string[] = [];
    if (level === 'high') {
      recommendations.push('Seek immediate medical attention if symptoms worsen');
      recommendations.push('Contact your caregiver right away');
    }
    if (triggers.some(t => t.toLowerCase().includes('hydrat'))) {
      recommendations.push('Drink at least 1L of water in the next 2 hours');
      recommendations.push('Set reminders every 30 minutes to hydrate');
    }
    if (triggers.some(t => t.toLowerCase().includes('pain'))) {
      recommendations.push('Take prescribed pain medication as needed');
      recommendations.push('Rest and avoid strenuous activities');
    }
    if (triggers.some(t => t.toLowerCase().includes('sleep'))) {
      recommendations.push('Aim for 8+ hours of sleep tonight');
      recommendations.push('Avoid screens 1 hour before bed');
    }
    if (triggers.some(t => t.toLowerCase().includes('temperatur'))) {
      recommendations.push('Monitor your temperature every 4 hours');
      recommendations.push('Use cool compress if fever persists');
    }
    if (recommendations.length === 0) {
      recommendations.push('Continue your current health routine');
      recommendations.push('Stay hydrated and maintain medication schedule');
    }
    return recommendations;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newHealth: HealthData = {
      id: `health_${Date.now()}`,
      patientId: userId,
      date: new Date(),
      ...formData,
      hydrationStatus: formData.hydrationLevel < 30 ? 'low' : formData.hydrationLevel < 60 ? 'normal' : 'optimal',
    };

    if (!mockHealthData.has(userId)) mockHealthData.set(userId, []);
    mockHealthData.get(userId)!.push(newHealth);

    const { score, level } = calculateRiskScore(formData);
    const triggers = getTriggerFactors(formData);

    const newRisk: RiskAssessment = {
      id: `risk_${Date.now()}`, patientId: userId, date: new Date(),
      riskScore: score, riskLevel: level, predictedCrisisIn48h: score > 70,
      triggerFactors: triggers, recommendations: getRecommendations(level, triggers),
    };

    if (!mockRiskAssessments.has(userId)) mockRiskAssessments.set(userId, []);
    mockRiskAssessments.get(userId)!.push(newRisk);

    if (level === 'high' || score > 70) {
      const caregiverIds = mockRelationships.get(userId) || [];
      caregiverIds.forEach(caregiverId => {
        if (!mockNotifications.has(caregiverId)) mockNotifications.set(caregiverId, []);
        const notification: Notification = {
          id: `notif_${Date.now()}_${caregiverId}`, caregiverId, patientId: userId, type: 'risk_alert',
          title: `High Risk Alert: ${patient?.name}`, message: `${patient?.name} has a ${level} risk score (${score}/100). ${triggers[0] || 'Please check in.'}`,
          severity: 'high', read: false, createdAt: new Date(),
        };
        mockNotifications.get(caregiverId)!.push(notification);
      });
    }

    localStorage.setItem('latestHealth', JSON.stringify(newHealth));

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => { router.push('/patient/dashboard'); }, 2000);
    }, 1500);
  };

  const totalSections = 6; // Adjusted for visible components
  const completedSections = [
    formData.hydrationLevel !== 50,
    formData.medicationAdherence,
    formData.eyeJaundiceLevel > 0,
    formData.sleepHours !== 7,
    formData.painLevel > 0,
    formData.notes.length > 0,
  ].filter(Boolean).length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="inner">

        {/* Header */}
        <div className="page-header fade-in">
          <div className="header-left">
            <h1 className="page-title">Daily Health Check-in</h1>
            <p className="page-description">
              Help us track your health and predict crises early. This ensures your care team provides the best support.
            </p>
          </div>
          <div className="progress-tracker">
            {Array.from({ length: totalSections }).map((_, i) => (
              <div key={i} className={`progress-step ${i < completedSections ? 'completed' : i === completedSections ? 'current' : 'pending'}`} />
            ))}
            <span className="progress-count">{completedSections}/{totalSections}</span>
          </div>
        </div>

        {/* Form / Success State */}
        {success ? (
          <div className="success-overlay fade-in">
            <div className="success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="success-title">Check-in Complete</h2>
            <p className="success-message">
              Your health data has been securely recorded. We will notify your care team if any concerns are detected.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkin-form">

            {/* Hydration Card */}
            <HydrationCard hydrationLevel={formData.hydrationLevel} onHydrationUpdate={handleHydrationUpdate} />

            <EyeJaundiceCard
              onJaundiceUpdate={handleJaundiceUpdate}
            />



            {/* Medication */}
            <SectionCard icon={<Icons.Pill />} iconClass="green" title="Medication Adherence" sub="Track your sickle cell medications today" animClass="fade-in-1">
              <div className="med-list">
                {medications.map(m => (
                  <div key={m.id} className={`med-item ${m.taken ? 'completed' : ''}`} onClick={() => toggleMedication(m.id)}>
                    <div className="med-checkbox">
                      {m.taken && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <div className="med-info">
                      <div className="med-name">{m.name}</div>
                      <div className="med-time">{m.time}</div>
                      {m.status && <div className="med-status" style={{ color: '#16a34a' }}>{m.status}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>



            {/* Sleep */}
            <SectionCard icon={<Icons.Moon />} iconClass="purple" title="Sleep Duration" sub="Hours of sleep received last night" animClass="fade-in-3">
              <div className="number-input-group">
                <button type="button" className="number-stepper" onClick={() => updateField('sleepHours')(Math.max(0, formData.sleepHours - 0.5))}>−</button>
                <input type="number" min={0} max={24} step={0.5} value={formData.sleepHours} onChange={(e) => updateField('sleepHours')(parseFloat(e.target.value))} className="number-input" />
                <button type="button" className="number-stepper" onClick={() => updateField('sleepHours')(Math.min(24, formData.sleepHours + 0.5))}>+</button>
              </div>
              {formData.sleepHours < 6 && <span className="status-badge danger">Low sleep — Aim for 7-9 hours</span>}
              {formData.sleepHours >= 7 && formData.sleepHours <= 9 && <span className="status-badge good">Optimal sleep duration</span>}
            </SectionCard>

            {/* Pain */}
            <SectionCard icon={<Icons.Activity />} iconClass="red" title="Pain Level" sub="Assess your current physical discomfort (0 = no pain, 10 = extreme)" animClass="fade-in-4">
              <SliderField label="Pain Intensity" value={formData.painLevel} min={0} max={10} colorClass="pain" onChange={updateField('painLevel')} />
            </SectionCard>

            {/* Notes */}
            <SectionCard icon={<Icons.Notes />} iconClass="blue" title="Additional Notes" sub="Share any other symptoms or concerns with your care team" animClass="fade-in-5">
              <textarea className="textarea" placeholder="E.g., Feeling dizzy, unusual pain location, or specific questions..." value={formData.notes} onChange={(e) => updateField('notes')(e.target.value)} rows={4} />
            </SectionCard>

            {/* Actions */}
            <div className="button-group fade-in-5">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <><span className="spinner" /> Processing...</> : 'Complete Check-in'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
            </div>

          </form>
        )}
      </div>
    </>
  );
}