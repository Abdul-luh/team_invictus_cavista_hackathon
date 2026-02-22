'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockHealthData, mockRiskAssessments, mockPatients, initializeMockData } from '@/lib/mockData';
import { Patient, HealthData, RiskAssessment, ClinicalReport } from '@/types';
import { formatDate } from '@/lib/utils';

/* ─── Daily tasks definition (drives notification badges) ─── */
// In your tasks file or a separate constants file
import {
  Droplets,
  Pill,
  Activity,
  Moon,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const DAILY_TASKS = [
  {
    id: 'water',
    label: 'Water Intake',
    icon: Droplets,
    desc: 'Log your water intake',
    route: '/patient/tasks/water',
    color: '#3b82f6' // blue
  },
  {
    id: 'medication',
    label: 'Medication',
    icon: Pill,
    desc: 'Confirm you took your meds',
    route: '/patient/tasks/medication',
    color: '#8b5cf6' // purple
  },
  {
    id: 'pain',
    label: 'Pain Check',
    icon: Activity,
    desc: 'Rate your pain & fatigue',
    route: '/patient/tasks/pain',
    color: '#ef4444' // red
  },
  {
    id: 'sleep',
    label: 'Sleep Quality',
    icon: Moon,
    desc: 'Log last night\'s sleep',
    route: '/patient/tasks/sleep',
    color: '#f59e0b' // amber
  },
  {
    id: 'jaundice',
    label: 'Eye Check',
    icon: Eye,
    desc: 'Check eye yellowing (jaundice)',
    route: '/patient/tasks/jaundice',
    color: '#10b981' // green
  },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --g50:#f0fdf4;--g100:#dcfce7;--g200:#bbf7d0;--g500:#22c55e;--g600:#16a34a;--g700:#15803d;
    --rh-bg:#fef2f2;--rh-bd:#fecaca;--rh-tx:#dc2626;--rh-dot:#ef4444;
    --rm-bg:#fffbeb;--rm-bd:#fde68a;--rm-tx:#d97706;--rm-dot:#f59e0b;
    --bl50:#eff6ff;--bl100:#dbeafe;--bl500:#3b82f6;--bl600:#2563eb;
    --pu50:#faf5ff;--pu200:#e9d5ff;--pu600:#9333ea;
    --n0:#fff;--n50:#f9fafb;--n100:#f3f4f6;--n200:#e5e7eb;
    --n300:#d1d5db;--n400:#9ca3af;--n500:#6b7280;--n600:#4b5563;--n700:#374151;--n900:#111827;
    --sh-sm:0 1px 4px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);
    --sh-green:0 4px 16px rgba(22,163,74,.2);
    --r-md:12px;--r-lg:16px;--r-xl:20px;
  }
  body{font-family:'DM Sans',sans-serif;background:var(--n50);}

  .shell{display:flex;min-height:100svh;}
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .content{flex:1;overflow-y:auto;padding:clamp(14px,3vw,28px);}
  .inner{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:clamp(14px,2vw,20px);}

  /* Banner */
  .banner{
    background:linear-gradient(135deg,var(--g600) 0%,#0d5c2c 100%);
    border-radius:var(--r-xl);
    padding:clamp(18px,3vw,28px) clamp(20px,4vw,32px);
    color:white;position:relative;overflow:hidden;
    box-shadow:var(--sh-green);
    display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;
  }
  .banner::before{content:'';position:absolute;top:-50px;right:-30px;width:220px;height:220px;background:rgba(255,255,255,.05);border-radius:50%;}
  .banner::after{content:'';position:absolute;bottom:-70px;right:100px;width:180px;height:180px;background:rgba(255,255,255,.04);border-radius:50%;}
  .banner-body{position:relative;z-index:1;}
  .banner-title{font-family:'Sora',sans-serif;font-size:clamp(17px,2.2vw,24px);font-weight:800;letter-spacing:-.5px;margin-bottom:5px;}
  .banner-sub{font-size:13px;opacity:.8;font-weight:300;}
  .banner-code{
    position:relative;z-index:1;
    background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.25);
    border-radius:var(--r-lg);
    padding:10px 16px;text-align:center;
    backdrop-filter:blur(8px);
    flex-shrink:0;
  }
  .banner-code-lbl{font-size:10px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;opacity:.7;margin-bottom:3px;}
  .banner-code-val{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;letter-spacing:.18em;}

  /* Stats */
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
  @media(max-width:680px){.stats-grid{grid-template-columns:repeat(2,1fr);}}

  .stat{
    background:var(--n0);border:1px solid var(--n200);
    border-radius:var(--r-lg);padding:16px;
    box-shadow:0 1px 2px rgba(0,0,0,.04);
    position:relative;overflow:hidden;
  }
  .stat::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:var(--r-lg) var(--r-lg) 0 0;}
  .stat.green::after{background:var(--g500);}
  .stat.amber::after{background:var(--rm-dot);}
  .stat.blue::after{background:var(--bl500);}
  .stat.orange::after{background:#f97316;}
  .stat-ico{position:absolute;right:12px;top:14px;font-size:18px;opacity:.12;}
  .stat-val{font-family:'Sora',sans-serif;font-size:clamp(20px,2.8vw,28px);font-weight:800;line-height:1;margin-bottom:4px;}
  .stat.green .stat-val{color:var(--g600);}
  .stat.amber .stat-val{color:var(--rm-tx);}
  .stat.blue  .stat-val{color:var(--bl600);}
  .stat.orange .stat-val{color:#ea580c;}
  .stat-lbl{font-size:12px;font-weight:500;color:var(--n500);}
  .stat-sub{font-size:11px;color:var(--n300);margin-top:2px;}

  /* Card */
  .card{background:var(--n0);border:1px solid var(--n200);border-radius:var(--r-xl);padding:clamp(16px,2.5vw,24px);box-shadow:var(--sh-sm);}
  .card-title{font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:var(--n900);letter-spacing:-.3px;margin-bottom:16px;display:flex;align-items:center;gap:7px;}

  /* Daily tasks */
  .tasks-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  @media(max-width:700px){.tasks-grid{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:440px){.tasks-grid{grid-template-columns:1fr 1fr;}}

  .task-btn{
    display:flex;flex-direction:column;align-items:flex-start;
    padding:14px;border-radius:var(--r-lg);
    border:1.5px solid var(--n200);
    background:var(--n0);
    cursor:pointer;
    transition:all .2s cubic-bezier(.34,1.56,.64,1);
    text-align:left;position:relative;overflow:hidden;
  }
  .task-btn:hover{border-color:var(--g500);transform:translateY(-2px);box-shadow:0 6px 20px rgba(22,163,74,.12);}
  .task-btn.done{border-color:var(--g200);background:var(--g50);}
  .task-btn.pending{border-color:var(--rm-bd);background:var(--rm-bg);}

  .task-done-tick{
    position:absolute;top:10px;right:10px;
    width:20px;height:20px;border-radius:50%;
    background:var(--g500);display:flex;align-items:center;justify-content:center;
  }
  .task-pending-dot{
    position:absolute;top:10px;right:10px;
    width:8px;height:8px;border-radius:50%;
    background:var(--rm-dot);
    animation:pulseDot 1.8s ease-in-out infinite;
  }
  @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}

  .task-icon{font-size:22px;margin-bottom:8px;}
  .task-label{font-family:'Sora',sans-serif;font-size:13px;font-weight:700;color:var(--n900);margin-bottom:2px;}
  .task-desc{font-size:11px;color:var(--n400);font-weight:300;line-height:1.4;}
  .task-btn.done .task-label{color:var(--g700);}
  .task-btn.pending .task-label{color:var(--rm-tx);}

  /* Risk assessment */
  .risk-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px;}
  .risk-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:100px;font-size:12px;font-weight:600;border:1px solid;white-space:nowrap;}
  .risk-badge.high{background:var(--rh-bg);border-color:var(--rh-bd);color:var(--rh-tx);}
  .risk-badge.medium{background:var(--rm-bg);border-color:var(--rm-bd);color:var(--rm-tx);}
  .risk-badge.low{background:var(--g50);border-color:var(--g200);color:var(--g700);}
  .risk-dot{width:6px;height:6px;border-radius:50%;}
  .risk-badge.high .risk-dot{background:var(--rh-dot);}
  .risk-badge.medium .risk-dot{background:var(--rm-dot);}
  .risk-badge.low .risk-dot{background:var(--g500);}

  .risk-bar-wrap{background:var(--n100);border-radius:100px;height:8px;overflow:hidden;margin-bottom:6px;}
  .risk-bar{height:8px;border-radius:100px;transition:width .6s ease;}
  .risk-bar.low{background:var(--g500);}
  .risk-bar.medium{background:var(--rm-dot);}
  .risk-bar.high{background:var(--rh-dot);}

  .factor-item{display:flex;align-items:flex-start;gap:7px;padding:8px 10px;border-radius:var(--r-md);background:var(--rh-bg);border:1px solid var(--rh-bd);font-size:13px;color:var(--rh-tx);margin-bottom:6px;}
  .rec-item{display:flex;align-items:flex-start;gap:7px;padding:8px 10px;border-radius:var(--r-md);background:var(--g50);border:1px solid var(--g100);font-size:13px;color:var(--g700);margin-bottom:6px;}

  /* Alert */
  .alert{border-radius:var(--r-lg);padding:11px 14px;display:flex;align-items:flex-start;gap:9px;font-size:13px;border:1px solid;margin-bottom:14px;}
  .alert.warning{background:var(--rm-bg);border-color:var(--rm-bd);color:var(--rm-tx);}
  .alert-title{font-weight:700;margin-bottom:1px;}

  /* Health bars */
  .health-bar-wrap{background:var(--n100);border-radius:100px;height:6px;overflow:hidden;}
  .health-bar{height:6px;border-radius:100px;}

  /* Action buttons */
  .actions-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  @media(max-width:560px){.actions-grid{grid-template-columns:1fr;}}

  .action-btn{
    display:flex;align-items:center;gap:10px;
    padding:13px 16px;border-radius:var(--r-lg);
    cursor:pointer;border:none;font-family:'DM Sans',sans-serif;
    font-size:14px;font-weight:500;transition:all .2s;text-align:left;
  }
  .action-btn.primary{background:linear-gradient(135deg,var(--g600),#15803d);color:white;box-shadow:var(--sh-green);}
  .action-btn.primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(22,163,74,.35);}
  .action-btn.secondary{background:var(--n0);color:var(--n700);border:1.5px solid var(--n200);}
  .action-btn.secondary:hover{background:var(--n50);border-color:var(--n300);}
  .action-icon{font-size:18px;flex-shrink:0;}

  /* Medication badge */
  .med-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:600;}
  .med-badge.ok{background:var(--g50);color:var(--g700);border:1px solid var(--g200);}
  .med-badge.missed{background:var(--rh-bg);color:var(--rh-tx);border:1px solid var(--rh-bd);}

  /* Activity chip */
  .activity-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:600;background:var(--bl50);color:var(--bl600);border:1px solid var(--bl100);}

  /* Two-col health grid */
  .health-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  @media(max-width:520px){.health-grid{grid-template-columns:1fr;}}
  .health-row{display:flex;flex-direction:column;gap:10px;}
  .health-item-lbl{font-size:12px;color:var(--n400);font-weight:500;margin-bottom:4px;}
  .health-item-val{font-size:14px;font-weight:600;color:var(--n800);}
  .bar-row{display:flex;align-items:center;gap:8px;}
  .bar-wrap{flex:1;background:var(--n100);border-radius:100px;height:6px;overflow:hidden;}
  .bar{height:6px;border-radius:100px;}

  /* Loading */
  .loading-screen{min-height:100svh;display:flex;align-items:center;justify-content:center;background:var(--n50);flex-direction:column;gap:14px;}
  .spinner{width:40px;height:40px;border:3px solid var(--g100);border-top-color:var(--g600);border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-text{font-size:14px;color:var(--n500);font-weight:300;}

  /* Animations */
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .au {animation:fadeUp .4s ease both;}
  .au1{animation:fadeUp .4s ease .05s both;}
  .au2{animation:fadeUp .4s ease .10s both;}
  .au3{animation:fadeUp .4s ease .15s both;}
  .au4{animation:fadeUp .4s ease .20s both;}
  .au5{animation:fadeUp .4s ease .25s both;}

  /* Notification dot on task header */
  .notif-badge{
    display:inline-flex;align-items:center;justify-content:center;
    background:var(--rm-dot);color:white;
    font-size:10px;font-weight:700;
    width:18px;height:18px;border-radius:50%;
    margin-left:auto;
  }

  /* Medication Summary */
  .summary-card{
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid var(--n200);
    border-radius: var(--r-xl);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .summary-header{
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: var(--n900);
  }
  .summary-grid{
    display: flex;
    gap: 16px;
  }
  .day-summary{
    flex: 1;
    background: white;
    padding: 12px;
    border-radius: var(--r-md);
    border: 1px solid var(--n200);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .day-label{
    font-size: 11px;
    font-weight: 600;
    color: var(--n400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .day-status{
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
  }
  .day-status.ok { color: var(--g600); }
  .day-status.missed { color: var(--rh-tx); }
  .summary-text{
    font-size: 13px;
    line-height: 1.5;
    color: var(--n600);
    padding: 12px;
    background: white;
    border-radius: var(--r-md);
    border-left: 4px solid var(--g500);
  }
  .summary-text.warning { border-left-color: var(--rh-dot); }

  /* AI Report Section */
  .ai-report-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: var(--r-xl);
    padding: 24px;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3);
  }
  .ai-report-card::before {
    content: ''; position: absolute; top: -20%; right: -10%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
  }
  .ai-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 12px;
  }
  .ai-badge {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .ai-content {
    font-size: 14px; line-height: 1.6;
    color: rgba(255,255,255,0.8);
    margin-bottom: 24px;
    font-weight: 300;
  }
  .ai-metrics-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }
  .ai-metric-item {
    background: rgba(255,255,255,0.05);
    padding: 16px; border-radius: var(--r-lg);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .ai-metric-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
  .ai-metric-val {
    font-family: 'Sora', sans-serif;
    font-size: 24px; font-weight: 800;
    display: flex; align-items: center; gap: 8px;
  }
  .ai-metric-val.drop { color: #f87171; }
  .ai-metric-val.rise { color: #fbbf24; }
`;

export default function PatientDashboard() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [profileCode, setProfileCode] = useState<string>('SC-0000');
  const [currentHealth, setCurrentHealth] = useState<HealthData | null>(null);
  const [yesterdayHealth, setYesterdayHealth] = useState<HealthData | null>(null);
  const [currentRisk, setCurrentRisk] = useState<RiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [aiReport, setAiReport] = useState<ClinicalReport | null>(null);

  // Demo fallback data for visual consistency
  const DEMO_HEALTH_VALS = {
    hydrationLevel: 85,
    painLevel: 25,
    sleepHours: 8,
    sleepStart: '10:00 PM',
    sleepEnd: '06:00 AM',
    temperature: 36.8,
    fatigueLevel: 3,
    eyeJaundiceLevel: 2,
    medicationAdherence: true,
    activityLevel: 'moderate'
  };

  const fetchClinicalReport = async (uid: string) => {
    try {
      const token = localStorage.getItem('authToken'); // correct key
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://team-invictus-cavista-hackathon.onrender.com';

      const res = await fetch(`${baseUrl}/user/clinical-report/${uid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      console.log("response", res);

      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
      } else {
        console.warn('Clinical report endpoint returned', res.status, 'using fallback');
        // Fallback dummy report
        setAiReport({
          user_id: uid,
          detailed_report: "Based on your recent trends, your hydration levels have shown a slight decline, which may contribute to the increased fatigue reported yesterday. However, your jaundice levels remain stable. We recommend increasing your fluid intake by 500ml daily over the next 48 hours to maintain stability.",
          metrics: {
            water_percent_drop: 12.5,
            bilirubin_percent_rise: 4.2
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch clinical report, using fallback:', err);
      // Fallback dummy report
      setAiReport({
        user_id: uid,
        detailed_report: "Based on your recent trends, your hydration levels have shown a slight decline, which may contribute to the increased fatigue reported yesterday. However, your jaundice levels remain stable. We recommend increasing your fluid intake by 500ml daily over the next 48 hours to maintain stability.",
        metrics: {
          water_percent_drop: 12.5,
          bilirubin_percent_rise: 4.2
        }
      });
    }
  };

  useEffect(() => {
    if (mockPatients.size === 0) initializeMockData();


    const userStr = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    if (!userStr || !userId) { router.push('/auth'); return; }
    console.log("userId", userId);

    const userObj = JSON.parse(userStr);
    if (userObj.role !== 'patient') { router.push('/auth'); return; }

    // Set patient state only onceA
    setPatient(userObj);
    fetchClinicalReport(userId);

    // Get real unique code
    const realCode = userObj.unique_code || userObj.uniqueCode || userObj.patient_code || userObj.code || userObj.unique_id || 'SC-0000';
    setProfileCode(realCode);

    const hList = mockHealthData.get(userId) || [];
    let latestH = hList.length ? hList[hList.length - 1] : null;

    // Check if we have a more recent record from the just-completed check-in
    const storedLatest = localStorage.getItem('latestHealth');
    if (storedLatest) {
      const parsed = JSON.parse(storedLatest);
      latestH = parsed;
    }

    if (latestH) setCurrentHealth(latestH);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateStr = yesterday.toDateString();
    const yData = hList.find(h => new Date(h.date).toDateString() === yesterdayDateStr);
    if (yData) setYesterdayHealth(yData);

    const rList = mockRiskAssessments.get(userId) || [];
    if (rList.length) setCurrentRisk(rList[rList.length - 1]);

    // Load completed tasks for today
    const todayKey = `tasks_${userId}_${new Date().toDateString()}`;
    const saved = localStorage.getItem(todayKey);
    if (saved) setCompletedTasks(JSON.parse(saved));

    setIsLoading(false);
  }, [router]);

  const pendingCount = DAILY_TASKS.length - completedTasks.length;

  if (isLoading) return (
    <>
      <style>{STYLES}</style>
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-text">Loading your dashboard…</p>
      </div>
    </>
  );

  if (!patient) return null;

  const rc = currentRisk?.riskLevel ?? 'low';

  return (
    <>
      <style>{STYLES}</style>
      <div className="inner">

        {/* Banner */}
        <div className="banner au">
          <div className="banner-body">
            <div className="banner-title">Welcome back, {patient.name} 👋</div>
            <div className="banner-sub">Your health is our priority. Stay informed, stay healthy.</div>
          </div>
          <div className="banner-code">
            <div className="banner-code-lbl">Your Code</div>
            <div className="banner-code-val">{profileCode || patient.uniqueCode}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid au1">
          <div className="stat green">
            <span className="stat-ico">💧</span>
            <div className="stat-val">{currentHealth?.hydrationLevel ?? DEMO_HEALTH_VALS.hydrationLevel}%</div>
            <div className="stat-lbl">Hydration</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {[1, 2, 3].map((step) => {
                const level = currentHealth?.hydrationLevel ?? DEMO_HEALTH_VALS.hydrationLevel;
                const isActive = (step === 1 && level > 0) || (step === 2 && level > 33) || (step === 3 && level > 66);
                return (
                  <div key={step} style={{
                    height: '6px', flex: 1, borderRadius: '3px',
                    background: isActive ? 'var(--g500)' : 'var(--n200)',
                    transition: 'background 0.3s ease'
                  }} />
                );
              })}
            </div>
            <div className="stat-sub" style={{ marginTop: '4px' }}>
              {(currentHealth?.hydrationLevel ?? DEMO_HEALTH_VALS.hydrationLevel) <= 33 ? 'Low' : (currentHealth?.hydrationLevel ?? DEMO_HEALTH_VALS.hydrationLevel) <= 66 ? 'Moderate' : 'Optimal'}
            </div>
          </div>
          <div className="stat amber">
            <span className="stat-ico">🩺</span>
            <div className="stat-val">{currentHealth?.painLevel ?? DEMO_HEALTH_VALS.painLevel}%</div>
            <div className="stat-lbl">Pain Level</div>
            <div className="stat-sub">Self-reported (%)</div>
          </div>
          <div className="stat blue">
            <span className="stat-ico">😴</span>
            <div className="stat-val">{currentHealth?.sleepHours ?? DEMO_HEALTH_VALS.sleepHours}<span style={{ fontSize: 14, fontWeight: 400 }}>h</span></div>
            <div className="stat-lbl">Sleep</div>
            <div className="stat-sub">Last night</div>
          </div>
          <div className="stat orange">
            <span className="stat-ico">🌡️</span>
            <div className="stat-val">{currentHealth?.temperature ?? DEMO_HEALTH_VALS.temperature}°</div>
            <div className="stat-lbl">Temperature</div>
            <div className="stat-sub">Celsius</div>
          </div>
        </div>

        {/* Daily tasks */}
        <div className="card au2">
          <div className="card-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Today's Health Tasks
            {pendingCount > 0 && <span className="notif-badge">{pendingCount}</span>}
          </div>
          <div className="tasks-grid">
            {DAILY_TASKS.map(task => {
              const done = completedTasks.includes(task.id);
              const Icon = task.icon; // Lucide component

              return (
                <button
                  key={task.id}
                  className={`task-btn ${done ? 'done' : 'pending'}`}
                  onClick={() => router.push(`/patient/tasks/${task.id}`)}
                  style={{ '--task-color': task.color } as React.CSSProperties} // optional for CSS variables
                >
                  {/* Status indicator */}
                  {done ? (
                    <span className="task-done-tick">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="task-pending-dot" />
                  )}

                  {/* Lucide icon – you can wrap it in a span with styling */}
                  <span className="task-icon" style={{ color: task.color }}>
                    <Icon size={20} />
                  </span>

                  <div className="task-label">{task.label}</div>
                  <div className="task-desc">
                    {done ? 'Completed ✓' : task.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Risk Assessment */}
        {/* <div className="card au3">
                <div className="card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Crisis Risk Assessment
                </div>

                {currentRisk ? (
                  <>
                    <div className="risk-row">
                      <div>
                        <div style={{fontSize:12,color:'var(--n400)',marginBottom:4}}>Last updated: {formatDate(currentRisk.date)}</div>
                        <span className={`risk-badge ${rc}`}>
                          <span className="risk-dot" />
                          {rc.charAt(0).toUpperCase() + rc.slice(1)} Risk · {currentRisk.riskScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="risk-bar-wrap" style={{marginBottom:6}}>
                      <div className={`risk-bar ${rc}`} style={{width:`${currentRisk.riskScore}%`}} />
                    </div>

                    {currentRisk.predictedCrisisIn48h && (
                      <div className="alert warning">
                        <span>⚠️</span>
                        <div>
                          <div className="alert-title">Crisis predicted within 48 hours</div>
                          Take preventive measures immediately. Stay hydrated and rest.
                        </div>
                      </div>
                    )}

                    {currentRisk.triggerFactors?.length > 0 && (
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:12,fontWeight:600,color:'var(--n600)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Risk Factors</div>
                        {currentRisk.triggerFactors.map((f: string, i: number) => (
                          <div className="factor-item" key={i}><span>•</span>{f}</div>
                        ))}
                      </div>
                    )}

                    {currentRisk.recommendations?.length > 0 && (
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:'var(--n600)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Recommendations</div>
                        {currentRisk.recommendations.map((r: string, i: number) => (
                          <div className="rec-item" key={i}><span>✓</span>{r}</div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{textAlign:'center',padding:'24px 0',color:'var(--n400)'}}>
                    <div style={{fontSize:28,marginBottom:8}}>📋</div>
                    <div style={{fontSize:14,fontWeight:500}}>No risk data yet</div>
                    <div style={{fontSize:13,fontWeight:300}}>Complete your daily check-in to get an assessment.</div>
                  </div>
                )}
              </div> */}

        {/* AI Clinical Insights */}
        {aiReport && (
  <div className="ai-report-card au3">
    <div className="ai-header">
      <span style={{ fontSize: '20px' }}>🤖</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '15px' }}>AI Clinical Insights</span>
          <span className="ai-badge">Personalized</span>
        </div>
        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>Generated from your recent health logs</div>
      </div>
    </div>

    <div className="ai-content">
      {aiReport.detailed_report}
    </div>

    <div className="ai-metrics-grid">
      <div className="ai-metric-item">
        <div className="ai-metric-label">Hydration Change</div>
        <div className={`ai-metric-val ${aiReport.metrics.water_percent_drop > 0 ? 'drop' : ''}`}>
          {aiReport.metrics.water_percent_drop > 0 ? '↓' : '↑'} {Math.abs(aiReport.metrics.water_percent_drop)}%
        </div>
      </div>
      <div className="ai-metric-item">
        <div className="ai-metric-label">Jaundice Trend</div>
        <div className={`ai-metric-val ${aiReport.metrics.bilirubin_percent_rise > 0 ? 'rise' : ''}`}>
          {aiReport.metrics.bilirubin_percent_rise > 0 ? '↑' : '↓'} {Math.abs(aiReport.metrics.bilirubin_percent_rise)}%
        </div>
      </div>
    </div>

    {/* Book Consultation Button */}
    <button
      className="action-btn primary"
      onClick={() => router.push('/patient/appointments')}
      style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}
    >
      <span>📅</span> Book a Consultation
    </button>
  </div>
)}

        {/* Today's Health Detail */}
        <div className="card au4">
          <div className="card-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Today's Health Detail
          </div>
          <div className="health-grid">
            <div className="health-row">
              <div>
                <div className="health-item-lbl">Fatigue</div>
                <div className="bar-row">
                  <div className="bar-wrap"><div className="bar" style={{ width: `${(currentHealth?.fatigueLevel ?? DEMO_HEALTH_VALS.fatigueLevel) * 10}%`, background: '#f97316' }} /></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--n700)', minWidth: 28 }}>{currentHealth?.fatigueLevel ?? DEMO_HEALTH_VALS.fatigueLevel}/10</span>
                </div>
              </div>
              <div>
                <div className="health-item-lbl">Eye Jaundice</div>
                <div className="bar-row">
                  <div className="bar-wrap"><div className="bar" style={{ width: `${(currentHealth?.eyeJaundiceLevel ?? DEMO_HEALTH_VALS.eyeJaundiceLevel) * 10}%`, background: '#ca8a04' }} /></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--n700)', minWidth: 28 }}>{currentHealth?.eyeJaundiceLevel ?? DEMO_HEALTH_VALS.eyeJaundiceLevel}/10</span>
                </div>
              </div>
              <div>
                <div className="health-item-lbl">Activity Level</div>
                <span className="activity-chip">🏃 {currentHealth?.activityLevel ?? DEMO_HEALTH_VALS.activityLevel}</span>
              </div>
            </div>
            <div className="health-row">
              <div>
                <div className="health-item-lbl">Medication</div>
                <span className={`med-badge ${(currentHealth?.medicationAdherence ?? DEMO_HEALTH_VALS.medicationAdherence) ? 'ok' : 'missed'}`}>
                  {(currentHealth?.medicationAdherence ?? DEMO_HEALTH_VALS.medicationAdherence) ? '✓ On Track' : '✗ Missed'}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div className="health-item-lbl">Notes</div>
                <div style={{ fontSize: 13, color: 'var(--n600)', background: 'var(--n50)', padding: '8px 10px', borderRadius: 10, fontWeight: 300, lineHeight: 1.5 }}>
                  {currentHealth?.notes || "No symptoms reported today."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medication Summary Row */}
        <div className="summary-card au4">
          <div className="summary-header">
            <Pill size={16} color="var(--g600)" />
            Medication Progress
          </div>
          <div className="summary-grid">
            <div className="day-summary">
              <span className="day-label">Yesterday</span>
              <div className={`day-status ${(yesterdayHealth?.medicationAdherence ?? true) ? 'ok' : 'missed'}`}>
                {(yesterdayHealth?.medicationAdherence ?? true) ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {(yesterdayHealth?.medicationAdherence ?? true) ? 'Taken' : 'Missed'}
              </div>
            </div>
            <div className="day-summary">
              <span className="day-label">Today</span>
              <div className={`day-status ${(currentHealth?.medicationAdherence ?? DEMO_HEALTH_VALS.medicationAdherence) ? 'ok' : 'missed'}`}>
                {(currentHealth?.medicationAdherence ?? DEMO_HEALTH_VALS.medicationAdherence) ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {(currentHealth?.medicationAdherence ?? DEMO_HEALTH_VALS.medicationAdherence) ? 'Taken' : 'Pending'}
              </div>
            </div>
          </div>
          <div className={`summary-text ${(!(currentHealth?.medicationAdherence ?? DEMO_HEALTH_VALS.medicationAdherence) || !(yesterdayHealth?.medicationAdherence ?? true)) ? 'warning' : ''}`}>
            {(() => {
              const todayOk = currentHealth?.medicationAdherence ?? DEMO_HEALTH_VALS.medicationAdherence;
              const yesterdayOk = yesterdayHealth?.medicationAdherence ?? true;
              if (todayOk && yesterdayOk) return "Great job! You've stayed on track with your medication for the last two days. Consistency is key.";
              if (todayOk && !yesterdayOk) return "You're back on track today after missing yesterday's dose. Keep it up!";
              if (!todayOk && yesterdayOk) return "You haven't logged today's medication yet. It's important to stay consistent to prevent crises.";
              if (!todayOk && !yesterdayOk) return "You've missed two days in a row. Please take your medication as soon as possible.";
              return "Complete your daily check-in to see your progress.";
            })()}
          </div>
        </div>

        {/* Actions */}
        <div className="actions-grid au5">
          <button className="action-btn primary" onClick={() => router.push('/patient/sos')}>
            <span className="action-icon">🚨</span>
            <span>Emergency SOS</span>
          </button>
          <button className="action-btn secondary" onClick={() => router.push('/patient/contact')}>
            <span className="action-icon">📞</span>
            <span>Contact Caregiver</span>
          </button>
          <button className="action-btn secondary" onClick={() => router.push('/patient/trends')}>
            <span className="action-icon">📊</span>
            <span>View Health Trends</span>
          </button>
        </div>

      </div>
    </>
  );
}