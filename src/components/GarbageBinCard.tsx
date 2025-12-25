import { Trash2, MapPin, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { predictOverflow, PredictionResult } from '@/lib/prediction';
import { cn } from '@/lib/utils';

interface GarbageBin {
  id: string;
  location: string;
  last_emptied_date: string;
  capacity_days: number;
  current_garbage_level: number;
  area_type: 'residential' | 'commercial';
  complaints_last_week: number;
}

interface GarbageBinCardProps {
  bin: GarbageBin;
  showNotification?: boolean;
}

export function GarbageBinCard({ bin, showNotification = true }: GarbageBinCardProps) {
  const prediction: PredictionResult = predictOverflow(bin);
  
  const daysSinceEmptied = Math.floor(
    (Date.now() - new Date(bin.last_emptied_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getLevelColor = (level: number) => {
    if (level >= 90) return 'bg-destructive';
    if (level >= 70) return 'bg-warning';
    if (level >= 50) return 'bg-warning/70';
    return 'bg-success';
  };

  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
      prediction.riskLevel === 'critical' && 'ring-2 ring-destructive shadow-alert',
      prediction.riskLevel === 'high' && 'ring-1 ring-destructive/50'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2.5 rounded-xl',
              prediction.riskLevel === 'critical' ? 'bg-destructive/10' :
              prediction.riskLevel === 'high' ? 'bg-warning/10' : 'bg-primary/10'
            )}>
              <Trash2 className={cn(
                'w-5 h-5',
                prediction.riskLevel === 'critical' ? 'text-destructive' :
                prediction.riskLevel === 'high' ? 'text-warning' : 'text-primary'
              )} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {bin.area_type}
              </p>
              <h3 className="font-semibold text-foreground leading-tight">{bin.location}</h3>
            </div>
          </div>
          <StatusBadge status={prediction.riskLevel} size="sm" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Garbage Level Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Fill Level</span>
            <span className="font-mono font-bold">{bin.current_garbage_level}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn('h-full rounded-full transition-all duration-500', getLevelColor(bin.current_garbage_level))}
              style={{ width: `${bin.current_garbage_level}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Emptied:</span>
            <span className="font-medium">{daysSinceEmptied}d ago</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Days Left:</span>
            <span className={cn(
              'font-mono font-bold',
              prediction.daysLeft <= 1 ? 'text-destructive' : 
              prediction.daysLeft <= 3 ? 'text-warning' : 'text-foreground'
            )}>
              {prediction.daysLeft}
            </span>
          </div>
        </div>

        {/* Prediction Message */}
        <div className={cn(
          'p-3 rounded-lg text-sm',
          prediction.riskLevel === 'critical' ? 'bg-destructive/10 text-destructive' :
          prediction.riskLevel === 'high' ? 'bg-warning/10 text-warning-foreground' :
          'bg-muted text-muted-foreground'
        )}>
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{prediction.message}</p>
              <p className="text-xs mt-1 opacity-80">
                ML Confidence: {prediction.confidence}%
              </p>
            </div>
          </div>
        </div>

        {/* BBMP Notification */}
        {showNotification && prediction.willOverflow && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-primary text-sm font-medium">
            <MapPin className="w-4 h-4" />
            BBMP has been notified
          </div>
        )}
      </CardContent>
    </Card>
  );
}
