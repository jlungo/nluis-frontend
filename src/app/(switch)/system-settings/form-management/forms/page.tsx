import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye } from "lucide-react";

interface FormField {
  id: string;
  name: string;
  type:
  | "text"
  | "number"
  | "email"
  | "tel"
  | "date"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "location";
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
  order: number;
}

interface Form {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  responses: number;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "active" | "inactive";
}

interface Questionnaire {
  id: string;
  name: string;
  description: string;
  forms: Form[];
  totalResponses: number;
  status: "draft" | "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface FormResponse {
  id: string;
  formId: string;
  respondent: string;
  location: string;
  answers: Record<string, string | number | boolean>;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface DynamicFormsState {
  questionnaires: Questionnaire[];
  forms: Form[];
  responses: FormResponse[];
  selectedQuestionnaire: string | null;
  selectedForm: string | null;
  currentView: "questionnaires" | "forms" | "responses" | "builder";
  searchTerm: string;
  statusFilter: string;
  loading: boolean;
  showFormBuilder: boolean;
  editingForm: Form | null;
  formBuilderFields: FormField[];
  viewMode: "list" | "grid" | "table";
  analysisView: "bar" | "pie" | "table";
}

export default function Page() {
  const [state, setState] = useState<DynamicFormsState>({
    questionnaires: [],
    forms: [],
    responses: [],
    selectedQuestionnaire: null,
    selectedForm: null,
    currentView: "questionnaires",
    searchTerm: "",
    statusFilter: "",
    loading: true,
    showFormBuilder: false,
    editingForm: null,
    formBuilderFields: [],
    viewMode: "list",
    analysisView: "table",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockQuestionnaires: Questionnaire[] = [
        {
          id: "Q001",
          name: "Land Use Survey",
          description: "Comprehensive land use assessment questionnaire",
          forms: [
            {
              id: "F001",
              name: "Basic Information",
              description: "Collect basic land information",
              fields: [
                {
                  id: "field1",
                  name: "Land Owner Name",
                  type: "text",
                  required: true,
                  placeholder: "Enter land owner name",
                  order: 1,
                },
                {
                  id: "field2",
                  name: "Land Area",
                  type: "number",
                  required: true,
                  placeholder: "Enter area in hectares",
                  order: 2,
                },
                {
                  id: "field3",
                  name: "Land Use Type",
                  type: "select",
                  required: true,
                  options: [
                    "Residential",
                    "Commercial",
                    "Agricultural",
                    "Industrial",
                  ],
                  order: 3,
                },
              ],
              responses: 45,
              createdAt: "2024-01-15",
              updatedAt: "2024-02-20",
              status: "active",
            },
          ],
          totalResponses: 77,
          status: "active",
          createdAt: "2024-01-15",
          updatedAt: "2024-02-20",
        },
      ];

      setState((prev) => ({
        ...prev,
        questionnaires: mockQuestionnaires,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading data:", error);
      setState((prev) => ({ ...prev, loading: false }));
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
          <h1 className="text-2xl font-bold">Dynamic Forms & Questionnaires</h1>
          <p className="text-muted-foreground">
            Create and manage dynamic forms for data collection
          </p>
        </div>
        <Button onClick={() => { }}>
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </div>

      {/* Questionnaires List */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.questionnaires.map((questionnaire) => (
              <Card
                key={questionnaire.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {questionnaire.name}
                    </CardTitle>
                    <Badge variant="default">{questionnaire.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {questionnaire.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Forms</p>
                      <p className="font-medium">
                        {questionnaire.forms.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Responses</p>
                      <p className="font-medium">
                        {questionnaire.totalResponses}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
