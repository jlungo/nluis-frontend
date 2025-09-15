import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Upload, User, CheckCircle, AlertTriangle, MapPin, Clock, Download, Phone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Zone {
  id: string;
  type: string;
  status: string;
  lastModified: string;
}

interface DataCollectorUpload {
  id: string;
  collectorName: string;
  collectorId: string;
  deviceId: string;
  uploadTime: string;
  location: string;
  zonesUploaded: number;
  status: 'uploaded' | 'processing' | 'approved' | 'rejected';
  zoneIds: string[];
  notes?: string;
}

interface ZoneHistoryEntry {
  id: string;
  action: string;
  user: string;
  userRole: string;
  timestamp: string;
  details: string;
  source: 'field_upload' | 'desktop_edit' | 'review_process' | 'system';
}

interface HistoryPanelProps {
  zones: Zone[];
  activeZone?: string | null;
}

const mockDataCollectorUploads: DataCollectorUpload[] = [
  {
    id: 'upload-1',
    collectorName: 'Sarah Wilson',
    collectorId: 'FC-001',
    deviceId: 'tablet-789',
    uploadTime: '2025-09-11 08:30',
    location: 'Pwani District - North Sector',
    zonesUploaded: 3,
    status: 'approved',
    zoneIds: ['zone-1', 'zone-2', 'zone-3'],
    notes: 'Morning collection round - agricultural zones verified'
  },
  {
    id: 'upload-2',
    collectorName: 'John Mapesa',
    collectorId: 'FC-002',
    deviceId: 'phone-456',
    uploadTime: '2025-09-11 14:45',
    location: 'Pwani District - Central Area',
    zonesUploaded: 2,
    status: 'processing',
    zoneIds: ['zone-4', 'zone-5'],
    notes: 'Residential area mapping - needs boundary verification'
  },
  {
    id: 'upload-3',
    collectorName: 'Maria Santos',
    collectorId: 'FC-003',
    deviceId: 'tablet-123',
    uploadTime: '2025-09-10 16:20',
    location: 'Pwani District - Coastal Zone',
    zonesUploaded: 1,
    status: 'rejected',
    zoneIds: ['zone-6'],
    notes: 'GPS accuracy issues - needs re-collection'
  },
  {
    id: 'upload-4',
    collectorName: 'Ahmed Hassan',
    collectorId: 'FC-004',
    deviceId: 'tablet-345',
    uploadTime: '2025-09-10 11:15',
    location: 'Pwani District - Industrial Area',
    zonesUploaded: 4,
    status: 'uploaded',
    zoneIds: ['zone-7', 'zone-8', 'zone-9', 'zone-10'],
    notes: 'Industrial zone survey completed'
  }
];

const mockZoneHistory: { [zoneId: string]: ZoneHistoryEntry[] } = {
  'zone-1': [
    {
      id: 'zh-1-1',
      action: 'Zone Created',
      user: 'Sarah Wilson',
      userRole: 'Field Collector',
      timestamp: '2025-09-11 08:30',
      details: 'Initial zone boundary captured via mobile app',
      source: 'field_upload'
    },
    {
      id: 'zh-1-2',
      action: 'Boundary Refined',
      user: 'Mike Johnson',
      userRole: 'GIS Specialist',
      timestamp: '2025-09-11 10:15',
      details: 'Adjusted boundary precision using desktop tools',
      source: 'desktop_edit'
    },
    {
      id: 'zh-1-3',
      action: 'Status Changed',
      user: 'Admin User',
      userRole: 'Reviewer',
      timestamp: '2025-09-11 12:00',
      details: 'Status changed from Draft to Approved',
      source: 'review_process'
    }
  ],
  'zone-2': [
    {
      id: 'zh-2-1',
      action: 'Zone Created',
      user: 'Sarah Wilson',
      userRole: 'Field Collector',
      timestamp: '2025-09-11 08:45',
      details: 'Residential zone mapped with attribute data',
      source: 'field_upload'
    },
    {
      id: 'zh-2-2',
      action: 'Attributes Updated',
      user: 'Sarah Wilson',
      userRole: 'Field Collector',
      timestamp: '2025-09-11 09:00',
      details: 'Added owner information and land use details',
      source: 'field_upload'
    }
  ]
};

export function HistoryPanel({ zones, activeZone }: HistoryPanelProps) {
  const [viewMode, setViewMode] = useState<'uploads' | 'zone_history'>('uploads');

  const getUploadStatusIcon = (status: DataCollectorUpload['status']) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'processing': return AlertTriangle;
      case 'rejected': return AlertTriangle;
      case 'uploaded': return Upload;
      default: return Upload;
    }
  };

  const getUploadStatusColor = (status: DataCollectorUpload['status']) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'processing': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      case 'uploaded': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSourceIcon = (source: ZoneHistoryEntry['source']) => {
    switch (source) {
      case 'field_upload': return Phone;
      case 'desktop_edit': return MapPin;
      case 'review_process': return CheckCircle;
      case 'system': return Clock;
      default: return Clock;
    }
  };

  const handleDownloadUpload = (uploadId: string) => {
    toast.success(`Downloading data from upload ${uploadId}`);
  };

  const handleReprocessUpload = (uploadId: string) => {
    toast.info(`Reprocessing upload ${uploadId}...`);
  };

  // If a zone is selected, show zone-specific history
  if (activeZone && viewMode === 'zone_history') {
    const zoneHistory = mockZoneHistory[activeZone] || [];
    const zone = zones.find(z => z.id === activeZone);

    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3>Zone History</h3>
              <p className="text-sm text-muted-foreground">
                History for {zone?.type} Zone {activeZone}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('uploads')}
            >
              View All Uploads
            </Button>
          </div>

          <Separator />

          {/* Zone History Timeline */}
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3">
              {zoneHistory.length > 0 ? (
                zoneHistory.map((entry, index) => {
                  const Icon = getSourceIcon(entry.source);
                  const isLatest = index === 0;
                  
                  return (
                    <Card key={entry.id} className={isLatest ? 'border-primary' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <CardTitle className="text-sm">{entry.action}</CardTitle>
                          </div>
                          <Badge variant={isLatest ? 'default' : 'outline'}>
                            {entry.source.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{entry.user} ({entry.userRole})</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{entry.timestamp}</span>
                        </div>

                        <p className="text-sm">{entry.details}</p>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No history available for this zone</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3>Data Collection History</h3>
            <p className="text-sm text-muted-foreground">
              Field collector uploads and processing status
            </p>
          </div>
          {activeZone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('zone_history')}
            >
              Zone History
            </Button>
          )}
        </div>

        <Separator />

        {/* Upload History */}
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-3">
            {mockDataCollectorUploads.map((upload, _index) => {
              const StatusIcon = getUploadStatusIcon(upload.status);
              const statusColor = getUploadStatusColor(upload.status);
              
              return (
                <Card key={upload.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                        <div>
                          <CardTitle className="text-sm">{upload.collectorName}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            ID: {upload.collectorId} | Device: {upload.deviceId}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          upload.status === 'approved' ? 'default' :
                          upload.status === 'processing' ? 'secondary' :
                          upload.status === 'rejected' ? 'destructive' : 'outline'
                        }
                      >
                        {upload.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Upload Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Upload Time:</span>
                        <p>{upload.uploadTime}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Zones:</span>
                        <p>{upload.zonesUploaded} zones</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Location:</span>
                        <p>{upload.location}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {upload.notes && (
                      <div>
                        <span className="text-sm text-muted-foreground">Notes:</span>
                        <p className="text-sm">{upload.notes}</p>
                      </div>
                    )}

                    {/* Zone IDs */}
                    <div>
                      <span className="text-sm text-muted-foreground">Zone IDs:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {upload.zoneIds.map(zoneId => (
                          <Badge key={zoneId} variant="outline" className="text-xs">
                            {zoneId}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadUpload(upload.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {upload.status === 'rejected' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReprocessUpload(upload.id)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Reprocess
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {mockDataCollectorUploads.filter(u => u.status === 'approved').length}
                </p>
                <p className="text-muted-foreground">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {mockDataCollectorUploads.filter(u => u.status === 'processing').length}
                </p>
                <p className="text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}