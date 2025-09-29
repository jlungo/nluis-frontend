import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FormPreviewTester } from './FormPreviewTester';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronRight,
    Plus,
    Trash2,
    GripVertical,
    Layers,
    FolderOpen,
    Move,
    TestTube,
    Component
} from 'lucide-react';
import { toast } from 'sonner';
import { useModulesQuery, type ModuleProps } from '@/queries/useModuleQuery';
import { useLevelsQuery, type LevelProps } from '@/queries/useLevelQuery';
import { Link, useNavigate } from 'react-router';
import { Spinner } from '@/components/ui/spinner';
import type { InputType } from '@/types/input-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { AxiosError } from 'axios';
import { workflowQueryKey, type WorkflowProps } from '@/queries/useWorkflowQuery';
import type { FormField, FormSection, SectionForm, WorkflowTemplate } from './FormPreviewTester';
import { workflowCategoryTypes } from '@/types/constants';
import { slugify } from '@/lib/utils';
import { useRolesQuery } from '@/queries/useRolesQuery';
import { MultiSelect } from '@/components/multiselect';
import { Switch } from '@/components/ui/switch';
import type { WorkflowSubmission } from '@/types/submission';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function WorkflowBuilder({ previousData, sections }: { previousData?: WorkflowProps; sections?: FormSection[] }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedModule, setSelectedModule] = useState<ModuleProps | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<LevelProps | null>(null);
    const [formDetails, setFormDetails] = useState<{
        name: string;
        description: string | null;
        category: number | null;
        version: number
    }>({
        name: '',
        description: null,
        category: null,
        version: 1.0
    });
    const [uncollapsed, setUncollapsed] = useState<string[]>([])
    const [formSections, setFormSections] = useState<FormSection[]>([]);

    const { data: roles, isLoading: isLoadingRoles } = useRolesQuery();
    const { data: modules, isLoading: isLoadingModules } = useModulesQuery();
    const { data: levels, isLoading: isLoadingLevels } = useLevelsQuery(1000, 0, '', selectedModule?.slug ? selectedModule.slug : "")

    const fieldTypes = useMemo<{ value: InputType; label: string }[]>(
        () => [
            { value: 'text', label: 'Text Input' },
            { value: 'email', label: 'Email Input' },
            { value: 'number', label: 'Number Input' },
            { value: 'textarea', label: 'Text Area' },
            { value: 'select', label: 'Dropdown Select' },
            { value: 'multiselect', label: 'Dropdown Multiselect' },
            { value: 'checkbox', label: 'Checkbox' },
            { value: 'table', label: 'Table' },
            { value: 'date', label: 'Date Picker' },
            { value: 'file', label: 'File Upload' },
            { value: 'members', label: 'Members Add' },
            { value: 'zoning', label: 'Zoning' },
        ],
        []
    );

    const steps = useMemo(() => [
        { id: 1, name: 'Module', description: 'Choose module' },
        { id: 2, name: 'Level', description: 'Select level' },
        { id: 3, name: 'Workflow', description: 'Workflow details' },
        { id: 4, name: 'Structure', description: 'Build sections' },
        { id: 5, name: 'Preview', description: 'Test & preview' }
    ], []);

    const progress = useMemo(() => (currentStep / steps.length) * 100, [currentStep, steps.length]);

    const handleNext = useCallback(() => {
        setCurrentStep(prevStep => {
            const nextStep = prevStep < steps.length ? prevStep + 1 : prevStep;
            return nextStep;
        });
    }, [setCurrentStep, steps.length]);

    const handleBack = useCallback(() => {
        setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));
    }, [setCurrentStep]);

    const addSection = useCallback(() => {
        const id = `section-default-UI-${Date.now()}`
        setFormSections(sections => [
            ...sections,
            {
                id,
                name: ``,
                description: '',
                forms: [],
                approval_roles: [],
                order: sections.length + 1,
                is_active: true
            }
        ]);
        setUncollapsed(prev => [...prev, `${id}-collapse-section`])
    }, [setFormSections, setUncollapsed]);

    const updateSection = useCallback((sectionId: string, updates: Partial<FormSection>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId ? { ...section, ...updates } : section
            )
        );
    }, [setFormSections]);

    const removeSection = useCallback((sectionId: string) => {
        if (sectionId.startsWith("section-default-UI-")) setFormSections(sections => sections.filter(section => section.id !== sectionId));
        else setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId ? { ...section, is_active: false } : section
            )
        );
        setUncollapsed(prev => prev.filter(id => id !== `${sectionId}-collapse-section`))
    }, [setFormSections, setUncollapsed]);

    const addForm = useCallback((sectionId: string) => {
        const id = `form-default-UI-${Date.now()}`
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: [
                            ...section.forms,
                            {
                                id,
                                name: '',
                                editor_roles: [],
                                description: '',
                                form_fields: [],
                                order: section.forms.length + 1,
                                is_active: true
                            }
                        ]
                    }
                    : section
            )
        );
        setUncollapsed(prev => [...prev, `${id}-collapse-form`])
    }, [setFormSections, setUncollapsed]);

    const updateForm = useCallback((sectionId: string, formId: string, updates: Partial<SectionForm>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId ? { ...form, ...updates } : form
                        )
                    }
                    : section
            )
        );
    }, [setFormSections]);

    const removeForm = useCallback((sectionId: string, formId: string) => {
        if (formId.startsWith("form-default-UI-")) setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.filter(form => form.id !== formId)
                    }
                    : section
            )
        );
        else setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId ? { ...form, is_active: false } : form
                        ),
                    }
                    : section
            )
        );
        setUncollapsed(prev => prev.filter(id => id !== `${formId}-collapse-form`))
    }, [setFormSections, setUncollapsed]);

    const addField = useCallback((sectionId: string, formId: string) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    form_fields: [
                                        ...form.form_fields,
                                        {
                                            id: `field-default-UI-${Date.now()}`,
                                            name: '',
                                            label: '',
                                            type: 'text',
                                            required: false,
                                            options: [],
                                            order: form.form_fields.length + 1,
                                            is_active: true
                                        }
                                    ]
                                }
                                : form
                        )
                    }
                    : section
            )
        );
    }, [setFormSections]);

    const updateField = useCallback((sectionId: string, formId: string, fieldId: string, updates: Partial<FormField>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    form_fields: form.form_fields.map(field =>
                                        field.id === fieldId ? { ...field, ...updates } : field
                                    )
                                }
                                : form
                        )
                    }
                    : section
            )
        )
    }, [setFormSections]);

    const removeField = useCallback((sectionId: string, formId: string, fieldId: string) => {
        if (fieldId.startsWith("field-default-UI-"))
            setFormSections(sections =>
                sections.map(section =>
                    section.id === sectionId
                        ? {
                            ...section,
                            forms: section.forms.map(form =>
                                form.id === formId
                                    ? {
                                        ...form,
                                        form_fields: form.form_fields.filter(field => field.id !== fieldId)
                                    }
                                    : form
                            )
                        }
                        : section
                )
            );
        else
            setFormSections(sections =>
                sections.map(section =>
                    section.id === sectionId
                        ? {
                            ...section,
                            forms: section.forms.map(form =>
                                form.id === formId
                                    ? {
                                        ...form,
                                        form_fields: form.form_fields.map(field =>
                                            field.id === fieldId ? { ...field, is_active: false } : field
                                        )
                                    }
                                    : form
                            )
                        }
                        : section
                )
            );
    }, [setFormSections]);

    const addOption = useCallback((sectionId: string, formId: string, fieldId: string) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: form.form_fields.map(field =>
                                        field.id === fieldId
                                            ? {
                                                ...field,
                                                options: [
                                                    ...field.options,
                                                    {
                                                        id: `option-default-UI-${Date.now()}`,
                                                        label: '',
                                                        name: '',
                                                        order: field?.options?.length + 1,
                                                    }
                                                ]
                                            }
                                            : field
                                    )
                                }
                                : form
                        )
                    }
                    : section
            )
        );
    }, [setFormSections]);

    const updateOption = useCallback((sectionId: string, formId: string, fieldId: string, optionId: string, updates: Partial<FormField>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: form.form_fields.map(field =>
                                        field.id === fieldId
                                            ? {
                                                ...field,
                                                options: field.options.map(option =>
                                                    option.id === optionId ? { ...option, ...updates } : option
                                                )
                                            }
                                            : field
                                    )
                                }
                                : form
                        )
                    }
                    : section
            )
        )
    }, [setFormSections]);

    const removeOption = useCallback((sectionId: string, formId: string, fieldId: string, optionId: string) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: form.form_fields.map(field =>
                                        field.id === fieldId
                                            ? {
                                                ...field,
                                                options: field.options.filter(option => option.id !== optionId)
                                            }
                                            : field
                                    )
                                }
                                : form
                        )
                    }
                    : section
            )
        );
    }, [setFormSections]);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (e: WorkflowSubmission) => {
            if (previousData) return api.put(`/form-management/submission/${previousData.slug}/update/`, e);
            return api.post(`/form-management/submission/`, e)
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [workflowQueryKey],
            }),
        onError: (e) => {
            console.log(e);
        },
    });

    const handleComplete = useCallback(() => {
        if (!selectedModule || !selectedLevel) {
            toast.error('Please complete all required selections');
            return;
        }

        if (!formDetails.category) {
            toast.error('Please select a category');
            return;
        }

        if (!formDetails.name) {
            toast.error('Please provide a workflow name');
            return;
        }

        if (formSections.length === 0) {
            toast.error('Please add at least one section to the workflow');
            return;
        }

        const workflowData: WorkflowSubmission = {
            name: formDetails.name,
            description: formDetails.description,
            module_level: selectedLevel.slug,
            category: formDetails.category,
            version: `${formDetails.version}`,
            sections: formSections.map(section => ({
                slug: section.id.startsWith('section-default-UI-') ? undefined : section.id,
                name: section.name,
                description: section.description,
                position: section.order,
                approval_roles: section.approval_roles,
                is_active: previousData ? section.is_active ? "1" : "0" : undefined,
                forms: section.forms.map(form => ({
                    slug: form.id.startsWith('form-default-UI-') ? undefined : form.id,
                    name: form.name,
                    description: form.description,
                    position: form.order,
                    editor_roles: form.editor_roles,
                    is_active: previousData ? form.is_active ? '1' : '0' : undefined,
                    form_fields: form.form_fields.map(field => ({
                        id: isNaN(Number(field.id)) ? undefined : Number(field.id),
                        label: field.label,
                        type: field.type as InputType,
                        placeholder: field.placeholder || null,
                        name: field.name,
                        required: field.required,
                        position: field.order,
                        is_active: previousData ? field.is_active ? '1' : '0' : undefined,
                        select_options: field.options.map(option => ({
                            text_label: option.label,
                            value: option.name,
                            position: option.order,
                        }))
                    }))
                }))
            }))
        };

        try {
            toast.promise(mutateAsync(workflowData), {
                loading: previousData ? "Updating worflow..." : "Creating workflow...",
                success: () => {
                    navigate('/system-settings/form-management/form-workflows', { replace: true });
                    if (previousData) return `Form workflow updated successfully!`;
                    return `Form workflow created successfully!`
                },
                error: (e: AxiosError) => {
                    const detail =
                        e?.response?.data &&
                            typeof e.response.data === "object" &&
                            "detail" in e.response.data
                            ? (e.response.data as { detail?: string }).detail
                            : undefined;
                    return `${detail || "Network error!"}`;
                }
            })
        } catch (error) {
            console.log(error)
            toast.error("Failed to create workflow!");
        }
    }, [
        selectedModule,
        selectedLevel,
        formDetails,
        formSections,
        mutateAsync,
        previousData,
        navigate,
    ]);

    // Create form data for preview
    const createFormForPreview = (): WorkflowTemplate => {
        return {
            id: `form-preview-${Date.now()}`,
            name: formDetails.name || 'Untitled Form',
            description: formDetails.description,
            module: selectedModule?.name || '',
            module_level: selectedLevel?.slug || '',
            isActive: true,
            isTemplate: true,
            sections: formSections.length > 0 ? formSections : undefined,
            version: formDetails.version
        };
    };

    useEffect(() => {
        if (!previousData) return;
        setSelectedModule({
            slug: previousData.module_slug,
            name: previousData.module_name,
        });
        setSelectedLevel({
            slug: previousData.module_level,
            name: previousData.module_level_name,
            module_slug: previousData.module_slug,
            module_name: previousData.module_name,
        });
        setFormDetails({
            name: previousData.name,
            description: previousData?.description || '',
            category: previousData.category,
            version: parseFloat(previousData.version)
        });
        if (sections) setFormSections(sections);
        setCurrentStep(4);
    }, [previousData, sections])

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-base xl:text-xl font-semibold mb-2">Select Module</h2>
                            <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                                Choose the system module where this form will be used
                            </p>
                        </div>

                        {!isLoadingModules && modules && modules.length > 0 ?
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {modules.map((module: ModuleProps) => (
                                    <Card
                                        key={module.slug}
                                        className={`py-4 md:py-6 cursor-pointer transition-all hover:shadow-md ${selectedModule?.slug === module.slug
                                            ? 'ring-2 ring-primary border-primary'
                                            : 'hover:border-primary/50'
                                            }`}
                                        onClick={() => setSelectedModule(module)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg text-primary bg-primary/10`}>
                                                    <Component />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{module.name}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Create a form related to {module.name} module.
                                                    </p>
                                                </div>
                                                {selectedModule?.slug === module.slug && (
                                                    <Check className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            :
                            <div className='w-full h-40 flex flex-col items-center justify-center'>
                                {isLoadingModules ? (
                                    <Spinner />
                                ) :
                                    <p className='text-muted-foreground'>Either there is no network connection, or there are no modules yet. Contact the administrator to add modules</p>
                                }
                            </div>
                        }
                    </div>
                );

            case 2:
                return (
                    <>
                        {selectedModule ? (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-base xl:text-xl font-semibold mb-2">Select Level</h2>
                                    <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                                        Choose the administrative level for this form
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        {/* <Badge variant="outline" className={selectedModule.color.replace('bg-', 'border-').replace('/10', '/20')}> */}
                                        <Badge variant="outline">
                                            {selectedModule.name}
                                        </Badge>
                                    </div>
                                </div>

                                {!isLoadingLevels && levels && levels?.results && levels.results.length > 0 ?
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {levels.results.map((level) => (
                                            <Card
                                                key={level.slug}
                                                className={`cursor-pointer transition-all hover:shadow-md ${selectedLevel?.slug === level.slug
                                                    ? 'ring-2 ring-primary border-primary'
                                                    : 'hover:border-primary/50'
                                                    }`}
                                                onClick={() => setSelectedLevel(level)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-medium">{level.name}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Create a form related to {level.name} level
                                                            </p>
                                                        </div>
                                                        {selectedLevel?.slug === level.slug && (
                                                            <Check className="h-5 w-5 text-primary" />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    :
                                    <div className='w-full h-40 flex flex-col items-center justify-center'>
                                        {isLoadingLevels ? (
                                            <Spinner />
                                        ) :
                                            <p className='text-muted-foreground'>This module has no levels yet. You can levels for modules <Link to="/system-settings/module-levels" className="text-blue-800">here</Link>.</p>
                                        }
                                    </div>
                                }
                            </div>
                        ) : null}
                    </>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-base xl:text-xl font-semibold mb-2">Workflow Details</h2>
                            <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                                Define the basic information for your form
                            </p>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                {selectedModule && (
                                    // <Badge variant="outline" className={selectedModule.color.replace('bg-', 'border-').replace('/10', '/20')}>
                                    <Badge variant="outline">
                                        {selectedModule.name}
                                    </Badge>
                                )}
                                {selectedLevel && (
                                    <>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="outline">
                                            {selectedLevel.name}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="formName">Workflow Name *</Label>
                                <Input
                                    id="formName"
                                    placeholder="Enter form name..."
                                    value={formDetails.name}
                                    onChange={(e) => setFormDetails({ ...formDetails, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="formDescription">Description</Label>
                                <Textarea
                                    id="formDescription"
                                    placeholder="Describe the purpose and use of this form..."
                                    value={formDetails?.description || undefined}
                                    onChange={(e) => setFormDetails({ ...formDetails, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="formCategory">Workflow Category</Label>
                                    <Select
                                        value={formDetails?.category ? `${formDetails?.category}` : ''}
                                        onValueChange={(value) => setFormDetails({ ...formDetails, category: parseInt(value) })}
                                        required
                                    >
                                        <SelectTrigger className='w-full capitalize'>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(workflowCategoryTypes).map(([key, value]) => <SelectItem key={key} value={key} className='capitalize'>{value}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="formVersion">Version</Label>
                                    <Input
                                        id="formVersion"
                                        value={formDetails.version}
                                        onChange={(e) => setFormDetails({ ...formDetails, version: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="flex sm:items-center justify-between">
                            <div>
                                <h2 className="text-base xl:text-xl font-semibold mb-2">Build Workflow Structure</h2>
                                <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                                    Create sections, add forms, and define fields
                                </p>
                                <div className="mt-2">
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {formDetails.name || 'Untitled Form'}
                                    </Badge>
                                </div>
                            </div>
                            <Button onClick={addSection} className="gap-2" size="sm">
                                <Plus className="h-4 w-4" />
                                Add Section
                            </Button>
                        </div>

                        {formSections.length === 0 ? (
                            <Card className="border-dashed border-2 p-12 text-center">
                                <div className="space-y-4">
                                    <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                        <Layers className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium">No sections yet</h3>
                                        <p className="text-muted-foreground mt-1">
                                            Start building your form by adding the first section
                                        </p>
                                    </div>
                                    <Button onClick={addSection} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add First Section
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    {formSections.filter(section => section.is_active === true).slice().sort((a, b) => a.order - b.order).map(section => (
                                        <Card key={section.id} className="relative">
                                            <Collapsible
                                                open={uncollapsed.includes(`${section.id}-collapse-section`)}
                                                onOpenChange={(e) => setUncollapsed(prev => {
                                                    if (e) return [...prev, `${section.id}-collapse-section`]
                                                    return prev.filter(item => item !== `${section.id}-collapse-section`)
                                                })}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <div className='flex justify-between w-full py-2 px-5 md:px-6 bg-accent dark:bg-muted/30 hover:bg-muted/90 dark:hover:bg-muted/40 cursor-pointer'>
                                                        <div className="flex items-center gap-2 text-muted-foreground w-full">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger className='flex gap-2 cursor-grab'>
                                                                        <GripVertical className="h-4 w-4" />
                                                                        <Layers className="h-4 w-4" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top">
                                                                        <p>Drag to change position</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <Badge variant="outline" className="text-xs">
                                                                Section {section.order}
                                                            </Badge>
                                                            {!uncollapsed.includes(`${section.id}-collapse-section`) && section.name.length > 0 ? <p className='text-xs md:text-sm line-clamp-1 text-foreground'>{section.name}</p> : null}

                                                        </div>
                                                        <AlertDialog>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                type='button'
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-destructive dark:text-destructive hover:text-destructive"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top">
                                                                        <p>Delete Section</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Section</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this section?
                                                                        {section.name.length > 0 ? <p className='text-center text-foreground'>{section.name}</p> : null}
                                                                        {section.description.length > 0 ? <p className='text-center text-muted-foreground'>{section.description}</p> : null}
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => removeSection(section.id)}
                                                                        className="bg-destructive text-white hover:bg-destructive/90">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent className="flex-1 space-y-3 w-full px-5 md:px-6">
                                                    <div className="flex flex-col md:flex-row gap-3 w-full mt-4">
                                                        <div className='flex flex-col w-full gap-3'>
                                                            <Input
                                                                placeholder="Section name"
                                                                value={section.name}
                                                                onChange={(e) => updateSection(section.id, { name: e.target.value })}
                                                            />
                                                            <MultiSelect
                                                                title='users able to approve'
                                                                data={roles ? roles.filter(role => role.code !== 'ADMIN').map(role => ({ value: role.id, label: role.name })) : []}
                                                                selected={section.approval_roles.map(role => role.user_role)}
                                                                setSelected={(e) => updateSection(section.id, { approval_roles: e.map(role => ({ user_role: role })) })}
                                                                isLoading={isLoadingRoles}
                                                            />
                                                        </div>
                                                        <Textarea
                                                            placeholder="Section description"
                                                            value={section.description}
                                                            onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium">Forms</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {section.forms.length}
                                                                </Badge>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => addForm(section.id)}
                                                                className="gap-2"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Add Form
                                                            </Button>
                                                        </div>

                                                        {section.forms.length === 0 ? (
                                                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                                                <div className="space-y-2">
                                                                    <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto" />
                                                                    <p className="text-sm text-muted-foreground">
                                                                        No forms in this section yet
                                                                    </p>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addForm(section.id)}
                                                                        className="gap-2"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                        Add First Form
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="space-y-4">
                                                                    {section.forms.filter(form => form.is_active === true).slice().sort((a, b) => a.order - b.order).map(form => (
                                                                        <Collapsible
                                                                            key={form.id}
                                                                            open={uncollapsed.includes(`${form.id}-collapse-form`)}
                                                                            onOpenChange={(e) => setUncollapsed(prev => {
                                                                                if (e) return [...prev, `${form.id}-collapse-form`]
                                                                                return prev.filter(item => item !== `${form.id}-collapse-form`)
                                                                            })}
                                                                            className="border rounded-lg py-4 bg-muted/30"
                                                                        >
                                                                            <CollapsibleTrigger asChild>
                                                                                <div className='flex justify-between w-full py-2 px-4 bg-accent dark:bg-muted/40 hover:bg-muted/90 dark:hover:bg-muted/50 cursor-pointer'>
                                                                                    <div className="flex items-center gap-2 text-muted-foreground w-full">
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger className='flex gap-2 cursor-grab'>
                                                                                                    <Move className="h-3 w-3" />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent side="top">
                                                                                                    <p>Drag to change position</p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                        <Badge variant="outline" className="text-xs">
                                                                                            Form {form.order}
                                                                                        </Badge>
                                                                                        {!uncollapsed.includes(`${form.id}-collapse-form`) && form.name.length > 0 ? <p className='text-xs md:text-sm line-clamp-1 text-foreground'>{form.name}</p> : null}
                                                                                    </div>
                                                                                    <AlertDialog>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger asChild>
                                                                                                    <AlertDialogTrigger asChild>
                                                                                                        <Button
                                                                                                            type='button'
                                                                                                            variant="ghost"
                                                                                                            size="sm"
                                                                                                            className="text-destructive dark:text-destructive hover:text-destructive"
                                                                                                        >
                                                                                                            <Trash2 className="h-4 w-4" />
                                                                                                        </Button>
                                                                                                    </AlertDialogTrigger>
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent side="top">
                                                                                                    <p>Delete Form</p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>

                                                                                        <AlertDialogContent>
                                                                                            <AlertDialogHeader>
                                                                                                <AlertDialogTitle>Delete Form</AlertDialogTitle>
                                                                                                <AlertDialogDescription>
                                                                                                    Are you sure you want to delete this form?
                                                                                                    {form.name.length > 0 ? <p className='text-center text-foreground'>{form.name}</p> : null}
                                                                                                    {form.description.length > 0 ? <p className='text-center text-muted-foreground'>{form.description}</p> : null}
                                                                                                </AlertDialogDescription>
                                                                                            </AlertDialogHeader>
                                                                                            <AlertDialogFooter>
                                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                                <AlertDialogAction
                                                                                                    onClick={() => removeForm(section.id, form.id)}
                                                                                                    className="bg-destructive text-white hover:bg-destructive/90">
                                                                                                    Delete
                                                                                                </AlertDialogAction>
                                                                                            </AlertDialogFooter>
                                                                                        </AlertDialogContent>
                                                                                    </AlertDialog>
                                                                                </div>
                                                                            </CollapsibleTrigger>
                                                                            <CollapsibleContent className="space-y-4 px-4">
                                                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                                                    <div className='flex flex-col gap-3'>
                                                                                        <Input
                                                                                            placeholder="Form name"
                                                                                            value={form.name}
                                                                                            onChange={(e) => updateForm(section.id, form.id, { name: e.target.value })}
                                                                                        />
                                                                                        <MultiSelect
                                                                                            title='users able to edit'
                                                                                            data={roles ? roles.filter(role => role.code !== 'ADMIN').map(role => ({ value: role.id, label: role.name })) : []}
                                                                                            selected={form.editor_roles.map(role => role.user_role)}
                                                                                            setSelected={(e) => updateForm(section.id, form.id, { editor_roles: e.map(role => ({ user_role: role })) })}
                                                                                            isLoading={isLoadingRoles}
                                                                                        />
                                                                                    </div>
                                                                                    <Textarea
                                                                                        placeholder="Form description"
                                                                                        value={form.description}
                                                                                        onChange={(e) => updateForm(section.id, form.id, { description: e.target.value })}
                                                                                    />
                                                                                </div>

                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        {form.form_fields.length} fields
                                                                                    </Badge>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        onClick={() => addField(section.id, form.id)}
                                                                                        className="gap-2"
                                                                                    >
                                                                                        <Plus className="h-3 w-3 hidden sm:block" />
                                                                                        Add Field
                                                                                    </Button>
                                                                                </div>

                                                                                {/* Fields */}
                                                                                {form.form_fields.length === 0 ? (
                                                                                    <div className="border-2 border-dashed rounded-lg py-4 text-center">
                                                                                        <div className="space-y-2">
                                                                                            <FolderOpen className="h-5 w-5 text-muted-foreground mx-auto" />
                                                                                            <p className="text-xs text-muted-foreground">
                                                                                                No fields in this form yet
                                                                                            </p>
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                size="sm"
                                                                                                onClick={() => addField(section.id, form.id)}
                                                                                                className="gap-2"
                                                                                            >
                                                                                                <Plus className="h-3 w-3" />
                                                                                                Add First Field
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="space-y-2 pl-4 border-l-2 border-border">
                                                                                            {form.form_fields.filter(field => field.is_active === true).slice().sort((a, b) => a.order - b.order).map(field => (
                                                                                                <div key={field.id} className='bg-background rounded border'>
                                                                                                    <div className="flex flex-col lg:flex-row items-center gap-3 p-3">
                                                                                                        <span className="text-xs text-muted-foreground w-6">
                                                                                                            {field.order}
                                                                                                        </span>
                                                                                                        <Input
                                                                                                            placeholder="Field label"
                                                                                                            value={field.label}
                                                                                                            onChange={(e) => updateField(section.id, form.id, field.id, {
                                                                                                                label: e.target.value,
                                                                                                                name: slugify(e.target.value)
                                                                                                            })}
                                                                                                            className="flex-1"
                                                                                                        />
                                                                                                        <Input
                                                                                                            placeholder="Placeholder"
                                                                                                            value={field.placeholder}
                                                                                                            onChange={(e) => updateField(section.id, form.id, field.id, { placeholder: e.target.value })}
                                                                                                            className="flex-1"
                                                                                                        />
                                                                                                        <Select
                                                                                                            value={field.type}
                                                                                                            onValueChange={(value) => updateField(section.id, form.id, field.id, { type: value as InputType, options: [] })}
                                                                                                        >
                                                                                                            <SelectTrigger className="w-full lg:w-40">
                                                                                                                <SelectValue />
                                                                                                            </SelectTrigger>
                                                                                                            <SelectContent>
                                                                                                                {fieldTypes.map((type) => (
                                                                                                                    <SelectItem key={type.value} value={type.value}>
                                                                                                                        {type.label}
                                                                                                                    </SelectItem>
                                                                                                                ))}
                                                                                                            </SelectContent>
                                                                                                        </Select>
                                                                                                        <div className='flex justify-between gap-3 w-full lg:w-fit'>
                                                                                                            <div className='flex items-center space-x-2'>
                                                                                                                <Switch
                                                                                                                    id={`${section.id}-${form.id}-${field.id}`}
                                                                                                                    className='data-[state=checked]:bg-destructive'
                                                                                                                    checked={field.required}
                                                                                                                    onCheckedChange={(checked) =>
                                                                                                                        updateField(section.id, form.id, field.id, { required: checked })
                                                                                                                    }
                                                                                                                />
                                                                                                                <Label htmlFor={`${section.id}-${form.id}-${field.id}`} className='mt-2'>Required</Label>
                                                                                                            </div>
                                                                                                            <AlertDialog>
                                                                                                                <TooltipProvider>
                                                                                                                    <Tooltip>
                                                                                                                        <TooltipTrigger asChild>
                                                                                                                            <AlertDialogTrigger asChild>
                                                                                                                                <Button
                                                                                                                                    type='button'
                                                                                                                                    variant="ghost"
                                                                                                                                    size="sm"
                                                                                                                                    className="text-destructive dark:text-destructive hover:text-destructive"
                                                                                                                                >
                                                                                                                                    <Trash2 className="h-4 w-4" />
                                                                                                                                </Button>
                                                                                                                            </AlertDialogTrigger>
                                                                                                                        </TooltipTrigger>
                                                                                                                        <TooltipContent side="top">
                                                                                                                            <p>Delete Field</p>
                                                                                                                        </TooltipContent>
                                                                                                                    </Tooltip>
                                                                                                                </TooltipProvider>

                                                                                                                <AlertDialogContent>
                                                                                                                    <AlertDialogHeader>
                                                                                                                        <AlertDialogTitle>Delete Field</AlertDialogTitle>
                                                                                                                        <AlertDialogDescription>
                                                                                                                            Are you sure you want to delete this field?
                                                                                                                            {field.label.length > 0 ? <p className='text-center text-foreground'>{field.label}</p> : null}
                                                                                                                            {field?.placeholder && field?.placeholder.length > 0 ? <p className='text-center text-muted-foreground'>{field.placeholder}</p> : null}
                                                                                                                        </AlertDialogDescription>
                                                                                                                    </AlertDialogHeader>
                                                                                                                    <AlertDialogFooter>
                                                                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                                                        <AlertDialogAction
                                                                                                                            onClick={() => removeField(section.id, form.id, field.id)}
                                                                                                                            className="bg-destructive text-white hover:bg-destructive/90">
                                                                                                                            Delete
                                                                                                                        </AlertDialogAction>
                                                                                                                    </AlertDialogFooter>
                                                                                                                </AlertDialogContent>
                                                                                                            </AlertDialog>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    {field.type === 'select' || field.type === 'multiselect' ? (
                                                                                                        <div className="space-y-2 pl-3">
                                                                                                            <div className="flex items-center justify-between gap-2 px-4 pb-4">
                                                                                                                <Badge variant="outline" className="text-xs">
                                                                                                                    {field.options.length} options
                                                                                                                </Badge>
                                                                                                                <Button
                                                                                                                    variant="outline"
                                                                                                                    size="sm"
                                                                                                                    onClick={() => addOption(section.id, form.id, field.id)}
                                                                                                                    className="gap-2"
                                                                                                                >
                                                                                                                    <Plus className="h-3 w-3 hidden sm:block" />
                                                                                                                    Add Option
                                                                                                                </Button>
                                                                                                            </div>
                                                                                                            {field.options.length === 0 ? (
                                                                                                                <div className="border-2 border-dashed rounded-lg py-4 -mt-4 mb-4 mx-4 text-center">
                                                                                                                    <div className="space-y-2">
                                                                                                                        <FolderOpen className="h-5 w-5 text-muted-foreground mx-auto" />
                                                                                                                        <p className="text-xs text-muted-foreground">
                                                                                                                            No options for this field yet
                                                                                                                        </p>
                                                                                                                        <Button
                                                                                                                            variant="outline"
                                                                                                                            size="sm"
                                                                                                                            onClick={() => addOption(section.id, form.id, field.id)}
                                                                                                                            className="gap-2"
                                                                                                                        >
                                                                                                                            <Plus className="h-3 w-3" />
                                                                                                                            Add First Option
                                                                                                                        </Button>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div className="space-y-2 ml-4 px-4 pb-4 border-l-2 border-border">
                                                                                                                    {field.options.slice().sort((a, b) => a.order - b.order).map(option => (
                                                                                                                        <div key={option.id} className='flex gap-1'>
                                                                                                                            <Input
                                                                                                                                placeholder="Enter Option"
                                                                                                                                value={option.label}
                                                                                                                                onChange={(e) => updateOption(section.id, form.id, field.id, option.id, { name: slugify(e.target.value), label: e.target.value })}
                                                                                                                                className="flex-1"
                                                                                                                            />
                                                                                                                            <Button
                                                                                                                                variant="ghost"
                                                                                                                                size="sm"
                                                                                                                                onClick={() => removeOption(section.id, form.id, field.id, option.id)}
                                                                                                                                className="text-destructive hover:text-destructive"
                                                                                                                            >
                                                                                                                                <Trash2 className="h-3 w-3" />
                                                                                                                            </Button>
                                                                                                                        </div>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ) : null}
                                                                                                </div>
                                                                                            ))}
                                                                                            <div className="flex items-center px-5 md:px-6 [.border-t]:pt-4 md:[.border-t]:pt-5 border-2 border-dashed text-center py-2 justify-center">
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    size="sm"
                                                                                                    onClick={() => addField(section.id, form.id)}
                                                                                                    className="gap-2 mr-4"
                                                                                                >
                                                                                                    <Plus className="h-3 w-3" />
                                                                                                    Add Field
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </CollapsibleContent>
                                                                        </Collapsible>
                                                                    ))}
                                                                </div>
                                                                <CardFooter className="border-2 border-dashed rounded-lg text-center py-2 flex justify-center mt-4">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addForm(section.id)}
                                                                        className="gap-2"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                        Add Form
                                                                    </Button>
                                                                </CardFooter>
                                                            </>
                                                        )}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </Card>
                                    ))}
                                </div>
                                <div className="flex items-center px-5 md:px-6 [.border-t]:pt-4 md:[.border-t]:pt-5 border-2 border-dashed rounded-lg text-center py-2 justify-center mt-5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addSection}
                                        className="gap-2"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Section
                                    </Button>
                                </div>
                            </>
                        )}
                    </div >
                );

            case 5:
                return (
                    <div className="-m-6">
                        <FormPreviewTester
                            workflowData={createFormForPreview()}
                            onSave={handleComplete}
                            onEdit={() => setCurrentStep(4)}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background mb-10">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg md:text-2xl font-semibold">Create New Form Workflow</h1>
                        <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                            Follow the steps to create a structured form with sections and forms
                        </p>
                    </div>
                    {/* <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button> */}
                </div>

                {/* Progress */}
                <Card className='py-4 md:py-6'>
                    <CardContent className='px-4 md:px-6'>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
                                <span className="text-xs md:text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
                            </div>
                            <Progress value={progress} className="w-full" />

                            <div className="flex items-center justify-between gap-1 overflow-x-auto">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex flex-row items-center gap-0.5 md:gap-2 flex-shrink-0">
                                        <div className='flex flex-col xl:flex-row items-center gap-0.5 md:gap-2 flex-shrink-0'>
                                            <div className={`w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${currentStep > step.id
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : currentStep === step.id
                                                    ? 'border-primary text-primary'
                                                    : 'border-muted text-muted-foreground'
                                                }`}>
                                                {currentStep > step.id ? <Check className="h-4 w-4 dark:text-white/80" /> : step.id}
                                            </div>
                                            <div className="flex flex-col text-center xl:text-start">
                                                <span className={`text-[10px] md:text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                    {step.name}
                                                </span>
                                                <span className="text-[9px] md:text-xs text-muted-foreground sr-only sm:not-sr-only">{step.description}</span>
                                            </div>
                                        </div>
                                        {index < steps.length - 1 && <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground mx-1 sm:mx-2" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Step Content */}
                <Card className="py-4 md:py-6">
                    <CardContent className="px-4 md:px-6 min-h-80">
                        {renderStepContent()}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
                        {currentStep < steps.length ? (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    (currentStep === 1 && !selectedModule) ||
                                    (currentStep === 2 && !selectedLevel) ||
                                    (currentStep === 3 && !formDetails.name) ||
                                    (currentStep === 3 && !formDetails?.category) ||
                                    (currentStep === 4 && formSections.length === 0)
                                }
                                className="gap-2"
                            >
                                {currentStep === 5 ? (
                                    <>
                                        Preview & Test
                                        <TestTube className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={!formDetails.name || formSections.length === 0 || isPending}
                                className="gap-2"
                            >
                                <Check className="h-4 w-4" />
                                {previousData ? 'Edit' : 'Create'} Form Workflow
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}