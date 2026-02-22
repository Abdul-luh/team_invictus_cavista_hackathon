'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isValidEmail, isValidPhone } from '@/lib/utils';

/* ─── Shared design tokens ─────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --g50:#f0fdf4; --g100:#dcfce7; --g200:#bbf7d0;
    --g500:#22c55e; --g600:#16a34a; --g700:#15803d; --g900:#14532d;
    --r500:#ef4444; --r50:#fef2f2;
    --bl50:#eff6ff; --bl700:#1d4ed8;
    --gray50:#f9fafb; --gray100:#f3f4f6; --gray200:#e5e7eb;
    --gray300:#d1d5db; --gray400:#9ca3af; --gray500:#6b7280;
    --gray600:#4b5563; --gray700:#374151; --gray900:#111827;
    --radius-sm:10px; --radius-md:14px; --radius-lg:20px; --radius-xl:28px;
    --shadow-card: 0 4px 24px rgba(22,163,74,.08), 0 1px 4px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.9);
    --shadow-btn: 0 4px 16px rgba(22,163,74,.3), 0 1px 4px rgba(22,163,74,.2);
  }

  body { font-family: 'DM Sans', sans-serif; }

  /* ── Layout ── */
  .page {
    min-height: 100svh;
    background: #f8fefb;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: clamp(24px,5vw,48px) clamp(16px,4vw,24px);
    position: relative;
    overflow-x: hidden;
  }

  .blob {
    position: fixed; border-radius: 50%;
    filter: blur(80px); pointer-events: none; z-index: 0;
  }
  .blob-tl {
    width: min(500px,80vw); height: min(500px,80vw);
    background: radial-gradient(circle,#86efac,#4ade80 60%,transparent);
    top:-15%; right:-10%; opacity:.22;
    animation: blobFloat 9s ease-in-out infinite;
  }
  .blob-br {
    width: min(400px,70vw); height: min(400px,70vw);
    background: radial-gradient(circle,#6ee7b7,#34d399 60%,transparent);
    bottom:-15%; left:-10%; opacity:.18;
    animation: blobFloat 11s ease-in-out infinite reverse;
  }
  .grid-bg {
    position: fixed; inset:0; z-index:0;
    background-image:
      linear-gradient(rgba(22,163,74,.04) 1px,transparent 1px),
      linear-gradient(90deg,rgba(22,163,74,.04) 1px,transparent 1px);
    background-size: 48px 48px;
  }

  @keyframes blobFloat {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(18px,-14px) scale(1.03)}
    66%{transform:translate(-10px,10px) scale(.97)}
  }

  /* ── Header ── */
  .page-header {
    position: relative; z-index:10;
    width:100%; max-width:520px;
    display:flex; flex-direction:column; align-items:center;
    gap:clamp(14px,2vw,20px);
    margin-bottom: clamp(20px,3vw,32px);
    opacity:0; transform:translateY(20px);
    animation: fadeUp .6s ease forwards .05s;
  }

  @keyframes fadeUp {
    to { opacity:1; transform:translateY(0); }
  }

  .back-link {
    align-self: flex-start;
    display:flex; align-items:center; gap:6px;
    font-size:13px; font-weight:500; color:var(--gray500);
    text-decoration:none;
    transition: color .2s ease;
    font-family: 'DM Sans', sans-serif;
  }
  .back-link:hover { color:var(--g600); }
  .back-arrow {
    width:20px; height:20px;
    border-radius:50%;
    border:1.5px solid var(--gray200);
    display:flex; align-items:center; justify-content:center;
    transition: border-color .2s, background .2s;
  }
  .back-link:hover .back-arrow { border-color:var(--g600); background:var(--g50); }

  .logo-row { display:flex; align-items:center; gap:12px; }
  .logo-icon {
    width:42px; height:42px;
    background: linear-gradient(135deg,#16a34a,#22c55e);
    border-radius:13px;
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 6px 20px rgba(22,163,74,.35);
    position:relative; overflow:hidden; flex-shrink:0;
  }
  .logo-icon::after {
    content:''; position:absolute;
    top:3px;left:3px;right:3px;height:40%;
    background: linear-gradient(to bottom,rgba(255,255,255,.25),transparent);
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

  .page-title {
    font-family:'Sora',sans-serif;
    font-size:clamp(22px,3.5vw,30px);
    font-weight:800; color:var(--gray900);
    letter-spacing:-1px; text-align:center;
    line-height:1.1;
  }
  .title-accent { color:var(--g600); }

  .page-sub {
    font-size:clamp(13px,1.6vw,15px);
    color:var(--gray500); text-align:center;
    font-weight:300; line-height:1.6;
    max-width:380px;
  }

  /* ── Card ── */
  .form-card {
    position:relative; z-index:10;
    width:100%; max-width:520px;
    background:rgba(255,255,255,.88);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(22,163,74,.12);
    border-radius:var(--radius-xl);
    padding:clamp(24px,4vw,40px);
    box-shadow:var(--shadow-card);
    opacity:0; transform:translateY(20px);
    animation: fadeUp .6s ease forwards .15s;
  }

  /* ── Progress bar (for multi-role visual) ── */
  .role-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(22,163,74,.08);
    border:1px solid rgba(22,163,74,.2);
    border-radius:100px;
    padding:5px 14px;
    font-size:13px; font-weight:500; color:var(--g700);
    margin-bottom:20px;
    align-self:center;
  }
  .role-dot {
    width:7px;height:7px;
    background:var(--g500); border-radius:50%;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100%{opacity:1;transform:scale(1)}
    50%{opacity:.5;transform:scale(.75)}
  }

  /* ── Section divider ── */
  .section-divider {
    display:flex; align-items:center; gap:10px;
    margin:24px 0 20px;
  }
  .divider-line { flex:1; height:1px; background:var(--gray100); }
  .divider-label {
    font-size:11px; font-weight:600; letter-spacing:.08em;
    color:var(--gray400); text-transform:uppercase;
    white-space:nowrap;
  }

  /* ── Form fields ── */
  .fields-grid {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:14px;
  }
  .field-full { grid-column:1/-1; }

  @media(max-width:500px) {
    .fields-grid { grid-template-columns:1fr; }
    .field-full { grid-column:1; }
  }

  .field-group { display:flex; flex-direction:column; gap:5px; }

  .field-label {
    font-size:13px; font-weight:500;
    color:var(--gray700);
    display:flex; align-items:center; gap:4px;
  }
  .required-mark { color:var(--r500); font-size:11px; }

  .field-input, .field-select {
    width:100%;
    padding:11px 14px;
    border:1.5px solid var(--gray200);
    border-radius:var(--radius-md);
    font-family:'DM Sans',sans-serif;
    font-size:14px; color:var(--gray900);
    background:white;
    outline:none;
    transition: border-color .2s, box-shadow .2s, background .2s;
    appearance:none; -webkit-appearance:none;
  }
  .field-input::placeholder { color:var(--gray400); font-weight:300; }
  .field-input:focus, .field-select:focus {
    border-color:var(--g600);
    box-shadow: 0 0 0 3px rgba(22,163,74,.1);
    background:#fff;
  }
  .field-input.error, .field-select.error {
    border-color:var(--r500);
    background:var(--r50);
  }
  .field-input.error:focus, .field-select.error:focus {
    box-shadow: 0 0 0 3px rgba(239,68,68,.1);
  }
  .field-error {
    font-size:12px; color:var(--r500);
    display:flex; align-items:center; gap:5px;
  }

  /* Select wrapper for custom arrow */
  .select-wrapper { position:relative; }
  .select-arrow {
    position:absolute; right:12px; top:50%; transform:translateY(-50%);
    pointer-events:none; color:var(--gray400);
  }

  /* ── Password eye toggle ── */
  .input-wrapper { position:relative; }
  .eye-btn {
    position:absolute; right:12px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer;
    color:var(--gray400); padding:4px;
    display:flex; align-items:center;
    transition:color .2s;
  }
  .eye-btn:hover { color:var(--g600); }

  /* ── Code display card ── */
  .code-card {
    background:linear-gradient(135deg,var(--g50) 0%,rgba(187,247,208,.3) 100%);
    border:1.5px solid var(--g200);
    border-radius:var(--radius-lg);
    padding:18px 20px;
    display:flex; flex-direction:column; gap:6px;
  }
  .code-label {
    font-size:12px; font-weight:500; color:var(--g700);
    text-transform:uppercase; letter-spacing:.07em;
  }
  .code-value {
    font-family:'Sora',sans-serif;
    font-size:clamp(24px,5vw,32px);
    font-weight:800; color:var(--g700);
    letter-spacing:.2em;
    line-height:1;
  }
  .code-hint {
    font-size:12px; color:var(--gray500); font-weight:300;
    line-height:1.5;
  }
  .code-copy-btn {
    align-self:flex-start;
    margin-top:6px;
    background:white;
    border:1.5px solid var(--g200);
    border-radius:8px;
    padding:5px 12px;
    font-size:12px; font-weight:500; color:var(--g700);
    cursor:pointer;
    display:flex; align-items:center; gap:5px;
    transition:all .2s;
    font-family:'DM Sans',sans-serif;
  }
  .code-copy-btn:hover {
    background:var(--g600); color:white; border-color:var(--g600);
  }

  /* ── Alert ── */
  .alert {
    border-radius:var(--radius-md);
    padding:12px 16px;
    display:flex; align-items:flex-start; gap:10px;
    font-size:13px; font-weight:400;
    margin-bottom:16px;
  }
  .alert-success {
    background:#f0fdf4;
    border:1px solid #bbf7d0;
    color:#15803d;
  }
  .alert-error {
    background:var(--r50);
    border:1px solid #fecaca;
    color:#dc2626;
  }
  .alert-icon { flex-shrink:0; margin-top:1px; }
  .alert-title { font-weight:600; margin-bottom:2px; }

  /* ── Submit button ── */
  .btn-submit {
    width:100%;
    background: linear-gradient(135deg,var(--g600) 0%,#15803d 100%);
    color:white;
    border:none;
    padding:clamp(13px,2vw,16px);
    border-radius:var(--radius-md);
    font-family:'Sora',sans-serif;
    font-weight:600;
    font-size:clamp(14px,1.8vw,16px);
    cursor:pointer;
    transition:all .25s ease;
    box-shadow:var(--shadow-btn);
    position:relative; overflow:hidden;
    letter-spacing:-.2px;
    margin-top:4px;
  }
  .btn-submit::before {
    content:''; position:absolute;
    top:0;left:0;right:0;height:50%;
    background: linear-gradient(to bottom,rgba(255,255,255,.15),transparent);
    border-radius:var(--radius-md) var(--radius-md) 0 0;
    pointer-events:none;
  }
  .btn-submit:hover {
    transform:translateY(-2px);
    box-shadow:0 8px 24px rgba(22,163,74,.4);
  }
  .btn-submit:active { transform:translateY(0); }
  .btn-submit:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  /* ── Footer text ── */
  .form-footer {
    text-align:center;
    font-size:13px; color:var(--gray500);
    margin-top:16px;
  }
  .form-link {
    color:var(--g600); font-weight:600;
    text-decoration:none;
  }
  .form-link:hover { text-decoration:underline; }

  /* ── Invalid role state ── */
  .invalid-state {
    min-height:100svh;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    gap:12px;
    font-family:'DM Sans',sans-serif;
  }
`;

function FieldGroup({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {children}
      {error && (
        <span className="field-error">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
            <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

function TextInput({
  placeholder, value, onChange, error, type = 'text', isPassword = false
}: {
  placeholder?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; type?: string; isPassword?: boolean
}) {
  const [show, setShow] = useState(false);
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="input-wrapper">
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`field-input ${error ? 'error' : ''}`}
        style={isPassword ? { paddingRight: '40px' } : {}}
      />
      {isPassword && (
        <button type="button" className="eye-btn" onClick={() => setShow(!show)}>
          {show ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') as 'patient' | 'caregiver' | null;

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    patientCode: '', relationship: '', dateOfBirth: '', genotype: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [patientCodeFromBackend, setPatientCodeFromBackend] = useState('');

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(p => ({ ...p, [key]: e.target.value }));

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!isValidEmail(formData.email)) e.email = 'Valid email is required';
    if (!isValidPhone(formData.phone)) e.phone = 'Valid phone number is required';
    if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (role === 'patient') {
      if (!formData.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
      if (!formData.genotype) e.genotype = 'Genotype is required';
    }
    if (role === 'caregiver') {
      if (!formData.patientCode.trim()) e.patientCode = 'Patient code is required';
      if (!formData.relationship.trim()) e.relationship = 'Relationship is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);
    setSuccess(false);

    const payload: any = {
      email: formData.email,
      password: formData.password,
      full_name: formData.name,
      role: role,
      phone: formData.phone,
    };

    if (role === 'patient') {
      payload.dateOfBirth = formData.dateOfBirth;
      payload.genotype = formData.genotype;
    } else if (role === 'caregiver') {
      payload.linked_patient_code = formData.patientCode.toUpperCase();
      payload.relationship = formData.relationship;
    }

    try {
      const response = await fetch('https://team-invictus-cavista-hackathon.onrender.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setApiError(data.detail?.[0]?.msg || data.message || 'Registration failed.');
        setIsSubmitting(false);
        return;
      }

      const patientCode = data.patient_code || data.patientCode;
      if (patientCode) setPatientCodeFromBackend(patientCode);

      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => router.push(`/auth/login?role=${role}`), 3500);

    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!role) {
    return (
      <div className="invalid-state">
        <span style={{ fontSize: 32 }}>⚠️</span>
        <p style={{ color: '#6b7280', fontSize: 15 }}>Invalid role. Please go back and select a role.</p>
        <a href="/auth" style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>← Go back</a>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />
      <div className="grid-bg" />

      <div className="page-header">
        <a href="/auth" className="back-link">
          <span className="back-arrow">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Back
        </a>

        <div className="logo-row">
          <div className="logo-icon"><span className="logo-letter">S</span></div>
          <span className="logo-name">SickleSense</span>
        </div>

        <h1 className="page-title">
          {role === 'patient' ? (
            <><span className="title-accent">Patient</span> Registration</>
          ) : (
            <><span className="title-accent">Caregiver</span> Registration</>
          )}
        </h1>
        <p className="page-sub">
          {role === 'patient'
            ? 'Create your account and receive a unique code to share with your caregivers.'
            : 'Create your account and link to your patient using their unique code.'}
        </p>
      </div>

      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span className="role-badge">
            <span className="role-dot" />
            {role === 'patient' ? '👤 Registering as Patient' : '🤝 Registering as Caregiver'}
          </span>
        </div>

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <div>
              <div className="alert-title">Registration Successful!</div>
              {patientCodeFromBackend && (
                <div style={{ marginTop: 4 }}>
                  Your patient code: <strong>{patientCodeFromBackend}</strong>
                </div>
              )}
              Redirecting to login...
            </div>
          </div>
        )}

        {apiError && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <div>{apiError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="section-divider">
            <div className="divider-line" />
            <span className="divider-label">Personal Info</span>
            <div className="divider-line" />
          </div>

          <div className="fields-grid">
            <div className="field-full">
              <FieldGroup label="Full Name" required error={errors.name}>
                <TextInput placeholder="e.g. Amina Okonkwo" value={formData.name} onChange={set('name')} error={errors.name} />
              </FieldGroup>
            </div>
            <FieldGroup label="Email Address" required error={errors.email}>
              <TextInput type="email" placeholder="you@example.com" value={formData.email} onChange={set('email')} error={errors.email} />
            </FieldGroup>
            <FieldGroup label="Phone Number" required error={errors.phone}>
              <TextInput type="tel" placeholder="+234 801 234 5678" value={formData.phone} onChange={set('phone')} error={errors.phone} />
            </FieldGroup>
          </div>

          {role === 'patient' && (
            <>
              <div className="section-divider">
                <div className="divider-line" />
                <span className="divider-label">Medical Details</span>
                <div className="divider-line" />
              </div>
              <div className="fields-grid">
                <FieldGroup label="Date of Birth" required error={errors.dateOfBirth}>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={set('dateOfBirth')}
                    className={`field-input ${errors.dateOfBirth ? 'error' : ''}`}
                  />
                </FieldGroup>
                <FieldGroup label="Genotype" required error={errors.genotype}>
                  <div className="select-wrapper">
                    <select value={formData.genotype} onChange={set('genotype')} className={`field-select ${errors.genotype ? 'error' : ''}`}>
                      <option value="">Select genotype</option>
                      <option value="SS">SS — Sickle Cell Disease</option>
                      <option value="SC">SC — Hemoglobin C</option>
                      <option value="SB">SB — Beta Thalassemia</option>
                    </select>
                    <span className="select-arrow">▼</span>
                  </div>
                </FieldGroup>
              </div>
            </>
          )}

          {role === 'caregiver' && (
            <>
              <div className="section-divider">
                <div className="divider-line" />
                <span className="divider-label">Link to Patient</span>
                <div className="divider-line" />
              </div>
              <div className="fields-grid">
                <FieldGroup label="Patient Code" required error={errors.patientCode}>
                  <TextInput placeholder="6-character code" value={formData.patientCode} onChange={set('patientCode')} error={errors.patientCode} />
                </FieldGroup>
                <FieldGroup label="Your Relationship" required error={errors.relationship}>
                  <div className="select-wrapper">
                    <select value={formData.relationship} onChange={set('relationship')} className={`field-select ${errors.relationship ? 'error' : ''}`}>
                      <option value="">Select relationship</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="select-arrow">▼</span>
                  </div>
                </FieldGroup>
              </div>
            </>
          )}

          <div className="section-divider">
            <div className="divider-line" />
            <span className="divider-label">Security</span>
            <div className="divider-line" />
          </div>

          <div className="fields-grid">
            <FieldGroup label="Password" required error={errors.password}>
              <TextInput isPassword placeholder="Min. 6 characters" value={formData.password} onChange={set('password')} error={errors.password} />
            </FieldGroup>
            <FieldGroup label="Confirm Password" required error={errors.confirmPassword}>
              <TextInput isPassword placeholder="Re-enter password" value={formData.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
            </FieldGroup>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button type="submit" className="btn-submit" disabled={isSubmitting || success}>
              {isSubmitting ? 'Creating account...' : success ? 'Redirecting...' : 'Create Account →'}
            </button>
            <p className="form-footer">
              Already have an account?{' '}
              <a href={`/auth/login?role=${role}`} className="form-link">Sign in here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <style>{STYLES}</style>
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fefb', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: 32, height: 32, borderColor: '#dcfce7', borderTopColor: '#16a34a', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: 14 }}>Preparing registration...</p>
          </div>
        </div>
      }>
        <RegisterContent />
      </Suspense>
    </>
  );
}