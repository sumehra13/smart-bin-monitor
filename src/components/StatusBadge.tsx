import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'low' | 'medium' | 'high' | 'critical' | 'active' | 'resolved';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold rounded-full';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const statusConfig = {
    low: {
      styles: 'bg-success/15 text-success border border-success/30',
      icon: CheckCircle,
      label: 'Low Risk'
    },
    medium: {
      styles: 'bg-warning/15 text-warning border border-warning/30',
      icon: AlertCircle,
      label: 'Medium Risk'
    },
    high: {
      styles: 'bg-destructive/15 text-destructive border border-destructive/30',
      icon: AlertTriangle,
      label: 'High Risk'
    },
    critical: {
      styles: 'bg-destructive text-destructive-foreground border border-destructive',
      icon: XCircle,
      label: 'Critical'
    },
    active: {
      styles: 'bg-destructive/15 text-destructive border border-destructive/30',
      icon: AlertTriangle,
      label: 'Active'
    },
    resolved: {
      styles: 'bg-success/15 text-success border border-success/30',
      icon: CheckCircle,
      label: 'Resolved'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(baseStyles, sizeStyles[size], config.styles)}>
      {showIcon && <Icon className={cn(size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />}
      {config.label}
    </span>
  );
}
