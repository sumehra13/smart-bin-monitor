// ML-based prediction logic for garbage overflow

export interface BinData {
  current_garbage_level: number;
  complaints_last_week: number;
  area_type: 'residential' | 'commercial';
  last_emptied_date: string;
  capacity_days: number;
}

export interface PredictionResult {
  willOverflow: boolean;
  daysLeft: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  message: string;
}

export function predictOverflow(bin: BinData): PredictionResult {
  const daysSinceEmptied = Math.floor(
    (Date.now() - new Date(bin.last_emptied_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Feature weights based on importance
  const levelWeight = 0.4;
  const complaintsWeight = 0.25;
  const areaWeight = 0.15;
  const daysWeight = 0.2;

  // Normalize features
  const normalizedLevel = bin.current_garbage_level / 100;
  const normalizedComplaints = Math.min(bin.complaints_last_week / 10, 1);
  const areaMultiplier = bin.area_type === 'commercial' ? 1.3 : 1.0;
  const normalizedDays = Math.min(daysSinceEmptied / bin.capacity_days, 1.5);

  // Calculate risk score (0-1)
  const riskScore = 
    (normalizedLevel * levelWeight) +
    (normalizedComplaints * complaintsWeight) +
    ((areaMultiplier - 1) * areaWeight) +
    (normalizedDays * daysWeight);

  // Predict days left until overflow
  const remainingCapacity = 100 - bin.current_garbage_level;
  const dailyFillRate = bin.area_type === 'commercial' ? 15 : 10;
  const adjustedFillRate = dailyFillRate * (1 + (bin.complaints_last_week * 0.1));
  const daysLeft = Math.max(0, Math.floor(remainingCapacity / adjustedFillRate));

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore >= 0.8 || bin.current_garbage_level >= 90) {
    riskLevel = 'critical';
  } else if (riskScore >= 0.6 || bin.current_garbage_level >= 70) {
    riskLevel = 'high';
  } else if (riskScore >= 0.4 || bin.current_garbage_level >= 50) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Determine if overflow is predicted
  const willOverflow = riskLevel === 'critical' || riskLevel === 'high';

  // Generate message
  let message: string;
  if (riskLevel === 'critical') {
    message = 'URGENT: Immediate collection required. Overflow imminent!';
  } else if (riskLevel === 'high') {
    message = `Warning: High fill level. Collection needed within ${daysLeft} day(s).`;
  } else if (riskLevel === 'medium') {
    message = `Moderate fill level. Schedule collection within ${daysLeft} days.`;
  } else {
    message = `Normal operation. Approximately ${daysLeft} days until next collection.`;
  }

  // Calculate confidence based on data quality
  const confidence = Math.round(
    (0.9 - (Math.abs(daysSinceEmptied - bin.capacity_days / 2) / bin.capacity_days) * 0.2) * 100
  );

  return {
    willOverflow,
    daysLeft,
    riskLevel,
    confidence: Math.min(95, Math.max(60, confidence)),
    message
  };
}
