import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Calendar,
  MapPin,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface Meeting {
  id: string;
  date: string;
  villageName: string;
  summary: string;
  attendance: number;
  attachments: number;
  status: "scheduled" | "completed" | "cancelled";
  location: string;
  facilitator: string;
  agenda: string[];
  outcomes: string[];
}

interface ComplianceState {
  meetings: Meeting[];
  selectedMeetings: string[];
  loading: boolean;
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  villageFilter: string;
  viewMode: "list" | "grid" | "calendar";
  showAddMeeting: boolean;
  editingMeeting: Meeting | null;
}

export default function CompliancePage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<ComplianceState>({
    meetings: [],
    selectedMeetings: [],
    loading: true,
    searchTerm: "",
    statusFilter: "",
    dateFilter: "",
    villageFilter: "",
    viewMode: "list",
    showAddMeeting: false,
    editingMeeting: null,
  });

  useLayoutEffect(() => {
    setPage({
      module: "compliance",
      title: "Compliance & Village Meetings",
      backButton: "Back to Dashboard",
    });
  }, [setPage]);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockMeetings: Meeting[] = [
        {
          id: "1",
          date: "2024-02-25",
          villageName: "Mwanza Village",
          summary: "Land use planning consultation meeting",
          attendance: 45,
          attachments: 3,
          status: "completed",
          location: "Village Hall",
          facilitator: "John Mwita",
          agenda: [
            "Land use planning",
            "CCRO registration",
            "Community concerns",
          ],
          outcomes: [
            "Approved land use plan",
            "Identified 15 new CCRO candidates",
          ],
        },
        {
          id: "2",
          date: "2024-02-28",
          villageName: "Dar es Salaam Village",
          summary: "Compliance monitoring and enforcement",
          attendance: 32,
          attachments: 2,
          status: "scheduled",
          location: "Community Center",
          facilitator: "Sarah Kimambo",
          agenda: [
            "Compliance review",
            "Enforcement actions",
            "Future planning",
          ],
          outcomes: [],
        },
        {
          id: "3",
          date: "2024-03-05",
          villageName: "Arusha Village",
          summary: "Land dispute resolution meeting",
          attendance: 28,
          attachments: 5,
          status: "cancelled",
          location: "District Office",
          facilitator: "Michael Nyerere",
          agenda: ["Dispute resolution", "Mediation process", "Legal guidance"],
          outcomes: [],
        },
      ];

      setState((prev) => ({
        ...prev,
        meetings: mockMeetings,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading meetings:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleMeetingSelection = (meetingId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedMeetings.includes(meetingId);
      const newSelected = isSelected
        ? prev.selectedMeetings.filter((id) => id !== meetingId)
        : [...prev.selectedMeetings, meetingId];

      return {
        ...prev,
        selectedMeetings: newSelected,
      };
    });
  };

  const handleAddMeeting = () => {
    setState((prev) => ({ ...prev, showAddMeeting: true }));
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setState((prev) => ({ ...prev, editingMeeting: meeting }));
  };

  const handleDeleteMeeting = (meetingId: string) => {
    // TODO: Implement delete functionality
    console.log("Deleting meeting:", meetingId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance & Village Meetings</h1>
          <p className="text-muted-foreground">
            Manage village meetings, compliance monitoring, and community
            engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                viewMode: prev.viewMode === "list" ? "grid" : "list",
              }))
            }
          >
            {state.viewMode === "list" ? "Grid View" : "List View"}
          </Button>
          <Button onClick={handleAddMeeting}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meeting
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Meeting Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={state.searchTerm}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                }
                className="pl-10"
              />
            </div>
            <Select
              value={state.statusFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, statusFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Status</SelectItem> */}
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Filter by date"
              value={state.dateFilter}
              onChange={(e) =>
                setState((prev) => ({ ...prev, dateFilter: e.target.value }))
              }
            />
            <Input
              placeholder="Filter by village"
              value={state.villageFilter}
              onChange={(e) =>
                setState((prev) => ({ ...prev, villageFilter: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Meetings</p>
                <p className="text-2xl font-bold">{state.meetings.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {
                    state.meetings.filter((m) => m.status === "scheduled")
                      .length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {
                    state.meetings.filter((m) => m.status === "completed")
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Attendance
                </p>
                <p className="text-2xl font-bold">
                  {state.meetings.reduce((sum, m) => sum + m.attendance, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      {state.viewMode === "list" ? (
        <Card>
          <CardHeader>
            <CardTitle>Village Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <Checkbox
                        checked={
                          state.selectedMeetings.length ===
                          state.meetings.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setState((prev) => ({
                              ...prev,
                              selectedMeetings: state.meetings.map((m) => m.id),
                            }));
                          } else {
                            setState((prev) => ({
                              ...prev,
                              selectedMeetings: [],
                            }));
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">Meeting Date</th>
                    <th className="text-left p-2">Village Name</th>
                    <th className="text-left p-2">Summary</th>
                    <th className="text-left p-2">Attendance</th>
                    <th className="text-left p-2">Attachments</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.meetings.map((meeting) => (
                    <tr key={meeting.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Checkbox
                          checked={state.selectedMeetings.includes(meeting.id)}
                          onCheckedChange={() =>
                            handleMeetingSelection(meeting.id)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(meeting.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-2 font-medium">{meeting.villageName}</td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {meeting.summary}
                      </td>
                      <td className="p-2">{meeting.attendance}</td>
                      <td className="p-2">{meeting.attachments}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(meeting.status)}
                          {getStatusBadge(meeting.status)}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMeeting(meeting)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(meeting.status)}
                    <CardTitle className="text-lg">
                      {meeting.villageName}
                    </CardTitle>
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(meeting.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {meeting.location}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {meeting.summary}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Attendance</p>
                      <p className="font-medium">{meeting.attendance}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Attachments</p>
                      <p className="font-medium">{meeting.attachments}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditMeeting(meeting)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Actions */}
      {state.selectedMeetings.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {state.selectedMeetings.length} meeting(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
