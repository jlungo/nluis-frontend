import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GRIIDashboardData } from '@/types/grii-dashboard';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'cyan';
}

function StatCard({ title, value, subtitle, trend, color = 'blue' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    red: 'border-l-red-500',
    yellow: 'border-l-yellow-500',
    purple: 'border-l-purple-500',
    cyan: 'border-l-cyan-500',
  };

  const trendColor = trend?.direction === 'up' ? 'text-green-600' : trend?.direction === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <Card className={`border-l-4 ${colorMap[color]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className={`text-sm font-semibold ${trendColor} ml-2`}>
              {trend.direction === 'up' && '↑'}{trend.direction === 'down' && '↓'}{trend.direction === 'stable' && '→'}
              {' '}{Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryCardsProps {
  data: GRIIDashboardData;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <StatCard
        title="Total Parcels Registered"
        value={data.summary.totalParcelsRegistered.toLocaleString()}
        subtitle="All localities"
        color="blue"
      />

      <StatCard
        title="CCROs Issued This Month"
        value={data.summary.ccrosIssuedThisMonth}
        subtitle="Current month"
        color="green"
      />

      <StatCard
        title="NIDA Verification Rate"
        value={`${data.summary.nidaVerificationRate}%`}
        subtitle="All parties"
        color="purple"
      />

      <StatCard
        title="Active Users"
        value={data.summary.activeUsers.toLocaleString()}
        subtitle="Online now"
        color="cyan"
      />

      <StatCard
        title="System Uptime"
        value={`${data.efficiency.systemUptime}%`}
        subtitle="Last 30 days"
        color="green"
      />

      <StatCard
        title="Data Quality Score"
        value={`${data.dataQuality.qualityScore}/100`}
        subtitle="Overall system"
        color="yellow"
      />
    </div>
  );
}
