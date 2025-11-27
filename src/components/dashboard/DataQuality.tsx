import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceRankingProps {
  items: Array<{
    id: number;
    name: string;
    score: number;
    subtitle?: string;
  }>;
  title: string;
  maxDisplay?: number;
}

export function PerformanceRanking({
  items,
  title,
  maxDisplay = 5,
}: PerformanceRankingProps) {
  const displayItems = items.slice(0, maxDisplay);
  const maxScore = Math.max(...items.map((i) => i.score));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayItems.map((item, index) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold">{item.score}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(item.score / maxScore) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface DataQualityIndicatorProps {
  label: string;
  percentage: number;
  threshold?: number;
}

function DataQualityIndicator({
  label,
  percentage,
  threshold = 80,
}: DataQualityIndicatorProps) {
  const getColor = () => {
    if (percentage >= threshold) return 'bg-green-500';
    if (percentage >= threshold - 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-semibold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${getColor()} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface DataQualityMetricsProps {
  completeness: number;
  validationPassRate: number;
  spatialConflictCount?: number;
  duplicateCount?: number;
}

export function DataQualityMetrics({
  completeness,
  validationPassRate,
  spatialConflictCount,
  duplicateCount,
}: DataQualityMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Data Quality Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataQualityIndicator label="Data Completeness" percentage={completeness} />
        <DataQualityIndicator label="Validation Pass Rate" percentage={validationPassRate} />

        {spatialConflictCount !== undefined && duplicateCount !== undefined && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Issues to Address:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Spatial Conflicts</p>
                <p className="text-lg font-semibold text-red-600">{spatialConflictCount}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Duplicates</p>
                <p className="text-lg font-semibold text-orange-600">{duplicateCount}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
