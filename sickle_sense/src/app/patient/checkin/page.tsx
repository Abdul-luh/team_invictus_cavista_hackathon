'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar, Card, Button, Alert } from '@/components';
import { mockHealthData, calculateRiskScore, getTriggerFactors } from '@/lib/utils';
import { mockRiskAssessments, mockRelationships, mockNotifications } from '@/lib/mockData';
import { HealthData, RiskAssessment, Notification, Patient } from '@/types';
export default function DailyCheckin() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    hydrationLevel: 50,
    painLevel: 0,
    fatigueLevel: 0,
    sleepHours: 7,
    temperature: 37,
    medicationAdherence: true,
    eyeJaundiceLevel: 0,
    activityLevel: 'moderate' as 'low' | 'moderate' | 'high',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userIdStr = localStorage.getItem('userId');

    if (!userStr || !userIdStr) {
      router.push('/auth');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'patient') {
      router.push('/auth');
      return;
    }

    setPatient(user);
    setUserId(userIdStr);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newHealthData: HealthData = {
      id: `health_${Date.now()}`,
      patientId: userId,
      date: new Date(),
      hydrationLevel: formData.hydrationLevel,
      hydrationStatus: formData.hydrationLevel < 30 ? 'low' : formData.hydrationLevel < 60 ? 'normal' : 'optimal',
      painLevel: formData.painLevel,
      fatigueLevel: formData.fatigueLevel,
      sleepHours: formData.sleepHours,
      temperature: formData.temperature,
      medicationAdherence: formData.medicationAdherence,
      eyeJaundiceLevel: formData.eyeJaundiceLevel,
      activityLevel: formData.activityLevel,
      notes: formData.notes,
    };

    if (!mockHealthData.has(userId)) mockHealthData.set(userId, []);
    mockHealthData.get(userId)!.push(newHealthData);

    const { score, level } = calculateRiskScore(formData as any);
    const triggers = getTriggerFactors(formData as any);
    const predictedCrisis = score > 70;

    const newRiskAssessment: RiskAssessment = {
      id: `risk_${Date.now()}`,
      patientId: userId,
      date: new Date(),
      riskScore: score,
      riskLevel: level,
      predictedCrisisIn48h: predictedCrisis,
      triggerFactors: triggers,
      recommendations: getRecommendations(level, triggers),
    };

    if (!mockRiskAssessments.has(userId)) mockRiskAssessments.set(userId, []);
    mockRiskAssessments.get(userId)!.push(newRiskAssessment);

    if (level === 'high' || predictedCrisis) {
      const caregiverIds = mockRelationships.get(userId) || [];
      caregiverIds.forEach((caregiverId) => {
        if (!mockNotifications.has(caregiverId)) mockNotifications.set(caregiverId, []);
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          caregiverId,
          patientId: userId,
          type: 'risk_alert',
          title: `⚠️ High Risk Alert for ${patient?.name}`,
          message: `${patient?.name} has a ${level} risk score (${score}/100). ${triggers[0] || 'Monitor closely.'}`,
          severity: 'high',
          read: false,
          createdAt: new Date(),
        };
        mockNotifications.get(caregiverId)!.push(notification);
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => router.push('/patient/dashboard'), 1400);
    }, 900);
  };

  const getRecommendations = (level: string, triggers: string[]): string[] => {
    const recommendations: string[] = [];

    if (level === 'high') {
      recommendations.push('Seek immediate medical attention if symptoms worsen');
      recommendations.push('Contact your caregiver immediately');
    }

    if (triggers.includes('Low hydration levels detected')) {
      recommendations.push('Drink at least 1 liter of water in the next 2 hours');
      recommendations.push('Set reminders to drink water every 30 minutes');
    }

    if (triggers.includes('Elevated pain levels')) {
      recommendations.push('Take your prescribed pain medication');
      recommendations.push('Rest and avoid strenuous activities');
    }

    if (triggers.includes('Insufficient sleep')) {
      recommendations.push('Get at least 8 hours of sleep tonight');
      recommendations.push('Avoid caffeine and screens before bed');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue your current health routine');
      recommendations.push('Stay hydrated and maintain regular medication schedule');
    }

    return recommendations;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="patient" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Daily Health Check-in" userRole="patient" />

        <main className="flex-1 overflow-y-auto">
          {/* Responsive padding */}
          <div className="container-max py-6 px-4 sm:px-6 lg:px-8">
            {success && (
              <Alert
                type="success"
                title="Check-in Submitted!"
                message="Your health data has been saved and analyzed. Redirecting to dashboard..."
                className="mb-6"
              />
            )}

            <Card>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Daily Health Check-in</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-8">
                Please provide your current health status. This data helps us predict and prevent crises.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hydration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Hydration Level: <span className="text-green-600">{formData.hydrationLevel}%</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.hydrationLevel}
                    onChange={(e) => setFormData({ ...formData, hydrationLevel: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Pain */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Pain Level: <span className="text-red-600">{formData.painLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={formData.painLevel}
                    onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Fatigue */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Fatigue Level: <span className="text-orange-600">{formData.fatigueLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={formData.fatigueLevel}
                    onChange={(e) => setFormData({ ...formData, fatigueLevel: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Sleep */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Sleep Hours: <span className="text-blue-600">{formData.sleepHours}h</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={formData.sleepHours}
                    onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Temperature: <span className="text-red-600">{formData.temperature}°C</span>
                  </label>
                  <input
                    type="number"
                    min={35}
                    max={40}
                    step={0.1}
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                </div>

                {/* Medication */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.medicationAdherence}
                      onChange={(e) => setFormData({ ...formData, medicationAdherence: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-900">I took my medications as prescribed today</span>
                  </label>
                </div>

                {/* Jaundice */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Eye Jaundice Level: <span className="text-yellow-600">{formData.eyeJaundiceLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={formData.eyeJaundiceLevel}
                    onChange={(e) => setFormData({ ...formData, eyeJaundiceLevel: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Activity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Activity Level</label>
                  <div className="flex gap-4">
                    {['low', 'moderate', 'high'].map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="activity"
                          value={level}
                          checked={formData.activityLevel === level}
                          onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                          className="w-4 h-4"
                        />
                        <span className="capitalize text-sm font-medium text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any other symptoms or concerns?"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="primary" type="submit" disabled={isSubmitting} fullWidth>
                    {isSubmitting ? 'Submitting...' : 'Submit Check-in'}
                  </Button>
                  <Button variant="secondary" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}