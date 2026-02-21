  'use client';

  import { useState, useEffect } from 'react';
  import Link from 'next/link';

  export default function AuthPage() {
    const [selectedRole, setSelectedRole] = useState<'patient' | 'caregiver' | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

          * { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --green-50: #f0fdf4;
            --green-100: #dcfce7;
            --green-200: #bbf7d0;
            --green-400: #4ade80;
            --green-500: #22c55e;
            --green-600: #16a34a;
            --green-700: #15803d;
            --green-900: #14532d;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-800: #1f2937;
            --gray-900: #111827;
          }

          body {
            font-family: 'DM Sans', sans-serif;
          }

          .auth-root {
            min-height: 100vh;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            padding: 1.5rem;
          }

          /* Animated background blobs */
          .blob {
            position: absolute;
            border-radius: 9999px;
            filter: blur(80px);
            animation: blobFloat 8s ease-in-out infinite alternate;
            pointer-events: none;
          }
          .blob-1 {
            top: -10rem; right: -10rem;
            width: 600px; height: 600px;
            background: radial-gradient(circle, #86efac 0%, #4ade80 60%, transparent 100%);
            opacity: 0.22;
            animation-delay: 0s;
          }
          .blob-2 {
            bottom: -10rem; left: -10rem;
            width: 500px; height: 500px;
            background: radial-gradient(circle, #bbf7d0 0%, #86efac 60%, transparent 100%);
            opacity: 0.18;
            animation-delay: -3s;
          }
          .blob-3 {
            top: 40%; left: 50%;
            width: 300px; height: 300px;
            background: radial-gradient(circle, #dcfce7 0%, transparent 70%);
            opacity: 0.35;
            animation-delay: -6s;
            transform: translate(-50%, -50%);
          }
          @keyframes blobFloat {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(20px, -20px) scale(1.05); }
          }
          .blob-3 {
            animation: blobFloat3 8s ease-in-out infinite alternate;
          }
          @keyframes blobFloat3 {
            0% { transform: translate(-50%, -50%) scale(1); }
            100% { transform: translate(calc(-50% + 20px), calc(-50% - 20px)) scale(1.05); }
          }

          /* Grid noise texture overlay */
          .noise-overlay {
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
            opacity: 0.4;
            pointer-events: none;
          }

          /* Main grid */
          .auth-grid {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 1100px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
            opacity: 0;
            transform: translateY(24px);
            animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
          }
          @keyframes fadeUp {
            to { opacity: 1; transform: translateY(0); }
          }

          /* Left branding */
          .brand-section { space-y: 1.5rem; }

          .logo-wrap {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.75rem;
          }
          .logo-icon {
            width: 52px; height: 52px;
            background: linear-gradient(135deg, var(--green-600), var(--green-400));
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(22,163,74,0.35);
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
          }
          .logo-icon::after {
            content: '';
            position: absolute;
            top: -40%; left: -40%;
            width: 80%; height: 80%;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
          }
          .logo-text {
            font-family: 'Syne', sans-serif;
            font-size: 1.6rem;
            font-weight: 800;
            color: var(--gray-900);
            letter-spacing: -0.03em;
          }

          .hero-heading {
            font-family: 'Syne', sans-serif;
            font-size: 2.25rem;
            font-weight: 800;
            color: var(--gray-900);
            line-height: 1.1;
            letter-spacing: -0.04em;
            margin-bottom: 1.25rem;
          }
          .hero-heading .accent { color: var(--green-600); }

          .hero-sub {
            color: var(--gray-500);
            font-size: 1.05rem;
            line-height: 1.7;
            max-width: 420px;
            margin-bottom: 2rem;
          }

          /* Stats row */
          .stats-row {
            display: flex;
            gap: 1.75rem;
            flex-wrap: wrap;
          }
          .stat-item {}
          .stat-num {
            font-family: 'Syne', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--green-600);
            line-height: 1;
          }
          .stat-label {
            font-size: 0.78rem;
            color: var(--gray-400);
            margin-top: 2px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }

          /* Divider in stats */
          .stat-divider {
            width: 1px;
            background: var(--gray-200);
            align-self: stretch;
          }

          /* Right card */
          .auth-card {
            background: rgba(255,255,255,0.8);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(187,247,208,0.6);
            box-shadow: 0 24px 64px rgba(22,163,74,0.10), 0 4px 16px rgba(0,0,0,0.06);
            border-radius: 28px;
            padding: 2.5rem;
            animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both;
          }

          .card-header {
            text-align: center;
            margin-bottom: 2rem;
          }
          .card-eyebrow {
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--green-600);
            background: var(--green-50);
            border: 1px solid var(--green-200);
            border-radius: 999px;
            display: inline-block;
            padding: 0.3rem 0.9rem;
            margin-bottom: 0.75rem;
          }
          .card-title {
            font-family: 'Syne', sans-serif;
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--gray-900);
            letter-spacing: -0.03em;
            line-height: 1.2;
          }
          .card-subtitle {
            font-size: 0.9rem;
            color: var(--gray-500);
            margin-top: 0.4rem;
          }

          /* Role buttons */
          .role-btn {
            width: 100%;
            padding: 1.1rem 1.25rem;
            border-radius: 18px;
            border: 1.5px solid var(--gray-200);
            background: white;
            cursor: pointer;
            text-align: left;
            transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.85rem;
            position: relative;
            overflow: hidden;
          }
          .role-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, var(--green-50), transparent);
            opacity: 0;
            transition: opacity 0.25s;
          }
          .role-btn:hover {
            border-color: var(--green-400);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(22,163,74,0.12);
          }
          .role-btn:hover::before { opacity: 1; }
          .role-btn.active {
            border-color: var(--green-600);
            background: var(--green-50);
            box-shadow: 0 0 0 4px rgba(22,163,74,0.08), 0 8px 24px rgba(22,163,74,0.15);
            transform: translateY(-1px);
          }
          .role-btn.active::before { opacity: 1; }

          .role-icon {
            font-size: 2rem;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            flex-shrink: 0;
            position: relative;
            z-index: 1;
            transition: transform 0.25s;
          }
          .role-btn:hover .role-icon,
          .role-btn.active .role-icon {
            transform: scale(1.08) rotate(-3deg);
          }

          .role-info { position: relative; z-index: 1; }
          .role-name {
            font-family: 'Syne', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: 0.2rem;
          }
          .role-desc {
            font-size: 0.8rem;
            color: var(--gray-500);
            line-height: 1.4;
          }

          /* Checkmark indicator */
          .role-check {
            margin-left: auto;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 2px solid var(--gray-300);
            flex-shrink: 0;
            position: relative;
            z-index: 1;
            transition: all 0.25s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .role-btn.active .role-check {
            border-color: var(--green-600);
            background: var(--green-600);
          }
          .role-check-inner {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: white;
            transform: scale(0);
            transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          }
          .role-btn.active .role-check-inner { transform: scale(1); }

          /* Action buttons */
          .actions-wrap {
            margin-top: 1.5rem;
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s;
          }
          .actions-wrap.visible {
            max-height: 200px;
            opacity: 1;
          }

          .btn-primary {
            display: block;
            width: 100%;
            padding: 0.9rem 1.5rem;
            border-radius: 14px;
            border: none;
            background: linear-gradient(135deg, var(--green-600), var(--green-500));
            color: white;
            font-family: 'Syne', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s;
            box-shadow: 0 4px 16px rgba(22,163,74,0.35);
            text-align: center;
            text-decoration: none;
            letter-spacing: -0.01em;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(22,163,74,0.45);
            background: linear-gradient(135deg, var(--green-700), var(--green-600));
          }
          .btn-primary:active { transform: translateY(0); }

          .btn-secondary {
            display: block;
            width: 100%;
            margin-top: 0.65rem;
            padding: 0.85rem 1.5rem;
            border-radius: 14px;
            border: 1.5px solid var(--green-200);
            background: transparent;
            color: var(--green-700);
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.25s;
            text-align: center;
            text-decoration: none;
          }
          .btn-secondary:hover {
            background: var(--green-50);
            border-color: var(--green-400);
            color: var(--green-800);
          }

          /* Trust badge */
          .trust-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            margin-top: 1.4rem;
            font-size: 0.75rem;
            color: var(--gray-400);
          }
          .trust-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--green-400); }

          /* Responsive */
          @media (max-width: 768px) {
            .auth-grid {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
            .brand-section {
              text-align: center;
            }
            .hero-sub { margin: 0 auto 1.5rem; }
            .stats-row { justify-content: center; }
            .auth-card { padding: 2rem 1.5rem; }
            .blob-1 { width: 350px; height: 350px; top: -6rem; right: -6rem; }
            .blob-2 { width: 300px; height: 300px; bottom: -6rem; left: -6rem; }
          }

          @media (max-width: 480px) {
            .auth-root { padding: 1rem; }
            .hero-heading { font-size: 1.8rem; }
            .auth-card { padding: 1.5rem 1.1rem; border-radius: 22px; }
            .role-btn { padding: 0.9rem 1rem; }
            .stats-row { gap: 1rem; }
          }
        `}</style>

        <div className="auth-root">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="noise-overlay" />

          <div className="auth-grid">

          {/* Left: Branding */}
  <div className="brand-section">

    {/* Premium Badge */}
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.35rem 0.9rem',
      borderRadius: '999px',
      background: 'linear-gradient(135deg, var(--green-50), white)',
      border: '1px solid var(--green-200)',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--green-700)',
      marginBottom: '1.5rem'
    }}>
      AI-Powered Health Monitoring
    </div>

    {/* Logo Row */}
    <div className="logo-wrap" style={{ marginBottom: '2.2rem' }}>
      <div className="logo-icon" style={{
        width: '58px',
        height: '58px',
        borderRadius: '18px',
        boxShadow: '0 12px 40px rgba(22,163,74,0.35)'
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.5 2 6 4.5 6 8c0 2 .8 3.8 2 5l4 4 4-4c1.2-1.2 2-3 2-5 0-3.5-2.5-6-6-6z" fill="white"/>
          <circle cx="12" cy="8" r="2.5" fill="rgba(22,163,74,0.6)"/>
        </svg>
      </div>

      <div>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--gray-900)',
          letterSpacing: '-0.03em'
        }}>
          SickleSense
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--gray-400)',
          marginTop: '2px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          Predict • Prevent • Protect
        </div>
      </div>
    </div>

    {/* Hero Heading */}
    <h2 className="hero-heading py-24" style={{
      marginBottom: '1.5rem'
    }}>
      Smarter <span className="accent">Crisis Prevention</span><br />
      Built for <span style={{ color: 'var(--gray-800)' }}>Sickle Cell Care</span>
    </h2>

    {/* Subtitle */}
    <p className="hero-sub" style={{
      fontSize: '1.08rem',
      marginBottom: '2.5rem'
    }}>
      Real-time predictive intelligence that empowers patients and caregivers 
      to take action before emergencies happen.
    </p>

    {/* Refined Stats */}
    <div className="stats-row" style={{
      gap: '2.5rem'
    }}>
      <div className="stat-item">
        <div className="stat-num">94%</div>
        <div className="stat-label">Prediction Accuracy</div>
      </div>

      <div className="stat-item">
        <div className="stat-num">12k+</div>
        <div className="stat-label">Lives Supported</div>
      </div>

      <div className="stat-item">
        <div className="stat-num">24/7</div>
        <div className="stat-label">Monitoring</div>
      </div>
    </div>

  </div>

            {/* Right: Card */}
            <div className="auth-card">
              <div className="card-header">
                <div className="card-eyebrow">Get Started Free</div>
                <h3 className="card-title">How are you joining us?</h3>
                <p className="card-subtitle">Select your role to personalize your experience</p>
              </div>

              <div>
                <button
                  onClick={() => setSelectedRole('patient')}
                  className={`role-btn${selectedRole === 'patient' ? ' active' : ''}`}
                >
                  <div className="role-icon">👤</div>
                  <div className="role-info">
                    <div className="role-name">I'm a Patient</div>
                    <div className="role-desc">Track health metrics and receive crisis alerts</div>
                  </div>
                  <div className="role-check">
                    <div className="role-check-inner" />
                  </div>
                </button>

                <button
                  onClick={() => setSelectedRole('caregiver')}
                  className={`role-btn${selectedRole === 'caregiver' ? ' active' : ''}`}
                >
                  <div className="role-icon">🤝</div>
                  <div className="role-info">
                    <div className="role-name">I'm a Caregiver</div>
                    <div className="role-desc">Monitor and support loved ones proactively</div>
                  </div>
                  <div className="role-check">
                    <div className="role-check-inner" />
                  </div>
                </button>
              </div>

              <div className={`actions-wrap${selectedRole ? ' visible' : ''}`}>
                <Link
                  href={`/auth/register?role=${selectedRole}`}
                  className="btn-primary"
                >
                  Continue as {selectedRole === 'patient' ? 'Patient' : 'Caregiver'} →
                </Link>
                <Link
                  href={`/auth/login?role=${selectedRole}`}
                  className="btn-secondary"
                >
                  I already have an account
                </Link>
              </div>

              <div className="trust-badge">
                <div className="trust-dot" />
                HIPAA Compliant
                <div className="trust-dot" />
                End-to-end Encrypted
                <div className="trust-dot" />
                Free to start
              </div>
            </div>

          </div>
        </div>
      </>
    );
  }