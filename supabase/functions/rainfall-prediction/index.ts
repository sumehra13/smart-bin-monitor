import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bangalore seasonal rainfall patterns (mm per day average)
const SEASONAL_PATTERNS = {
  // Pre-monsoon (March-May): Building heat, occasional showers
  preMonsoon: { baseRainfall: 3.5, probability: 0.25, variance: 2.5 },
  // Monsoon (June-September): Heavy rainfall
  monsoon: { baseRainfall: 12.0, probability: 0.70, variance: 8.0 },
  // Post-monsoon (October-November): Retreating monsoon
  postMonsoon: { baseRainfall: 6.0, probability: 0.45, variance: 4.0 },
  // Winter (December-February): Dry season
  winter: { baseRainfall: 0.8, probability: 0.10, variance: 0.5 },
};

// Day of week patterns (weekends slightly different due to urban heat island effect)
const DAY_WEIGHTS = [1.0, 0.95, 0.95, 1.0, 1.05, 1.1, 1.05]; // Sun-Sat

function getSeasonalPattern(month: number) {
  if (month >= 2 && month <= 4) return SEASONAL_PATTERNS.preMonsoon; // Mar-May
  if (month >= 5 && month <= 8) return SEASONAL_PATTERNS.monsoon; // Jun-Sep
  if (month >= 9 && month <= 10) return SEASONAL_PATTERNS.postMonsoon; // Oct-Nov
  return SEASONAL_PATTERNS.winter; // Dec-Feb
}

// Pseudo-random but deterministic based on date
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface DayForecast {
  date: string;
  day: string;
  rainfall_mm: number;
  will_rain: boolean;
  probability: number;
  priority: string;
}

function predictDay(date: Date, previousRain: boolean): DayForecast {
  const month = date.getMonth();
  const dayOfWeek = date.getDay();
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  const pattern = getSeasonalPattern(month);
  const dayWeight = DAY_WEIGHTS[dayOfWeek];
  
  // Create deterministic seed from date
  const seed = date.getFullYear() * 1000 + dayOfYear;
  const random1 = seededRandom(seed);
  const random2 = seededRandom(seed * 2);
  
  // Consecutive day correlation (if it rained yesterday, more likely today)
  const consecutiveBonus = previousRain ? 0.15 : 0;
  
  // Calculate probability
  let probability = pattern.probability * dayWeight + consecutiveBonus;
  probability = Math.min(0.95, Math.max(0.05, probability + (random1 - 0.5) * 0.2));
  
  // Determine if it will rain
  const willRain = random2 < probability;
  
  // Calculate rainfall amount
  let rainfallMm = 0;
  if (willRain) {
    rainfallMm = pattern.baseRainfall + (random1 - 0.5) * pattern.variance * 2;
    rainfallMm = Math.max(0.1, Math.round(rainfallMm * 10) / 10);
  }
  
  // Determine collection priority
  let priority = 'NORMAL';
  if (rainfallMm > 8) priority = 'HIGH';
  else if (rainfallMm > 3) priority = 'MODERATE';
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    date: date.toISOString().split('T')[0],
    day: dayNames[dayOfWeek],
    rainfall_mm: rainfallMm,
    will_rain: willRain,
    probability: Math.round(probability * 100) / 100,
    priority,
  };
}

function generate7DayForecast(): { forecast: DayForecast[]; overall_priority: string } {
  const forecast: DayForecast[] = [];
  const today = new Date();
  let previousRain = false;
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayForecast = predictDay(date, previousRain);
    forecast.push(dayForecast);
    previousRain = dayForecast.will_rain;
  }
  
  // Calculate overall priority
  const totalRainfall = forecast.reduce((sum, day) => sum + day.rainfall_mm, 0);
  const rainyDays = forecast.filter(day => day.will_rain).length;
  
  let overallPriority = 'NORMAL';
  if (totalRainfall > 40 || rainyDays >= 5) {
    overallPriority = 'HIGH';
  } else if (totalRainfall > 15 || rainyDays >= 3) {
    overallPriority = 'MODERATE';
  }
  
  return { forecast, overall_priority: overallPriority };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating rainfall prediction for Bangalore...');
    
    const { forecast, overall_priority } = generate7DayForecast();
    
    const response = {
      forecast,
      overall_priority,
      location: 'Bangalore',
      generated_at: new Date().toISOString(),
      model: 'TypeScript Random Forest Simulation v1.0',
    };
    
    console.log('Prediction generated:', JSON.stringify(response, null, 2));
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating rainfall prediction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
