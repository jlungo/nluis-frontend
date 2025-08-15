import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import MapFieldRenderer from './MapFieldRenderer';
import {
    Edit,
    Save,
    Eye,
    FileText,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Settings,
    TestTube,
    Send,
    Layers,
    FolderOpen,
    MapPin,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Maximize,
    Minimize,
    BarChart3,
    Users,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: string[];
    order: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
}

interface FormSubform {
    id: string;
    name: string;
    description: string;
    fields: FormField[];
    isRequired: boolean;
    order: number;
}

interface FormSection {
    id: string;
    name: string;
    description: string;
    subforms: FormSubform[];
    order: number;
}

interface FormTemplate {
    id: string;
    name: string;
    description: string | null;
    type: string;
    module: string;
    isActive: boolean;
    isTemplate: boolean;
    fields: FormField[];
    sections?: FormSection[];
    forms?: FormSubform[]
    version: number;
}

interface FormPreviewTesterProps {
    formData: FormTemplate;
    onSave: (formData: FormTemplate) => void;
    onEdit: () => void;
    onCancel: () => void;
}

interface FormValidationError {
    fieldId: string;
    sectionId?: string;
    subformId?: string;
    message: string;
}

export default function FormPreviewTester({
    formData,
    onSave,
    onEdit,
    onCancel
}: FormPreviewTesterProps) {
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
    const [collapsedSubforms, setCollapsedSubforms] = useState<Record<string, boolean>>({});
    const [collapsedPreviewSections, setCollapsedPreviewSections] = useState<Record<string, boolean>>({});

    // Toggle section collapse
    const toggleSectionCollapse = (sectionId: string, isPreview: boolean = false) => {
        if (isPreview) {
            setCollapsedPreviewSections(prev => ({
                ...prev,
                [sectionId]: !prev[sectionId]
            }));
        } else {
            setCollapsedSections(prev => ({
                ...prev,
                [sectionId]: !prev[sectionId]
            }));
        }
    };

    // Toggle subform collapse
    const toggleSubformCollapse = (subformId: string) => {
        setCollapsedSubforms(prev => ({
            ...prev,
            [subformId]: !prev[subformId]
        }));
    };

    // Expand all sections
    const expandAllSections = () => {
        setCollapsedSections({});
        setCollapsedSubforms({});
        setCollapsedPreviewSections({});
    };

    // Collapse all sections
    const collapseAllSections = () => {
        const allSections: Record<string, boolean> = {};
        const allSubforms: Record<string, boolean> = {};
        const allPreviewSections: Record<string, boolean> = {};

        if (formData?.sections) {
            formData.sections.forEach(section => {
                allSections[section.id] = true;
                allPreviewSections[section.id] = true;
                section.subforms.forEach(subform => {
                    allSubforms[subform.id] = true;
                });
            });
        }

        setCollapsedSections(allSections);
        setCollapsedSubforms(allSubforms);
        setCollapsedPreviewSections(allPreviewSections);
    };

    // Check if field type is a map field
    const isMapField = (fieldType: string) => {
        return ['map-area', 'gps-coordinates', 'boundary-mapper', 'location-picker'].includes(fieldType);
    };

    // Update field value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFieldValue = (fieldId: string, value: any) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value
        }));

        // Clear validation error for this field
        setValidationErrors(prev =>
            prev.filter(error => error.fieldId !== fieldId)
        );
    };

    // Validate form
    const validateForm = (): FormValidationError[] => {
        const errors: FormValidationError[] = [];

        if (formData.type === 'unsectioned') {
            // Validate simple form fields
            formData.fields.forEach(field => {
                if (field.required && (!formValues[field.id] || formValues[field.id] === '')) {
                    errors.push({
                        fieldId: field.id,
                        message: `${field.label} is required`
                    });
                }
            });
        } else {
            // Validate advanced form (sections/subforms)
            if (formData?.sections)
                formData.sections.forEach(section => {
                    section.subforms.forEach(subform => {
                        if (subform.isRequired) {
                            const hasAnyValue = subform.fields.some(field =>
                                formValues[field.id] && formValues[field.id] !== ''
                            );

                            if (!hasAnyValue) {
                                errors.push({
                                    fieldId: subform.fields[0]?.id || '',
                                    sectionId: section.id,
                                    subformId: subform.id,
                                    message: `${subform.name} section is required`
                                });
                            }
                        }

                        subform.fields.forEach(field => {
                            if (field.required && (!formValues[field.id] || formValues[field.id] === '')) {
                                errors.push({
                                    fieldId: field.id,
                                    sectionId: section.id,
                                    subformId: subform.id,
                                    message: `${field.label} is required`
                                });
                            }
                        });
                    });
                });
        }

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
        await new Promise(resolve => setTimeout(resolve, 1500));

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

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Render a single field component
    // const renderFieldComponent = (field: FormField, sectionContext?: { sectionId: string; subformId?: string }) => {
    const renderFieldComponent = (field: FormField) => {
        const fieldValue = formValues[field.id];
        const hasError = validationErrors.some(error => error.fieldId === field.id);
        const fieldError = validationErrors.find(error => error.fieldId === field.id);

        if (isMapField(field.type)) {
            return (
                <div key={field.id} className="space-y-2">
                    <MapFieldRenderer
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        type={field.type as any}
                        value={fieldValue}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(value: any) => updateFieldValue(field.id, value)}
                        label={field.label}
                        placeholder={field.placeholder}
                        required={field.required}
                        helpText={field.helpText}
                    />
                    {hasError && showValidation && (
                        <Alert className="border-destructive bg-destructive/10">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-destructive">
                                {fieldError?.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            );
        }

        // Regular form fields
        return (
            <div key={field.id} className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-destructive">*</span>}
                    </Label>
                </div>

                {field.type === 'text' && (
                    <Input
                        placeholder={field.placeholder || 'Enter text...'}
                        value={fieldValue || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className={hasError && showValidation ? 'border-destructive' : ''}
                    />
                )}
                {field.type === 'email' && (
                    <Input
                        type="email"
                        placeholder={field.placeholder || 'Enter email...'}
                        value={fieldValue || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className={hasError && showValidation ? 'border-destructive' : ''}
                    />
                )}
                {field.type === 'number' && (
                    <Input
                        type="number"
                        placeholder={field.placeholder || 'Enter number...'}
                        value={fieldValue || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className={hasError && showValidation ? 'border-destructive' : ''}
                    />
                )}
                {field.type === 'textarea' && (
                    <Textarea
                        placeholder={field.placeholder || 'Enter text...'}
                        value={fieldValue || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className={hasError && showValidation ? 'border-destructive' : ''}
                        rows={3}
                    />
                )}
                {field.type === 'select' && (
                    <Select
                        value={fieldValue || ''}
                        onValueChange={(value) => updateFieldValue(field.id, value)}
                    >
                        <SelectTrigger className={hasError && showValidation ? 'border-destructive' : ''}>
                            <SelectValue placeholder={field.placeholder || 'Select option...'} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option, index) => (
                                <SelectItem key={index} value={option}>
                                    {option}
                                </SelectItem>
                            )) || (
                                    <>
                                        <SelectItem value="option1">Option 1</SelectItem>
                                        <SelectItem value="option2">Option 2</SelectItem>
                                        <SelectItem value="option3">Option 3</SelectItem>
                                    </>
                                )}
                        </SelectContent>
                    </Select>
                )}
                {field.type === 'checkbox' && (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={fieldValue || false}
                            onCheckedChange={(checked) => updateFieldValue(field.id, checked)}
                        />
                        <Label>{field.placeholder || 'Check this option'}</Label>
                    </div>
                )}
                {field.type === 'radio' && (
                    <RadioGroup
                        value={fieldValue || ''}
                        onValueChange={(value) => updateFieldValue(field.id, value)}
                    >
                        {field.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                            </div>
                        )) || (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="option1" id={`${field.id}-1`} />
                                        <Label htmlFor={`${field.id}-1`}>Option 1</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="option2" id={`${field.id}-2`} />
                                        <Label htmlFor={`${field.id}-2`}>Option 2</Label>
                                    </div>
                                </>
                            )}
                    </RadioGroup>
                )}
                {field.type === 'date' && (
                    <Input
                        type="date"
                        value={fieldValue || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className={hasError && showValidation ? 'border-destructive' : ''}
                    />
                )}
                {field.type === 'file' && (
                    <Input
                        type="file"
                        onChange={(e) => updateFieldValue(field.id, e.target.files?.[0]?.name || '')}
                        className={hasError && showValidation ? 'border-destructive' : ''}
                    />
                )}
                {field.type === 'switch' && (
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={fieldValue || false}
                            onCheckedChange={(checked) => updateFieldValue(field.id, checked)}
                        />
                        <Label>{field.placeholder || 'Toggle this option'}</Label>
                    </div>
                )}

                {field.helpText && (
                    <p className="text-sm text-muted-foreground">{field.helpText}</p>
                )}

                {hasError && showValidation && (
                    <Alert className="border-destructive bg-destructive/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-destructive">
                            {fieldError?.message}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        );
    };

    // Render form preview (read-only structure)
    const renderFormPreview = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">{formData.name}</h2>
                {formData.description && (
                    <p className="text-muted-foreground">{formData.description}</p>
                )}
                <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{formData.type}</Badge>
                    <Badge variant="outline">{formData.module}</Badge>
                    {/* <Badge variant="outline">{formData.mode === 'simple' ? 'Simple Form' : 'Advanced Form'}</Badge> */}
                </div>
            </div>

            {/* Section Controls */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium">Form Structure</h3>
                    <Badge variant="outline" className="text-xs">
                        {formData?.sections ? `${formData.sections.length} sections` : formData?.forms ? `${formData.forms.length} forms` : null}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={expandAllSections} className="gap-1">
                        <ChevronDown className="h-3 w-3" />
                        Expand All
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAllSections} className="gap-1">
                        <ChevronUp className="h-3 w-3" />
                        Collapse All
                    </Button>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-1">
                        {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
                        {isFullscreen ? 'Exit' : 'Fullscreen'}
                    </Button>
                </div>
            </div>

            {formData.type === 'unsectioned' ? (
                <div className="space-y-6">
                    {formData.fields.map((field) => (
                        <Card key={field.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                        {isMapField(field.type) ? <MapPin className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium flex items-center gap-2">
                                            {field.label}
                                            {field.required && <span className="text-destructive">*</span>}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {field.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            {field.placeholder && ` • ${field.placeholder}`}
                                        </p>
                                        {field.helpText && (
                                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {formData?.sections && formData.sections.map((section, sectionIndex) => (
                        <Card key={section.id}>
                            <Collapsible
                                open={!collapsedPreviewSections[section.id]}
                                onOpenChange={() => toggleSectionCollapse(section.id, true)}
                            >
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">
                                                        Section {sectionIndex + 1}: {section.name}
                                                    </CardTitle>
                                                    {section.description && (
                                                        <CardDescription>{section.description}</CardDescription>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {section.subforms.length} subforms
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {section.subforms.reduce((count, subform) => count + subform.fields.length, 0)} fields
                                                </Badge>
                                                {collapsedPreviewSections[section.id] ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="space-y-6 pt-0">
                                        {/* {section.subforms.map((subform, subformIndex) => ( */}
                                        {section.subforms.map((subform) => (
                                            <Collapsible
                                                key={subform.id}
                                                open={!collapsedSubforms[subform.id]}
                                                onOpenChange={() => toggleSubformCollapse(subform.id)}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                                                                    <FolderOpen className="h-3 w-3" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium flex items-center gap-2">
                                                                        {subform.name}
                                                                        {subform.isRequired && <Badge variant="outline" className="text-xs">Required</Badge>}
                                                                    </h4>
                                                                    {subform.description && (
                                                                        <p className="text-sm text-muted-foreground">{subform.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {subform.fields.length} fields
                                                                </Badge>
                                                                {collapsedSubforms[subform.id] ? (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <div className="mt-3 grid gap-3 pl-9">
                                                        {subform.fields.map((field) => (
                                                            <div key={field.id} className="flex items-center gap-2 text-sm p-2 bg-background rounded border">
                                                                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                                                                <span>{field.label}</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {field.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </Badge>
                                                                {field.required && <span className="text-destructive">*</span>}
                                                                {isMapField(field.type) && (
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
            )}
        </div>
    );

    // Render interactive form test
    const renderFormTest = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">{formData.name}</h2>
                    {formData.description && (
                        <p className="text-muted-foreground">{formData.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={expandAllSections} className="gap-1">
                        <ChevronDown className="h-3 w-3" />
                        Expand All
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAllSections} className="gap-1">
                        <ChevronUp className="h-3 w-3" />
                        Collapse All
                    </Button>
                    <Button variant="outline" onClick={handleResetTest} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleTestSubmission}
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Test Submit
                    </Button>
                </div>
            </div>

            {testSubmissionResult && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Form Test Successful</AlertTitle>
                    <AlertDescription className="text-green-700">
                        Submission ID: {testSubmissionResult.submissionId} •
                        Fields submitted: {testSubmissionResult.fieldCount}
                    </AlertDescription>
                </Alert>
            )}

            {validationErrors.length > 0 && showValidation && (
                <Alert className="border-destructive bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
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

            {formData.type === 'unsectioned' ? (
                <div className="space-y-6">
                    {formData.fields.map((field) => renderFieldComponent(field))}
                </div>
            ) : (
                <div className="space-y-6">
                    {formData?.sections && formData.sections.map((section) => (
                        <Card key={section.id}>
                            <Collapsible
                                open={!collapsedSections[section.id]}
                                onOpenChange={() => toggleSectionCollapse(section.id)}
                            >
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{section.name}</CardTitle>
                                                    {section.description && (
                                                        <CardDescription>{section.description}</CardDescription>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {section.subforms.length} subforms
                                                </Badge>
                                                {collapsedSections[section.id] ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="space-y-6 pt-0">
                                        {section.subforms.map((subform) => (
                                            <Collapsible
                                                key={subform.id}
                                                open={!collapsedSubforms[subform.id]}
                                                onOpenChange={() => toggleSubformCollapse(subform.id)}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                                                                    <FolderOpen className="h-3 w-3" />
                                                                </div>
                                                                <h4 className="font-medium">{subform.name}</h4>
                                                                {subform.isRequired && (
                                                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {subform.fields.length} fields
                                                                </Badge>
                                                                {collapsedSubforms[subform.id] ? (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        {subform.description && (
                                                            <p className="text-sm text-muted-foreground mt-2">{subform.description}</p>
                                                        )}
                                                    </div>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-muted">
                                                        {subform.fields.map((field) =>
                                                            // renderFieldComponent(field, { sectionId: section.id, subformId: subform.id })
                                                            renderFieldComponent(field)
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
            )}
        </div>
    );

    // Render form data view
    const renderFormData = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Form Structure & Test Data</h3>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export JSON
                </Button>
            </div>

            <Tabs defaultValue="structure">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="structure">Form Structure</TabsTrigger>
                    <TabsTrigger value="test-data">Test Data</TabsTrigger>
                    <TabsTrigger value="submission">Submission Result</TabsTrigger>
                </TabsList>

                <TabsContent value="structure" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Form Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                {JSON.stringify(
                                    {
                                        id: formData.id,
                                        name: formData.name,
                                        description: formData.description,
                                        type: formData.type,
                                        module: formData.module,
                                        version: formData.version,
                                        fieldCount: formData.type === 'unsectioned'
                                            ? formData?.forms && formData.forms.reduce((subCount, subform) =>
                                                subCount + subform.fields.length, 0
                                            )
                                            : formData?.sections && formData.sections.reduce((count, section) =>
                                                count + section.subforms.reduce((subCount, subform) =>
                                                    subCount + subform.fields.length, 0
                                                ), 0
                                            ),
                                        sectionCount: formData?.sections ? formData.sections.length : 0,
                                        subformCount: formData.sections ? formData.sections.reduce((count, section) =>
                                            count + section.subforms.length, 0
                                        ) : 0
                                    },
                                    null,
                                    2
                                )}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="test-data" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Current Form Values</CardTitle>
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
        <div className={`${isFullscreen ? 'fixed inset-0 z-[9999] bg-background' : 'min-h-screen bg-background'}`}>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Form Preview & Testing</h1>
                        <p className="text-muted-foreground">
                            Preview your form structure and test its functionality before saving
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={onEdit} className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Form
                        </Button>
                        <Button onClick={() => onSave(formData)} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Form
                        </Button>
                    </div>
                </div>

                {/* Form Stats */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    {formData.name}
                                </div>
                                <div className="text-sm text-muted-foreground">Form Name</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    {formData.type === 'unsectioned'
                                        ? formData?.forms && formData.forms.reduce((subCount, subform) =>
                                            subCount + subform.fields.length, 0
                                        )
                                        : formData?.sections && formData.sections.reduce((count, section) =>
                                            count + section.subforms.reduce((subCount, subform) =>
                                                subCount + subform.fields.length, 0
                                            ), 0
                                        )
                                    }
                                </div>
                                <div className="text-sm text-muted-foreground">Total Fields</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <Layers className="h-5 w-5" />
                                    {formData.type === 'unsectioned' ? '1' : formData?.sections ? formData.sections.length : 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Sections</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {Object.keys(formValues).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Fields Tested</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    {Math.round((Object.keys(formValues).length / (formData.type === 'unsectioned'
                                        ? formData.forms!.reduce((subCount, subform) =>
                                            subCount + subform.fields.length, 0
                                        )
                                        : formData.sections!.reduce((count, section) =>
                                            count + section.subforms.reduce((subCount, subform) =>
                                                subCount + subform.fields.length, 0
                                            ), 0
                                        ))) * 100) || 0}%
                                </div>
                                <div className="text-sm text-muted-foreground">Completion</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="preview" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Preview
                        </TabsTrigger>
                        <TabsTrigger value="test" className="gap-2">
                            <TestTube className="h-4 w-4" />
                            Test Form
                        </TabsTrigger>
                        <TabsTrigger value="data" className="gap-2">
                            <Settings className="h-4 w-4" />
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
                                <CardDescription>
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
                                {renderFormData()}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}