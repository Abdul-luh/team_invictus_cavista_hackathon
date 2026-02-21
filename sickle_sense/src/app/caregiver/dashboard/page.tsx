'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar, RiskBadge } from '@/components';
import {
  mockPatients, mockHealthData, mockRiskAssessments,
  mockNotifications, initializeMockData
} from '@/lib/mockData';
import { Patient, HealthData, RiskAssessment, Notification } from '@/types';
import { formatDate } from '@/lib/utils';

/* ─── Design tokens ───────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --g50:#f0fdf4;--g100:#dcfce7;--g200:#bbf7d0;--g500:#22c55e;--g600:#16a34a;--g700:#15803d;
    --rh-bg:#fef2f2;--rh-bd:#fecaca;--rh-tx:#dc2626;--rh-dot:#ef4444;
    --rm-bg:#fffbeb;--rm-bd:#fde68a;--rm-tx:#d97706;--rm-dot:#f59e0b;
    --rl-bg:#f0fdf4;--rl-bd:#bbf7d0;--rl-tx:#15803d;--rl-dot:#22c55e;
    --bl50:#eff6ff;--bl100:#dbeafe;--bl500:#3b82f6;--bl600:#2563eb;
    --n0:#fff;--n50:#f9fafb;--n100:#f3f4f6;--n200:#e5e7eb;
    --n300:#d1d5db;--n400:#9ca3af;--n500:#6b7280;--n600:#4b5563;--n700:#374151;--n900:#111827;
    --sh-sm:0 1px 4px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);
    --sh-green:0 4px 16px rgba(22,163,74,.18);
    --r-md:12px;--r-lg:16px;--r-xl:20px;
  }
  body{font-family:'DM Sans',sans-serif;background:var(--n50);color:var(--n900);}

  .shell{display:flex;min-height:100svh;}
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .content{flex:1;overflow-y:auto;padding:clamp(16px,3vw,28px);}
  .inner{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:clamp(14px,2vw,20px);}

  /* Banner */
  .banner{
    background:linear-gradient(135deg,var(--g600) 0%,#0d5c2c 100%);
    border-radius:var(--r-xl);
    padding:clamp(18px,3vw,26px) clamp(20px,4vw,32px);
    color:white;position:relative;overflow:hidden;
    box-shadow:var(--sh-green);
  }
  .banner::before{
    content:'';position:absolute;top:-50px;right:-30px;
    width:220px;height:220px;background:rgba(255,255,255,.05);border-radius:50%;
  }
  .banner::after{
    content:'';position:absolute;bottom:-70px;right:100px;
    width:180px;height:180px;background:rgba(255,255,255,.04);border-radius:50%;
  }
  .banner-body{position:relative;z-index:1;}
  .banner-title{
    font-family:'Sora',sans-serif;
    font-size:clamp(17px,2.2vw,22px);font-weight:800;
    letter-spacing:-.5px;margin-bottom:5px;
  }
  .banner-sub{font-size:13px;opacity:.8;font-weight:300;max-width:480px;}

  /* Stats */
  .stats-grid{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:12px;
  }
  @media(max-width:700px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:380px){.stats-grid{grid-template-columns:1fr 1fr;}}

  .stat{
    background:var(--n0);
    border:1px solid var(--n200);
    border-radius:var(--r-lg);
    padding:16px;
    box-shadow:0 1px 2px rgba(0,0,0,.04);
    position:relative;overflow:hidden;
  }
  .stat::after{
    content:'';position:absolute;top:0;left:0;right:0;height:3px;
    border-radius:var(--r-lg) var(--r-lg) 0 0;
  }
  .stat.blue::after{background:var(--bl500);}
  .stat.red::after{background:var(--rh-dot);}
  .stat.amber::after{background:var(--rm-dot);}
  .stat.green::after{background:var(--g500);}
  .stat-ico{position:absolute;right:12px;top:14px;font-size:18px;opacity:.12;}
  .stat-val{
    font-family:'Sora',sans-serif;
    font-size:clamp(22px,2.8vw,30px);font-weight:800;line-height:1;
    margin-bottom:4px;
  }
  .stat.blue .stat-val{color:var(--bl600);}
  .stat.red  .stat-val{color:var(--rh-tx);}
  .stat.amber .stat-val{color:var(--rm-tx);}
  .stat.green .stat-val{color:var(--g600);}
  .stat-lbl{font-size:12px;font-weight:500;color:var(--n500);}

  /* Main grid */
  .patients-grid{
    display:grid;
    grid-template-columns:260px 1fr;
    gap:16px;
    align-items:start;
  }
  @media(max-width:900px){.patients-grid{grid-template-columns:1fr;}}

  /* Patient list */
  .card{
    background:var(--n0);border:1px solid var(--n200);
    border-radius:var(--r-xl);padding:clamp(16px,2vw,20px);
    box-shadow:var(--sh-sm);
  }
  .card-title{
    font-family:'Sora',sans-serif;
    font-size:14px;font-weight:700;color:var(--n900);
    letter-spacing:-.3px;margin-bottom:12px;
    display:flex;align-items:center;gap:7px;
  }
  .patient-btn{
    width:100%;text-align:left;
    padding:10px 12px;border-radius:var(--r-md);
    border:1.5px solid transparent;
    background:var(--n50);
    cursor:pointer;
    transition:all .2s;
    margin-bottom:6px;
  }
  .patient-btn:last-child{margin-bottom:0;}
  .patient-btn:hover{background:var(--n100);border-color:var(--n200);}
  .patient-btn.active{background:var(--g50);border-color:var(--g200);}
  .pb-name{font-family:'Sora',sans-serif;font-size:13px;font-weight:600;color:var(--n900);margin-bottom:4px;}
  .pb-meta{font-size:11px;color:var(--n400);margin-bottom:6px;}

  /* Risk badge */
  .risk{
    display:inline-flex;align-items:center;gap:5px;
    padding:3px 9px;border-radius:100px;
    font-size:11px;font-weight:600;border:1px solid;
    white-space:nowrap;
  }
  .risk.high{background:var(--rh-bg);border-color:var(--rh-bd);color:var(--rh-tx);}
  .risk.medium{background:var(--rm-bg);border-color:var(--rm-bd);color:var(--rm-tx);}
  .risk.low{background:var(--rl-bg);border-color:var(--rl-bd);color:var(--rl-tx);}
  .risk-dot{width:5px;height:5px;border-radius:50%;}
  .risk.high .risk-dot{background:var(--rh-dot);}
  .risk.medium .risk-dot{background:var(--rm-dot);}
  .risk.low .risk-dot{background:var(--rl-dot);}

  /* Detail pane */
  .detail-stack{display:flex;flex-direction:column;gap:14px;}

  /* Patient header card */
  .pat-header{
    display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
    flex-wrap:wrap;
  }
  .pat-name{
    font-family:'Sora',sans-serif;
    font-size:clamp(17px,2vw,22px);font-weight:800;
    color:var(--n900);letter-spacing:-.5px;margin-bottom:4px;
  }
  .pat-geno{font-size:13px;color:var(--n500);font-weight:300;}
  .pat-geno strong{color:var(--g700);font-weight:600;}

  .info-grid{
    display:grid;grid-template-columns:1fr 1fr;gap:12px;
    margin-top:16px;padding-top:16px;
    border-top:1px solid var(--n100);
  }
  @media(max-width:480px){.info-grid{grid-template-columns:1fr;}}
  .info-item-lbl{font-size:11px;font-weight:500;color:var(--n400);text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;}
  .info-item-val{font-size:14px;font-weight:500;color:var(--n800);}

  /* Vitals grid */
  .vitals-grid{
    display:grid;grid-template-columns:repeat(4,1fr);gap:10px;
  }
  @media(max-width:600px){.vitals-grid{grid-template-columns:repeat(2,1fr);}}

  .vital{
    text-align:center;
    padding:14px 8px;
    border-radius:var(--r-lg);
    border:1px solid var(--n200);
    background:var(--n50);
  }
  .vital-val{
    font-family:'Sora',sans-serif;
    font-size:clamp(18px,2.2vw,24px);font-weight:800;
    line-height:1;margin-bottom:4px;
  }
  .vital.hydration .vital-val{color:var(--bl600);}
  .vital.pain      .vital-val{color:var(--rh-tx);}
  .vital.temp      .vital-val{color:#ea580c;}
  .vital.sleep     .vital-val{color:#7c3aed;}
  .vital-lbl{font-size:11px;color:var(--n400);font-weight:500;}
  .vital-sub{font-size:10px;color:var(--n300);margin-top:1px;}

  /* Risk factors */
  .factor-list{display:flex;flex-direction:column;gap:6px;}
  .factor-item{
    display:flex;align-items:flex-start;gap:8px;
    padding:8px 10px;border-radius:var(--r-md);
    background:var(--rh-bg);
    font-size:13px;color:var(--rh-tx);
    border:1px solid var(--rh-bd);
  }

  /* Alert strip */
  .alert{
    border-radius:var(--r-lg);padding:11px 14px;
    display:flex;align-items:flex-start;gap:9px;
    font-size:13px;border:1px solid;
  }
  .alert.error{background:var(--rh-bg);border-color:var(--rh-bd);color:var(--rh-tx);}
  .alert.warning{background:var(--rm-bg);border-color:var(--rm-bd);color:var(--rm-tx);}
  .alert.success{background:var(--g50);border-color:var(--g200);color:var(--g700);}
  .alert-ico{flex-shrink:0;margin-top:1px;}
  .alert-title{font-weight:700;margin-bottom:2px;}

  /* Notifications */
  .notif{
    display:flex;align-items:flex-start;gap:11px;
    padding:12px;border-radius:var(--r-lg);
    border:1px solid var(--n200);background:var(--n0);
    cursor:pointer;transition:all .2s;
    margin-bottom:8px;
  }
  .notif:last-child{margin-bottom:0;}
  .notif:hover{border-color:var(--n300);background:var(--n50);}
  .notif.unread{border-left:3px solid var(--bl500);background:var(--bl50);}
  .notif-icon{
    width:36px;height:36px;border-radius:10px;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;flex-shrink:0;
  }
  .notif-icon.high  {background:var(--rh-bg);}
  .notif-icon.medium{background:var(--rm-bg);}
  .notif-icon.low   {background:var(--bl50);}
  .notif-title{font-size:13px;font-weight:600;color:var(--n900);margin-bottom:2px;}
  .notif-msg{font-size:12px;color:var(--n500);font-weight:300;line-height:1.4;}
  .notif-unread-dot{
    width:8px;height:8px;border-radius:50%;
    background:var(--bl500);margin-top:3px;flex-shrink:0;
  }

  /* Buttons */
  .btn{
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    padding:9px 16px;border-radius:var(--r-md);
    font-family:'DM Sans',sans-serif;
    font-size:13px;font-weight:500;cursor:pointer;border:none;
    transition:all .2s;white-space:nowrap;text-decoration:none;
  }
  .btn-primary{
    background:linear-gradient(135deg,var(--g600),#15803d);
    color:white;box-shadow:var(--sh-green);
  }
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(22,163,74,.3);}
  .btn-full{width:100%;}
  .btn-sm{padding:7px 13px;font-size:12px;}

  /* Empty */
  .empty{
    text-align:center;padding:clamp(32px,5vw,56px) 20px;
    color:var(--n400);
  }
  .empty-icon{font-size:36px;margin-bottom:12px;opacity:.5;}
  .empty-title{font-family:'Sora',sans-serif;font-size:15px;font-weight:600;color:var(--n600);margin-bottom:4px;}
  .empty-sub{font-size:13px;font-weight:300;}

  /* Loading */
  .loading-screen{
    min-height:100svh;display:flex;
    align-items:center;justify-content:center;
    background:var(--n50);
    flex-direction:column;gap:14px;
  }
  .spinner{
    width:40px;height:40px;
    border:3px solid var(--g100);border-top-color:var(--g600);
    border-radius:50%;animation:spin .7s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-text{font-size:14px;color:var(--n500);font-weight:300;}

  /* Animations */
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .au  {animation:fadeUp .4s ease both;}
  .au1 {animation:fadeUp .4s ease .05s both;}
  .au2 {animation:fadeUp .4s ease .1s both;}
  .au3 {animation:fadeUp .4s ease .15s both;}
  .au4 {animation:fadeUp .4s ease .2s both;}
  .au5 {animation:fadeUp .4s ease .25s both;}
`;

/* ─── Main component ───────────────────────────────────────── */
export default function CaregiverDashboard() {
  const router = useRouter();
  const [caregiver, setCaregiver] = useState<any>(null);
  const [linkedPatients, setLinkedPatients] = useState<Patient[]>([]);
  const [patientHealthData, setPatientHealthData] = useState<Map<string, HealthData | null>>(new Map());
  const [patientRiskData, setPatientRiskData] = useState<Map<string, RiskAssessment | null>>(new Map());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  useEffect(() => {
    if (mockPatients.size === 0) initializeMockData();
    const userStr = localStorage.getItem('user');
    const userId  = localStorage.getItem('userId');
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

  const sel    = selectedPatient ? linkedPatients.find(p => p.id === selectedPatient) : null;
  const selH   = selectedPatient ? patientHealthData.get(selectedPatient) : null;
  const selR   = selectedPatient ? patientRiskData.get(selectedPatient) : null;
  const lowRiskCount = linkedPatients.filter(p => patientRiskData.get(p.id)?.riskLevel === 'low').length;
  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="shell">
        <Sidebar userRole="caregiver" />
        <div className="main">
          <Header title="Dashboard" userRole="caregiver" />
          <div className="content">
            <div className="inner">

              {/* Welcome banner */}
              <div className="banner au">
                <div className="banner-body">
                  <div className="banner-title">Welcome back, {caregiver.name} 🤝</div>
                  <div className="banner-sub">Monitor your loved ones' health and respond to real-time alerts.</div>
                </div>
              </div>

              {/* High risk alert */}
              {highRiskPatients.length > 0 && (
                <div className="alert error au1">
                  <span className="alert-ico">⚠️</span>
                  <div>
                    <div className="alert-title">{highRiskPatients.length} Patient{highRiskPatients.length > 1 ? 's' : ''} at High Risk</div>
                    {highRiskPatients.map(p => p.name).join(', ')} {highRiskPatients.length === 1 ? 'is' : 'are'} showing high-risk indicators. Take immediate action.
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="stats-grid au2">
                <div className="stat blue">
                  <span className="stat-ico">👥</span>
                  <div className="stat-val">{linkedPatients.length}</div>
                  <div className="stat-lbl">Patients Linked</div>
                </div>
                <div className="stat red">
                  <span className="stat-ico">⚠️</span>
                  <div className="stat-val">{highRiskPatients.length}</div>
                  <div className="stat-lbl">High Risk</div>
                </div>
                <div className="stat amber">
                  <span className="stat-ico">🔔</span>
                  <div className="stat-val">{unread}</div>
                  <div className="stat-lbl">Unread Alerts</div>
                </div>
                <div className="stat green">
                  <span className="stat-ico">✅</span>
                  <div className="stat-val">{lowRiskCount}</div>
                  <div className="stat-lbl">Low Risk</div>
                </div>
              </div>

              {linkedPatients.length > 0 ? (
                <div className="patients-grid au3">
                  {/* Patient list */}
                  <div className="card" style={{position:'sticky',top:0}}>
                    <div className="card-title">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Your Patients
                    </div>
                    {linkedPatients.map(patient => {
                      const risk = patientRiskData.get(patient.id);
                      return (
                        <button
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient.id)}
                          className={`patient-btn ${selectedPatient === patient.id ? 'active' : ''}`}
                        >
                          <div className="pb-name">{patient.name}</div>
                          <div className="pb-meta">{patient.genotype} · {patient.phone}</div>
                          {risk && (
                            <span className={`risk ${risk.riskLevel}`}>
                              <span className="risk-dot" />
                              {risk.riskLevel.charAt(0).toUpperCase() + risk.riskLevel.slice(1)} Risk
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detail pane */}
                  {sel && (
                    <div className="detail-stack">
                      {/* Patient header */}
                      <div className="card">
                        <div className="pat-header">
                          <div>
                            <div className="pat-name">{sel.name}</div>
                            <div className="pat-geno">Genotype: <strong>{sel.genotype}</strong></div>
                          </div>
                          {selR && (
                            <span className={`risk ${selR.riskLevel}`} style={{fontSize:'13px',padding:'5px 12px'}}>
                              <span className="risk-dot" />
                              {selR.riskLevel.charAt(0).toUpperCase() + selR.riskLevel.slice(1)} Risk
                              {selR.riskScore != null ? ` · ${selR.riskScore}%` : ''}
                            </span>
                          )}
                        </div>
                        <div className="info-grid">
                          {[
                            ['Email', sel.email],
                            ['Phone', sel.phone],
                            ['Relationship', caregiver.relationship || 'Caregiver'],
                            ['Last Update', selH ? formatDate(selH.date) : 'N/A'],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <div className="info-item-lbl">{label}</div>
                              <div className="info-item-val">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vitals */}
                      {selH && (
                        <div className="card">
                          <div className="card-title">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                            Current Vitals
                          </div>
                          <div className="vitals-grid">
                            <div className="vital hydration">
                              <div className="vital-val">{selH.hydrationLevel}%</div>
                              <div className="vital-lbl">Hydration</div>
                              <div className="vital-sub">Daily target</div>
                            </div>
                            <div className="vital pain">
                              <div className="vital-val">{selH.painLevel}<span style={{fontSize:'14px',fontWeight:400}}>/10</span></div>
                              <div className="vital-lbl">Pain Level</div>
                              <div className="vital-sub">Self-reported</div>
                            </div>
                            <div className="vital temp">
                              <div className="vital-val">{selH.temperature}°</div>
                              <div className="vital-lbl">Temperature</div>
                              <div className="vital-sub">Celsius</div>
                            </div>
                            <div className="vital sleep">
                              <div className="vital-val">{selH.sleepHours}<span style={{fontSize:'14px',fontWeight:400}}>h</span></div>
                              <div className="vital-lbl">Sleep</div>
                              <div className="vital-sub">Last night</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Risk assessment */}
                      {selR && (
                        <div className="card">
                          <div className="card-title">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            Risk Assessment
                          </div>

                          {selR.predictedCrisisIn48h && (
                            <div className="alert warning" style={{marginBottom:14}}>
                              <span className="alert-ico">🕐</span>
                              <div>
                                <div className="alert-title">Crisis predicted within 48 hours</div>
                                Monitor closely and consider booking an appointment.
                              </div>
                            </div>
                          )}

                          {selR.triggerFactors?.length > 0 && (
                            <div className="factor-list" style={{marginBottom:16}}>
                              {selR.triggerFactors.map((f: string, i: number) => (
                                <div className="factor-item" key={i}>
                                  <span style={{marginTop:1}}>•</span>
                                  {f}
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            className="btn btn-primary btn-full"
                            onClick={() => router.push('/caregiver/appointments')}
                          >
                            📅 Book Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card au3">
                  <div className="empty">
                    <div className="empty-icon">🔗</div>
                    <div className="empty-title">No patients linked yet</div>
                    <div className="empty-sub" style={{marginBottom:16}}>Link a patient to start monitoring their health.</div>
                    <button className="btn btn-primary" onClick={() => router.push('/auth/register?role=caregiver')}>
                      Link a Patient
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="card au4">
                  <div className="card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    Recent Alerts
                    {unread > 0 && (
                      <span style={{
                        marginLeft:'auto',background:'#ef4444',color:'white',
                        fontSize:11,fontWeight:700,padding:'2px 7px',
                        borderRadius:100
                      }}>{unread}</span>
                    )}
                  </div>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`notif ${!n.read ? 'unread' : ''}`}
                      onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    >
                      <div className={`notif-icon ${n.severity}`}>
                        {n.type === 'risk_alert' ? '⚠️' : n.type === 'medication_reminder' ? '💊' : n.type === 'appointment' ? '📅' : 'ℹ️'}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-msg">{n.message}</div>
                      </div>
                      {!n.read && <div className="notif-unread-dot" />}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}