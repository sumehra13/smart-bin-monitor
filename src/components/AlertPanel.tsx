import { Bell, CheckCircle, Clock, MapPin, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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

interface AlertPanelProps {
  alerts: Alert[];
  onResolve: (alertId: string, binId: string) => void;
  loading?: boolean;
}

export function AlertPanel({ alerts, onResolve, loading }: AlertPanelProps) {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Overflow Alerts
          </CardTitle>
          {activeAlerts.length > 0 && (
            <span className="px-2.5 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
              {activeAlerts.length} Active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[600px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="w-12 h-12 text-success mb-3" />
            <p className="font-medium text-foreground">All Clear!</p>
            <p className="text-sm text-muted-foreground">No overflow alerts at this time.</p>
          </div>
        ) : (
          <div className="divide-y">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-4 transition-colors',
                  'bg-destructive/5 hover:bg-destructive/10'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">
                          {alert.garbage_bins?.location || 'Unknown Location'}
                        </h4>
                        <StatusBadge status="active" size="sm" showIcon={false} />
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.garbage_bins?.area_type || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onResolve(alert.id, alert.bin_id)}
                    disabled={loading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            ))}

            {resolvedAlerts.length > 0 && (
              <>
                <div className="px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Resolved ({resolvedAlerts.length})
                </div>
                {resolvedAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-4 opacity-60">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">
                            {alert.garbage_bins?.location || 'Unknown Location'}
                          </h4>
                          <StatusBadge status="resolved" size="sm" showIcon={false} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Resolved {alert.resolved_at && formatDistanceToNow(new Date(alert.resolved_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
