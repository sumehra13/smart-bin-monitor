import { CloudRain, Droplets, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from 'recharts';

interface DayForecast {
  date: string;
  day: string;
  rainfall_mm: number;
  will_rain: boolean;
  probability: number;
  priority: string;
}

interface RainfallChartProps {
  forecast: DayForecast[];
  overallPriority: string;
  showDetails?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'hsl(var(--destructive))';
    case 'MODERATE':
      return 'hsl(var(--warning, 45 93% 47%))';
    default:
      return 'hsl(var(--primary))';
  }
};

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'destructive';
    case 'MODERATE':
      return 'secondary';
    default:
      return 'default';
  }
};

const getBarColor = (rainfall: number) => {
  if (rainfall > 8) return 'hsl(220 70% 50%)'; // Heavy rain - deep blue
  if (rainfall > 3) return 'hsl(200 80% 55%)'; // Moderate rain - blue
  if (rainfall > 0) return 'hsl(190 70% 60%)'; // Light rain - light blue
  return 'hsl(45 90% 55%)'; // No rain - sunny yellow
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.day}</p>
        <p className="text-sm text-muted-foreground">{data.date}</p>
        <div className="mt-2 space-y-1">
          <p className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-foreground">{data.rainfall_mm} mm</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Probability: {Math.round(data.probability * 100)}%
          </p>
          <Badge variant={getPriorityBadgeVariant(data.priority) as any} className="mt-1">
            {data.priority} Priority
          </Badge>
        </div>
      </div>
    );
  }
  return null;
};

export function RainfallChart({ forecast, overallPriority, showDetails = true }: RainfallChartProps) {
  if (!forecast || forecast.length === 0) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20">
        <CardContent className="pt-6 flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CloudRain className="w-5 h-5 animate-pulse" />
            <span>Loading weather forecast...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = forecast.map((day) => ({
    ...day,
    shortDay: day.day.slice(0, 3),
    probabilityPercent: Math.round(day.probability * 100),
  }));

  const totalRainfall = forecast.reduce((sum, day) => sum + day.rainfall_mm, 0);
  const rainyDays = forecast.filter((day) => day.will_rain).length;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CloudRain className="w-5 h-5 text-blue-500" />
            7-Day Rainfall Forecast
          </CardTitle>
          <Badge variant={getPriorityBadgeVariant(overallPriority) as any}>
            {overallPriority} Priority
          </Badge>
        </div>
        {showDetails && (
          <p className="text-sm text-muted-foreground mt-1">
            {rainyDays} rainy day{rainyDays !== 1 ? 's' : ''} expected • {totalRainfall.toFixed(1)} mm total
          </p>
        )}
      </CardHeader>

      <CardContent>
        {/* Bar Chart */}
        <div className="h-48 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
              <XAxis 
                dataKey="shortDay" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'mm', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rainfall_mm" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.rainfall_mm)} />
                ))}
              </Bar>
              <Line 
                type="monotone" 
                dataKey="probabilityPercent" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                yAxisId={0}
                hide
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Day indicators */}
        <div className="grid grid-cols-7 gap-1 mt-4">
          {forecast.map((day, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-2 rounded-lg bg-background/50"
            >
              {day.will_rain ? (
                <CloudRain className="w-4 h-4 text-blue-500 mb-1" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-500 mb-1" />
              )}
              <span className="text-xs text-muted-foreground">
                {Math.round(day.probability * 100)}%
              </span>
            </div>
          ))}
        </div>

        {showDetails && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            ℹ️ Garbage collection may be adjusted on heavy rain days
          </p>
        )}
      </CardContent>
    </Card>
  );
}
