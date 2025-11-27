import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const SummaryCardSkeleton = () => (
  <Card className="col-span-1">
    <CardHeader className="pb-2">
      <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-slate-200 rounded w-16 animate-pulse mb-2" />
      <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
    </CardContent>
  </Card>
);

export const ChartSkeleton = ({ colSpan = 1 }: { colSpan?: number }) => (
  <Card className={`col-span-${colSpan}`}>
    <CardHeader>
      <div className="h-5 bg-slate-200 rounded w-40 animate-pulse mb-2" />
      <div className="h-3 bg-slate-200 rounded w-56 animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-80 bg-slate-100 rounded animate-pulse" />
    </CardContent>
  </Card>
);

export const MetricsGridSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardHeader className="pb-2">
          <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-6 bg-slate-200 rounded w-12 animate-pulse mb-2" />
          <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const MapSkeleton = () => (
  <Card className="w-full lg:col-span-2">
    <CardHeader>
      <div className="h-5 bg-slate-200 rounded w-32 animate-pulse mb-2" />
      <div className="h-3 bg-slate-200 rounded w-48 animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-96 bg-slate-100 rounded animate-pulse" />
    </CardContent>
  </Card>
);

export const DashboardLoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <SummaryCardSkeleton key={i} />
      ))}
    </div>

    {/* Alerts */}
    <Card>
      <CardHeader>
        <div className="h-5 bg-slate-200 rounded w-24 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Tabs and content */}
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-200 rounded w-20 animate-pulse" />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ChartSkeleton key={i} colSpan={i < 2 ? 2 : 1} />
        ))}
      </div>

      {/* Metrics */}
      <MetricsGridSkeleton count={5} />

      {/* Map */}
      <MapSkeleton />
    </div>
  </div>
);
