import { supabase } from "@/integrations/supabase/client";

export interface DayForecast {
  date: string;
  day: string;
  rainfall_mm: number;
  will_rain: boolean;
  probability: number;
  priority: string;
}

export interface RainfallPrediction {
  forecast: DayForecast[];
  overall_priority: string;
  location: string;
  generated_at: string;
  model: string;
}

export const getRainfallPrediction = async (): Promise<RainfallPrediction> => {
  const { data, error } = await supabase.functions.invoke('rainfall-prediction');
  
  if (error) {
    console.error('Error fetching rainfall prediction:', error);
    throw new Error("Failed to fetch rainfall prediction");
  }
  
  return data as RainfallPrediction;
};
