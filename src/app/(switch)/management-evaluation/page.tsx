import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  MapPin,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Satellite,
  Map,
  Download,
  FileText,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Page {
  onNavigateToSubModule: (subModule: string) => void;
  onCreateNew: (type: string) => void;
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "management-evaluation",
      title: "Monitoring & Evaluation",
    });
  }, [setPage]);

  // Mock data for M&E Dashboard
  const kpiData = {
    villagesMonitored: 156,
    totalVillages: 234,
    indicatorIncrease: 23,
    reportsGenerated: 48,
    upcomingActivities: 7
  };

  const villageData = [
    { name: 'Mwanga Village', region: 'Kilimanjaro', status: 'Completed', lastMonitored: '2024-01-15', reportLink: 'MEV-2024-001' },
    { name: 'Dodoma Central', region: 'Dodoma', status: 'Pending', lastMonitored: '2024-01-08', reportLink: null },
    { name: 'Arusha Highlands', region: 'Arusha', status: 'Completed', lastMonitored: '2024-01-12', reportLink: 'MEV-2024-002' },
    { name: 'Mwanza Lake', region: 'Mwanza', status: 'In Progress', lastMonitored: '2024-01-10', reportLink: null },
    { name: 'Dar Port Area', region: 'Dar es Salaam', status: 'Completed', lastMonitored: '2024-01-14', reportLink: 'MEV-2024-003' }
  ];

  const indicatorTrends = [
    { indicator: 'Livestock Count', baseline: 2500, current: 3200, change: 28, trend: 'up' },
    { indicator: 'Crop Yield (tons)', baseline: 1200, current: 1580, change: 32, trend: 'up' },
    { indicator: 'Forest Cover (%)', baseline: 65, current: 58, change: -11, trend: 'down' },
    { indicator: 'Water Access (%)', baseline: 45, current: 67, change: 49, trend: 'up' },
    { indicator: 'Population', baseline: 8500, current: 9200, change: 8, trend: 'up' }
  ];

  const changeDetection = [
    { area: 'Mwanga Forest', type: 'Forest Loss', size: '24 hectares', date: '2024-01-10', severity: 'Medium' },
    { area: 'Dodoma Infrastructure', type: 'New Roads', size: '12 km', date: '2024-01-12', severity: 'Low' },
    { area: 'Arusha Settlement', type: 'New Buildings', size: '8 structures', date: '2024-01-14', severity: 'Low' },
    { area: 'Mwanza Agriculture', type: 'Crop Expansion', size: '45 hectares', date: '2024-01-08', severity: 'Medium' }
  ];

  const projections = [
    { indicator: 'Forest Cover', current: 58, projected2025: 52, projected2027: 47, confidence: 85 },
    { indicator: 'Population Growth', current: 9200, projected2025: 10500, projected2027: 12200, confidence: 92 },
    { indicator: 'Agricultural Yield', current: 1580, projected2025: 1850, projected2027: 2150, confidence: 78 }
  ];

  const filteredVillageData = villageData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase().replace(' ', '') === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monitoring & Evaluation</h2>
          <p className="text-muted-foreground">Track progress and measure impact of land use planning initiatives</p>
        </div>
        <Button 
          onClick={() => {}}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Indicator
        </Button>
      </div>

      {/* KPI Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Villages Monitored</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.villagesMonitored}</div>
            <p className="text-xs text-muted-foreground">
              vs {kpiData.totalVillages} Total
            </p>
            <Progress value={(kpiData.villagesMonitored / kpiData.totalVillages) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicator Increase</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpiData.indicatorIncrease}%</div>
            <p className="text-xs text-muted-foreground">
              Key indicators improved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.reportsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.upcomingActivities}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">67%</div>
            <Progress value={67} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">Monitoring Map</TabsTrigger>
          <TabsTrigger value="villages">Village Tracking</TabsTrigger>
          <TabsTrigger value="indicators">Indicator Trends</TabsTrigger>
          <TabsTrigger value="changes">Change Detection</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="reports">Report Management</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Monitoring Map */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Village Monitoring Status
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    <Map className="h-4 w-4 mr-1" />
                    Full Map
                  </Button>
                </div>
                <CardDescription>Real-time infrastructure and monitoring status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Interactive M&E monitoring map</p>
                    <p className="text-sm text-muted-foreground">Green: M&E Done • Yellow: In Progress • Red: Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Detection Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5" />
                  Change Detection
                </CardTitle>
                <CardDescription>Recent satellite-detected changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {changeDetection.slice(0, 3).map((change, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{change.area}</span>
                        <Badge variant={change.severity === 'Medium' ? 'secondary' : 'outline'}>
                          {change.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {change.type} • {change.size}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => {}}>
                  View All Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="villages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Village Tracking Table</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search villages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inprogress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-4 p-3 bg-muted rounded-lg text-sm font-medium">
                  <div>Village Name</div>
                  <div>Region</div>
                  <div>M&E Status</div>
                  <div>Last Monitored</div>
                  <div>Report Link</div>
                </div>
                {filteredVillageData.map((village, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 p-3 border border-border rounded-lg text-sm">
                    <div className="font-medium">{village.name}</div>
                    <div>{village.region}</div>
                    <div>
                      <Badge 
                        variant={
                          village.status === 'Completed' ? 'default' :
                          village.status === 'In Progress' ? 'secondary' :
                          'outline'
                        }
                      >
                        {village.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">{village.lastMonitored}</div>
                    <div>
                      {village.reportLink ? (
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          {village.reportLink}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indicator Trends Graph</CardTitle>
              <CardDescription>Key indicator changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indicatorTrends.map((indicator, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{indicator.indicator}</div>
                      <div className="text-sm text-muted-foreground">
                        Baseline: {indicator.baseline} → Current: {indicator.current}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-4 w-4 ${indicator.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`font-medium ${indicator.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {indicator.change > 0 ? '+' : ''}{indicator.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Satellite Change Detection</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Satellite className="h-4 w-4 mr-1" />
                  New Analysis
                </Button>
              </div>
              <CardDescription>Timeline view of key changes in mapped areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changeDetection.map((change, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium">{change.area}</div>
                      <div className="text-sm text-muted-foreground">
                        {change.type} • {change.size} • {change.date}
                      </div>
                    </div>
                    <Badge variant={change.severity === 'Medium' ? 'secondary' : 'outline'}>
                      {change.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projection Visualizer</CardTitle>
              <CardDescription>Future projections based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projections.map((projection, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{projection.indicator}</span>
                      <Badge variant="outline">Confidence: {projection.confidence}%</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">Current</div>
                        <div>{typeof projection.current === 'number' && projection.current > 100 ? projection.current.toLocaleString() : projection.current}</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-medium">2025</div>
                        <div>{typeof projection.projected2025 === 'number' && projection.projected2025 > 100 ? projection.projected2025.toLocaleString() : projection.projected2025}</div>
                      </div>
                      <div className="text-center p-2 bg-blue-100 rounded">
                        <div className="font-medium">2027</div>
                        <div>{typeof projection.projected2027 === 'number' && projection.projected2027 > 100 ? projection.projected2027.toLocaleString() : projection.projected2027}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Report Management Panel</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Plus className="h-4 w-4 mr-1" />
                  Generate Report
                </Button>
              </div>
              <CardDescription>Recent reports, drafts, and exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 border border-border rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="font-medium">12 Recent Reports</div>
                  <div className="text-sm text-muted-foreground">Published this month</div>
                </div>
                <div className="text-center p-6 border border-border rounded-lg">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="font-medium">3 Draft Reports</div>
                  <div className="text-sm text-muted-foreground">In progress</div>
                </div>
                <div className="text-center p-6 border border-border rounded-lg">
                  <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="font-medium">Export Options</div>
                  <div className="text-sm text-muted-foreground">PDF, Excel, Word</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}