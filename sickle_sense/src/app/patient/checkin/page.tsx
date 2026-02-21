'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar } from '@/components';
import { HydrationCard } from '@/components/HydrationCard';
import { calculateRiskScore, getTriggerFactors } from '@/lib/utils';
import { mockHealthData, mockRiskAssessments, mockRelationships, mockNotifications } from '@/lib/mockData';
import { HealthData, RiskAssessment, Notification, Patient } from '@/types';

// Add these new interfaces
interface HydrationRecord {
  id: string;
  timestamp: Date;
  verified: boolean;
  ml_added: number;
  drink_type?: 'water' | 'juice' | 'other';
  video_url?: string;
}

interface HydrationStats {
  verified: boolean;
  ml_added: number;
  drinks_today: number;
  progress_percentage: number;
  message: string;
  daily_goal_ml: number;
  weekly_data: {
    date: string;
    ml: number;
    drinks: number;
  }[];
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    /* Primary Colors - Modern Sickle Sense Theme */
    --primary-50: #f0f9ff;
    --primary-100: #e0f2fe;
    --primary-200: #bae6fd;
    --primary-300: #7dd3fc;
    --primary-400: #38bdf8;
    --primary-500: #0ea5e9;
    --primary-600: #0284c7;
    --primary-700: #0369a1;
    --primary-800: #075985;
    --primary-900: #0c4a6e;
    
    /* Accent Colors - Warm & Approachable */
    --accent-50: #fff7ed;
    --accent-100: #ffedd5;
    --accent-200: #fed7aa;
    --accent-300: #fdba74;
    --accent-400: #fb923c;
    --accent-500: #f97316;
    --accent-600: #ea580c;
    --accent-700: #c2410c;
    
    /* Semantic Colors */
    --success-50: #f0fdf4;
    --success-100: #dcfce7;
    --success-200: #bbf7d0;
    --success-500: #22c55e;
    --success-600: #16a34a;
    --success-700: #15803d;
    
    --warning-50: #fefce8;
    --warning-100: #fef9c3;
    --warning-200: #fde047;
    --warning-500: #eab308;
    --warning-600: #ca8a04;
    
    --danger-50: #fef2f2;
    --danger-100: #fee2e2;
    --danger-200: #fecaca;
    --danger-500: #ef4444;
    --danger-600: #dc2626;
    --danger-700: #b91c1c;
    
    /* Neutrals */
    --white: #ffffff;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    
    /* Border Radius */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-2xl: 1.5rem;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--gray-50);
    color: var(--gray-900);
    line-height: 1.5;
  }

  /* Layout */
  .shell {
    display: flex;
    min-height: 100vh;
    background: var(--gray-50);
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: clamp(1rem, 3vw, 2rem);
  }

  .inner {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Header Section */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .header-left {
    flex: 1;
  }

  .page-title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--primary-700), var(--primary-900));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.25rem;
  }

  .page-description {
    color: var(--gray-500);
    font-size: 0.875rem;
    font-weight: 400;
    max-width: 500px;
  }

  /* Progress Tracker */
  .progress-tracker {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--white);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }

  .progress-step {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--gray-200);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-step.completed {
    background: var(--success-500);
    transform: scale(1.2);
  }

  .progress-step.current {
    background: var(--primary-500);
    box-shadow: 0 0 0 3px var(--primary-100);
  }

  .progress-step.pending {
    background: var(--gray-200);
  }

  .progress-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--gray-500);
    margin-left: 0.25rem;
  }

  /* Cards */
  .card {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-2xl);
    padding: clamp(1.25rem, 3vw, 1.75rem);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
  }

  .card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--gray-300);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .card-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: var(--gray-50);
    color: var(--gray-700);
    transition: all 0.2s ease;
  }

  .card:hover .card-icon {
    transform: scale(1.05);
  }

  .card-icon.blue { background: var(--primary-50); color: var(--primary-600); }
  .card-icon.green { background: var(--success-50); color: var(--success-600); }
  .card-icon.red { background: var(--danger-50); color: var(--danger-600); }
  .card-icon.orange { background: var(--accent-50); color: var(--accent-600); }
  .card-icon.yellow { background: var(--warning-50); color: var(--warning-600); }
  .card-icon.purple { background: #faf5ff; color: #9333ea; }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: 0.25rem;
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: var(--gray-500);
    font-weight: 400;
  }

  /* Hydration Specific Styles */
  .hydration-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1.5rem 0;
    padding: 1rem;
    background: var(--primary-50);
    border-radius: var(--radius-xl);
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-700);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .progress-bar-large {
    width: 100%;
    height: 1rem;
    background: var(--gray-200);
    border-radius: 1rem;
    overflow: hidden;
    margin: 1rem 0;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-400), var(--primary-600));
    border-radius: 1rem;
    transition: width 0.3s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.5rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2));
    border-radius: 1rem;
  }

  .goal-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--gray-500);
  }

  /* Chart Styles */
  .chart-container {
    margin: 1.5rem 0;
    padding: 1rem;
    background: var(--gray-50);
    border-radius: var(--radius-xl);
  }

  .chart-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .chart-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.5rem;
    height: 120px;
  }

  .bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .bar {
    width: 100%;
    background: linear-gradient(180deg, var(--primary-300), var(--primary-500));
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    transition: height 0.3s ease;
    min-height: 4px;
    position: relative;
    cursor: pointer;
  }

  .bar:hover {
    background: linear-gradient(180deg, var(--primary-400), var(--primary-600));
  }

  .bar-label {
    font-size: 0.7rem;
    color: var(--gray-500);
    font-weight: 500;
  }

  .bar-value {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--primary-700);
    background: var(--primary-50);
    padding: 0.125rem 0.25rem;
    border-radius: var(--radius-sm);
  }

  /* Drink Log */
  .drink-log {
    margin-top: 1.5rem;
    border-top: 1px solid var(--gray-200);
    padding-top: 1.5rem;
  }

  .drink-log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .drink-log-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gray-700);
  }

  .view-all {
    font-size: 0.75rem;
    color: var(--primary-600);
    cursor: pointer;
    text-decoration: none;
  }

  .view-all:hover {
    text-decoration: underline;
  }

  .drink-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .drink-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
    transition: all 0.2s ease;
  }

  .drink-item:hover {
    border-color: var(--primary-300);
    transform: translateX(4px);
  }

  .drink-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .drink-icon {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .drink-details {
    display: flex;
    flex-direction: column;
  }

  .drink-time {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gray-700);
  }

  .drink-meta {
    font-size: 0.75rem;
    color: var(--gray-500);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--success-600);
    font-size: 0.7rem;
  }

  .drink-amount {
    font-weight: 600;
    color: var(--primary-600);
    font-size: 0.875rem;
  }

  /* Video Upload Section */
  .video-section {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-50), var(--white));
    border-radius: var(--radius-xl);
    border: 2px dashed var(--primary-200);
  }

  .video-preview {
    width: 100%;
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: 1rem;
    background: var(--gray-900);
    aspect-ratio: 16/9;
  }

  .video-preview video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-options {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .upload-btn {
    flex: 1;
    padding: 0.875rem;
    border: 1px solid var(--primary-200);
    border-radius: var(--radius-lg);
    background: var(--white);
    color: var(--primary-700);
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .upload-btn:hover {
    background: var(--primary-50);
    border-color: var(--primary-400);
  }

  .upload-btn.primary {
    background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
    color: white;
    border: none;
  }

  .upload-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .verification-result {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: var(--radius-lg);
    animation: slideIn 0.3s ease;
  }

  .verification-result.success {
    background: var(--success-50);
    border: 1px solid var(--success-200);
    color: var(--success-700);
  }

  .verification-result.error {
    background: var(--danger-50);
    border: 1px solid var(--danger-200);
    color: var(--danger-700);
  }

  /* Drink Type Selector */
  .drink-type-selector {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }

  .drink-type-btn {
    flex: 1;
    min-width: 80px;
    padding: 0.75rem;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    background: var(--white);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .drink-type-btn:hover {
    border-color: var(--primary-300);
    background: var(--primary-50);
  }

  .drink-type-btn.selected {
    border-color: var(--primary-500);
    background: var(--primary-50);
    box-shadow: var(--shadow-sm);
  }

  .drink-type-icon {
    font-size: 1.25rem;
  }

  .drink-type-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--gray-700);
  }

  /* Loading Spinner */
  .spinner {
    display: inline-block;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Success Overlay */
  .success-overlay {
    background: linear-gradient(135deg, var(--success-50), var(--white));
    border: 1px solid var(--success-200);
    border-radius: var(--radius-2xl);
    padding: clamp(2rem, 6vw, 3rem);
    text-align: center;
    animation: fadeIn 0.5s ease;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 1s ease infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .success-title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    color: var(--success-700);
    margin-bottom: 0.5rem;
  }

  .success-message {
    color: var(--gray-600);
    font-size: 1rem;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.4s ease forwards;
  }

  .fade-in-1 { animation: fadeIn 0.4s ease 0.05s forwards; opacity: 0; }
  .fade-in-2 { animation: fadeIn 0.4s ease 0.1s forwards; opacity: 0; }
  .fade-in-3 { animation: fadeIn 0.4s ease 0.15s forwards; opacity: 0; }
  .fade-in-4 { animation: fadeIn 0.4s ease 0.2s forwards; opacity: 0; }
  .fade-in-5 { animation: fadeIn 0.4s ease 0.25s forwards; opacity: 0; }
  .fade-in-6 { animation: fadeIn 0.4s ease 0.3s forwards; opacity: 0; }
  .fade-in-7 { animation: fadeIn 0.4s ease 0.35s forwards; opacity: 0; }
  .fade-in-8 { animation: fadeIn 0.4s ease 0.4s forwards; opacity: 0; }

  /* Responsive */
  @media (max-width: 640px) {
    .page-header {
      flex-direction: column;
      align-items: stretch;
    }

    .progress-tracker {
      width: 100%;
      justify-content: center;
    }

    .radio-group {
      grid-template-columns: 1fr;
    }

    .button-group {
      flex-direction: column;
    }

    .btn-secondary {
      text-align: center;
    }

    .hydration-stats {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .upload-options {
      flex-direction: column;
    }
  }

  /* Glass Effect for Special Cards */
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

// Add HydrationCard component
interface HydrationCardProps {
  hydrationLevel: number;
  onHydrationUpdate: (stats: HydrationStats) => void;
}


interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  colorClass: string;
  hint?: string;
  onChange: (value: number) => void;
}

function SliderField({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = '', 
  colorClass, 
  onChange 
}: SliderFieldProps) {
  const progress = ((value - min) / (max - min)) * 100;
  
  const getStatusHint = () => {
    if (colorClass === 'hydration') {
      if (value < 30) return { type: 'danger', text: '⚠️ Critical - Drink water now' };
      if (value < 60) return { type: 'warning', text: '⚠️ Below optimal' };
      return { type: 'good', text: '✓ Well hydrated' };
    }
    if (colorClass === 'pain') {
      if (value > 7) return { type: 'danger', text: '🔴 Severe - Contact doctor' };
      if (value > 3) return { type: 'warning', text: '🟡 Moderate discomfort' };
      return { type: 'good', text: '🟢 Minimal pain' };
    }
    if (colorClass === 'fatigue') {
      if (value > 7) return { type: 'danger', text: '🔴 Extreme fatigue - Rest' };
      if (value > 3) return { type: 'warning', text: '🟡 Somewhat tired' };
      return { type: 'good', text: '🟢 Energized' };
    }
    if (colorClass === 'jaundice') {
      if (value > 5) return { type: 'danger', text: '🔴 Elevated - Monitor closely' };
      if (value > 2) return { type: 'warning', text: '🟡 Mild yellowing' };
      return { type: 'good', text: '🟢 Normal' };
    }
    return null;
  };

  const status = getStatusHint();

  return (
    <div className="slider-container">
      <div className="slider-header">
        <div>
          <span className="field-label">{label}</span>
          {status && (
            <span className={`status-badge ${status.type}`}>
              {status.text}
            </span>
          )}
        </div>
        <span className={`slider-value ${colorClass}`}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider"
        style={{ '--progress': `${progress}%` } as React.CSSProperties}
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--gray-400)'
      }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

interface SectionCardProps {
  icon: string;
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
        <div className={`card-icon ${iconClass}`}>
          {icon}
        </div>
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
    
    if (!userStr || !uid) {
      router.push('/auth');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'patient') {
        router.push('/auth');
        return;
      }
      setPatient(user);
      setUserId(uid);
    } catch (error) {
      router.push('/auth');
    }
  }, [router]);

  const updateField = (key: string) => (value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleHydrationUpdate = (stats: HydrationStats) => {
    setHydrationStats(stats);
    // Update the hydration level based on actual intake
    const newHydrationLevel = Math.min(100, Math.round((stats.drinks_today * 250 / 2000) * 100));
    setFormData(prev => ({ ...prev, hydrationLevel: newHydrationLevel }));
  };

  const getRecommendations = (level: string, triggers: string[]): string[] => {
    const recommendations: string[] = [];
    
    if (level === 'high') {
      recommendations.push('🚨 Seek immediate medical attention if symptoms worsen');
      recommendations.push('📞 Contact your caregiver right away');
    }
    
    if (triggers.some(t => t.toLowerCase().includes('hydrat'))) {
      recommendations.push('💧 Drink at least 1L of water in the next 2 hours');
      recommendations.push('⏰ Set reminders every 30 minutes to hydrate');
    }
    
    if (triggers.some(t => t.toLowerCase().includes('pain'))) {
      recommendations.push('💊 Take prescribed pain medication as needed');
      recommendations.push('🛌 Rest and avoid strenuous activities');
    }
    
    if (triggers.some(t => t.toLowerCase().includes('sleep'))) {
      recommendations.push('😴 Aim for 8+ hours of sleep tonight');
      recommendations.push('📵 Avoid screens 1 hour before bed');
    }
    
    if (triggers.some(t => t.toLowerCase().includes('temperatur'))) {
      recommendations.push('🌡️ Monitor your temperature every 4 hours');
      recommendations.push('🧊 Use cool compress if fever persists');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Continue your current health routine');
      recommendations.push('💪 Stay hydrated and maintain medication schedule');
    }
    
    return recommendations;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create health data entry
    const newHealth: HealthData = {
      id: `health_${Date.now()}`,
      patientId: userId,
      date: new Date(),
      ...formData,
      hydrationStatus: formData.hydrationLevel < 30 ? 'low' : 
                       formData.hydrationLevel < 60 ? 'normal' : 'optimal',
    };

    // Store in mock data
    if (!mockHealthData.has(userId)) {
      mockHealthData.set(userId, []);
    }
    mockHealthData.get(userId)!.push(newHealth);

    // Calculate risk
    const { score, level } = calculateRiskScore(formData);
    const triggers = getTriggerFactors(formData);

    // Create risk assessment
    const newRisk: RiskAssessment = {
      id: `risk_${Date.now()}`,
      patientId: userId,
      date: new Date(),
      riskScore: score,
      riskLevel: level,
      predictedCrisisIn48h: score > 70,
      triggerFactors: triggers,
      recommendations: getRecommendations(level, triggers),
    };

    if (!mockRiskAssessments.has(userId)) {
      mockRiskAssessments.set(userId, []);
    }
    mockRiskAssessments.get(userId)!.push(newRisk);

    // Create notifications for high risk
    if (level === 'high' || score > 70) {
      const caregiverIds = mockRelationships.get(userId) || [];
      
      caregiverIds.forEach(caregiverId => {
        if (!mockNotifications.has(caregiverId)) {
          mockNotifications.set(caregiverId, []);
        }
        
        const notification: Notification = {
          id: `notif_${Date.now()}_${caregiverId}`,
          caregiverId,
          patientId: userId,
          type: 'risk_alert',
          title: `⚠️ High Risk Alert: ${patient?.name}`,
          message: `${patient?.name} has a ${level} risk score (${score}/100). ${triggers[0] || 'Please check in.'}`,
          severity: 'high',
          read: false,
          createdAt: new Date(),
        };
        
        mockNotifications.get(caregiverId)!.push(notification);
      });
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      // Redirect after showing success
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 2000);
    }, 1500);
  };

  // Calculate progress
  const totalSections = 9;
  const completedSections = [
    formData.hydrationLevel !== 50,
    formData.painLevel > 0,
    formData.fatigueLevel > 0,
    formData.sleepHours !== 7,
    formData.temperature !== 37,
    true, // medication always counts
    formData.eyeJaundiceLevel > 0,
    formData.activityLevel !== 'moderate',
    formData.notes.length > 0,
  ].filter(Boolean).length;

  return (
    <>
      <style>{STYLES}</style>
            <div className="inner">
              
              {/* Header with progress */}
              <div className="page-header fade-in">
                <div className="header-left">
                  <h1 className="page-title">
                    Daily Health Check-in
                  </h1>
                  <p className="page-description">
                    Help us track your health and predict crises early. 
                    This helps your care team provide better support.
                  </p>
                </div>
                <div className="progress-tracker">
                  {Array.from({ length: totalSections }).map((_, i) => (
                    <div
                      key={i}
                      className={`progress-step ${
                        i < completedSections ? 'completed' : 
                        i === completedSections ? 'current' : 'pending'
                      }`}
                    />
                  ))}
                  <span className="progress-count">
                    {completedSections}/{totalSections}
                  </span>
                </div>
              </div>

              {/* Success State */}
              {success ? (
                <div className="success-overlay fade-in">
                  <div className="success-icon">✨</div>
                  <h2 className="success-title">Check-in Complete!</h2>
                  <p className="success-message">
                    Your health data has been recorded and analyzed. 
                    We'll notify your care team if any concerns arise.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  
                  {/* Enhanced Hydration Card */}
                  <HydrationCard 
                    hydrationLevel={formData.hydrationLevel}
                    onHydrationUpdate={handleHydrationUpdate}
                  />

                  {/* Pain */}
                  <SectionCard
                    icon="🩺"
                    iconClass="red"
                    title="Pain Level"
                    sub="Rate your current pain (0 = no pain, 10 = worst pain)"
                    animClass="fade-in-2"
                  >
                    <SliderField
                      label="Pain Level"
                      value={formData.painLevel}
                      min={0}
                      max={10}
                      unit="/10"
                      colorClass="pain"
                      onChange={updateField('painLevel')}
                    />
                  </SectionCard>

                  {/* Fatigue */}
                  <SectionCard
                    icon="😴"
                    iconClass="orange"
                    title="Fatigue Level"
                    sub="How tired do you feel right now?"
                    animClass="fade-in-2"
                  >
                    <SliderField
                      label="Fatigue Level"
                      value={formData.fatigueLevel}
                      min={0}
                      max={10}
                      unit="/10"
                      colorClass="fatigue"
                      onChange={updateField('fatigueLevel')}
                    />
                  </SectionCard>

                  {/* Sleep */}
                  <SectionCard
                    icon="🌙"
                    iconClass="purple"
                    title="Sleep Duration"
                    sub="Hours of sleep last night"
                    animClass="fade-in-3"
                  >
                    <div className="number-input-group">
                      <button
                        type="button"
                        className="number-stepper"
                        onClick={() => updateField('sleepHours')(Math.max(0, formData.sleepHours - 0.5))}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={formData.sleepHours}
                        onChange={(e) => updateField('sleepHours')(parseFloat(e.target.value))}
                        className="number-input"
                      />
                      <button
                        type="button"
                        className="number-stepper"
                        onClick={() => updateField('sleepHours')(Math.min(24, formData.sleepHours + 0.5))}
                      >
                        +
                      </button>
                    </div>
                    {formData.sleepHours < 6 && (
                      <span className="status-badge danger">
                        ⚠️ Low sleep - aim for 7-9 hours
                      </span>
                    )}
                    {formData.sleepHours >= 7 && formData.sleepHours <= 9 && (
                      <span className="status-badge good">
                        ✓ Optimal sleep duration
                      </span>
                    )}
                  </SectionCard>

                  {/* Temperature */}
                  <SectionCard
                    icon="🌡️"
                    iconClass="yellow"
                    title="Body Temperature"
                    sub="Current temperature in °C"
                    animClass="fade-in-4"
                  >
                    <div className="number-input-group">
                      <button
                        type="button"
                        className="number-stepper"
                        onClick={() => updateField('temperature')(
                          Math.max(35, +(formData.temperature - 0.1).toFixed(1))
                        )}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={35}
                        max={42}
                        step={0.1}
                        value={formData.temperature}
                        onChange={(e) => updateField('temperature')(parseFloat(e.target.value))}
                        className="number-input"
                      />
                      <button
                        type="button"
                        className="number-stepper"
                        onClick={() => updateField('temperature')(
                          Math.min(42, +(formData.temperature + 0.1).toFixed(1))
                        )}
                      >
                        +
                      </button>
                    </div>
                    {formData.temperature > 38 && (
                      <span className="status-badge danger">
                        ⚠️ Elevated - Contact your care team
                      </span>
                    )}
                  </SectionCard>

                  {/* Medication */}
                  <SectionCard
                    icon="💊"
                    iconClass="green"
                    title="Medication Adherence"
                    sub="Did you take your medications today?"
                    animClass="fade-in-5"
                  >
                    <label className={`checkbox-toggle ${formData.medicationAdherence ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.medicationAdherence}
                        onChange={(e) => updateField('medicationAdherence')(e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      <div className="checkbox-box" onClick={() => updateField('medicationAdherence')(!formData.medicationAdherence)}>
                        {formData.medicationAdherence && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="checkbox-label" onClick={() => updateField('medicationAdherence')(!formData.medicationAdherence)}>
                        {formData.medicationAdherence 
                          ? '✓ Yes, I took all medications' 
                          : '⚠️ No, I missed my medications'}
                      </span>
                    </label>
                  </SectionCard>

                  {/* Jaundice */}
                  <SectionCard
                    icon="👁️"
                    iconClass="yellow"
                    title="Eye Jaundice"
                    sub="Rate any yellowing of eyes (0 = none, 10 = severe)"
                    animClass="fade-in-6"
                  >
                    <SliderField
                      label="Jaundice Level"
                      value={formData.eyeJaundiceLevel}
                      min={0}
                      max={10}
                      unit="/10"
                      colorClass="jaundice"
                      onChange={updateField('eyeJaundiceLevel')}
                    />
                  </SectionCard>

                  {/* Activity */}
                  <SectionCard
                    icon="🏃"
                    iconClass="green"
                    title="Activity Level"
                    sub="How active have you been today?"
                    animClass="fade-in-7"
                  >
                    <div className="radio-group">
                      {[
                        { value: 'low', icon: '🛋️', label: 'Low' },
                        { value: 'moderate', icon: '🚶', label: 'Moderate' },
                        { value: 'high', icon: '🏋️', label: 'High' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`radio-option ${formData.activityLevel === option.value ? 'selected' : ''}`}
                          onClick={() => updateField('activityLevel')(option.value)}
                        >
                          <span className="radio-icon">{option.icon}</span>
                          <span className="radio-label">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  {/* Notes */}
                  <SectionCard
                    icon="📝"
                    iconClass="purple"
                    title="Additional Notes"
                    sub="Share any other symptoms or concerns"
                    animClass="fade-in-8"
                  >
                    <textarea
                      className="textarea"
                      placeholder="E.g., Feeling dizzy, unusual pain location, questions for your doctor..."
                      value={formData.notes}
                      onChange={(e) => updateField('notes')(e.target.value)}
                      rows={4}
                    />
                  </SectionCard>

                  {/* Action Buttons */}
                  <div className="button-group fade-in-8">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner" />
                          Submitting...
                        </>
                      ) : (
                        '✓ Complete Check-in'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
     
    </>
  );
}