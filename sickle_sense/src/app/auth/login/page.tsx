'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockPatients, mockCaregivers } from '@/lib/mockData';

/* ─── Shared design tokens (same as Register) ─────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --g50:#f0fdf4; --g100:#dcfce7; --g200:#bbf7d0;
    --g500:#22c55e; --g600:#16a34a; --g700:#15803d;
    --r500:#ef4444; --r50:#fef2f2;
    --bl50:#eff6ff; --bl100:#dbeafe; --bl700:#1d4ed8; --bl800:#1e40af;
    --gray50:#f9fafb; --gray100:#f3f4f6; --gray200:#e5e7eb;
    --gray300:#d1d5db; --gray400:#9ca3af; --gray500:#6b7280;
    --gray600:#4b5563; --gray700:#374151; --gray900:#111827;
    --radius-sm:10px; --radius-md:14px; --radius-lg:20px; --radius-xl:28px;
    --shadow-card: 0 4px 24px rgba(22,163,74,.08), 0 1px 4px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.9);
    --shadow-btn: 0 4px 16px rgba(22,163,74,.3), 0 1px 4px rgba(22,163,74,.2);
  }

  body { font-family: 'DM Sans', sans-serif; }

  .page {
    min-height: 100svh;
    background: #f8fefb;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(24px,5vw,48px) clamp(16px,4vw,24px);
    position: relative;
    overflow: hidden;
  }

  .blob {
    position: fixed; border-radius:50%;
    filter:blur(80px); pointer-events:none; z-index:0;
  }
  .blob-tl {
    width:min(500px,80vw); height:min(500px,80vw);
    background:radial-gradient(circle,#86efac,#4ade80 60%,transparent);
    top:-15%; right:-10%; opacity:.22;
    animation:blobFloat 9s ease-in-out infinite;
  }
  .blob-br {
    width:min(400px,70vw); height:min(400px,70vw);
    background:radial-gradient(circle,#6ee7b7,#34d399 60%,transparent);
    bottom:-15%; left:-10%; opacity:.18;
    animation:blobFloat 11s ease-in-out infinite reverse;
  }
  .grid-bg {
    position:fixed; inset:0; z-index:0;
    background-image:
      linear-gradient(rgba(22,163,74,.04) 1px,transparent 1px),
      linear-gradient(90deg,rgba(22,163,74,.04) 1px,transparent 1px);
    background-size:48px 48px;
  }

  @keyframes blobFloat {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(18px,-14px) scale(1.03)}
    66%{transform:translate(-10px,10px) scale(.97)}
  }

  .content {
    position:relative; z-index:10;
    width:100%; max-width:440px;
    display:flex; flex-direction:column;
    align-items:center;
    gap:clamp(20px,3vw,28px);
  }

  /* ── Header ── */
  .page-header {
    width:100%;
    display:flex; flex-direction:column; align-items:center;
    gap:clamp(14px,2vw,18px);
    opacity:0; transform:translateY(20px);
    animation:fadeUp .6s ease forwards .05s;
  }

  @keyframes fadeUp {
    to { opacity:1; transform:translateY(0); }
  }

  .back-link {
    align-self:flex-start;
    display:flex; align-items:center; gap:6px;
    font-size:13px; font-weight:500; color:var(--gray500);
    text-decoration:none;
    transition:color .2s;
    font-family:'DM Sans',sans-serif;
  }
  .back-link:hover { color:var(--g600); }
  .back-arrow {
    width:20px; height:20px; border-radius:50%;
    border:1.5px solid var(--gray200);
    display:flex; align-items:center; justify-content:center;
    transition:border-color .2s,background .2s;
  }
  .back-link:hover .back-arrow { border-color:var(--g600); background:var(--g50); }

  .logo-row { display:flex; align-items:center; gap:12px; }
  .logo-icon {
    width:42px; height:42px;
    background:linear-gradient(135deg,#16a34a,#22c55e);
    border-radius:13px;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 6px 20px rgba(22,163,74,.35);
    position:relative; overflow:hidden; flex-shrink:0;
  }
  .logo-icon::after {
    content:''; position:absolute;
    top:3px;left:3px;right:3px;height:40%;
    background:linear-gradient(to bottom,rgba(255,255,255,.25),transparent);
    border-radius:8px 8px 0 0;
  }
  .logo-letter {
    font-family:'Sora',sans-serif; font-weight:800;
    color:white; font-size:20px; position:relative; z-index:1;
  }
  .logo-name {
    font-family:'Sora',sans-serif; font-weight:700;
    font-size:clamp(18px,2.5vw,22px); color:var(--gray900);
    letter-spacing:-.4px;
  }

  .welcome-text {
    text-align:center;
  }
  .page-title {
    font-family:'Sora',sans-serif;
    font-size:clamp(24px,4vw,32px);
    font-weight:800; color:var(--gray900);
    letter-spacing:-1px; line-height:1.1;
    margin-bottom:6px;
  }
  .title-accent { color:var(--g600); }
  .page-sub {
    font-size:clamp(13px,1.6vw,15px);
    color:var(--gray500); font-weight:300; line-height:1.6;
  }

  /* ── Card ── */
  .form-card {
    position:relative; z-index:10;
    width:100%;
    background:rgba(255,255,255,.88);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(22,163,74,.12);
    border-radius:var(--radius-xl);
    padding:clamp(24px,4vw,40px);
    box-shadow:var(--shadow-card);
    opacity:0; transform:translateY(20px);
    animation:fadeUp .6s ease forwards .15s;
  }

  .role-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(22,163,74,.08);
    border:1px solid rgba(22,163,74,.2);
    border-radius:100px;
    padding:5px 14px;
    font-size:13px; font-weight:500; color:var(--g700);
    margin-bottom:20px;
  }
  .role-dot {
    width:7px;height:7px;
    background:var(--g500); border-radius:50%;
    animation:pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100%{opacity:1;transform:scale(1)}
    50%{opacity:.5;transform:scale(.75)}
  }

  .field-group { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
  .field-label {
    font-size:13px; font-weight:500; color:var(--gray700);
    display:flex; align-items:center; gap:4px;
  }

  .input-wrapper { position:relative; }

  .field-input {
    width:100%;
    padding:12px 14px;
    border:1.5px solid var(--gray200);
    border-radius:var(--radius-md);
    font-family:'DM Sans',sans-serif;
    font-size:14px; color:var(--gray900);
    background:white; outline:none;
    transition:border-color .2s,box-shadow .2s,background .2s;
  }
  .field-input::placeholder { color:var(--gray400); font-weight:300; }
  .field-input:focus {
    border-color:var(--g600);
    box-shadow:0 0 0 3px rgba(22,163,74,.1);
  }
  .field-input.error {
    border-color:var(--r500);
    background:var(--r50);
  }
  .field-input.error:focus { box-shadow:0 0 0 3px rgba(239,68,68,.1); }

  .field-error {
    font-size:12px; color:var(--r500);
    display:flex; align-items:center; gap:5px;
  }

  .eye-btn {
    position:absolute; right:12px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer;
    color:var(--gray400); padding:4px;
    display:flex; align-items:center;
    transition:color .2s;
  }
  .eye-btn:hover { color:var(--g600); }

  /* Forgot password */
  .forgot-row {
    display:flex; justify-content:flex-end;
    margin-top:-8px; margin-bottom:4px;
  }
  .forgot-link {
    font-size:12px; color:var(--g600); font-weight:500;
    text-decoration:none;
  }
  .forgot-link:hover { text-decoration:underline; }

  /* Alert */
  .alert {
    border-radius:var(--radius-md);
    padding:12px 16px;
    display:flex; align-items:flex-start; gap:10px;
    font-size:13px; margin-bottom:16px;
  }
  .alert-error {
    background:var(--r50);
    border:1px solid #fecaca;
    color:#dc2626;
  }

  /* Submit */
  .btn-submit {
    width:100%;
    background:linear-gradient(135deg,var(--g600) 0%,#15803d 100%);
    color:white; border:none;
    padding:clamp(13px,2vw,16px);
    border-radius:var(--radius-md);
    font-family:'Sora',sans-serif;
    font-weight:600; font-size:clamp(14px,1.8vw,16px);
    cursor:pointer;
    transition:all .25s ease;
    box-shadow:var(--shadow-btn);
    position:relative; overflow:hidden;
    letter-spacing:-.2px;
    margin-top:8px;
  }
  .btn-submit::before {
    content:''; position:absolute;
    top:0;left:0;right:0;height:50%;
    background:linear-gradient(to bottom,rgba(255,255,255,.15),transparent);
    pointer-events:none;
  }
  .btn-submit:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(22,163,74,.4); }
  .btn-submit:active { transform:translateY(0); }
  .btn-submit:disabled { opacity:.65; cursor:not-allowed; transform:none; }

  /* Loading spinner */
  .spinner {
    display:inline-block;
    width:14px; height:14px;
    border:2px solid rgba(255,255,255,.4);
    border-top-color:white;
    border-radius:50%;
    animation:spin .7s linear infinite;
    margin-right:8px; vertical-align:middle;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  .form-footer {
    text-align:center;
    font-size:13px; color:var(--gray500);
    margin-top:16px;
  }
  .form-link {
    color:var(--g600); font-weight:600; text-decoration:none;
  }
  .form-link:hover { text-decoration:underline; }

  /* Demo credentials */
  .demo-card {
    background:linear-gradient(135deg,var(--bl50),rgba(219,234,254,.5));
    border:1px solid var(--bl100);
    border-radius:var(--radius-lg);
    padding:16px 18px;
    margin-top:20px;
  }
  .demo-title {
    font-size:11px; font-weight:700;
    color:var(--bl800);
    text-transform:uppercase; letter-spacing:.08em;
    margin-bottom:10px;
    display:flex; align-items:center; gap:6px;
  }
  .demo-row {
    display:flex; align-items:center;
    gap:8px; margin-bottom:6px;
  }
  .demo-row:last-child { margin-bottom:0; }
  .demo-chip {
    font-size:11px; font-weight:600;
    background:white; color:var(--bl700);
    border:1px solid var(--bl100);
    border-radius:6px;
    padding:2px 8px;
    white-space:nowrap;
  }
  .demo-email {
    font-size:12px; color:var(--bl800);
    font-family:'DM Sans',sans-serif;
  }
  .demo-use-btn {
    margin-left:auto;
    font-size:11px; font-weight:600;
    color:var(--bl700);
    background:white; border:1px solid var(--bl100);
    border-radius:6px; padding:2px 8px;
    cursor:pointer;
    transition:all .2s;
    font-family:'DM Sans',sans-serif;
  }
  .demo-use-btn:hover { background:var(--bl700); color:white; border-color:var(--bl700); }

  .invalid-state {
    min-height:100svh;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    gap:12px; font-family:'DM Sans',sans-serif;
  }
`;

function PasswordInput({
  placeholder, value, onChange, error
}: { placeholder?:string; value:string; onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void; error?:string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrapper">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`field-input ${error ? 'error' : ''}`}
        style={{ paddingRight: '40px' }}
      />
      <button type="button" className="eye-btn" onClick={() => setShow(!show)}>
        {show ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') as 'patient' | 'caregiver' | null;

  const [formData, setFormData] = useState({ email:'', password:'' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const DEMO = {
    patient: 'amina@example.com',
    caregiver: 'mama@example.com',
  };

  const useDemoCredentials = (demoRole: 'patient' | 'caregiver') => {
    setFormData({ email: DEMO[demoRole], password: 'demo123' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    setTimeout(() => {
      let user = null;
      if (role === 'patient') {
        for (const [id, patient] of mockPatients) {
          if (patient.email === formData.email) { user = { ...patient, id }; break; }
        }
      } else if (role === 'caregiver') {
        for (const [id, caregiver] of mockCaregivers) {
          if (caregiver.email === formData.email) { user = { ...caregiver, id }; break; }
        }
      }
      if (!user) {
        setErrors({ general: `No ${role} account found with this email` });
        setIsLoading(false); return;
      }
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id);
      setIsLoading(false);
      router.push(role === 'patient' ? '/patient/dashboard' : '/caregiver/dashboard');
    }, 1000);
  };

  if (!role) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="invalid-state">
          <span style={{fontSize:32}}>⚠️</span>
          <p style={{color:'#6b7280',fontSize:15}}>Invalid role. Please go back and select a role.</p>
          <a href="/auth" style={{color:'#16a34a',fontWeight:600,fontSize:14}}>← Go back</a>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="page">
        <div className="blob blob-tl" />
        <div className="blob blob-br" />
        <div className="grid-bg" />

        <div className="content">
          {/* Header */}
          <div className="page-header">
            <a href="/auth" className="back-link">
              <span className="back-arrow">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Back
            </a>

            <div className="logo-row">
              <div className="logo-icon"><span className="logo-letter">S</span></div>
              <span className="logo-name">SickleSense</span>
            </div>

            <div className="welcome-text">
              <h1 className="page-title">
                Welcome <span className="title-accent">back</span>
              </h1>
              <p className="page-sub">
                Sign in to your {role === 'patient' ? 'patient' : 'caregiver'} account
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="form-card">
            <div style={{display:'flex',justifyContent:'center'}}>
              <span className="role-badge">
                <span className="role-dot" />
                {role === 'patient' ? '👤 Signing in as Patient' : '🤝 Signing in as Caregiver'}
              </span>
            </div>

            {errors.general && (
              <div className="alert alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className={`field-input ${errors.email ? 'error' : ''}`}
                />
                {errors.email && (
                  <span className="field-error">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.5" stroke="#ef4444"/>
                      <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label">Password</label>
                <PasswordInput
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  error={errors.password}
                />
                {errors.password && (
                  <span className="field-error">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.5" stroke="#ef4444"/>
                      <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="forgot-row">
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading && <span className="spinner" />}
                {isLoading ? 'Signing in…' : 'Sign In →'}
              </button>

              <p className="form-footer">
                Don't have an account?{' '}
                <a href={`/auth/register?role=${role}`} className="form-link">Create one here</a>
              </p>
            </form>

            {/* Demo credentials */}
            <div className="demo-card">
              <div className="demo-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Demo accounts
              </div>
              {(['patient', 'caregiver'] as const).map(r => (
                <div className="demo-row" key={r}>
                  <span className="demo-chip">{r === 'patient' ? '👤 Patient' : '🤝 Caregiver'}</span>
                  <span className="demo-email">{DEMO[r]}</span>
                  <button
                    type="button"
                    className="demo-use-btn"
                    onClick={() => useDemoCredentials(r)}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}