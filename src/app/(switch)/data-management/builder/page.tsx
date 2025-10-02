import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Trash2,
  Save,
  FormInput,
  Type,
  Hash,
  Calendar,
  Image,
  File,
  CheckSquare,
  Square,
  List,
  Database,
  Eye,
  Copy,
} from "lucide-react";

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
  status: "draft" | "active" | "inactive";
}

interface FormBuilderState {
  form: Form;
  currentField: FormField | null;
  previewMode: boolean;
  loading: boolean;
}

export default function FormBuilderPage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<FormBuilderState>({
    form: {
      id: "form_" + Date.now(),
      name: "",
      description: "",
      fields: [],
      status: "draft",
    },
    currentField: null,
    previewMode: false,
    loading: false,
  });

  useLayoutEffect(() => {
    setPage({
      module: "system-settings",
      title: "Form Builder",
    });
  }, [setPage]);

  const addField = () => {
    const newField: FormField = {
      id: "field_" + Date.now(),
      name: "",
      type: "text",
      required: false,
      order: state.form.fields.length + 1,
    };

    setState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        fields: [...prev.form.fields, newField],
      },
      currentField: newField,
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        fields: prev.form.fields.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
      },
    }));
  };

  const removeField = (fieldId: string) => {
    setState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        fields: prev.form.fields.filter((field) => field.id !== fieldId),
      },
    }));
  };

  const duplicateField = (field: FormField) => {
    const newField: FormField = {
      ...field,
      id: "field_" + Date.now(),
      name: field.name + " (Copy)",
      order: state.form.fields.length + 1,
    };

    setState((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        fields: [...prev.form.fields, newField],
      },
    }));
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />;
      case "number":
        return <Hash className="h-4 w-4" />;
      case "date":
        return <Calendar className="h-4 w-4" />;
      case "textarea":
        return <FormInput className="h-4 w-4" />;
      case "select":
        return <List className="h-4 w-4" />;
      case "checkbox":
        return <CheckSquare className="h-4 w-4" />;
      case "radio":
        return <Square className="h-4 w-4" />;
      case "file":
        return <File className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      case "location":
        return <Database className="h-4 w-4" />;
      default:
        return <FormInput className="h-4 w-4" />;
    }
  };

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={
              field.placeholder || `Enter ${field.name.toLowerCase()}`
            }
            disabled
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder={
              field.placeholder || `Enter ${field.name.toLowerCase()}`
            }
            disabled
          />
        );
      case "email":
        return (
          <Input
            type="email"
            placeholder={
              field.placeholder || `Enter ${field.name.toLowerCase()}`
            }
            disabled
          />
        );
      case "tel":
        return (
          <Input
            type="tel"
            placeholder={
              field.placeholder || `Enter ${field.name.toLowerCase()}`
            }
            disabled
          />
        );
      case "date":
        return <Input type="date" disabled />;
      case "textarea":
        return (
          <Textarea
            placeholder={
              field.placeholder || `Enter ${field.name.toLowerCase()}`
            }
            disabled
          />
        );
      case "select":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  field.placeholder || `Select ${field.name.toLowerCase()}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <label className="text-sm">{field.name}</label>
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" disabled />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      case "file":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <File className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">File upload</p>
          </div>
        );
      case "image":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Image upload</p>
          </div>
        );
      case "location":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Database className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Location picker</p>
          </div>
        );
      default:
        return <Input placeholder="Field preview" disabled />;
    }
  };

  const saveForm = () => {
    // TODO: Implement form saving logic
    console.log("Saving form:", state.form);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Form Builder</h1>
          <p className="text-muted-foreground">
            Create and customize dynamic forms for data collection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setState((prev) => ({ ...prev, previewMode: !prev.previewMode }))
            }
          >
            <Eye className="h-4 w-4 mr-2" />
            {state.previewMode ? "Edit Mode" : "Preview Mode"}
          </Button>
          <Button onClick={saveForm}>
            <Save className="h-4 w-4 mr-2" />
            Save Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Form Name</label>
              <Input
                placeholder="Enter form name"
                value={state.form.name}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    form: { ...prev.form, name: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter form description"
                value={state.form.description}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    form: { ...prev.form, description: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={state.form.status}
                onValueChange={(value) =>
                  setState((prev) => ({
                    ...prev,
                    form: {
                      ...prev.form,
                      status: value as "draft" | "active" | "inactive",
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Form Fields</CardTitle>
              <Button onClick={addField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {state.form.fields.length === 0 ? (
              <div className="text-center py-8">
                <FormInput className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No fields added yet</p>
                <p className="text-sm text-gray-500">
                  Click "Add Field" to start building your form
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.form.fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getFieldTypeIcon(field.type)}
                        <span className="font-medium">Field {index + 1}</span>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateField(field)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {state.previewMode ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {field.name || "Untitled Field"}
                        </label>
                        {renderFieldPreview(field)}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Field Name
                            </label>
                            <Input
                              placeholder="Enter field name"
                              value={field.name}
                              onChange={(e) =>
                                updateField(field.id, { name: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Field Type
                            </label>
                            <Select
                              value={field.type}
                              onValueChange={(value) =>
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                updateField(field.id, { type: value as any })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="tel">Phone</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="textarea">
                                  Text Area
                                </SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="checkbox">
                                  Checkbox
                                </SelectItem>
                                <SelectItem value="radio">Radio</SelectItem>
                                <SelectItem value="file">
                                  File Upload
                                </SelectItem>
                                <SelectItem value="image">
                                  Image Upload
                                </SelectItem>
                                <SelectItem value="location">
                                  Location
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Placeholder
                            </label>
                            <Input
                              placeholder="Enter placeholder text"
                              value={field.placeholder || ""}
                              onChange={(e) =>
                                updateField(field.id, {
                                  placeholder: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={field.required}
                              onCheckedChange={(checked) =>
                                updateField(field.id, {
                                  required: checked as boolean,
                                })
                              }
                            />
                            <label className="text-sm font-medium">
                              Required
                            </label>
                          </div>
                        </div>

                        {(field.type === "select" ||
                          field.type === "radio") && (
                            <div>
                              <label className="text-sm font-medium">
                                Options
                              </label>
                              <Textarea
                                placeholder="Enter options separated by commas"
                                value={field.options?.join(", ") || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    options: e.target.value
                                      .split(",")
                                      .map((s) => s.trim()),
                                  })
                                }
                              />
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
