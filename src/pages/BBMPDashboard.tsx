import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileWarning
} from 'lucide-react';

import { Header } from '@/components/Header';
import { GarbageBinCard } from '@/components/GarbageBinCard';
import { AlertPanel } from '@/components/AlertPanel';
import { RainfallChart } from '@/components/RainfallChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { predictOverflow } from '@/lib/prediction';
import { getRainfallPrediction, DayForecast } from '@/api/rainfall';

interface GarbageBin {
  id: string;
  location: string;
  last_emptied_date: string;
  capacity_days: number;
  current_garbage_level: number;
  area_type: 'residential' | 'commercial';
  complaints_last_week: number;
}

interface Alert {
  id: string;
  bin_id: string;
  message: string;
  status: 'active' | 'resolved';
  predicted_days_left: number | null;
  created_at: string;
  resolved_at: string | null;
  garbage_bins?: {
    location: string;
    area_type: string;
  };
}

export default function BBMPDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bins, setBins] = useState<GarbageBin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [complaintCount, setComplaintCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  /* ✅ WEEKLY RAINFALL STATES */
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [overallPriority, setOverallPriority] = useState<string>("");

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'bbmp')) {
      navigate('/auth/bbmp');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (user && profile?.role === 'bbmp') {
      fetchData();
    }
  }, [user, profile]);

  /* ✅ FETCH WEEKLY RAINFALL DATA */
  useEffect(() => {
    getRainfallPrediction()
      .then((data) => {
        setForecast(data.forecast);
        setOverallPriority(data.overall_priority);
      })
      .catch((err) => console.error("Rainfall error:", err));
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: binsData, error: binsError } = await supabase
      .from('garbage_bins')
      .select('*')
      .order('current_garbage_level', { ascending: false });

    if (binsError) {
      toast.error('Failed to load garbage bins');
    } else {
      const typedBins = binsData as GarbageBin[];
      setBins(typedBins);
      await generateAlerts(typedBins);
    }

    const { data: alertsData } = await supabase
      .from('alerts')
      .select(`
        *,
        garbage_bins (
          location,
          area_type
        )
      `)
      .order('created_at', { ascending: false });

    if (alertsData) {
      setAlerts(alertsData as Alert[]);
    }

    const { count } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    setComplaintCount(count || 0);
    setLoading(false);
  };

  const generateAlerts = async (bins: GarbageBin[]) => {
    for (const bin of bins) {
      const prediction = predictOverflow(bin);
      if (prediction.willOverflow) {
        await supabase.from('alerts').insert({
          bin_id: bin.id,
          message: prediction.message,
          predicted_days_left: prediction.daysLeft,
          status: 'active'
        });
      }
    }
  };

  const criticalBins = bins.filter(b => predictOverflow(b).riskLevel === 'critical').length;
  const highRiskBins = bins.filter(b => predictOverflow(b).riskLevel === 'high').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const resolvedToday = alerts.filter(
    a => a.status === 'resolved' &&
    a.resolved_at &&
    new Date(a.resolved_at).toDateString() === new Date().toDateString()
  ).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">

        {/* 🌧 WEEKLY RAINFALL CHART */}
        <div className="mb-8">
          <RainfallChart forecast={forecast} overallPriority={overallPriority} />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card><CardContent>{criticalBins} Critical Bins</CardContent></Card>
          <Card><CardContent>{highRiskBins} High Risk</CardContent></Card>
          <Card><CardContent>{activeAlerts} Active Alerts</CardContent></Card>
          <Card><CardContent>{resolvedToday} Resolved Today</CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <AlertPanel alerts={alerts} onResolve={() => {}} loading={resolving} />

          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-4">
              {bins.map((bin) => (
                <GarbageBinCard key={bin.id} bin={bin} showNotification={false} />
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
