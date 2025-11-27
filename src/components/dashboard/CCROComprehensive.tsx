import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GRIIDashboardData } from '@/types/grii-dashboard';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CCROComprehensiveProps {
  data: GRIIDashboardData;
  ccroApplications?: any[];
}

const STATUS_COLORS: Record<string, string> = {
  submitted: '#FFA726',
  under_review: '#FFA726',
  approved: '#42A5F5',
  issued: '#66BB6A',
  rejected: '#EF5350',
  pending: '#999',
};

const getStatusColor = (status: string) => STATUS_COLORS[status.toLowerCase().replace(/ /g, '_')] || '#999';

export const CCROComprehensive: React.FC<CCROComprehensiveProps> = ({ data, ccroApplications = [] }) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Get CCRO and NIDA statistics
  const ccroStats = data?.ccro;
  const nidaStats = data?.nida;
  
  const byStatus = ccroStats?.byStage || {
    submitted: 0,
    underReview: 0,
    approved: 0,
    issued: 0,
    rejected: 0,
  };

  // Convert status counts to chart data
  const statusChartData = Object.entries(byStatus).map(([status, count]) => ({
    name: status.replace(/([A-Z])/g, ' $1').trim(),
    value: count as number,
    status: status,
  }));

  // Filter applications if data provided
  const filteredApplications = ccroApplications.filter(app => {
    if (selectedStatus && app.status !== selectedStatus) return false;
    if (selectedType && app.application_type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ccroStats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{byStatus.issued || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{byStatus.underReview || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">NIDA Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{nidaStats?.verified || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Verification Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nidaStats?.verificationRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Status</CardTitle>
            <CardDescription>Distribution across all statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={getStatusColor(entry.status)} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NIDA Verification */}
        <Card>
          <CardHeader>
            <CardTitle>NIDA Verification Status</CardTitle>
            <CardDescription>Verification breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Verified', value: nidaStats?.verified || 0 },
                { name: 'Pending', value: nidaStats?.pending || 0 },
                { name: 'Missing', value: nidaStats?.missing || 0 },
                { name: 'Invalid', value: nidaStats?.invalid || 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Count by Status</CardTitle>
          <CardDescription>Detailed breakdown of all statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {statusChartData.map((entry, idx) => (
                  <Cell 
                    key={`bar-${idx}`} 
                    fill={getStatusColor(entry.status)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Application List with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All CCRO Applications</CardTitle>
          <CardDescription>
            Showing {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <Tabs defaultValue="all" className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger 
                value="all"
                onClick={() => {
                  setSelectedStatus(null);
                  setSelectedType(null);
                }}
              >
                All ({ccroStats?.total || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="issued"
                onClick={() => setSelectedStatus('issued')}
              >
                Issued ({byStatus.issued || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="approved"
                onClick={() => setSelectedStatus('approved')}
              >
                Approved ({byStatus.approved || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="review"
                onClick={() => setSelectedStatus('under_review')}
              >
                In Review ({byStatus.underReview || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="submitted"
                onClick={() => setSelectedStatus('submitted')}
              >
                Submitted ({byStatus.submitted || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="rejected"
                onClick={() => setSelectedStatus('rejected')}
              >
                Rejected ({byStatus.rejected || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Application Table */}
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Application ID</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">NIDA Status</th>
                    <th className="text-left py-2 px-2">Applicant</th>
                    <th className="text-left py-2 px-2">Submitted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.slice(0, 20).map((app: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium">{app.id || app.application_id || 'N/A'}</td>
                      <td className="py-2 px-2">
                        <Badge style={{ backgroundColor: getStatusColor(app.status || '') }}>
                          {app.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">{app.application_type || app.type || 'N/A'}</td>
                      <td className="py-2 px-2">
                        <Badge variant={app.nida_verified ? 'default' : 'secondary'}>
                          {app.nida_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">{app.applicant_name || app.applicant || 'N/A'}</td>
                      <td className="py-2 px-2 text-xs">
                        {app.submitted_date ? new Date(app.submitted_date).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredApplications.length > 20 && (
                <div className="text-center py-4 text-gray-500">
                  Showing 20 of {filteredApplications.length} applications
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No applications found matching the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Breakdown</CardTitle>
          <CardDescription>Detailed statistics by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(byStatus).map(([status, count]) => (
              <div
                key={status}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedStatus(status)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{status.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-2xl font-bold">{count as number}</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getStatusColor(status) + '20' }}
                  >
                    <span style={{ color: getStatusColor(status) }} className="text-lg font-semibold">
                      {count as number}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CCROComprehensive;
