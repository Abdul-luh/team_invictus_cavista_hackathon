// Generate a unique 6-character alphanumeric code for patients
export const generateUniqueCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Calculate risk score based on health data
export const calculateRiskScore = (data: {
  hydrationLevel: number;
  painLevel: number;
  fatigueLevel: number;
  sleepHours: number;
  temperature: number;
  eyeJaundiceLevel: number;
  activityLevel: 'low' | 'moderate' | 'high';
  medicationAdherence: boolean;
}): { score: number; level: 'low' | 'medium' | 'high' } => {
  let score = 0;

  // Hydration score (0-20 points)
  score += Math.max(0, 20 - (data.hydrationLevel * 0.2));

  // Pain level (0-15 points)
  score += (data.painLevel / 10) * 15;

  // Fatigue level (0-15 points)
  score += (data.fatigueLevel / 10) * 15;

  // Sleep hours (0-15 points) - less sleep = higher risk
  score += Math.max(0, (8 - data.sleepHours) * 1.875);

  // Temperature (0-20 points) - fever increases risk
  score += Math.max(0, (data.temperature - 37) * 5);

  // Jaundice level (0-10 points)
  score += (data.eyeJaundiceLevel / 10) * 10;

  // Activity level (0-5 points)
  const activityRiskMap = { high: 5, moderate: 2, low: 0 };
  score += activityRiskMap[data.activityLevel];

  // Medication adherence (0-10 points)
  score += data.medicationAdherence ? 0 : 10;

  const finalScore = Math.min(100, Math.round(score));

  let level: 'low' | 'medium' | 'high';
  if (finalScore < 30) level = 'low';
  else if (finalScore < 70) level = 'medium';
  else level = 'high';

  return { score: finalScore, level };
};

// Get trigger factors based on health data
export const getTriggerFactors = (data: {
  hydrationLevel: number;
  painLevel: number;
  fatigueLevel: number;
  sleepHours: number;
  temperature: number;
  eyeJaundiceLevel: number;
  medicationAdherence: boolean;
}): string[] => {
  const triggers: string[] = [];

  if (data.hydrationLevel < 30) triggers.push('Low hydration levels detected');
  if (data.painLevel > 6) triggers.push('Elevated pain levels');
  if (data.fatigueLevel > 7) triggers.push('Severe fatigue reported');
  if (data.sleepHours < 5) triggers.push('Insufficient sleep');
  if (data.temperature > 37.5) triggers.push('Fever detected');
  if (data.eyeJaundiceLevel > 5) triggers.push('Increased jaundice levels');
  if (!data.medicationAdherence) triggers.push('Medication not taken as prescribed');

  return triggers.length > 0 ? triggers : ['No significant risk factors'];
};

// Format date for display
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time for display
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Check if data is stale (more than 24 hours old)
export const isDataStale = (date: Date | string): boolean => {
  const dataDate = new Date(date);
  const now = new Date();
  const diffHours = (now.getTime() - dataDate.getTime()) / (1000 * 60 * 60);
  return diffHours > 24;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format (basic)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};
