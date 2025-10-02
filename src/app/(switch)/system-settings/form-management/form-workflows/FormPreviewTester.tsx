import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Edit,
    Save,
    Eye,
    FileText,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Settings,
    TestTube,
    Send,
    Layers,
    FolderOpen,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Maximize,
    Minimize,
    BarChart3,
    Users,
    Clock,
    Upload
} from 'lucide-react';
import { toast } from 'sonner';
import DatePicker from '@/components/form-field/form-date-picker';
import type { InputType } from '@/types/input-types';
import { ShapefileMap } from '@/components/zoning/ShapefileMap';
import { useThemeStore } from '@/store/themeStore';
import FormMembers from '@/components/form-field/form-members';
import SubdivisionShell from '@/components/subdivision/SubdivisionShell';

export type State = "1" | "0"

export interface FieldOption {
    id: string;
    label: string;
    name: string;
    order: number;
}

export interface FormField {
    id: string;
    name: string;
    label: string;
    type: InputType;
    required: boolean;
    placeholder?: string;
    order: number;
    options: FieldOption[];
    is_active: boolean;
}

export interface SectionForm {
    id: string;
    name: string;
    editor_roles: { user_role: string }[];
    description: string;
    order: number;
    form_fields: FormField[];
    is_active: boolean;
}

export interface FormSection {
    id: string;
    name: string;
    approval_roles: { user_role: string }[];
    description: string;
    order: number;
    forms: SectionForm[];
    is_active: boolean;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string | null;
    module: string;
    module_level: string;
    isActive: boolean;
    isTemplate: boolean;
    sections?: FormSection[];
    version: number;
}

interface WorkflowPreviewTesterProps {
    workflowData: WorkflowTemplate;
    onSave: (workflowData: WorkflowTemplate) => void;
    onEdit: () => void;
}

interface FormValidationError {
    fieldName: string;
    sectionId: string;
    formId: string;
    message: string;
}

export function FormPreviewTester({
    workflowData,
    onSave,
    onEdit,
}: WorkflowPreviewTesterProps) {
    const [activeTab, setActiveTab] = useState<'preview' | 'test' | 'data'>('preview');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [validationErrors, setValidationErrors] = useState<FormValidationError[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [testSubmissionResult, setTestSubmissionResult] = useState<any>(null);
    const [showValidation, setShowValidation] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // State for collapsible sections
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
    const [collapsedForms, setCollapsedForms] = useState<Record<string, boolean>>({});
    const [collapsedPreviewSections, setCollapsedPreviewSections] = useState<Record<string, boolean>>({});

    // Toggle section collapse
    const toggleSectionCollapse = (sectionId: string, isPreview: boolean = false) => {
        if (isPreview)
            setCollapsedPreviewSections(prev => ({
                ...prev,
                [sectionId]: !prev[sectionId]
            }));
        else
            setCollapsedSections(prev => ({
                ...prev,
                [sectionId]: !prev[sectionId]
            }));
    };

    // Toggle form collapse
    const toggleFormCollapse = (formId: string) => {
        setCollapsedForms(prev => ({
            ...prev,
            [formId]: !prev[formId]
        }));
    };

    const collapseAllSections = () => {
        setCollapsedSections({});
        setCollapsedForms({});
        setCollapsedPreviewSections({});
    };

    const expandAllSections = () => {
        const allSections: Record<string, boolean> = {};
        const allForms: Record<string, boolean> = {};
        const allPreviewSections: Record<string, boolean> = {};
        if (workflowData?.sections) {
            workflowData.sections.filter(section => section.is_active === true).forEach(section => {
                allSections[section.id] = true;
                allPreviewSections[section.id] = true;
                section.forms.forEach(form => {
                    allForms[form.id] = true;
                });
            });
        }
        setCollapsedSections(allSections);
        setCollapsedForms(allForms);
        setCollapsedPreviewSections(allPreviewSections);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFieldValue = useCallback((fieldName: string, value: any) => {
        setFormValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
        setValidationErrors(prev => prev.filter(error => error.fieldName !== fieldName));
    }, [setFormValues, setValidationErrors]);

    // Validate form
    const validateForm = (): FormValidationError[] => {
        const errors: FormValidationError[] = [];
        if (workflowData?.sections)
            workflowData.sections.filter(section => section.is_active === true).forEach(section => {
                section.forms.filter(form => form.is_active === true).forEach(form => {
                    form.form_fields.filter(field => field.is_active === true).forEach(field => {
                        const fieldName = `${section.order}-${form.order}-${field.name}`
                        if (field.required && (!formValues[fieldName] || formValues[fieldName] === '')) {
                            errors.push({
                                fieldName: fieldName,
                                sectionId: section.id,
                                formId: form.id,
                                message: `${field.label} is required`
                            });
                        }
                    });
                });
            });
        return errors;
    };

    // Test form submission
    const handleTestSubmission = async () => {
        setIsSubmitting(true);
        setShowValidation(true);
        const errors = validateForm();
        setValidationErrors(errors);
        if (errors.length > 0) {
            toast.error(`Form validation failed with ${errors.length} errors`);
            setIsSubmitting(false);
            return;
        }
        // Simulate form submission delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const submissionResult = {
            success: true,
            submissionId: `test-${Date.now()}`,
            timestamp: new Date().toISOString(),
            data: formValues,
            fieldCount: Object.keys(formValues).length,
            validationPassed: true
        };
        setTestSubmissionResult(submissionResult);
        setIsSubmitting(false);
        toast.success('Form test submission successful!');
    };

    // Reset test data
    const handleResetTest = () => {
        setFormValues({});
        setValidationErrors([]);
        setTestSubmissionResult(null);
        setShowValidation(false);
        toast.info('Form test data reset');
    };

    // Render a single field component
    const renderFieldComponent = useCallback(
        (field: FormField, formOrder: number, sectionOrder: number) => {
            const fieldName = `${sectionOrder}-${formOrder}-${field.name}`
            const fieldValue = formValues[fieldName];
            const fieldError = validationErrors.find(error => error.fieldName === fieldName);
            const hasError = !!fieldError && showValidation;

            const renderLabel = () => (
                <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-destructive">*</span>}
                    </Label>
                </div>
            );
            const renderError = () =>
                hasError && (
                    <Alert className="border-destructive bg-destructive/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-destructive">
                            {fieldError?.message}
                        </AlertDescription>
                    </Alert>
                );

            switch (field.type) {
                case "zoning":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            <MapRenderer key={field.id} />
                            {renderError()}
                        </div>
                    );

                case "land-subdivision":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            {renderLabel()}
                            <SubdivisionMapRenderer
                                value={fieldValue}
                                onChange={(value) => updateFieldValue(fieldName, value)}
                            />
                            {renderError()}
                        </div>
                    );

                case "members":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            <FormMembers
                                label={field.label}
                                name={fieldName}
                                required={field.required}
                                placeholder={field.placeholder}
                                fullWidth
                            />
                            {renderError()}
                        </div>
                    );

                case "text":
                case "email":
                case "number":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            {renderLabel()}
                            <Input
                                type={field.type === "text" ? "text" : field.type}
                                placeholder={field.placeholder || `Enter ${field.type}...`}
                                value={fieldValue || ""}
                                onChange={(e) => updateFieldValue(fieldName, e.target.value)}
                                className={hasError ? "border-destructive" : ""}
                            />
                            {renderError()}
                        </div>
                    );

                case "textarea":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            {renderLabel()}
                            <Textarea
                                placeholder={field.placeholder || "Enter text..."}
                                value={fieldValue || ""}
                                onChange={(e) => updateFieldValue(fieldName, e.target.value)}
                                className={hasError ? "border-destructive" : ""}
                                rows={3}
                            />
                            {renderError()}
                        </div>
                    );

                case "select":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            {renderLabel()}
                            <Select
                                value={fieldValue || ""}
                                onValueChange={(value) => updateFieldValue(fieldName, value)}
                            >
                                <SelectTrigger
                                    className={hasError ? "border-destructive w-full" : "w-full"}
                                >
                                    <SelectValue
                                        placeholder={field.placeholder || "Select option..."}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options
                                        ?.sort((a, b) => a.order - b.order)
                                        .map((option, index) => (
                                            <SelectItem key={index} value={option.name}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {renderError()}
                        </div>
                    );

                case "checkbox":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            {renderLabel()}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={fieldValue || false}
                                    onCheckedChange={(checked) =>
                                        updateFieldValue(fieldName, checked)
                                    }
                                />
                                <Label>{field.placeholder || "Check this option"}</Label>
                            </div>
                            {renderError()}
                        </div>
                    );

                case "date":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            <DatePicker
                                label={field.label}
                                name={fieldName}
                                required={field.required}
                                dateValue={fieldValue ? new Date(fieldValue) : undefined}
                                onDateChange={(e) =>
                                    updateFieldValue(fieldName, e.toISOString().split("T")[0])
                                }
                                fullWidth
                            />
                            {renderError()}
                        </div>
                    );

                case "file":
                    return (
                        <div key={field.id} className="space-y-2 bg-background p-2 sm:p-3 md:p-4 border">
                            {renderLabel()}
                            <div
                                className={`group relative border-2 border-dashed rounded-xl overflow-hidden ${hasError
                                    ? "border-destructive"
                                    : "border-input hover:border-muted-foreground/50 transition"
                                    }`}
                            >
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        updateFieldValue(fieldName, e.target.files?.[0]?.name || "")
                                    }
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="p-3 w-full flex items-center justify-between gap-3">
                                    <div className="rounded-md bg-accent dark:bg-input p-2">
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-grow flex flex-col gap-1">
                                        <p className="text-sm">
                                            {formValues[fieldName] || field.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {field.placeholder}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="group-hover:bg-accent"
                                    >
                                        Browse
                                    </Button>
                                </div>
                            </div>
                            {renderError()}
                        </div>
                    );

                default:
                    return null;
            }
        },
        [formValues, validationErrors, showValidation, updateFieldValue]
    );

    // Render form preview (read-only structure)
    const renderFormPreview = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-lg md:text-2xl font-semibold">{workflowData.name}</h2>
                {workflowData.description && (
                    <p className="text-muted-foreground">{workflowData.description}</p>
                )}
                <div className="flex items-center justify-center gap-2">
                    {/* <Badge variant="outline" className='capitalize'>{workflowData.type}</Badge> */}
                    <Badge variant="outline">{workflowData.module}</Badge>
                </div>
            </div>

            {/* Section Controls */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex flex-col md:flex-row items-center gap-2">
                    <h3 className="font-medium text-base md:text-lg">Form Structure</h3>
                    <Badge variant="outline" className="text-xs">
                        {workflowData?.sections ? `${workflowData.sections.filter(section => section.is_active === true).length} sections` : null}
                    </Badge>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <Button variant="outline" size="sm" onClick={expandAllSections} className="text-xs md:text-sm">
                        <ChevronDown className="h-2 md:h-3 w-2 md:w-3" />
                        Expand<span className='hidden md:inline'> All</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAllSections} className="text-xs md:text-sm">
                        <ChevronUp className="h-2 md:h-3 w-2 md:w-3" />
                        Collapse<span className='hidden md:inline'> All</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="text-xs md:text-sm">
                        {isFullscreen ? <Minimize className="h-2 md:h-3 w-2 md:w-3" /> : <Maximize className="h-2 md:h-3 w-2 md:w-3" />}
                        {isFullscreen ? 'Exit' : 'Fullscreen'}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {workflowData?.sections && workflowData.sections.filter(section => section.is_active === true).sort((a, b) => a.order - b.order).map((section) => (
                    <Card key={section.id}>
                        <Collapsible
                            open={collapsedPreviewSections[section.id]}
                            onOpenChange={() => toggleSectionCollapse(section.id, true)}
                        >
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer bg-accent/50 dark:bg-muted/30 hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                                <Layers className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xs md:text-base line-clamp-1">
                                                    <span className='hidden md:inline'>Section </span>{section.order}: {section.name}
                                                </CardTitle>
                                                {section.description && <CardDescription className='hidden md:inline md:line-clamp-1'>{section.description}</CardDescription>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="hidden flex-col md:flex-row items-center gap-2 md:flex">
                                                <Badge variant="outline" className="text-xs">
                                                    {section.forms.filter(form => form.is_active === true).length} forms
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {section.forms.filter(form => form.is_active === true).reduce((count, form) => count + form.form_fields.filter(field => field.is_active === true).length, 0)} fields
                                                </Badge>
                                            </div>
                                            {!collapsedPreviewSections[section.id] ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <CardContent className="pt-0">
                                    {section.forms.filter(form => form.is_active === true).sort((a, b) => a.order - b.order).map((form) => (
                                        <Collapsible
                                            key={form.id}
                                            open={collapsedForms[form.id]}
                                            onOpenChange={() => toggleFormCollapse(form.id)}
                                            className='border bg-muted/30 rounded-lg py-4 my-3'
                                        >
                                            <CollapsibleTrigger asChild>
                                                <div className="px-4 py-2 md:py-0 cursor-pointer bg-accent dark:bg-muted/40 hover:bg-muted/90 dark:hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                                                                <FolderOpen className="h-3 w-3" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium flex items-center gap-2 text-xs md:text-sm">
                                                                    {form.name}
                                                                </h4>
                                                                {form.description && <p className="text-xs md:text-sm text-muted-foreground hidden md:inline md:line-clamp-1">{form.description}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs hidden md:block">
                                                                {form.form_fields.filter(field => field.is_active === true).length} fields
                                                            </Badge>
                                                            {!collapsedForms[form.id] ? (
                                                                <ChevronRight className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent className='px-4'>
                                                <div className="mt-3 grid gap-1 md:gap-2 md:pl-8">
                                                    {form.form_fields.filter(field => field.is_active === true).sort((a, b) => a.order - b.order).map((field) => (
                                                        <div key={field.id} className="flex items-center gap-2 text-sm p-2 bg-background rounded border">
                                                            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                                                            <span>{field.label}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {field.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </Badge>
                                                            {field.required && <span className="text-destructive">*</span>}
                                                            {field.type === 'zoning' && (
                                                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                                                                    Interactive Map
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                ))}
            </div>
        </div>
    );

    // Render interactive form test
    const renderFormTest = () => (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-1">
                <div>
                    <h2 className="text-sm sm:text-base md:text-xl font-semibold">{workflowData.name}</h2>
                    {workflowData.description && (
                        <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{workflowData.description}</p>
                    )}
                </div>
                <div className='flex gap-2'>
                    <div className="flex flex-col xl:flex-row gap-2">
                        <Button variant="outline" size="sm" onClick={expandAllSections} className="text-xs md:text-sm">
                            <ChevronDown className="h-2 md:h-3 w-2 md:w-3" />
                            Expand<span className='hidden md:inline'> All</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={collapseAllSections} className="text-xs md:text-sm">
                            <ChevronUp className="h-2 md:h-3 w-2 md:w-3" />
                            Collapse<span className='hidden md:inline'> All</span>
                        </Button>
                    </div>
                    <div className="flex flex-col xl:flex-row gap-2">
                        <Button variant="outline" size="sm" onClick={handleResetTest} className="text-xs md:text-sm">
                            <RefreshCw className="h-2 md:h-3 w-2 md:w-3" />
                            Reset
                        </Button>
                        <Button
                            onClick={handleTestSubmission}
                            disabled={isSubmitting}
                            className="text-xs md:text-sm"
                            size="sm"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="h-2 md:h-3 w-2 md:w-3 animate-spin" />
                            ) : (
                                <Send className="h-2 md:h-3 w-2 md:w-3" />
                            )}
                            <span className='hidden md:block'>Test </span>Submit
                        </Button>
                    </div>
                </div>
            </div>

            {testSubmissionResult && (
                <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-600" />
                    <AlertTitle className="text-green-800">Form Test Successful</AlertTitle>
                    <AlertDescription className="text-green-700">
                        Submission ID: {testSubmissionResult.submissionId} •
                        Fields submitted: {testSubmissionResult.fieldCount}
                    </AlertDescription>
                </Alert>
            )}

            {validationErrors.length > 0 && showValidation && (
                <Alert className="border-destructive bg-destructive/10">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertTitle>Validation Errors ({validationErrors.length})</AlertTitle>
                    <AlertDescription>
                        Please fix the following errors before submitting:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            {validationErrors.map((error, index) => (
                                <li key={index} className="text-sm">{error.message}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                {workflowData?.sections && workflowData.sections.filter(section => section.is_active === true).sort((a, b) => a.order - b.order).map((section) => (
                    <Card key={section.id}>
                        <Collapsible
                            open={collapsedSections[section.id]}
                            onOpenChange={() => toggleSectionCollapse(section.id)}
                        >
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer bg-accent/50 dark:bg-muted/30 hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                                <Layers className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xs md:text-base line-clamp-1">
                                                    <span className='hidden md:inline'>Section </span>{section.order}: {section.name}
                                                </CardTitle>
                                                {section.description && <CardDescription className='hidden md:inline md:line-clamp-1'>{section.description}</CardDescription>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="hidden flex-col md:flex-row items-center gap-2 md:flex">
                                                <Badge variant="outline" className="text-xs">
                                                    {section.forms.filter(form => form.is_active === true).length} forms
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {section.forms.filter(form => form.is_active === true).reduce((count, form) => count + form.form_fields.filter(field => field.is_active === true).length, 0)} fields
                                                </Badge>
                                            </div>
                                            {!collapsedSections[section.id] ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <CardContent className="pt-0">
                                    {section.forms.filter(form => form.is_active === true).sort((a, b) => a.order - b.order).map((form) => (
                                        <Collapsible
                                            key={form.id}
                                            open={collapsedForms[form.id]}
                                            onOpenChange={() => toggleFormCollapse(form.id)}
                                            className='border bg-muted/30 rounded-lg py-4 my-3'
                                        >
                                            <CollapsibleTrigger asChild>
                                                <div className="px-4 py-2 md:py-0 cursor-pointer bg-accent dark:bg-muted/40 hover:bg-muted/90 dark:hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                                                                <FolderOpen className="h-3 w-3" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium flex items-center gap-2 text-xs md:text-sm">
                                                                    {form.name}
                                                                </h4>
                                                                {form.description && <p className="text-xs md:text-sm text-muted-foreground hidden md:inline md:line-clamp-1">{form.description}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs hidden md:block">
                                                                {form.form_fields.filter(field => field.is_active === true).length} fields
                                                            </Badge>
                                                            {!collapsedForms[form.id] ? (
                                                                <ChevronRight className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent className='px-4'>
                                                <div className="mt-4 space-y-1 md:space-y-2 pl-4 border-l-2 border-muted">
                                                    {form.form_fields.filter(field => field.is_active === true).sort((a, b) => a.order - b.order).map((field) =>
                                                        renderFieldComponent(field, form.order, section.order)
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                ))}
            </div>
        </div>
    );

    // Render form data view
    const renderWorkflowData = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Form Structure & Test Data</h3>
                {/* <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export JSON
                </Button> */}
            </div>

            <Tabs defaultValue="structure">
                <TabsList className="grid w-full grid-cols-3 rounded-full">
                    <TabsTrigger value="structure" className='rounded-full cursor-pointer'><span className='hidden sm:block'>Form</span> Structure</TabsTrigger>
                    <TabsTrigger value="test-data" className='rounded-full cursor-pointer'>Test <span className='hidden sm:block'>Data</span></TabsTrigger>
                    <TabsTrigger value="submission" className='rounded-full cursor-pointer'>Submission <span className='hidden sm:block'>Result</span></TabsTrigger>
                </TabsList>

                <TabsContent value="structure" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Form Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                {JSON.stringify(workflowData, null, 2) || 'No workflow data available'}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="test-data" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Current Forms Values</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                {JSON.stringify(formValues, null, 2) || 'No test data yet'}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="submission" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Submission Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                {testSubmissionResult
                                    ? JSON.stringify(testSubmissionResult, null, 2)
                                    : 'No submission test performed yet'
                                }
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-[9999] overflow-y-auto bg-background' : 'min-h-screen'}`}>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg md:text-2xl font-semibold">Workflow Preview & Testing</h1>
                        <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                            Preview your form workflow structure and test its functionality before saving
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Workflow
                        </Button>
                        <Button size="sm" onClick={() => onSave(workflowData)} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Workflow
                        </Button>
                    </div>
                </div>

                {/* Form Stats */}
                <Card>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            <div className="text-center">
                                <div className="text-sm lg:text-base 2xl:text-lg font-semibold text-primary flex items-center justify-center gap-2">
                                    <FileText className="h-5 w-5 shrink-0" />
                                    {workflowData.name}
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground">Form Name</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg lg:text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    {workflowData?.sections && workflowData.sections.filter(section => section.is_active === true).reduce((count, section) =>
                                        count + section.forms.filter(form => form.is_active === true).reduce((subCount, form) =>
                                            subCount + form.form_fields.filter(field => field.is_active === true).length, 0
                                        ), 0
                                    )}
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground">Total Fields</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg md:text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <Layers className="h-5 w-5" />
                                    {workflowData?.sections ? workflowData.sections.filter(section => section.is_active === true).length : 0}
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground">Sections</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg md:text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {Object.keys(formValues).length}
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground">Fields Tested</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg md:text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    {Math.round((Object.keys(formValues).length / (workflowData.sections!.filter(section => section.is_active === true).reduce((count, section) =>
                                        count + section.forms.filter(form => form.is_active === true).reduce((subCount, form) =>
                                            subCount + form.form_fields.filter(form => form.is_active === true).length, 0
                                        ), 0
                                    ))) * 100) || 0}%
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground">Completion</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as any)}>
                    <TabsList className="grid h-fit w-full grid-cols-3 rounded-full mb-3">
                        <TabsTrigger value="preview" className="text-xs md:text-base gap-2 rounded-full cursor-pointer">
                            <Eye className="h-4 w-4 hidden md:block" />
                            Preview
                        </TabsTrigger>
                        <TabsTrigger value="test" className="text-xs md:text-base gap-2 rounded-full cursor-pointer">
                            <TestTube className="h-4 w-4 hidden md:block" />
                            Test Form
                        </TabsTrigger>
                        <TabsTrigger value="data" className="text-xs md:text-base gap-2 rounded-full cursor-pointer">
                            <Settings className="h-4 w-4 hidden md:block" />
                            Data & Export
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Form Structure Preview
                                </CardTitle>
                                <CardDescription className='text-xs md:text-sm'>
                                    This is how your form structure will appear to end users
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderFormPreview()}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="test" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TestTube className="h-5 w-5" />
                                    Interactive Form Testing
                                </CardTitle>
                                <CardDescription>
                                    Fill out the form to test functionality, validation, and submission
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderFormTest()}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="data" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Form Data & Configuration
                                </CardTitle>
                                <CardDescription>
                                    View form structure, test data, and export options
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderWorkflowData()}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

const MapRenderer: React.FC = () => {
    const { isDarkMode } = useThemeStore()
    return (
        <div className="w-full aspect-square lg:aspect-video max-h-[70vh]">
            <ShapefileMap key={`${isDarkMode}`} />
        </div>
    )
}

const SubdivisionMapRenderer: React.FC<{ value: string | undefined, onChange: (value: string) => void }> = ({ value, onChange }) => {
    return (
        <div className="w-full h-[500px] rounded-lg border bg-background">
            <SubdivisionShell
                value={value}
                onChange={onChange}
                className="w-full h-full"
            />
        </div>
    )
}