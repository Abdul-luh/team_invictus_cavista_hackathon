'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar } from '@/components';
import { mockAppointments } from '@/lib/mockData';
import { Appointment } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import { Calendar, Clock, MapPin, User, ChevronRight, Plus } from 'lucide-react';


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
  .inner{max-width:800px;margin:0 auto;display:flex;flex-direction:column;gap:clamp(14px,2vw,20px);}

  /* Page header */
  .page-top{
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:12px;
  }
  .page-heading{
    font-family:'Sora',sans-serif;
    font-size:clamp(18px,2.5vw,22px);font-weight:800;
    color:var(--n900);letter-spacing:-.5px;
  }
  .page-sub{font-size:13px;color:var(--n400);font-weight:300;}

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

  /* Appointment cards */
  .apt-list{display:flex;flex-direction:column;gap:12px;}
  .apt-item{
    display:flex;align-items:stretch;gap:16px;
    padding:16px;border-radius:var(--r-lg);
    border:1px solid var(--n200);background:var(--n0);
    transition:all .2s ease;
    cursor:pointer;
  }
  .apt-item:hover{
    border-color:var(--g500);
    transform:translateY(-2px);
    box-shadow:0 8px 24px rgba(22,163,74,.08);
  }

  .apt-date{
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    width:60px;min-height:70px;background:var(--g50);
    border-radius:var(--r-md);text-align:center;
    border:1px solid var(--g100);
  }
  .apt-day{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:var(--g700);line-height:1;}
  .apt-mon{font-size:11px;font-weight:700;color:var(--g600);text-transform:uppercase;margin-top:2px;letter-spacing:0.04em;}

  .apt-main{flex:1;min-width:0;}
  .apt-doctor{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--n900);margin-bottom:4px;}
  .apt-reason{font-size:13px;color:var(--n600);margin-bottom:8px;font-weight:400;}
  
  .apt-info-grid{display:flex;flex-wrap:wrap;gap:12px;}
  .apt-info{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--n400);}
  .apt-info svg{color:var(--n300);}

  .apt-status{
    display:inline-flex;align-items:center;gap:5px;
    padding:4px 10px;border-radius:100px;
    font-size:11px;font-weight:600;
  }
  .apt-status.scheduled{background:var(--g50);color:var(--g600);border:1px solid var(--g200);}
  .apt-status.completed{background:var(--n50);color:var(--n500);border:1px solid var(--n200);}

  /* Banner */
  .banner{
    background:linear-gradient(135deg,#3b82f6 0%,#1e40af 100%);
    border-radius:var(--r-xl);
    padding: clamp(20px, 4vw, 32px);
    color:white;position:relative;overflow:hidden;
    margin-bottom:10px;
  }
  .banner::before{content:'';position:absolute;top:-20px;right:-20px;width:150px;height:150px;background:rgba(255,255,255,.1);border-radius:50%;}
  .banner-icon{font-size:32px;margin-bottom:12px;}
  .banner-title{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;margin-bottom:6px;}
  .banner-desc{font-size:14px;opacity:0.9;font-weight:300;max-width:400px;line-height:1.5;}

  /* Empty state */
  .empty{text-align:center;padding:48px 24px;color:var(--n400);}
  .empty-icon{font-size:40px;margin-bottom:16px;opacity:0.5;}
  .empty-title{font-family:'Sora',sans-serif;font-size:16px;font-weight:600;color:var(--n600);margin-bottom:4px;}

  /* Animations */
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .au {animation:fadeUp .4s ease both;}
  .au1{animation:fadeUp .4s ease .1s both;}
  .au2{animation:fadeUp .4s ease .2s both;}
`;

export default function PatientAppointments() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const userId = localStorage.getItem('userId');
        if (!userStr || !userId) { router.push('/auth'); return; }
        const user = JSON.parse(userStr);
        if (user.role !== 'patient') { router.push('/auth'); return; }

        const apts = mockAppointments.get(userId) || [];
        setAppointments(apts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setIsLoading(false);
    }, [router]);

    if (isLoading) return null;

    const upcoming = appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled');
    const past = appointments.filter(a => new Date(a.date) < new Date() || a.status === 'completed');

    return (
        <>
            <style>{STYLES}</style>
            <div className="shell">

                <div className="content">
                    <div className="inner">

                        <div className="banner au">
                            <div className="banner-icon">📅</div>
                            <div className="banner-title">Your Appointments</div>
                            <div className="banner-desc">Manage your upcoming doctor visits and keep track of your medical history.</div>
                        </div>

                        <div className="page-top au1" style={{ marginTop: '10px' }}>
                            <div>
                                <div className="page-heading">Upcoming</div>
                                <div className="page-sub">You have {upcoming.length} scheduled visits</div>
                            </div>
                        </div>

                        <div className="apt-list au2">
                            {upcoming.length > 0 ? upcoming.map(apt => (
                                <div key={apt.id} className="apt-item">
                                    <div className="apt-date">
                                        <div className="apt-day">{new Date(apt.date).getDate()}</div>
                                        <div className="apt-mon">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</div>
                                    </div>
                                    <div className="apt-main">
                                        <div className="apt-doctor">{apt.doctorName}</div>
                                        <div className="apt-reason">{apt.reason}</div>
                                        <div className="apt-info-grid">
                                            <div className="apt-info"><Clock size={14} /> {apt.time}</div>
                                            <div className="apt-info"><MapPin size={14} /> {apt.facility}</div>
                                            <span className="apt-status scheduled">Scheduled</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <ChevronRight size={20} color="var(--n300)" />
                                    </div>
                                </div>
                            )) : (
                                <div className="card">
                                    <div className="empty">
                                        <div className="empty-icon">📂</div>
                                        <div className="empty-title">No upcoming appointments</div>
                                        <div style={{ fontSize: 13, fontWeight: 300 }}>Contact your caregiver if you need to book a visit.</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {past.length > 0 && (
                            <>
                                <div className="page-top au" style={{ marginTop: '32px' }}>
                                    <div>
                                        <div className="page-heading">Past Visits</div>
                                        <div className="page-sub">Completed medical appointments</div>
                                    </div>
                                </div>
                                <div className="apt-list au1">
                                    {past.map(apt => (
                                        <div key={apt.id} className="apt-item" style={{ opacity: 0.8 }}>
                                            <div className="apt-date" style={{ background: 'var(--n100)', borderColor: 'var(--n200)' }}>
                                                <div className="apt-day" style={{ color: 'var(--n500)' }}>{new Date(apt.date).getDate()}</div>
                                                <div className="apt-mon" style={{ color: 'var(--n400)' }}>{new Date(apt.date).toLocaleString('default', { month: 'short' })}</div>
                                            </div>
                                            <div className="apt-main">
                                                <div className="apt-doctor">{apt.doctorName}</div>
                                                <div className="apt-reason" style={{ marginBottom: 4 }}>{apt.reason}</div>
                                                <div className="apt-info-grid">
                                                    <div className="apt-info">{formatDate(apt.date)}</div>
                                                    <span className="apt-status completed">Completed</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
