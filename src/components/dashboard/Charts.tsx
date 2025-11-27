import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GRIIDashboardData } from '@/types/grii-dashboard';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

interface ChartsProps {
  data: GRIIDashboardData;
}

// CCRO Pipeline Trend
export const CCROTrendChart: React.FC<ChartsProps> = ({ data }) => {
  const trendData = data?.ccro?.byStage ? [
    { month: 'Current', 
      submitted: data.ccro.byStage.submitted || 0, 
      underReview: data.ccro.byStage.underReview || 0, 
      approved: data.ccro.byStage.approved || 0, 
      issued: data.ccro.byStage.issued || 0 
    }
  ] : [
    { month: 'Current', submitted: 0, underReview: 0, approved: 0, issued: 0 }
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>CCRO Application Trend</CardTitle>
        <CardDescription>Monthly pipeline progression</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="submitted" stroke="#0088FE" />
            <Line type="monotone" dataKey="underReview" stroke="#FFBB28" />
            <Line type="monotone" dataKey="approved" stroke="#82CA9D" />
            <Line type="monotone" dataKey="issued" stroke="#00C49F" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Parcel Distribution by Zone
export const ParcelZoneDistribution: React.FC<ChartsProps> = ({ data }) => {
  if (!data?.parcel) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Parcels by Zone Type</CardTitle>
          <CardDescription>Distribution across land use zones</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  const zoneData = Object.entries(data.parcel.byZone || {}).map(([zone, count]) => ({
    name: zone || 'Unknown',
    value: count as number,
    parcels: count as number
  }));

  if (zoneData.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Parcels by Zone Type</CardTitle>
          <CardDescription>Distribution across land use zones</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
          No zone data available yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Parcels by Zone Type</CardTitle>
        <CardDescription>Distribution across land use zones</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={zoneData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, parcels }) => `${name}: ${parcels.toLocaleString()}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {zoneData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// NIDA Verification Status
export const NidaVerificationChart: React.FC<ChartsProps> = ({ data }) => {
  if (!data?.nida) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>NIDA Verification Status</CardTitle>
          <CardDescription>Verification rate across all applications</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  const total = data.nida.verified + data.nida.pending + data.nida.missing + data.nida.invalid || 1;
  const nidaData = [
    { status: 'Verified', count: data.nida.verified, percentage: (data.nida.verified / total) * 100 },
    { status: 'Pending', count: data.nida.pending, percentage: (data.nida.pending / total) * 100 },
    { status: 'Missing', count: data.nida.missing, percentage: (data.nida.missing / total) * 100 },
    { status: 'Invalid', count: data.nida.invalid, percentage: (data.nida.invalid / total) * 100 },
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>NIDA Verification Status</CardTitle>
        <CardDescription>Verification rate across all applications</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={nidaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#0088FE" name="Count" />
            <Bar yAxisId="right" dataKey="percentage" fill="#82CA9D" name="Percentage %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Tenure Rights Distribution
export const TenureRightsDistribution: React.FC<ChartsProps> = ({ data }) => {
  if (!data?.tenureRight) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Tenure Rights by Type</CardTitle>
          <CardDescription>Distribution of issued certificates</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  const tenureTotal = (data.tenureRight.byRightType?.customary || 0) + 
                         (data.tenureRight.byRightType?.lease || 0) + 
                         (data.tenureRight.byRightType?.joint || 0) + 
                         (data.tenureRight.byRightType?.group || 0) || 1;
  const tenureData = [
    { name: 'Customary', value: data.tenureRight.byRightType?.customary || 0, percentage: ((data.tenureRight.byRightType?.customary || 0) / tenureTotal) * 100 },
    { name: 'Lease', value: data.tenureRight.byRightType?.lease || 0, percentage: ((data.tenureRight.byRightType?.lease || 0) / tenureTotal) * 100 },
    { name: 'Joint', value: data.tenureRight.byRightType?.joint || 0, percentage: ((data.tenureRight.byRightType?.joint || 0) / tenureTotal) * 100 },
    { name: 'Group', value: data.tenureRight.byRightType?.group || 0, percentage: ((data.tenureRight.byRightType?.group || 0) / tenureTotal) * 100 },
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Tenure Rights by Type</CardTitle>
        <CardDescription>Distribution of issued certificates</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={tenureData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {tenureData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Form Submission Trend
export const FormSubmissionTrend: React.FC<ChartsProps> = ({ data }) => {
  // Use real submission data from backend
  const submissionData = data?.dataSubmission?.byStatus ? [
    { day: 'Today', 
      submissions: data.dataSubmission.totalSubmissions || 0, 
      approved: data.dataSubmission.byStatus.approved || 0, 
      rejected: data.dataSubmission.byStatus.rejected || 0 
    }
  ] : [
    { day: 'Today', submissions: 0, approved: 0, rejected: 0 }
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Daily Form Submissions</CardTitle>
        <CardDescription>Weekly submission and approval trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={submissionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="approved" stackId="1" fill="#82CA9D" />
            <Area type="monotone" dataKey="rejected" stackId="1" fill="#FF8042" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Parcel Registration Progress
export const ParcelProgressChart: React.FC<ChartsProps> = ({ data }) => {
  if (!data?.parcel?.byStage) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Parcel Registration Progress</CardTitle>
          <CardDescription>Completion by stage</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  const progressData = [
    { stage: 'Draft', value: data.parcel.byStage.draft },
    { stage: 'GIS Review', value: data.parcel.byStage.gisApproval },
    { stage: 'Registered', value: data.parcel.byStage.registered },
    { stage: 'Printed', value: data.parcel.byStage.printed },
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Parcel Registration Progress</CardTitle>
        <CardDescription>Completion by stage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0088FE">
              {progressData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Locality Coverage
export const LocalityCoverageChart: React.FC<ChartsProps> = ({ data }) => {
  const localityData = data?.parcel?.byLocality && Object.keys(data.parcel.byLocality).length > 0
    ? Object.entries(data.parcel.byLocality).map(([locality, parcels]) => ({
        locality,
        parcels: parcels as number,
        percentage: ((parcels as number) / (data.parcel?.total || 1)) * 100
      })).slice(0, 6)
    : [];

  if (localityData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Geographic Coverage by Locality</CardTitle>
          <CardDescription>Parcel registration distribution</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
          No locality data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Geographic Coverage by Locality</CardTitle>
        <CardDescription>Parcel registration distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={localityData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="locality" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="parcels" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// User Activity Heatmap (as Bar Chart)
export const UserActivityChart: React.FC<ChartsProps> = ({ data }) => {
  const activityData = data?.user?.totalUsers ? [
    { hour: 'Active Users', active: data.user.activeUsers || 0 },
  ] : [
    { hour: 'Active Users', active: 0 }
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>System Activity by Hour</CardTitle>
        <CardDescription>Real-time user activity pattern</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="active" fill="#82CA9D" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Data Quality Metrics Over Time
export const DataQualityTrendChart: React.FC<ChartsProps> = ({ data }) => {
  const qualityData = data?.dataQuality ? [
    { month: 'Current', 
      completeness: data.dataQuality.completeness || 0, 
      validation: data.dataQuality.validationPassRate || 0, 
      duplicates: data.dataQuality.duplicates || 0 
    }
  ] : [
    { month: 'Current', completeness: 0, validation: 0, duplicates: 0 }
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Data Quality Improvement Trend</CardTitle>
        <CardDescription>Quality metrics over the last 5 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={qualityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completeness" stroke="#82CA9D" strokeWidth={2} />
            <Line type="monotone" dataKey="validation" stroke="#0088FE" strokeWidth={2} />
            <Line type="monotone" dataKey="duplicates" stroke="#FF8042" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Project Budget Allocation
export const ProjectBudgetChart: React.FC<ChartsProps> = ({ data }) => {
  const budgetData = data?.project?.totalBudget ? [
    { project: 'Total Budget', allocated: data.project.totalBudget || 0, spent: 0 }
  ] : [
    { project: 'Total Budget', allocated: 0, spent: 0 }
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Project Budget vs Actual Spending</CardTitle>
        <CardDescription>Budget allocation and expenditure ($M)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="project" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="allocated" fill="#0088FE" name="Allocated" />
            <Bar dataKey="spent" fill="#82CA9D" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// System Performance Metrics
export const SystemPerformanceChart: React.FC<ChartsProps> = ({ data }) => {
  const performanceData = data?.efficiency?.systemUptime 
    ? [{ metric: 'System Uptime', value: data.efficiency.systemUptime }]
    : [];

  if (performanceData.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>System Performance Score</CardTitle>
          <CardDescription>Overall system health metrics (%)</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
          No performance data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>System Performance Score</CardTitle>
        <CardDescription>Overall system health metrics (%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="metric" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="value" fill="#82CA9D">
              {performanceData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 95 ? '#00C49F' : entry.value >= 90 ? '#FFBB28' : '#FF8042'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
