'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface JaundiceStats {
  verified: boolean;
  current_level: number;
  status: 'Normal' | 'Mild' | 'Elevated' | 'Critical';
  message: string;
  weekly_data: { date: string; level: number }[];
}

interface EyeJaundiceCardProps {
  onJaundiceUpdate: (stats: JaundiceStats) => void;
}

export function EyeJaundiceCard({ onJaundiceUpdate }: EyeJaundiceCardProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [jaundiceHistory, setJaundiceHistory] = useState<JaundiceStats['weekly_data']>([]);
  const [currentResult, setCurrentResult] = useState<JaundiceStats | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Mock historical data
    const mockData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        level: Math.floor(Math.random() * 3) + 1, // Range 1-4
      };
    });
    setJaundiceHistory(mockData);

    setCurrentResult({
      verified: true,
      current_level: 2,
      status: 'Mild',
      message: "Healthy eye levels detected. Last scan shows everything is stable.",
      weekly_data: mockData
    });
  }, []);

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCamera(true);
      setIsRecording(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      alert("Camera access required for eye analysis.");
    }
  };

  const submitVerification = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsVerifying(true);
    setVerificationError(null);
    const userId = localStorage.getItem('userId');

    try {
      // 1. Capture image from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 2. Convert to Blob
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (!blob) throw new Error("Could not capture image");
      const file = new File([blob], `jaundice_${Date.now()}.jpg`, { type: 'image/jpeg' });

      // 3. Submit to API
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://team-invictus-cavista-hackathon.onrender.com';
      const response = await fetch(`${apiUrl}/logs/jaundice-check/${userId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log("Jaundice Verification Response:", data);

      if (!response.ok) {
        let errorMessage = 'Analysis failed. Please try again.';
        if (response.status === 422 && data.detail) {
          errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } else if (data.message || data.error) {
          errorMessage = data.message || data.error;
        }
        setVerificationError(errorMessage);
        setShowResultModal(true);
        return;
      }

      // Success logic - Assuming data contains 'yellow_index' or similar
      // Based on user description, AI gives a 1-10 yellow index
      const yellowIndex = data.yellow_index || data.index || 0;
      const result: JaundiceStats = {
        verified: true,
        current_level: yellowIndex,
        status: yellowIndex > 7 ? 'Critical' : yellowIndex > 4 ? 'Elevated' : yellowIndex > 2 ? 'Mild' : 'Normal',
        message: yellowIndex > 4 ? "Alert: Significant yellowing detected. Consultation recommended." : "Analysis complete. Levels are stable.",
        weekly_data: jaundiceHistory
      };

      setCurrentResult(result);
      onJaundiceUpdate(result);
      setShowCamera(false);
      setShowResultModal(true);

      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    } catch (error: any) {
      console.error('Jaundice Analysis error:', error);
      setVerificationError(error.message || 'Analysis failed. Please try again.');
      setShowResultModal(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const ResultModal = () => {
    if (!showResultModal) return null;
    if (!currentResult && !verificationError) return null;

    const isError = !!verificationError;
    const level = currentResult?.current_level || 0;
    const riskPercentage = level * 10;

    let statusColor = '#22c55e'; // Normal
    if (level > 7) statusColor = '#ef4444'; // Critical
    else if (level > 4) statusColor = '#f97316'; // Elevated
    else if (level > 2) statusColor = '#eab308'; // Mild

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out'
      }} onClick={() => {
        setShowResultModal(false);
        setVerificationError(null);
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '24px', padding: '32px',
          maxWidth: '400px', width: '100%', textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transform: 'translateY(0)', animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: isError ? '#fef2f2' : `${statusColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '40px',
            animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {isError ? '⚠️' : '👁️'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
            {isError ? 'Analysis Failed' : 'Analysis Results'}
          </h2>
          <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: 1.5, marginBottom: '24px' }}>
            {isError ? verificationError : currentResult?.message}
          </p>

          {!isError && currentResult && (
            <div style={{
              backgroundColor: '#f9fafb', borderRadius: '16px', padding: '16px',
              marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Yellow Index</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: statusColor }}>{level}/10</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Crisis Risk</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: statusColor === '#22c55e' ? '#22c55e' : statusColor }}>{riskPercentage}%</div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowResultModal(false);
              setVerificationError(null);
            }}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              backgroundColor: isError ? '#ef4444' : '#111827', color: 'white', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {isError ? 'Try Again' : 'Done'}
          </button>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#111827', color: 'white', padding: '10px 14px',
          borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 0, color: '#facc15', fontWeight: 700, fontSize: '1.125rem' }}>
            Level {payload[0].value}/10
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card fade-in-2" style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #fefce8 100%)',
      border: '1px solid rgba(234, 179, 8, 0.1)',
      boxShadow: '0 20px 40px -15px rgba(234, 179, 8, 0.15)',
      borderRadius: '24px', overflow: 'hidden'
    }}>
      <div style={{ padding: '1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
            color: '#a16207', width: '48px', height: '48px', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
          }}>👁️</div>
          <div>
            <div style={{ color: '#854d0e', fontWeight: 700, fontSize: '1.25rem' }}>Sclera Analysis</div>
            <div style={{ color: '#71717a', fontSize: '0.875rem' }}>AI-powered eye jaundice tracking</div>
          </div>
        </div>

        {/* Jaundice Trend Graph */}
        <div style={{
          marginBottom: '2rem', padding: '1.5rem', background: '#ffffff',
          borderRadius: '24px', border: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 700, color: '#111827', fontSize: '1.125rem' }}>Bilirubin Index</span>
            <span style={{ fontSize: '0.75rem', color: '#a16207', marginLeft: 'auto', background: '#fef9c3', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
              Status: {currentResult?.status || 'Active'}
            </span>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={jaundiceHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJaundice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* Vertical and Horizontal Grid Lines */}
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={true}
                  horizontal={true}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false} tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="8 4" label={{ value: 'Warning', position: 'right', fill: '#ef4444', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="level"
                  stroke="#eab308"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorJaundice)"
                  activeDot={{ r: 6, fill: '#ffffff', stroke: '#ca8a04', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interaction Section */}
        {!showCamera ? (
          <div style={{
            padding: '1.5rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            borderRadius: '20px', border: '2px dashed #fde68a', textAlign: 'center'
          }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#854d0e', fontWeight: 600 }}>Visual Verification</h4>
            <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '1.5rem' }}>Use your front camera to scan your eyes for jaundice detection.</p>
            <button
              onClick={startAnalysis}
              type="button"
              className="btn-primary"
              style={{ background: '#eab308', width: 'auto', margin: '0 auto', padding: '0.75rem 2rem' }}
            >
              Start Eye Scan 📸
            </button>
          </div>
        ) : (
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '1rem' }}>
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '4/3', position: 'relative' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={submitVerification}
                disabled={isVerifying}
                type="button"
                className="btn-primary"
                style={{ background: '#ca8a04', flex: 2 }}
              >
                {isVerifying ? 'Analyzing Sclera...' : 'Capture & Analyze'}
              </button>
              <button
                type="button"
                onClick={() => setShowCamera(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        {currentResult && !showCamera && (
          <div style={{
            marginTop: '1.5rem', padding: '1rem', background: '#ffffff',
            borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', gap: '1rem', alignItems: 'center'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', background: currentResult.current_level > 4 ? '#fef2f2' : '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {currentResult.current_level > 4 ? '⚠️' : '✅'}
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9375rem' }}>{currentResult.message}</p>
              <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>Bilirubin Intensity: {currentResult.current_level}/10</p>
            </div>
          </div>
        )}
      </div>
      <ResultModal />
    </div>
  );
}