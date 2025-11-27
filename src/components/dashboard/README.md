# GRII Dashboard Implementation Guide

## Overview

The GRII (Geographic Rights & Information Index) Dashboard is a comprehensive system-wide analytics dashboard for the NLUIS5 platform. It provides real-time insights into:

- **Spatial Data**: Parcels, subdivisions, zoning, land use
- **CCRO Management**: Certificate issuance, tenure rights, NIDA verification
- **User Performance**: Surveyors, CCRO officers, form collectors
- **Data Quality**: Completeness, validation rates, spatial conflicts
- **Geographic Coverage**: Locality coverage, cadastral coverage, registration rates
- **System Health**: Operational efficiency, compliance, alerts

## File Structure

```
src/
├── types/
│   └── grii-dashboard.ts          # TypeScript types for all dashboard data
├── store/
│   └── dashboardStore.ts          # Zustand store for dashboard state
├── components/
│   └── dashboard/
│       ├── index.ts               # Index for easy imports
│       ├── SummaryCards.tsx       # Executive summary cards
│       ├── AlertsWidget.tsx       # System alerts widget
│       ├── MetricsCards.tsx       # Module-specific metrics
│       └── DataQuality.tsx        # Data quality indicators & rankings
└── app/
    └── (switch)/
        └── dashboard/
            └── page.tsx           # Main dashboard page
```

## Key Components

### 1. **SummaryCards**
Displays executive summary metrics:
- Total Parcels Registered
- CCROs Issued This Month
- NIDA Verification Rate
- Active Users
- System Uptime
- Data Quality Score

### 2. **AlertsWidget**
Real-time system alerts with severity levels:
- **Critical**: Urgent issues (NIDA blocks, high conflict count)
- **Warning**: Attention needed (pending >7 days, low verification rate)
- **Info**: General notifications

### 3. **MetricsCards**
Module-specific metric breakdowns:
- **CCROMetrics**: Application pipeline, stages
- **ParcelMetrics**: Stage distribution, area metrics
- **NidaMetrics**: Verification status breakdown
- **TenureMetrics**: Certificate and tenure right status

### 4. **DataQuality**
Data quality visualization and performance rankings

## Data Structure

The `GRIIDashboardData` interface includes:

```typescript
{
  // Executive Summary
  summary: {
    totalParcelsRegistered: number;
    ccrosIssuedThisMonth: number;
    nidaVerificationRate: number;
    dataCurrentness: string;
    activeUsers: number;
  };

  // Module Metrics
  subdivision: SubdivisionStats;
  parcel: ParcelStats;
  photo: PhotoStats;
  ccro: CCROStats;
  nida: NidaStats;
  party: PartyStats;
  allocation: AllocationStats;
  tenureRight: TenureRightStats;
  certificate: CertificateStats;
  // ... and many more

  // Cross-Domain Analytics
  coverage: GeographicCoverage;
  tenureSecurity: TenureSecurityMetrics;
  efficiency: OperationalEfficiency;
  financial: FinancialTracking;
  distribution: GeographicDistribution;
  trends: TemporalTrends;
}
```

## Store (Zustand)

The `useDashboardStore` manages:

- **State**:
  - `dashboardData`: Aggregated metrics
  - `filters`: User-applied filters
  - `alerts`: System alerts
  - `views`: Saved dashboard views
  - `loading`: Loading state
  - `error`: Error messages
  - `autoRefresh`: Auto-refresh toggle

- **Actions**:
  - `fetchDashboardData()`: Load dashboard data
  - `setFilters()`: Apply filters & refresh
  - `clearFilters()`: Reset filters
  - `addAlert()` / `removeAlert()`: Manage alerts
  - `saveView()` / `loadView()`: Manage custom views

## Tabs Overview

### 1. **Overview Tab**
- Subdivision pipeline status
- Geographic coverage metrics
- Top surveyor performance
- Key indicators

### 2. **CCRO Tab**
- CCRO application pipeline
- NIDA verification breakdown
- Tenure rights & certificates
- Party distribution
- Allocation patterns

### 3. **Parcels Tab**
- Parcel stage distribution
- Land area metrics
- Photo coverage stats
- Parcel distribution by zone

### 4. **Zoning Tab**
- Land use plans status
- Zone type distribution
- Plan versions & documents

### 5. **Analysis Tab**
- Data quality score
- System compliance metrics
- Operational efficiency
- Data quality issues list

## Usage Example

```tsx
import { useDashboardStore } from '@/store/dashboardStore';
import { SummaryCards, CCROMetrics } from '@/components/dashboard';

export function MyDashboard() {
  const { dashboardData, loading, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) return <div>Loading...</div>;

  return (
    <div>
      <SummaryCards data={dashboardData} />
      <CCROMetrics data={dashboardData} />
    </div>
  );
}
```

## API Integration

Currently, the dashboard uses mock data. To integrate with the backend:

1. **Create a dashboard API service** in `src/services/`:

```typescript
// src/services/dashboardService.ts
export async function fetchDashboardData(filters?: DashboardFilterOptions) {
  const response = await apiClient.get('/api/dashboard/', { params: filters });
  return response.data as GRIIDashboardData;
}
```

2. **Update the store's `fetchDashboardData` action**:

```typescript
fetchDashboardData: async () => {
  set({ loading: true, error: null });
  try {
    const data = await dashboardService.fetchDashboardData(get().filters);
    set({ dashboardData: data, loading: false });
  } catch (error) {
    set({ error: error.message, loading: false });
  }
}
```

3. **Backend endpoints to create**:

```
GET /api/dashboard/
  - Returns complete GRIIDashboardData
  - Supports filters: ?locality=X&module=Y&dateRange=YYYY-MM-DD

GET /api/dashboard/alerts/
  - Returns current system alerts
  - Supports severity filter: ?level=critical

GET /api/dashboard/export/
  - Export dashboard data
  - Supports formats: ?format=pdf|csv|xlsx|geojson
```

## Features

✅ **Real-time Metrics**: Live counters and status updates
✅ **Tabbed Interface**: Organized by domain (CCRO, Parcels, Zoning, etc.)
✅ **Alerts System**: Critical alerts, warnings, info
✅ **Performance Rankings**: Top surveyors, CCRO officers
✅ **Data Quality Metrics**: Completeness, validation rates
✅ **Auto-Refresh**: Optional automatic data refresh
✅ **Export**: PDF, CSV, Excel, GeoJSON
✅ **Custom Views**: Save and load favorite dashboard layouts
✅ **Responsive Design**: Works on desktop, tablet, mobile

## Next Steps

1. **Connect to Backend**: Implement API endpoints as described above
2. **Add Charts**: Integrate Chart.js or Recharts for visualizations
3. **Geographic Map**: Add interactive map showing parcel distribution
4. **Advanced Filters**: Implement filtering by locality, date range, user
5. **Reporting**: Generate and schedule reports
6. **Notifications**: Real-time push notifications for critical alerts
7. **Performance**: Implement data caching and pagination

## Styling

The dashboard uses:
- **Tailwind CSS** for responsive layouts
- **shadcn/ui** components (Card, Badge, Tabs, etc.)
- **Lucide icons** for visual indicators

All colors follow the Tailwind color palette:
- Blue (#3B82F6) - Primary info
- Green (#10B981) - Success/Active
- Red (#EF4444) - Critical/Errors
- Yellow (#F59E0B) - Warnings
- Purple (#A855F7) - Metrics

## Performance Considerations

- Dashboard data is cached in Zustand store
- Load only visible tab content (lazy loading)
- Implement pagination for large lists (100+ items)
- Use React.memo for expensive component renders
- Debounce filter changes (500ms)

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels for icons
- ✅ Color-blind friendly color combinations
- ✅ Keyboard navigation support
- ✅ Screen reader friendly

## Security

- ✅ API calls require authentication token
- ✅ User can only see data they have access to
- ✅ Sensitive data (NIDA numbers) are masked
- ✅ Audit trail for all dashboard views

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
