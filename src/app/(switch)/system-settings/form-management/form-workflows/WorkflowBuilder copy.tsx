import { useCallback, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    Check,
    ChevronRight,
    Plus,
    Trash2,
    GripVertical,
    Layers,
    FolderOpen,
    Move,
} from 'lucide-react';
import type { InputType } from '@/types/input-types';
import type { FormField, FormSection, SectionForm } from './FormPreviewTester';
import { slugify } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function WorkflowBuilder() {
    const [currentStep, setCurrentStep] = useState(1);
    const [uncollapsed, setUncollapsed] = useState<string[]>([])
    const [formSections, setFormSections] = useState<FormSection[]>([]);

    const fieldTypes = useMemo<{ value: InputType; label: string }[]>(
        () => [
            { value: 'text', label: 'Text Input' },
            { value: 'email', label: 'Email Input' }
        ],
        []
    );

    const steps = useMemo(() => [
        { id: 1, name: 'Module', description: 'Choose module' },
        { id: 2, name: 'Level', description: 'Select level' },
        { id: 3, name: 'Workflow', description: 'Workflow details' },
        { id: 4, name: 'Structure', description: 'Build sections' },
    ], []);

    const progress = useMemo(() => (currentStep / steps.length) * 100, [currentStep, steps.length]);

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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <></>
            case 2:
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
                                        Untitled Form
                                    </Badge>
                                </div>
                            </div>
                            <Button onClick={addSection} className="gap-2" size="sm">
                                <Plus className="h-4 w-4" />
                                Add Section
                            </Button>
                        </div>

                        {formSections.length > 0 && (
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
                                                    <Button
                                                        type='button'
                                                        onClick={() => removeSection(section.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive dark:text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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

                                                    {section.forms.length > 0 && (
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
                                                                            <Button
                                                                                type='button'
                                                                                onClick={() => removeForm(section.id, form.id)}
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-destructive dark:text-destructive hover:text-destructive"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
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
                                                                        {form.form_fields.length > 0 && (
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
                                                                                                <Button
                                                                                                    type='button'
                                                                                                    onClick={() => removeField(section.id, form.id, field.id)}
                                                                                                    variant="ghost"
                                                                                                    size="sm"
                                                                                                    className="text-destructive dark:text-destructive hover:text-destructive"
                                                                                                >
                                                                                                    <Trash2 className="h-4 w-4" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </CollapsibleContent>
                                                                </Collapsible>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div >
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background mb-10">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg md:text-2xl font-semibold">Create New Form Workflow</h1>
                </div>
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
                <Card className="py-4 md:py-6">
                    <CardContent className="px-4 md:px-6 min-h-80">
                        {renderStepContent()}
                    </CardContent>
                </Card>
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
                        <Button className="gap-2">
                            <Check className="h-4 w-4" />
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}