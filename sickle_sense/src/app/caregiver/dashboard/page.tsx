'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiskBadge } from '@/components';
import {
  mockPatients, mockHealthData, mockRiskAssessments,
  mockNotifications, initializeMockData
} from '@/lib/mockData';
import { Patient, HealthData, RiskAssessment, Notification } from '@/types';
import { formatDate } from '@/lib/utils';

/* ─── Design tokens ───────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&display=swap');
  
  :root {
    --g50:#f0fdf4; --g100:#dcfce7; --g200:#bbf7d0; --g500:#22c55e; --g600:#16a34a; --g700:#15803d;
    --rh-bg:#fff1f2; --rh-bd:#fecdd3; --rh-tx:#e11d48; --rh-dot:#f43f5e;
    --rm-bg:#fffbeb; --rm-bd:#fef3c7; --rm-tx:#d97706; --rm-dot:#fbbf24;
    --rl-bg:#f0fdf4; --rl-bd:#dcfce7; --rl-tx:#16a34a; --rl-dot:#22c55e;
    --bl50:#eff6ff; --bl100:#dbeafe; --bl500:#3b82f6; --bl600:#2563eb;
    --n0:#ffffff; --n50:#f9fafb; --n100:#f3f4f6; --n200:#e5e7eb;
    --n300:#d1d5db; --n400:#9ca3af; --n500:#6b7280; --n600:#4b5563; --n700:#374151; --n900:#111827;
    --sh-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --sh-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --sh-green: 0 10px 15px -3px rgba(22, 163, 74, 0.1), 0 4px 6px -2px rgba(22, 163, 74, 0.05);
    --r-md:12px; --r-lg:16px; --r-xl:24px;
  }

  .dashboard-inner {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Professional Banner */
  .banner {
    position: relative;
    padding: 40px;
    border-radius: var(--r-xl);
    background: #064e3b; /* Deep green */
    background-image: radial-gradient(circle at top right, #065f46, transparent),
                      radial-gradient(circle at bottom left, #059669, transparent);
    color: white;
    overflow: hidden;
    box-shadow: var(--sh-md);
  }
  .banner::before {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.4;
  }
  .banner-content { position: relative; z-index: 1; }
  .banner-greeting {
    font-family: 'Sora', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.03em; margin-bottom: 8px;
  }
  .banner-desc {
    font-size: 15px; opacity: 0.9;
    font-weight: 400; max-width: 500px;
    line-height: 1.6;
  }

  /* Stats Cards - Modernized */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }
  .stat-card {
    background: var(--n0);
    padding: 24px;
    border-radius: var(--r-lg);
    border: 1px solid var(--n200);
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.2s ease;
    box-shadow: var(--sh-sm);
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--sh-md); }
  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .stat-icon-box {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .stat-card.blue .stat-icon-box { background: var(--bl50); color: var(--bl600); }
  .stat-card.red .stat-icon-box { background: var(--rh-bg); color: var(--rh-tx); }
  .stat-card.amber .stat-icon-box { background: var(--rm-bg); color: var(--rm-tx); }
  .stat-card.green .stat-icon-box { background: var(--rl-bg); color: var(--rl-tx); }
  
  .stat-value {
    font-family: 'Sora', sans-serif;
    font-size: 32px; font-weight: 800;
    color: var(--n900); letter-spacing: -0.02em;
  }
  .stat-label {
    font-size: 14px; font-weight: 600;
    color: var(--n500);
  }

  /* Grid Layout */
  .main-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } }

  /* Patient Selector */
  .patients-card {
    background: var(--n0);
    border: 1px solid var(--n200);
    border-radius: var(--r-xl);
    overflow: hidden;
    box-shadow: var(--sh-md);
  }
  .card-header {
    padding: 20px;
    border-bottom: 1px solid var(--n100);
    display: flex; align-items: center; gap: 10px;
    font-family: 'Sora', sans-serif;
    font-weight: 700; color: var(--n900);
  }
  .patient-list {
    display: flex;
    flex-direction: column;
    padding: 8px;
  }
  .patient-item {
    padding: 16px;
    border-radius: var(--r-md);
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    display: flex; flex-direction: column; gap: 4px;
  }
  .patient-item:hover { background: var(--n50); }
  .patient-item.selected {
    background: var(--g50);
    border-color: var(--g200);
    box-shadow: inset 0 0 0 1px var(--g200);
  }
  .p-name { font-weight: 700; color: var(--n900); font-size: 15px; }
  .p-info { font-size: 12px; color: var(--n500); }

  /* Patient Detail */
  .detail-view { display: flex; flex-direction: column; gap: 24px; }
  .panel {
    background: var(--n0);
    border-radius: var(--r-xl);
    border: 1px solid var(--n200);
    padding: 24px;
    box-shadow: var(--sh-md);
  }

  /* Vitals */
  .vitals-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
  }
  .vital-item {
    padding: 20px 15px;
    border-radius: var(--r-lg);
    background: var(--n50);
    border: 1px solid var(--n200);
    text-align: center;
    display: flex; flex-direction: column; gap: 8px;
  }
  .v-val {
    font-family: 'Sora', sans-serif;
    font-size: 24px; font-weight: 800;
  }
  .v-label { font-size: 12px; color: var(--n500); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .hydration .v-val { color: var(--bl600); }
  .pain .v-val { color: var(--rh-tx); }
  .temperature .v-val { color: #f59e0b; }
  .sleep .v-val { color: #7c3aed; }

  /* Risks and Actions */
  .risk-section {
    display: flex; flex-direction: column; gap: 16px;
  }
  .risk-badge-large {
    padding: 12px 20px; border-radius: 12px;
    display: flex; align-items: center; justify-content: space-between;
    font-weight: 700; font-size: 16px;
  }
  .risk-list { display: flex; flex-direction: column; gap: 10px; }
  .risk-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 12px;
    font-size: 14px; font-weight: 500;
    background: #fff5f5; border: 1px solid #fed7d7; color: #c53030;
  }

  /* Notifications refined */
  .alerts-card {
    background: var(--n0);
    border: 1px solid var(--n200);
    border-radius: var(--r-xl);
    padding: 24px;
    box-shadow: var(--sh-md);
  }
  .alert-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
  .alert-item {
    display: flex; gap: 16px; padding: 16px;
    border-radius: var(--r-lg); border: 1px solid var(--n200);
    transition: all 0.2s; cursor: pointer;
  }
  .alert-item:hover { transform: scale(1.01); box-shadow: var(--sh-sm); }
  .alert-item.unread { background: var(--bl50); border-color: var(--bl100); }
  .alert-icon { font-size: 20px; margin-top: 2px; }
  .alert-body { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .alert-title { font-weight: 700; color: var(--n900); font-size: 14px; }
  .alert-msg { font-size: 13px; color: var(--n600); line-height: 1.5; }

  /* Animations */
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .au { animation: fadeInUp 0.5s ease both; }
  .au1 { animation-delay: 0.1s; }
  .au2 { animation-delay: 0.2s; }
  .au3 { animation-delay: 0.3s; }
  .au4 { animation-delay: 0.4s; }
`;

/* ─── Main component ───────────────────────────────────────── */
export default function CaregiverDashboard() {
  const router = useRouter();
  const [caregiver, setCaregiver] = useState<Patient | null>(null);
  const [linkedPatients, setLinkedPatients] = useState<Patient[]>([]);
  const [patientHealthData, setPatientHealthData] = useState<Map<string, HealthData | null>>(new Map());
  const [patientRiskData, setPatientRiskData] = useState<Map<string, RiskAssessment | null>>(new Map());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  useEffect(() => {
    if (mockPatients.size === 0) initializeMockData();
    const userStr = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    if (!userStr || !userId) { router.push('/auth'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'caregiver') { router.push('/auth'); return; }
    setCaregiver(user);

    const patients: Patient[] = [];
    user.linkedPatients?.forEach((pid: string) => {
      const p = mockPatients.get(pid);
      if (!p) return;
      patients.push(p);
      const hList = mockHealthData.get(pid) || [];
      if (hList.length) setPatientHealthData(prev => new Map(prev).set(pid, hList[hList.length - 1]));
      const rList = mockRiskAssessments.get(pid) || [];
      if (rList.length) setPatientRiskData(prev => new Map(prev).set(pid, rList[rList.length - 1]));
    });

    setLinkedPatients(patients);
    if (patients.length) setSelectedPatient(patients[0].id);
    const notifs = mockNotifications.get(userId) || [];
    setNotifications(notifs.slice(-5));
    setIsLoading(false);
  }, [router]);

  const highRiskPatients = linkedPatients.filter(p => {
    const r = patientRiskData.get(p.id);
    return r && (r.riskLevel === 'high' || r.predictedCrisisIn48h);
  });

  if (isLoading) return (
    <>
      <style>{STYLES}</style>
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-text">Loading dashboard…</p>
      </div>
    </>
  );
  if (!caregiver) return null;

  const sel = selectedPatient ? linkedPatients.find(p => p.id === selectedPatient) : null;
  const selH = selectedPatient ? patientHealthData.get(selectedPatient) : null;
  const selR = selectedPatient ? patientRiskData.get(selectedPatient) : null;
  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="dashboard-inner">

        {/* Banner Section */}
        <section className="banner au">
          <div className="banner-content">
            <h1 className="banner-greeting">Welcome back, {caregiver?.name?.split(' ')[0]} 🤝</h1>
            <p className="banner-desc">You are currently monitoring {linkedPatients.length} patient{linkedPatients.length !== 1 ? 's' : ''}. {highRiskPatients.length > 0 ? `Attention required for ${highRiskPatients.length} high-risk alert${highRiskPatients.length > 1 ? 's' : ''}.` : 'All patients are currently stable.'}</p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="stats-row au au1">
          <div className="stat-card blue">
            <div className="stat-header">
              <span className="stat-label">Total Patients</span>
              <div className="stat-icon-box">👥</div>
            </div>
            <div className="stat-value">{linkedPatients.length}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-header">
              <span className="stat-label">High Risk</span>
              <div className="stat-icon-box">⚠️</div>
            </div>
            <div className="stat-value">{highRiskPatients.length}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-header">
              <span className="stat-label">Unread Alerts</span>
              <div className="stat-icon-box">🔔</div>
            </div>
            <div className="stat-value">{unread}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-header">
              <span className="stat-label">Care Score</span>
              <div className="stat-icon-box">⭐</div>
            </div>
            <div className="stat-value">94%</div>
          </div>
        </section>

        {linkedPatients.length > 0 ? (
          <div className="main-grid au au2">

            {/* Left Column: Patient List */}
            <aside className="patients-card">
              <div className="card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Your Patients
              </div>
              <div className="patient-list">
                {linkedPatients.map(p => {
                  const r = patientRiskData.get(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`patient-item ${selectedPatient === p.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPatient(p.id)}
                    >
                      <div className="p-name">{p.name}</div>
                      <div className="p-info">{p.genotype} • {p.phone}</div>
                      {r && <div style={{ marginTop: 8 }}><RiskBadge level={r.riskLevel} /></div>}
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Column: Active Patient Details */}
            <main className="detail-view">
              {sel && (
                <>
                  <section className="panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div>
                        <h2 style={{ fontFamily: 'Sora', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{sel.name}</h2>
                        <p style={{ color: '#6b7280', fontSize: 14 }}>Last record: {selH ? formatDate(selH.date) : 'N/A'}</p>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ padding: '10px 18px', borderRadius: 12, border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 14 }}
                        onClick={() => router.push('/caregiver/appointments')}
                      >
                        Book Consultation
                      </button>
                    </div>

                    <div className="vitals-row">
                      <div className="vital-item hydration">
                        <span className="v-label">Hydration</span>
                        <div className="v-val">{selH?.hydrationLevel || 0}%</div>
                      </div>
                      <div className="vital-item pain">
                        <span className="v-label">Pain Level</span>
                        <div className="v-val">{selH?.painLevel || 0}/10</div>
                      </div>
                      <div className="vital-item temperature">
                        <span className="v-label">Temp</span>
                        <div className="v-val">{selH?.temperature || 36.5}°C</div>
                      </div>
                      <div className="vital-item sleep">
                        <span className="v-label">Sleep</span>
                        <div className="v-val">{selH?.sleepHours || 0}h</div>
                      </div>
                    </div>
                  </section>

                  <section className="panel risk-section">
                    <h3 className="card-header" style={{ padding: 0, border: 'none', marginBottom: 16 }}>Health Risk & Factors</h3>
                    {selR && (
                      <>
                        <div className={`risk-badge-large ${selR.riskLevel}`} style={{
                          backgroundColor: selR.riskLevel === 'high' ? '#fff1f2' : selR.riskLevel === 'medium' ? '#fffbeb' : '#f0fdf4',
                          color: selR.riskLevel === 'high' ? '#e11d48' : selR.riskLevel === 'medium' ? '#d97706' : '#16a34a',
                          border: `1px solid ${selR.riskLevel === 'high' ? '#fecdd3' : selR.riskLevel === 'medium' ? '#fef3c7' : '#dcfce7'}`
                        }}>
                          <span>Current Status: {selR.riskLevel.toUpperCase()}</span>
                          <span>Score: {selR.riskScore}%</span>
                        </div>

                        {selR.predictedCrisisIn48h && (
                          <div className="risk-item">
                            <span style={{ fontSize: 18 }}>�</span>
                            <span>High probability of crisis within the next 48 hours.</span>
                          </div>
                        )}

                        <div className="risk-list">
                          {selR.triggerFactors?.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#4b5563' }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#d1d5db' }} />
                              {f}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                </>
              )}
            </main>
          </div>
        ) : (
          <section className="panel au au2" style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🔗</div>
            <h2 style={{ fontFamily: 'Sora', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>No Patients Linked</h2>
            <p style={{ color: '#6b7280', maxWidth: 400, margin: '0 auto 32px' }}>You haven&apos;t linked any patients to your account yet. Share your caregiver ID with patients so they can link to you.</p>
            <button className="btn-primary" style={{ padding: '14px 28px', borderRadius: 14, border: 'none', fontWeight: 600, cursor: 'pointer' }}>Generate Link Code</button>
          </section>
        )}

        {/* Recent Alerts */}
        <section className="alerts-card au au3">
          <h3 className="card-header" style={{ padding: 0, border: 'none', marginBottom: 8 }}>Recent Alerts & Notifications</h3>
          <div className="alert-list">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`alert-item ${!n.read ? 'unread' : ''}`}
                onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
              >
                <div className="alert-icon">
                  {n.type === 'risk_alert' ? '⚠️' : n.type === 'medication_reminder' ? '💊' : '📅'}
                </div>
                <div className="alert-body">
                  <div className="alert-title">{n.title}</div>
                  <div className="alert-msg">{n.message}</div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', alignSelf: 'center' }} />}
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
