import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { DashboardAlert } from '@/types/grii-dashboard';

interface AlertsWidgetProps {
  alerts: DashboardAlert[];
  maxDisplay?: number;
  onDismiss?: (alertId: string) => void;
}

export function AlertsWidget({
  alerts,
  maxDisplay = 5,
  onDismiss,
}: AlertsWidgetProps) {
  const displayAlerts = alerts.slice(0, maxDisplay);
  const criticalCount = alerts.filter((a) => a.level === 'critical').length;
  const warningCount = alerts.filter((a) => a.level === 'warning').length;

  const getIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getAlertStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-l-4 border-l-red-600 bg-red-50';
      case 'warning':
        return 'border-l-4 border-l-yellow-600 bg-yellow-50';
      case 'info':
        return 'border-l-4 border-l-blue-600 bg-blue-50';
      default:
        return 'border-l-4 border-l-gray-600';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-green-600">
            ✓ All systems operating normally
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Alerts</CardTitle>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive">{criticalCount} Critical</Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline">{warningCount} Warnings</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAlerts.map((alert) => (
          <Alert key={alert.id} className={getAlertStyle(alert.level)}>
            <div className="flex items-start gap-3">
              {getIcon(alert.level)}
              <div className="flex-1">
                <AlertTitle className="text-sm font-semibold">
                  {alert.metric}
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {alert.message}
                  {alert.value && <span className="font-semibold ml-2">{alert.value}</span>}
                  {alert.threshold && (
                    <span className="ml-2 text-muted-foreground">(Threshold: {alert.threshold})</span>
                  )}
                </AlertDescription>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-muted-foreground hover:text-foreground ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          </Alert>
        ))}
        {alerts.length > maxDisplay && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            +{alerts.length - maxDisplay} more alerts
          </div>
        )}
      </CardContent>
    </Card>
  );
}
