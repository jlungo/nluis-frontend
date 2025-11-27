import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GRIIDashboardData } from '@/types/grii-dashboard';

interface MetricsGridProps {
  data: GRIIDashboardData;
}

export function CCROMetrics({ data }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total CCRO Apps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.ccro.total}</div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div
              className="bg-blue-500 h-1 rounded-full"
              style={{
                width: `${(data.ccro.byStage.issued / data.ccro.total) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.ccro.byStage.issued} issued
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Submitted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {data.ccro.byStage.submitted}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Awaiting review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Under Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {data.ccro.byStage.underReview}
          </div>
          <p className="text-xs text-muted-foreground mt-2">In progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {data.ccro.byStage.approved}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Ready for issue</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Issued</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {data.ccro.byStage.issued}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Certificates issued</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ParcelMetrics({ data }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Parcels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.parcel.total.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {(data.parcel.totalAreaSqm / 1000000).toFixed(1)} km²
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Registered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {data.parcel.byStage.registered}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {((data.parcel.byStage.registered / data.parcel.total) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Under GIS Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {data.parcel.byStage.gisApproval}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {((data.parcel.byStage.gisApproval / data.parcel.total) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Printed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {data.parcel.byStage.printed}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {((data.parcel.byStage.printed / data.parcel.total) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">With Conflicts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {data.parcel.withConflicts}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Needs resolution</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function NidaMetrics({ data }: MetricsGridProps) {
  const total = data.nida.verified + data.nida.pending + data.nida.missing + data.nida.invalid;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {data.nida.verificationRate}%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.nida.verified.toLocaleString()} verified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {data.nida.verified}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {((data.nida.verified / total) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {data.nida.pending}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Awaiting verification</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Missing NIDA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {data.nida.missing}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {((data.nida.missing / total) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Invalid Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {data.nida.invalid}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.nida.blockedApplications} apps blocked
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function TenureMetrics({ data }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.certificate.issued}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Issued to parties</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {data.tenureRight.byStatus.active}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Currently enforced</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Suspended</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {data.tenureRight.byStatus.suspended}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Under review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Terminated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {data.tenureRight.byStatus.terminated}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Revoked</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {data.tenureRight.expiringCertificates}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Action needed</p>
        </CardContent>
      </Card>
    </div>
  );
}
