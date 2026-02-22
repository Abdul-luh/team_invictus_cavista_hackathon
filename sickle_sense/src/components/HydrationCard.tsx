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

// Interfaces
interface HydrationStats {
  verified: boolean;
  ml_added: number;
  drinks_today: number;
  progress_percentage: number;
  message: string;
  daily_goal_ml: number;
  weekly_data: { date: string; ml: number; drinks: number }[];
}

interface HydrationCardProps {
  hydrationLevel?: number;
  onHydrationUpdate: (result: HydrationStats) => void;
}

export function HydrationCard({ hydrationLevel, onHydrationUpdate }: HydrationCardProps) {
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<HydrationStats | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [hydrationHistory, setHydrationHistory] = useState<HydrationStats['weekly_data']>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockWeeklyData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        ml: Math.floor(Math.random() * 800) + 1200, // Range 1200-2000ml
        drinks: Math.floor(Math.random() * 4) + 4, // 4-8 drinks
      };
    });
    setHydrationHistory(mockWeeklyData);

    setVerificationResult({
      verified: true,
      ml_added: 75,
      drinks_today: 6,
      progress_percentage: 100,
      message: "Great job! You've reached your daily goal!",
      daily_goal_ml: 2000,
      weekly_data: mockWeeklyData,
    });
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

      setShowVideoUpload(true);
      setIsRecording(true);
      setVideoFile(null);
      setVideoPreview(null);
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `hydration_${Date.now()}.webm`, { type: 'video/webm' });
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(blob));

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);

    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera or start recording. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setShowVideoUpload(true);
    }
  };

  const submitVerification = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    setVerificationError(null);
    const userId = localStorage.getItem('userId');

    try {
      const formData = new FormData();
      formData.append('file', videoFile);

      const response = await fetch(`https://team-invictus-cavista-hackathon.onrender.com/logs/hydration-verify/${userId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log("Verification Response:", data);

      if (!response.ok) {
        let errorMessage = 'Verification failed. Please try again.';
        if (response.status === 422 && data.detail) {
          errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } else if (data.message || data.error) {
          errorMessage = data.message || data.error;
        }

        setVerificationError(errorMessage);
        setShowResultModal(true);
        return;
      }

      // Success logic
      const result: HydrationStats = {
        verified: data.verified ?? true,
        ml_added: data.ml_added ?? 60,
        drinks_today: data.drinks_today ?? 1,
        progress_percentage: data.progress_percentage ?? 33,
        message: data.message || "Verified!",
        daily_goal_ml: data.daily_goal_ml || 2000,
        weekly_data: data.weekly_data || hydrationHistory,
      };

      setVerificationResult(result);
      onHydrationUpdate(result);
      setShowVideoUpload(false);
      setVideoFile(null);
      setVideoPreview(null);
      setShowResultModal(true);
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationError(error.message || 'Verification failed. Please try again.');
      setShowResultModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  const ResultModal = () => {
    if (!showResultModal) return null;
    if (!verificationResult && !verificationError) return null;

    const isError = !!verificationError;

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
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
            backgroundColor: isError ? '#fef2f2' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '40px',
            animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {isError ? '⚠️' : '💧'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
            {isError ? 'Verification Failed' : 'Drink Verified!'}
          </h2>
          <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: 1.5, marginBottom: '24px' }}>
            {isError ? verificationError : verificationResult?.message}
          </p>

          {!isError && verificationResult && (
            <div style={{
              backgroundColor: '#f9fafb', borderRadius: '16px', padding: '16px',
              marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Added</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>+{verificationResult.ml_added} mL</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Progress</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>{verificationResult.progress_percentage}%</div>
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
            {isError ? 'Try Again' : 'Continue'}
          </button>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#111827',
          color: 'white',
          padding: '10px 14px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: 'none',
          outline: 'none'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#f3f4f6', fontSize: '0.875rem' }}>
            {label}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <p style={{ margin: 0, color: '#4ade80', fontWeight: 700, fontSize: '1.125rem' }}>
              {(payload[0].value / 1000).toFixed(2)}L
            </p>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '0.75rem', paddingLeft: '16px' }}>
            {payload[0].payload.drinks} drinks logged
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card fade-in-1" style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid rgba(34, 197, 94, 0.1)',
      boxShadow: '0 20px 40px -15px rgba(34, 197, 94, 0.2)',
      borderRadius: '24px',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #22c55e20 0%, #16a34a20 100%)',
            color: '#16a34a', width: '48px', height: '48px', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
          }}>💧</div>
          <div>
            <div style={{ color: '#15803d', fontWeight: 700, fontSize: '1.25rem' }}>Hydration Tracker</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Monitor your daily water intake</div>
          </div>
        </div>

        {/* Stats Grid */}
        {verificationResult && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            background: 'white', padding: '1.25rem', borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
            marginBottom: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Daily Goal Progress</span>
                <span style={{ color: '#6b7280' }}>{verificationResult.progress_percentage}% reached</span>
              </div>
              <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${verificationResult.progress_percentage}%`,
                  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '4px',
                  transition: 'width 1s ease-out'
                }} />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: verificationResult.progress_percentage >= 100 ? '#15803d' : '#2563eb', lineHeight: 1.2 }}>
                {verificationResult.progress_percentage}%
              </div>
              <div style={{ fontSize: '0.75rem', color: verificationResult.progress_percentage >= 100 ? '#166534' : '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                {verificationResult.progress_percentage <= 33 ? 'Low' : verificationResult.progress_percentage <= 66 ? 'Moderate' : 'Optimal'}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #f3f4f6',
          boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 700, color: '#111827', fontSize: '1.125rem' }}>Weekly Trend</span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto', background: '#f3f4f6', padding: '4px 8px', borderRadius: '12px' }}>
              Goal: {(verificationResult?.daily_goal_ml || 2000) / 1000}L
            </span>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hydrationHistory} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}L`}
                  domain={[0, 'dataMax + 400']}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <ReferenceLine
                  y={verificationResult?.daily_goal_ml || 2000}
                  stroke="#22c55e"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="ml"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMl)"
                  activeDot={{ r: 6, fill: '#ffffff', stroke: '#16a34a', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Video Upload Section */}
        {!showVideoUpload ? (
          <div style={{
            padding: '2rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '20px', border: '2px dashed #bbf7d0', textAlign: 'center'
          }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>📹</span>
            <h4 style={{ marginBottom: '0.5rem', color: '#15803d', fontSize: '1.125rem', fontWeight: 600 }}>Log Your Drink</h4>
            <p style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '1.5rem' }}>Record a quick video to verify your hydration</p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={startRecording}
                type='button'
                style={{
                  padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
              >
                <span>🎥</span> Record Video
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </div>
        ) : (
          <div style={{
            padding: '1.5rem', background: '#ffffff', borderRadius: '20px',
            border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', background: '#1a1a1a', aspectRatio: '16/9' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {isRecording && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '100px', fontSize: '0.875rem', fontWeight: 500 }}>
                  <span style={{ width: '10px', height: '10px', background: '#dc2626', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                  Recording...
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {isRecording ? (
                <button type="button" onClick={stopRecording} style={{ flex: 1, padding: '0.875rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Stop Recording
                </button>
              ) : (
                <>
                  <button type="button" onClick={submitVerification} disabled={isUploading} style={{ flex: 1, padding: '0.875rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
                    {isUploading ? 'Verifying...' : '✓ Verify & Log Drink'}
                  </button>
                  <button type="button" onClick={() => { setShowVideoUpload(false); setVideoFile(null); setVideoPreview(null); stopRecording(); }} style={{ padding: '0.875rem 1.5rem', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '12px', fontWeight: 500, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <ResultModal />
    </div>
  );
}