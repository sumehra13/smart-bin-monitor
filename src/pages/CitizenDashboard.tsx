import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, RefreshCw, AlertCircle, Plus, CloudRain } from 'lucide-react';
import { Header } from '@/components/Header';
import { GarbageBinCard } from '@/components/GarbageBinCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getRainfallPrediction } from '@/api/rainfall';

interface GarbageBin {
  id: string;
  location: string;
  last_emptied_date: string;
  capacity_days: number;
  current_garbage_level: number;
  area_type: 'residential' | 'commercial';
  complaints_last_week: number;
}

export default function CitizenDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bins, setBins] = useState<GarbageBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'residential' | 'commercial'>('all');

  /* 🌧 WEEKLY RAINFALL STATES */
  const [forecast, setForecast] = useState<any[]>([]);
  const [overallPriority, setOverallPriority] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/citizen');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBins();
    }
  }, [user]);

  /* 🌧 FETCH WEEKLY RAINFALL DATA */
  useEffect(() => {
    getRainfallPrediction()
      .then((data) => {
        setForecast(data.forecast);
        setOverallPriority(data.overall_priority);
      })
      .catch((err) => console.error("Rainfall error:", err));
  }, []);

  const fetchBins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('garbage_bins')
      .select('*')
      .order('current_garbage_level', { ascending: false });

    if (error) {
      toast.error('Failed to load garbage bins');
    } else {
      setBins(data as GarbageBin[]);
    }
    setLoading(false);
  };

  const filteredBins = bins.filter(bin =>
    filter === 'all' ? true : bin.area_type === filter
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">

        {/* 🌧 WEEKLY RAIN FORECAST (CITIZEN VIEW) */}
        <Card className="mb-8 border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CloudRain className="w-5 h-5" />
              Weekly Rain Forecast (From Tomorrow)
            </h2>

            {forecast.length === 0 ? (
              <p>Loading weather forecast...</p>
            ) : (
              forecast.map((day, index) => (
                <p key={index}>
                  <b>{day.day}, {day.date}</b> →{" "}
                  {day.will_rain ? "🌧 Rain Expected" : "☀️ No Rain"} (
                  {day.rainfall_mm} mm)
                </p>
              ))
            )}

            <p className="mt-3 text-sm text-muted-foreground">
              ℹ️ Due to expected weather conditions, garbage collection may be delayed on rainy days.
            </p>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to="/report-issue" className="block">
            <div className="p-6 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors border border-primary/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-lg">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Report an Issue</h3>
                  <p className="text-sm text-muted-foreground">Report garbage or civic issues</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/my-complaints" className="block">
            <div className="p-6 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors border border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <AlertCircle className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">My Complaints</h3>
                  <p className="text-sm text-muted-foreground">Track your complaints</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* BIN FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trash2 className="w-8 h-8 text-primary" />
              Garbage Bins
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor garbage levels in your area
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
              <Button size="sm" onClick={() => setFilter('all')}>All</Button>
              <Button size="sm" onClick={() => setFilter('residential')}>Residential</Button>
              <Button size="sm" onClick={() => setFilter('commercial')}>Commercial</Button>
            </div>
            <Button variant="outline" onClick={fetchBins} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* BINS */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBins.map((bin) => (
              <GarbageBinCard key={bin.id} bin={bin} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
