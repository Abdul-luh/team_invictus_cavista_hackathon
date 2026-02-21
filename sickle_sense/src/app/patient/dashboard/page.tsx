'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar } from '@/components';
import { mockPatients, mockNotifications } from '@/lib/mockData';
import { Notification } from '@/types';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --g50:#f0fdf4;--g100:#dcfce7;--g200:#bbf7d0;--g500:#22c55e;--g600:#16a34a;--g700:#15803d;
    --rh-bg:#fef2f2;--rh-bd:#fecaca;--rh-tx:#dc2626;--rh-dot:#ef4444;
    --rm-bg:#fffbeb;--rm-bd:#fde68a;--rm-tx:#d97706;--rm-dot:#f59e0b;
    --bl50:#eff6ff;--bl100:#dbeafe;--bl500:#3b82f6;--bl600:#2563eb;--bl700:#1d4ed8;
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

  /* Top row */
  .page-top{
    display:flex;align-items:flex-start;justify-content:space-between;
    flex-wrap:wrap;gap:12px;
  }
  .page-heading{
    font-family:'Sora',sans-serif;
    font-size:clamp(18px,2.5vw,22px);font-weight:800;
    color:var(--n900);letter-spacing:-.5px;margin-bottom:3px;
  }
  .page-sub{font-size:13px;color:var(--n400);font-weight:300;}

  /* Alert */
  .alert{
    border-radius:var(--r-lg);padding:11px 14px;
    display:flex;align-items:flex-start;gap:9px;
    font-size:13px;border:1px solid;
  }
  .alert.info{background:var(--bl50);border-color:var(--bl100);color:var(--bl700);}
  .alert-title{font-weight:700;margin-bottom:1px;}

  /* Filter bar */
  .filter-bar{
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:10px;
  }
  .filter-pills{display:flex;gap:6px;flex-wrap:wrap;}
  .pill{
    display:inline-flex;align-items:center;gap:5px;
    padding:7px 14px;border-radius:100px;
    font-family:'DM Sans',sans-serif;
    font-size:13px;font-weight:500;cursor:pointer;
    border:1.5px solid;
    transition:all .2s;white-space:nowrap;
  }
  .pill.active-all    {background:var(--n900);color:white;border-color:var(--n900);}
  .pill.active-unread {background:var(--bl600);color:white;border-color:var(--bl600);}
  .pill.active-high   {background:var(--rh-dot);color:white;border-color:var(--rh-dot);}
  .pill.inactive{background:var(--n0);color:var(--n600);border-color:var(--n200);}
  .pill.inactive:hover{background:var(--n50);border-color:var(--n300);}
  .pill-count{
    background:rgba(255,255,255,.25);
    border-radius:100px;padding:0 5px;
    font-size:11px;font-weight:700;
  }
  .pill.inactive .pill-count{background:var(--n100);color:var(--n500);}

  /* Mark all button */
  .mark-all-btn{
    display:inline-flex;align-items:center;gap:5px;
    padding:7px 13px;border-radius:100px;
    font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;
    cursor:pointer;border:1.5px solid var(--n200);
    background:var(--n0);color:var(--n600);
    transition:all .2s;
  }
  .mark-all-btn:hover{background:var(--n50);border-color:var(--n300);}

  /* Notification card */
  .notif-card{
    display:flex;align-items:flex-start;gap:12px;
    padding:14px 16px;border-radius:var(--r-xl);
    border:1px solid var(--n200);background:var(--n0);
    cursor:pointer;transition:all .22s;
    box-shadow:var(--sh-sm);
    position:relative;overflow:hidden;
  }
  .notif-card::before{
    content:'';position:absolute;top:0;bottom:0;left:0;
    width:3px;border-radius:0 2px 2px 0;
    transition:background .2s;
  }
  .notif-card.high::before  {background:var(--rh-dot);}
  .notif-card.medium::before{background:var(--rm-dot);}
  .notif-card.low::before   {background:var(--bl500);}
  .notif-card.read::before  {background:var(--n200);}
  .notif-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);}
  .notif-card.unread{background:var(--bl50);}

  .notif-icon-wrap{
    width:40px;height:40px;border-radius:12px;
    display:flex;align-items:center;justify-content:center;
    font-size:18px;flex-shrink:0;
  }
  .notif-icon-wrap.high  {background:var(--rh-bg);}
  .notif-icon-wrap.medium{background:var(--rm-bg);}
  .notif-icon-wrap.low   {background:var(--bl50);}
  .notif-icon-wrap.read  {background:var(--n100);}

  .notif-body{flex:1;min-width:0;}
  .notif-head{
    display:flex;align-items:flex-start;
    justify-content:space-between;gap:8px;
    margin-bottom:4px;
  }
  .notif-title{
    font-family:'Sora',sans-serif;
    font-size:13px;font-weight:700;color:var(--n900);
    line-height:1.3;
  }
  .notif-card.read .notif-title{color:var(--n600);font-weight:600;}
  .notif-msg{
    font-size:13px;color:var(--n500);
    font-weight:300;line-height:1.5;margin-bottom:8px;
  }
  .notif-meta{
    display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  }
  .notif-patient{
    font-size:11px;font-weight:500;color:var(--n500);
    display:flex;align-items:center;gap:4px;
  }
  .notif-time{font-size:11px;color:var(--n400);font-weight:300;}

  /* Severity chip */
  .sev-chip{
    display:inline-flex;align-items:center;gap:4px;
    padding:2px 8px;border-radius:100px;
    font-size:10px;font-weight:700;text-transform:uppercase;
    letter-spacing:.04em;border:1px solid;flex-shrink:0;
  }
  .sev-chip.high  {background:var(--rh-bg);border-color:var(--rh-bd);color:var(--rh-tx);}
  .sev-chip.medium{background:var(--rm-bg);border-color:var(--rm-bd);color:var(--rm-tx);}
  .sev-chip.low   {background:var(--bl50); border-color:var(--bl100);color:var(--bl700);}

  /* Unread dot */
  .unread-dot{
    width:9px;height:9px;border-radius:50%;
    background:var(--bl500);flex-shrink:0;margin-top:5px;
  }

  /* Right-side actions */
  .notif-actions{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}
  .del-btn{
    background:none;border:none;cursor:pointer;
    color:var(--n300);padding:4px;border-radius:6px;
    transition:all .15s;display:flex;align-items:center;
  }
  .del-btn:hover{color:var(--rh-tx);background:var(--rh-bg);}

  /* Group header */
  .group-label{
    font-size:11px;font-weight:600;color:var(--n400);
    text-transform:uppercase;letter-spacing:.07em;
    padding:4px 0;
    display:flex;align-items:center;gap:8px;
  }
  .group-line{flex:1;height:1px;background:var(--n200);}

  /* Empty */
  .empty{
    text-align:center;
    padding:clamp(40px,7vw,72px) 20px;
    color:var(--n400);
  }
  .empty-icon{font-size:40px;margin-bottom:14px;opacity:.4;}
  .empty-title{
    font-family:'Sora',sans-serif;
    font-size:16px;font-weight:700;color:var(--n600);margin-bottom:5px;
  }
  .empty-sub{font-size:13px;font-weight:300;line-height:1.5;}

  /* Card wrapper */
  .card{
    background:var(--n0);border:1px solid var(--n200);
    border-radius:var(--r-xl);
    box-shadow:var(--sh-sm);
    overflow:hidden;
  }

  /* Animations */
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .au {animation:fadeUp .4s ease both;}
  .au1{animation:fadeUp .4s ease .05s both;}
  .au2{animation:fadeUp .4s ease .1s both;}
  .au3{animation:fadeUp .4s ease .15s both;}
`;

type FilterType = 'all' | 'unread' | 'high';

const ICONS: Record<string, string> = {
  risk_alert:'⚠️', medication_reminder:'💊', appointment:'📅', default:'ℹ️'
};

export default function NotificationsPage() {
  const router = useRouter();
  const [caregiver, setCaregiver] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userId  = localStorage.getItem('userId');
    if (!userStr || !userId) { router.push('/auth'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'caregiver') { router.push('/auth'); return; }
    setCaregiver(user);
    const all = (mockNotifications.get(userId) || [])
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotifications(all);
  }, [router]);

  const markRead   = (id: string) => setNotifications(n => n.map(x => x.id===id ? {...x,read:true} : x));
  const markAllRead= ()           => setNotifications(n => n.map(x => ({...x,read:true})));
  const del        = (id: string) => setNotifications(n => n.filter(x => x.id!==id));

  const getPatientName = (pid: string) => mockPatients.get(pid)?.name || 'Unknown Patient';

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'high')   return n.severity === 'high';
    return true;
  });

  const unread = notifications.filter(n => !n.read).length;
  const highCount = notifications.filter(n => n.severity === 'high').length;

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60)   return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  };

  const sevClass = (s: string) => s === 'high' ? 'high' : s === 'medium' ? 'medium' : 'low';

  return (
    <>
      <style>{STYLES}</style>
      <div className="shell">
        <Sidebar userRole="caregiver" />
        <div className="main">
          <Header title="Notifications" userRole="caregiver" />
          <div className="content">
            <div className="inner">

              {/* Page top */}
              <div className="page-top au">
                <div>
                  <div className="page-heading">Notifications</div>
                  <div className="page-sub">{notifications.length} total · {unread} unread</div>
                </div>
              </div>

              {/* Unread summary */}
              {unread > 0 && (
                <div className="alert info au1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    <div className="alert-title">{unread} unread alert{unread !== 1 ? 's' : ''}</div>
                    Review them to stay updated on your patients' health.
                  </div>
                </div>
              )}

              {/* Filter bar */}
              <div className="filter-bar au2">
                <div className="filter-pills">
                  {([
                    {id:'all',    label:'All',           count:notifications.length},
                    {id:'unread', label:'Unread',         count:unread},
                    {id:'high',   label:'High Priority',  count:highCount},
                  ] as {id:FilterType; label:string; count:number}[]).map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`pill ${filter===f.id ? `active-${f.id}` : 'inactive'}`}
                    >
                      {f.label}
                      <span className="pill-count">{f.count}</span>
                    </button>
                  ))}
                </div>
                {unread > 0 && (
                  <button className="mark-all-btn" onClick={markAllRead}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/><polyline points="20 13 9 24 4 19"/>
                    </svg>
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              {filtered.length > 0 ? (
                <div className="au3" style={{display:'flex',flexDirection:'column',gap:8}}>
                  {/* Group: unread first */}
                  {filter === 'all' && unread > 0 && (
                    <>
                      {/* Unread group */}
                      <div className="group-label">
                        <div className="group-line"/>
                        <span>New</span>
                        <div className="group-line"/>
                      </div>
                      {filtered.filter(n => !n.read).map((n, i) => (
                        <NotifCard key={n.id} n={n} idx={i} onRead={markRead} onDelete={del} getPatientName={getPatientName} formatTime={formatTime} sevClass={sevClass} />
                      ))}
                      {filtered.filter(n => n.read).length > 0 && (
                        <div className="group-label" style={{marginTop:8}}>
                          <div className="group-line"/>
                          <span>Earlier</span>
                          <div className="group-line"/>
                        </div>
                      )}
                      {filtered.filter(n => n.read).map((n, i) => (
                        <NotifCard key={n.id} n={n} idx={i} onRead={markRead} onDelete={del} getPatientName={getPatientName} formatTime={formatTime} sevClass={sevClass} />
                      ))}
                    </>
                  )}

                  {/* Filtered views: no grouping */}
                  {filter !== 'all' && filtered.map((n, i) => (
                    <NotifCard key={n.id} n={n} idx={i} onRead={markRead} onDelete={del} getPatientName={getPatientName} formatTime={formatTime} sevClass={sevClass} />
                  ))}
                </div>
              ) : (
                <div className="card">
                  <div className="empty">
                    <div className="empty-icon">{filter === 'unread' ? '✨' : '🔔'}</div>
                    <div className="empty-title">
                      {filter === 'unread' ? "You're all caught up!" : 'No notifications'}
                    </div>
                    <div className="empty-sub">
                      {filter === 'unread'
                        ? 'No unread notifications right now.'
                        : 'No notifications matching this filter yet.'}
                    </div>
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

/* ── Notification Card sub-component ── */
function NotifCard({ n, idx, onRead, onDelete, getPatientName, formatTime, sevClass }: {
  n: Notification; idx: number;
  onRead: (id:string)=>void;
  onDelete: (id:string)=>void;
  getPatientName: (pid:string)=>string;
  formatTime: (d:Date|string)=>string;
  sevClass: (s:string)=>string;
}) {
  const sc = sevClass(n.severity);
  const icon = n.type === 'risk_alert' ? '⚠️' : n.type === 'medication_reminder' ? '💊' : n.type === 'appointment' ? '📅' : 'ℹ️';
  const iconClass = n.read ? 'read' : sc;

  return (
    <div
      className={`notif-card ${sc} ${!n.read ? 'unread' : 'read'}`}
      style={{animationDelay:`${idx * 0.04}s`, animation:'fadeUp .4s ease both'}}
      onClick={() => !n.read && onRead(n.id)}
    >
      <div className={`notif-icon-wrap ${iconClass}`}>{icon}</div>

      <div className="notif-body">
        <div className="notif-head">
          <div className="notif-title">{n.title}</div>
          <span className={`sev-chip ${sc}`}>{n.severity}</span>
        </div>
        <div className="notif-msg">{n.message}</div>
        <div className="notif-meta">
          <span className="notif-patient">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {getPatientName(n.patientId)}
          </span>
          <span className="notif-time">· {formatTime(n.createdAt)}</span>
        </div>
      </div>

      <div className="notif-actions">
        {!n.read && <div className="unread-dot" />}
        <button
          className="del-btn"
          onClick={e => { e.stopPropagation(); onDelete(n.id); }}
          aria-label="Delete notification"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}