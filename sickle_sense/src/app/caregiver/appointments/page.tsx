'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar } from '@/components';
import { mockPatients, mockAppointments } from '@/lib/mockData';
import { Patient, Appointment } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --g50:#f0fdf4;--g100:#dcfce7;--g200:#bbf7d0;--g500:#22c55e;--g600:#16a34a;--g700:#15803d;
    --rh-bg:#fef2f2;--rh-bd:#fecaca;--rh-tx:#dc2626;
    --bl50:#eff6ff;--bl100:#dbeafe;--bl600:#2563eb;
    --n0:#fff;--n50:#f9fafb;--n100:#f3f4f6;--n200:#e5e7eb;
    --n300:#d1d5db;--n400:#9ca3af;--n500:#6b7280;--n600:#4b5563;--n700:#374151;--n900:#111827;
    --sh-sm:0 1px 4px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);
    --sh-green:0 4px 16px rgba(22,163,74,.2);
    --r-md:12px;--r-lg:16px;--r-xl:20px;
  }
  body{font-family:'DM Sans',sans-serif;background:var(--n50);}

  .shell{display:flex;min-height:100svh;}
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .content{flex:1;overflow-y:auto;padding:clamp(16px,3vw,28px);}
  .inner{max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:clamp(14px,2vw,20px);}

  /* Page header row */
  .page-top{
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:12px;
    padding-bottom:4px;
  }
  .page-heading{
    font-family:'Sora',sans-serif;
    font-size:clamp(18px,2.5vw,22px);font-weight:800;
    color:var(--n900);letter-spacing:-.5px;
  }
  .page-sub{font-size:13px;color:var(--n400);font-weight:300;margin-top:2px;}

  /* Buttons */
  .btn{
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    padding:9px 18px;border-radius:var(--r-md);
    font-family:'DM Sans',sans-serif;
    font-size:13px;font-weight:500;cursor:pointer;border:none;
    transition:all .2s;white-space:nowrap;
  }
  .btn-primary{
    background:linear-gradient(135deg,var(--g600),#15803d);
    color:white;box-shadow:var(--sh-green);
  }
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(22,163,74,.35);}
  .btn-cancel{
    background:var(--n100);color:var(--n600);
    border:1.5px solid var(--n200);
  }
  .btn-cancel:hover{background:var(--n200);}
  .btn-full{width:100%;}

  /* Alert */
  .alert{
    border-radius:var(--r-lg);padding:11px 14px;
    display:flex;align-items:flex-start;gap:9px;
    font-size:13px;border:1px solid;
  }
  .alert.success{background:var(--g50);border-color:var(--g200);color:var(--g700);}
  .alert.error{background:var(--rh-bg);border-color:var(--rh-bd);color:var(--rh-tx);}
  .alert-title{font-weight:700;margin-bottom:1px;}

  /* Card */
  .card{
    background:var(--n0);border:1px solid var(--n200);
    border-radius:var(--r-xl);padding:clamp(16px,2.5vw,24px);
    box-shadow:var(--sh-sm);
  }
  .card-title{
    font-family:'Sora',sans-serif;
    font-size:14px;font-weight:700;color:var(--n900);
    letter-spacing:-.3px;margin-bottom:18px;
    display:flex;align-items:center;gap:7px;
  }

  /* Form */
  .form-grid{
    display:grid;grid-template-columns:1fr 1fr;gap:14px;
  }
  @media(max-width:560px){.form-grid{grid-template-columns:1fr;}}
  .col-full{grid-column:1/-1;}
  @media(max-width:560px){.col-full{grid-column:1;}}

  .field{display:flex;flex-direction:column;gap:4px;}
  .field-label{
    font-size:12px;font-weight:500;color:var(--n700);
    text-transform:uppercase;letter-spacing:.04em;
    display:flex;align-items:center;gap:3px;
  }
  .req{color:#ef4444;font-size:10px;}

  .ds-input,.ds-select,.ds-textarea{
    width:100%;padding:10px 13px;
    border:1.5px solid var(--n200);border-radius:var(--r-md);
    font-family:'DM Sans',sans-serif;font-size:14px;color:var(--n900);
    background:var(--n0);outline:none;
    transition:border-color .2s,box-shadow .2s;
    appearance:none;-webkit-appearance:none;
  }
  .ds-input::placeholder,.ds-textarea::placeholder{color:var(--n400);font-weight:300;}
  .ds-input:focus,.ds-select:focus,.ds-textarea:focus{
    border-color:var(--g600);
    box-shadow:0 0 0 3px rgba(22,163,74,.1);
  }
  .ds-input.err,.ds-select.err{border-color:#ef4444;background:#fef2f2;}
  .ds-textarea{resize:vertical;min-height:80px;}
  .sel-wrap{position:relative;}
  .sel-arrow{
    position:absolute;right:11px;top:50%;transform:translateY(-50%);
    pointer-events:none;color:var(--n400);
  }
  .ferr{font-size:12px;color:#ef4444;display:flex;align-items:center;gap:4px;}

  /* Section divider */
  .sec-div{
    display:flex;align-items:center;gap:10px;margin:8px 0;
  }
  .sec-line{flex:1;height:1px;background:var(--n100);}
  .sec-txt{
    font-size:11px;font-weight:600;letter-spacing:.07em;
    color:var(--n400);text-transform:uppercase;white-space:nowrap;
  }

  /* Appointment cards */
  .apt-list{display:flex;flex-direction:column;gap:10px;}

  .apt-card{
    display:flex;align-items:flex-start;gap:14px;
    padding:14px 16px;border-radius:var(--r-lg);
    border:1px solid var(--n200);background:var(--n0);
    transition:box-shadow .2s;
  }
  .apt-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.07);}
  .apt-card.upcoming{border-left:3px solid var(--g500);}
  .apt-card.past{border-left:3px solid var(--n300);opacity:.7;}

  .apt-date-block{
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-width:52px;padding:8px 6px;
    border-radius:var(--r-md);text-align:center;flex-shrink:0;
  }
  .apt-card.upcoming .apt-date-block{background:var(--g50);border:1px solid var(--g100);}
  .apt-card.past     .apt-date-block{background:var(--n50);border:1px solid var(--n200);}
  .apt-day{
    font-family:'Sora',sans-serif;font-size:20px;font-weight:800;line-height:1;
  }
  .apt-card.upcoming .apt-day{color:var(--g600);}
  .apt-card.past     .apt-day{color:var(--n400);}
  .apt-mon{font-size:10px;font-weight:600;letter-spacing:.05em;color:var(--n400);text-transform:uppercase;margin-top:1px;}

  .apt-body{flex:1;min-width:0;}
  .apt-patient{
    font-family:'Sora',sans-serif;font-size:14px;font-weight:700;
    color:var(--n900);margin-bottom:3px;
  }
  .apt-doctor{font-size:13px;color:var(--n600);margin-bottom:2px;}
  .apt-facility{font-size:12px;color:var(--n400);font-weight:300;margin-bottom:6px;}
  .apt-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;}
  .apt-tag{
    display:inline-flex;align-items:center;gap:4px;
    font-size:11px;color:var(--n500);
  }

  .apt-badge{
    display:inline-flex;align-items:center;
    padding:3px 9px;border-radius:100px;
    font-size:11px;font-weight:600;
  }
  .apt-badge.scheduled{background:var(--g50);color:var(--g700);border:1px solid var(--g200);}
  .apt-badge.past{background:var(--n100);color:var(--n500);border:1px solid var(--n200);}

  /* Empty */
  .empty{
    text-align:center;padding:clamp(32px,5vw,52px) 20px;color:var(--n400);
  }
  .empty-icon{font-size:36px;margin-bottom:12px;opacity:.45;}
  .empty-title{font-family:'Sora',sans-serif;font-size:15px;font-weight:600;color:var(--n600);margin-bottom:4px;}
  .empty-sub{font-size:13px;font-weight:300;}

  /* Animations */
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .au {animation:fadeUp .4s ease both;}
  .au1{animation:fadeUp .4s ease .05s both;}
  .au2{animation:fadeUp .4s ease .1s both;}
  .au3{animation:fadeUp .4s ease .15s both;}
  .au4{animation:fadeUp .4s ease .2s both;}

  /* Slide-down for form */
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  .slide-down{animation:slideDown .3s ease both;}
`;

type FormData = {
  doctorName:string; facility:string; date:string;
  time:string; reason:string; notes:string;
};

function FieldGroup({label,required,error,children}:{label:string;required?:boolean;error?:string;children:React.ReactNode}) {
  return (
    <div className="field">
      <label className="field-label">{label}{required && <span className="req">*</span>}</label>
      {children}
      {error && <span className="ferr"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4.5" stroke="#ef4444"/><path d="M5 3v2.5M5 6.5v.5" stroke="#ef4444" strokeWidth="1" strokeLinecap="round"/></svg>{error}</span>}
    </div>
  );
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [caregiver, setCaregiver] = useState<any>(null);
  const [linkedPatients, setLinkedPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [formData, setFormData] = useState<FormData>({ doctorName:'', facility:'', date:'', time:'', reason:'', notes:'' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userId  = localStorage.getItem('userId');
    if (!userStr || !userId) { router.push('/auth'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'caregiver') { router.push('/auth'); return; }
    setCaregiver(user);

    const patients: Patient[] = [];
    user.linkedPatients?.forEach((pid: string) => {
      const p = mockPatients.get(pid);
      if (p) patients.push(p);
    });
    setLinkedPatients(patients);
    if (patients.length) setSelectedPatient(patients[0].id);

    const all: Appointment[] = [];
    patients.forEach(p => all.push(...(mockAppointments.get(p.id) || [])));
    setAppointments(all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [router]);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!formData.doctorName.trim()) e.doctorName = 'Doctor name is required';
    if (!formData.facility.trim())   e.facility   = 'Facility is required';
    if (!formData.date)              e.date        = 'Date is required';
    else if (new Date(formData.date) < new Date()) e.date = 'Date must be in the future';
    if (!formData.time)              e.time        = 'Time is required';
    if (!formData.reason.trim())     e.reason      = 'Reason is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const apt: Appointment = {
      id:`apt_${Date.now()}`,
      patientId:selectedPatient,
      caregiverId:caregiver.id,
      doctorName:formData.doctorName,
      facility:formData.facility,
      date:new Date(formData.date),
      time:formData.time,
      reason:formData.reason,
      status:'scheduled',
      notes:formData.notes,
    };
    if (!mockAppointments.has(selectedPatient)) mockAppointments.set(selectedPatient, []);
    mockAppointments.get(selectedPatient)!.push(apt);
    setAppointments([apt, ...appointments]);
    setFormData({ doctorName:'', facility:'', date:'', time:'', reason:'', notes:'' });
    setShowForm(false);
    const name = linkedPatients.find(p => p.id === selectedPatient)?.name;
    setSuccessMessage(`Appointment booked for ${name}`);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const getPatientName = (pid: string) => linkedPatients.find(p => p.id === pid)?.name || 'Unknown';

  const upcoming = appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled');
  const past     = appointments.filter(a => new Date(a.date) < new Date()  || a.status === 'completed');

  const AptDate = ({ date }: { date: Date | string }) => {
    const d = new Date(date);
    return (
      <div className="apt-date-block">
        <div className="apt-day">{d.getDate()}</div>
        <div className="apt-mon">{d.toLocaleString('default',{month:'short'})}</div>
      </div>
    );
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="shell">
        <Sidebar userRole="caregiver" />
        <div className="main">
          <Header title="Appointments" userRole="caregiver" />
          <div className="content">
            <div className="inner">

              {/* Page top */}
              <div className="page-top au">
                <div>
                  <div className="page-heading">Appointments</div>
                  <div className="page-sub">{upcoming.length} upcoming · {past.length} past</div>
                </div>
                <button
                  className={`btn ${showForm ? 'btn-cancel' : 'btn-primary'}`}
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? (
                    <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> Cancel</>
                  ) : (
                    <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> Book Appointment</>
                  )}
                </button>
              </div>

              {/* Success alert */}
              {successMessage && (
                <div className="alert success au">
                  <span>✓</span>
                  <div><div className="alert-title">Booked!</div>{successMessage}</div>
                </div>
              )}

              {/* Booking form */}
              {showForm && (
                <div className="card slide-down">
                  <div className="card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    New Appointment
                  </div>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="sec-div"><div className="sec-line"/><span className="sec-txt">Patient & Doctor</span><div className="sec-line"/></div>

                    <div className="form-grid" style={{marginBottom:14}}>
                      <div className="field col-full">
                        <label className="field-label">Patient <span className="req">*</span></label>
                        <div className="sel-wrap">
                          <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="ds-select">
                            {linkedPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <span className="sel-arrow"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        </div>
                      </div>

                      <FieldGroup label="Doctor Name" required error={errors.doctorName}>
                        <input className={`ds-input ${errors.doctorName ? 'err' : ''}`} placeholder="Dr. Oluwaseun Adeyemi" value={formData.doctorName} onChange={set('doctorName')} />
                      </FieldGroup>

                      <FieldGroup label="Healthcare Facility" required error={errors.facility}>
                        <input className={`ds-input ${errors.facility ? 'err' : ''}`} placeholder="Lagos University Teaching Hospital" value={formData.facility} onChange={set('facility')} />
                      </FieldGroup>
                    </div>

                    <div className="sec-div"><div className="sec-line"/><span className="sec-txt">Date & Time</span><div className="sec-line"/></div>

                    <div className="form-grid" style={{marginBottom:14}}>
                      <FieldGroup label="Date" required error={errors.date}>
                        <input type="date" className={`ds-input ${errors.date ? 'err' : ''}`} value={formData.date} onChange={set('date')} />
                      </FieldGroup>

                      <FieldGroup label="Time" required error={errors.time}>
                        <input type="time" className={`ds-input ${errors.time ? 'err' : ''}`} value={formData.time} onChange={set('time')} />
                      </FieldGroup>
                    </div>

                    <div className="sec-div"><div className="sec-line"/><span className="sec-txt">Details</span><div className="sec-line"/></div>

                    <div className="form-grid" style={{marginBottom:20}}>
                      <FieldGroup label="Reason" required error={errors.reason}>
                        <input className={`ds-input ${errors.reason ? 'err' : ''}`} placeholder="e.g. Routine check-up, Follow-up" value={formData.reason} onChange={set('reason')} />
                      </FieldGroup>

                      <div className="field">
                        <label className="field-label">Additional Notes</label>
                        <textarea className="ds-textarea" placeholder="Any additional information…" value={formData.notes} onChange={set('notes')} />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Confirm Appointment
                    </button>
                  </form>
                </div>
              )}

              {/* Upcoming */}
              {upcoming.length > 0 && (
                <div className="card au2">
                  <div className="card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Upcoming
                    <span style={{marginLeft:'auto',background:' var(--g100)',color:'var(--g700)',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:100}}>{upcoming.length}</span>
                  </div>
                  <div className="apt-list">
                    {upcoming.map(apt => (
                      <div key={apt.id} className="apt-card upcoming">
                        <AptDate date={apt.date} />
                        <div className="apt-body">
                          <div className="apt-patient">{getPatientName(apt.patientId)}</div>
                          <div className="apt-doctor">{apt.doctorName}</div>
                          <div className="apt-facility">{apt.facility}</div>
                          <div className="apt-meta">
                            <span className="apt-tag">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {formatTime?.(apt.time) ?? apt.time}
                            </span>
                            <span className="apt-tag">· {apt.reason}</span>
                            <span className="apt-badge scheduled">Scheduled</span>
                          </div>
                          {apt.notes && <div style={{fontSize:12,color:'var(--n500)',marginTop:6,fontWeight:300}}>{apt.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {past.length > 0 && (
                <div className="card au3">
                  <div className="card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--n400)" strokeWidth="2.5">
                      <path d="M12 2a10 10 0 1 0 10 10"/><polyline points="12 6 12 12 16 14"/>
                      <polyline points="22 2 22 8 16 8"/>
                    </svg>
                    <span style={{color:'var(--n500)'}}>Past Appointments</span>
                    <span style={{marginLeft:'auto',background:'var(--n100)',color:'var(--n500)',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:100}}>{past.length}</span>
                  </div>
                  <div className="apt-list">
                    {past.map(apt => (
                      <div key={apt.id} className="apt-card past">
                        <AptDate date={apt.date} />
                        <div className="apt-body">
                          <div className="apt-patient">{getPatientName(apt.patientId)}</div>
                          <div className="apt-doctor">{apt.doctorName}</div>
                          <div className="apt-facility">{apt.facility}</div>
                          <div className="apt-meta">
                            <span className="apt-tag">{formatDate(apt.date)}</span>
                            <span className="apt-badge past">Completed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appointments.length === 0 && !showForm && (
                <div className="card au2">
                  <div className="empty">
                    <div className="empty-icon">📅</div>
                    <div className="empty-title">No appointments yet</div>
                    <div className="empty-sub">Book your first appointment using the button above.</div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}