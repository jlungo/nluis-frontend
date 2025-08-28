import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import type { FieldOption, FormField, FormSection, SectionForm, WorkflowSubmisionStructure, WorkflowTemplate } from './FormPreviewTester';
import { workflowCategoryTypes } from '@/types/constants';
import { slugify } from '@/lib/utils';
import { useRolesQuery } from '@/queries/useRolesQuery';
import { MultiSelect } from '@/components/multiselect';
import { Switch } from '@/components/ui/switch';

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
    const [formSections, setFormSections] = useState<FormSection[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [activeForm, setActiveForm] = useState<string | null>(null);

    const { data: roles, isLoading: isLoadingRoles } = useRolesQuery();
    const { data: modules, isLoading: isLoadingModules } = useModulesQuery();
    const { data: levels, isLoading: isLoadingLevels } = useLevelsQuery(1000, 0, '', selectedModule?.slug ? selectedModule.slug : "")

    const fieldTypes: { value: InputType, label: string }[] = [
        { value: 'text', label: 'Text Input' },
        { value: 'email', label: 'Email Input' },
        { value: 'number', label: 'Number Input' },
        { value: 'textarea', label: 'Text Area' },
        { value: 'select', label: 'Dropdown Select' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'radio', label: 'Radio Button' },
        { value: 'date', label: 'Date Picker' },
        { value: 'file', label: 'File Upload' },
        // { value: 'switch', label: 'Toggle Switch' },
        // { value: 'map-area', label: 'Interactive Map Area' },
        // { value: 'gps-coordinates', label: 'GPS Coordinates' },
        // { value: 'boundary-mapper', label: 'Boundary Drawing Tool' },
        // { value: 'location-picker', label: 'Location Picker' }
    ];

    const steps = [
        { id: 1, name: 'Module', description: 'Choose module' },
        { id: 2, name: 'Level', description: 'Select level' },
        { id: 3, name: 'Workflow', description: 'Workflow details' },
        { id: 4, name: 'Structure', description: 'Build sections' },
        { id: 5, name: 'Preview', description: 'Test & preview' }
    ];

    const progress = (currentStep / steps.length) * 100;

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);

            // Auto-generate sections when moving to step 5
            if (currentStep === 4 && formSections.length === 0) {
                initializeDefaultSections();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const initializeDefaultSections = () => {

        const defaultSections: FormSection[] = [
            {
                id: `section-default-UI-${Date.now()}-1`,
                name: ``,
                description: '',
                forms: [],
                approval_roles: [],
                order: 1
            }
        ]

        setFormSections(defaultSections);
    };

    const addSection = () => {
        const newSection: FormSection = {
            id: `section-default-UI-${Date.now()}`,
            name: ``,
            description: '',
            forms: [],
            approval_roles: [],
            order: formSections.length + 1
        };
        setFormSections([...formSections, newSection]);
        setActiveSection(newSection.id);
    };

    const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId ? { ...section, ...updates } : section
            )
        );
    };

    const removeSection = (sectionId: string) => {
        setFormSections(sections => sections.filter(section => section.id !== sectionId));
        if (activeSection === sectionId) {
            setActiveSection(null);
        }
    };

    const addForm = (sectionId: string) => {
        const section = formSections.find(s => s.id === sectionId);
        const newForm: SectionForm = {
            id: `form-${Date.now()}`,
            name: ``,
            editor_roles: [],
            description: '',
            fields: [],
            order: (section?.forms.length || 0) + 1
        };

        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: [...section.forms, newForm]
                    }
                    : section
            )
        );
        setActiveForm(newForm.id);
    };

    const updateForm = (sectionId: string, formId: string, updates: Partial<SectionForm>) => {
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
    };

    const removeForm = (sectionId: string, formId: string) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.filter(form => form.id !== formId)
                    }
                    : section
            )
        );
        if (activeForm === formId) {
            setActiveForm(null);
        }
    };

    const addField = (sectionId: string, formId: string) => {
        const section = formSections.find(s => s.id === sectionId);
        if (!section) return
        const form = section.forms.find(sf => sf.id === formId);
        const newField: FormField = {
            id: `field-${Date.now()}`,
            name: '',
            label: ``,
            type: 'text',
            required: false,
            options: [],
            order: (form?.fields.length || 0) + 1
        };

        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: [...form.fields, newField]
                                }
                                : form
                        )
                    }
                    : section
            )
        );
    };

    const updateField = (sectionId: string, formId: string, fieldId: string, updates: Partial<FormField>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: form.fields.map(field =>
                                        field.id === fieldId ? { ...field, ...updates } : field
                                    )
                                }
                                : form
                        )
                    }
                    : section
            )
        )
    };

    const removeField = (sectionId: string, formId: string, fieldId: string) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: form.fields.filter(field => field.id !== fieldId)
                                }
                                : form
                        )
                    }
                    : section
            )
        );
    };

    const addOption = (sectionId: string, formId: string, fieldId: string) => {
        const section = formSections.find(s => s.id === sectionId);
        if (!section) return
        const form = section.forms.find(sf => sf.id === formId);
        if (!form) return
        const field = form.fields.find(sf => sf.id === fieldId);
        const newOption: FieldOption = {
            id: `option-${Date.now()}`,
            label: '',
            name: '',
            order: (field?.options?.length || 0) + 1,
        };

        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: form.fields.map(field =>
                                        field.id === fieldId
                                            ? {
                                                ...field,
                                                options: [...field?.options, newOption]
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
    };

    const updateOption = (sectionId: string, formId: string, fieldId: string, optionId: string, updates: Partial<FormField>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: form.fields.map(field =>
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
    };

    const removeOption = (sectionId: string, formId: string, fieldId: string, optionId: string) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        forms: section.forms.map(form =>
                            form.id === formId
                                ? {
                                    ...form,
                                    fields: form.fields.map(field =>
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
    };

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (e: WorkflowSubmisionStructure) => {
            if (previousData) return api.put(`/form-management/submissions/${previousData.slug}/update/`, e);
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

    const handleComplete = () => {
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

        const workflowData: WorkflowSubmisionStructure = {
            name: formDetails.name,
            description: formDetails.description,
            module_level: selectedLevel.slug,
            category: formDetails.category,
            version: `${formDetails.version}`,
            sections: formSections.map(section => ({
                name: section.name,
                description: section.description,
                position: section.order,
                approval_roles: section.approval_roles,
                forms: section.forms.map(form => ({
                    name: form.name,
                    description: form.description,
                    position: form.order,
                    editor_roles: form.editor_roles,
                    fields: form.fields.map(field => ({
                        label: field.label,
                        type: field.type as InputType,
                        placeholder: field.placeholder || null,
                        name: field.name,
                        required: field.required,
                        position: field.order,
                        select_options: field.options.map(option => ({
                            text_label: option.label,
                            value: option.name,
                            position: option.order,
                        }))
                    }))
                }))
            }))
        };

        // console.log(workflowData)

        try {
            toast.promise(mutateAsync(workflowData), {
                loading: previousData ? "Updating worflow..." : "Creating workflow...",
                success: () => {
                    navigate('/system-settings/form-workflows', { replace: true });
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
    };

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
                            <div className="space-y-6">
                                {formSections.slice().sort((a, b) => a.order - b.order).map((section, sectionIndex) => (
                                    <Card key={section.id} className="relative">
                                        <CardHeader className="pb-2">
                                            <div className="flex flex-col md:flex-row items-start gap-4">
                                                <div className='flex justify-between w-full md:w-fit md:hidden'>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <GripVertical className="h-4 w-4" />
                                                        <Layers className="h-4 w-4" />
                                                        <Badge variant="outline" className="text-xs">
                                                            Section {sectionIndex + 1}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeSection(section.id)}
                                                        className="text-destructive dark:text-destructive hover:text-destructive ml-auto"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex-1 space-y-3 w-full">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                                        <Input
                                                            placeholder="Section name"
                                                            value={section.name}
                                                            onChange={(e) => updateSection(section.id, { name: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Section description"
                                                            value={section.description}
                                                            onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                                        />
                                                        <MultiSelect
                                                            title='users able to approve'
                                                            data={roles ? roles.filter(role => role.code !== 'ADMIN').map(role => ({ value: role.id, label: role.name })) : []}
                                                            selected={section.approval_roles.map(role => role.user_role)}
                                                            setSelected={(e) => updateSection(section.id, { approval_roles: e.map(role => ({ user_role: role })) })}
                                                            isLoading={isLoadingRoles}
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSection(section.id)}
                                                    className="text-destructive dark:text-destructive hover:text-destructive ml-auto hidden md:block"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
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
                                                <div className="space-y-4">
                                                    {section.forms.slice().sort((a, b) => a.order - b.order).map((form, formIndex) => (
                                                        <div key={form.id} className="border rounded-lg p-4 bg-muted/30">
                                                            <div className="space-y-4">
                                                                <div className="flex flex-col md:flex-row gap-3">
                                                                    <div className='flex justify-between w-full md:w-fit md:hidden'>
                                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                                            <Move className="h-3 w-3" />
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Form {formIndex + 1}
                                                                            </Badge>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeForm(section.id, form.id)}
                                                                            className="text-destructive hover:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        <Input
                                                                            placeholder="Form name"
                                                                            value={form.name}
                                                                            onChange={(e) => updateForm(section.id, form.id, { name: e.target.value })}
                                                                        />
                                                                        <Input
                                                                            placeholder="Form description"
                                                                            value={form.description}
                                                                            onChange={(e) => updateForm(section.id, form.id, { description: e.target.value })}
                                                                        />
                                                                        <MultiSelect
                                                                            title='users able to edit'
                                                                            data={roles ? roles.filter(role => role.code !== 'ADMIN').map(role => ({ value: role.id, label: role.name })) : []}
                                                                            selected={form.editor_roles.map(role => role.user_role)}
                                                                            setSelected={(e) => updateForm(section.id, form.id, { editor_roles: e.map(role => ({ user_role: role })) })}
                                                                            isLoading={isLoadingRoles}
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeForm(section.id, form.id)}
                                                                        className="text-destructive hover:text-destructive ml-auto hidden md:block"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addField(section.id, form.id)}
                                                                        className="gap-2"
                                                                    >
                                                                        <Plus className="h-3 w-3 hidden sm:block" />
                                                                        Add Field
                                                                    </Button>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {form.fields.length} fields
                                                                    </Badge>
                                                                </div>

                                                                {/* Fields */}
                                                                {form.fields.length > 0 && (
                                                                    <div className="space-y-2 pl-4 border-l-2 border-border">
                                                                        {form.fields.slice().sort((a, b) => a.order - b.order).map((field, fieldIndex) => (
                                                                            <div key={field.id} className='bg-background rounded border'>
                                                                                <div className="flex flex-col lg:flex-row items-center gap-3 p-3">
                                                                                    <span className="text-xs text-muted-foreground w-6">
                                                                                        {fieldIndex + 1}
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
                                                                                        onValueChange={(value) => updateField(section.id, form.id, field.id, { type: value, options: [] })}
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
                                                                                            <Label htmlFor={`${section.id}-${form.id}-${field.id}`}>Required</Label>
                                                                                        </div>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() => removeField(section.id, form.id, field.id)}
                                                                                            className="text-destructive hover:text-destructive"
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                                {field.type === 'select' ? (
                                                                                    <div className="space-y-2 pl-3">
                                                                                        <div className="flex items-center gap-2 pl-4 pb-4">
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                size="sm"
                                                                                                onClick={() => addOption(section.id, form.id, field.id)}
                                                                                                className="gap-2"
                                                                                            >
                                                                                                <Plus className="h-3 w-3 hidden sm:block" />
                                                                                                Add Option
                                                                                            </Button>
                                                                                            <Badge variant="outline" className="text-xs">
                                                                                                {field.options.length} options
                                                                                            </Badge>
                                                                                        </div>
                                                                                        {field.options.length > 0 ? (
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
                                                                                        ) : null}
                                                                                    </div>
                                                                                ) : null}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
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

    // Don't show normal layout for step 6 (preview)
    if (currentStep === 6) return renderStepContent();

    return (
        <div className="min-h-screen bg-background">
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