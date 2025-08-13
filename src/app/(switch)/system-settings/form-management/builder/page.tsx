import React, { useLayoutEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import FormPreviewTester from './FormPreviewTester';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    MapPin,
    Shield,
    FileText,
    Building2,
    Database,
    BarChart3,
    Settings,
    Users,
    ChevronRight,
    Plus,
    Trash2,
    GripVertical,
    Layers,
    FolderOpen,
    Move,
    TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { usePageStore } from '@/store/pageStore';

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

// interface FormDefinition {
//   id: string;
//   name: string;
//   description: string;
//   sections: FormSection[];
//   version: string;
// }

interface Module {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

interface Level {
    id: string;
    name: string;
    description: string;
    applicableModules: string[];
}

interface FormCategory {
    id: string;
    name: string;
    description: string;
    defaultSections: Partial<FormSection>[];
}

interface FormTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    module: string;
    isActive: boolean;
    isTemplate: boolean;
    fields: FormField[];
    sections: FormSection[];
    mode: 'simple' | 'advanced';
    version: string;
}

interface HierarchicalFormWizardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComplete: (formData: any) => void;
    onCancel: () => void;
}

export default function HierarchicalFormWizard({
    onComplete,
    onCancel
}: HierarchicalFormWizardProps) {
    const { setPage } = usePageStore();

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: "System Settings",
            backButton: 'Back',
        })
    }, [setPage])

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<FormCategory | null>(null);
    const [formDetails, setFormDetails] = useState({
        name: '',
        description: '',
        category: '',
        version: '1.0'
    });
    const [formSections, setFormSections] = useState<FormSection[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [activeSubform, setActiveSubform] = useState<string | null>(null);

    // Available modules
    const modules: Module[] = [
        {
            id: 'land-use',
            name: 'Land Use Planning',
            description: 'Village, district, and regional land use planning forms',
            icon: <MapPin className="h-6 w-6" />,
            color: 'text-primary bg-primary/10'
        },
        {
            id: 'ccro-management',
            name: 'CCRO Management',
            description: 'Certificate of Customary Right of Occupancy forms',
            icon: <Shield className="h-6 w-6" />,
            color: 'text-chart-2 bg-chart-2/10'
        },
        {
            id: 'document-management',
            name: 'Document Management',
            description: 'Document upload, categorization, and management forms',
            icon: <FileText className="h-6 w-6" />,
            color: 'text-chart-3 bg-chart-3/10'
        },
        {
            id: 'billing',
            name: 'Billing & Payments',
            description: 'Fee management and payment processing forms',
            icon: <Building2 className="h-6 w-6" />,
            color: 'text-chart-4 bg-chart-4/10'
        },
        {
            id: 'inventory-tracking',
            name: 'Inventory Tracking',
            description: 'Tool and asset inventory management forms',
            icon: <Database className="h-6 w-6" />,
            color: 'text-emerald-600 bg-emerald-600/10'
        },
        {
            id: 'organizations',
            name: 'Organizations',
            description: 'Organization registration and management forms',
            icon: <Users className="h-6 w-6" />,
            color: 'text-purple-600 bg-purple-600/10'
        },
        {
            id: 'reports',
            name: 'Reports & Analytics',
            description: 'Report configuration and generation forms',
            icon: <BarChart3 className="h-6 w-6" />,
            color: 'text-orange-600 bg-orange-600/10'
        },
        {
            id: 'system-settings',
            name: 'System Settings',
            description: 'System configuration and management forms',
            icon: <Settings className="h-6 w-6" />,
            color: 'text-gray-600 bg-gray-600/10'
        }
    ];

    // Available levels
    const levels: Level[] = [
        {
            id: 'village',
            name: 'Village Level',
            description: 'Forms for village-level planning and management',
            applicableModules: ['land-use', 'ccro-management', 'organizations']
        },
        {
            id: 'ward',
            name: 'Ward Level',
            description: 'Forms for ward-level administration',
            applicableModules: ['land-use', 'organizations', 'reports']
        },
        {
            id: 'district',
            name: 'District Level',
            description: 'Forms for district-level planning and coordination',
            applicableModules: ['land-use', 'ccro-management', 'billing', 'reports']
        },
        {
            id: 'regional',
            name: 'Regional Level',
            description: 'Forms for regional planning and oversight',
            applicableModules: ['land-use', 'reports', 'system-settings']
        },
        {
            id: 'zonal',
            name: 'Zonal Level',
            description: 'Forms for zonal coordination and management',
            applicableModules: ['land-use', 'reports']
        },
        {
            id: 'national',
            name: 'National Level',
            description: 'Forms for national policy and strategic planning',
            applicableModules: ['land-use', 'reports', 'system-settings']
        },
        {
            id: 'project',
            name: 'Project Level',
            description: 'Forms for specific projects and initiatives',
            applicableModules: ['land-use', 'ccro-management', 'document-management', 'inventory-tracking']
        },
        {
            id: 'institutional',
            name: 'Institutional Level',
            description: 'Forms for institutional management and operations',
            applicableModules: ['organizations', 'billing', 'inventory-tracking', 'system-settings']
        }
    ];

    // Get categories based on selected module and level
    const getCategories = (): FormCategory[] => {
        if (!selectedModule || !selectedLevel) return [];

        const categoryMap: Record<string, Record<string, FormCategory[]>> = {
            'land-use': {
                'village': [
                    {
                        id: 'village-planning',
                        name: 'Village Planning',
                        description: 'Comprehensive village land use planning and zoning forms',
                        defaultSections: [
                            {
                                name: 'Basic Information',
                                description: 'Essential project and location details',
                                order: 1
                            },
                            {
                                name: 'Land Assessment',
                                description: 'Land use evaluation and analysis',
                                order: 2
                            },
                            {
                                name: 'Community Consultation',
                                description: 'Stakeholder engagement and feedback',
                                order: 3
                            }
                        ]
                    },
                    {
                        id: 'community-consultation',
                        name: 'Community Consultation',
                        description: 'Forms for stakeholder engagement and consultation processes',
                        defaultSections: [
                            {
                                name: 'Stakeholder Identification',
                                description: 'Identify and categorize stakeholders',
                                order: 1
                            },
                            {
                                name: 'Consultation Activities',
                                description: 'Record consultation meetings and activities',
                                order: 2
                            }
                        ]
                    }
                ],
                'district': [
                    {
                        id: 'district-planning',
                        name: 'District Planning',
                        description: 'Forms for district-level land use planning',
                        defaultSections: [
                            {
                                name: 'District Overview',
                                description: 'District-wide planning overview',
                                order: 1
                            },
                            {
                                name: 'Inter-Village Coordination',
                                description: 'Coordination between villages',
                                order: 2
                            }
                        ]
                    }
                ]
            },
            'ccro-management': {
                'village': [
                    {
                        id: 'application-processing',
                        name: 'Application Processing',
                        description: 'Forms for CCRO application processing workflow',
                        defaultSections: [
                            {
                                name: 'Applicant Information',
                                description: 'Personal and contact details',
                                order: 1
                            },
                            {
                                name: 'Land Details',
                                description: 'Property and land information',
                                order: 2
                            },
                            {
                                name: 'Documentation',
                                description: 'Required supporting documents',
                                order: 3
                            }
                        ]
                    }
                ]
            }
        };

        return categoryMap[selectedModule.id]?.[selectedLevel.id] || [
            {
                id: 'general',
                name: 'General Forms',
                description: 'General purpose forms for this module and level',
                defaultSections: [
                    {
                        name: 'Basic Information',
                        description: 'Essential form information',
                        order: 1
                    }
                ]
            }
        ];
    };

    const fieldTypes = [
        { value: 'text', label: 'Text Input' },
        { value: 'email', label: 'Email Input' },
        { value: 'number', label: 'Number Input' },
        { value: 'textarea', label: 'Text Area' },
        { value: 'select', label: 'Dropdown Select' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'radio', label: 'Radio Button' },
        { value: 'date', label: 'Date Picker' },
        { value: 'file', label: 'File Upload' },
        { value: 'switch', label: 'Toggle Switch' },
        { value: 'map-area', label: 'Interactive Map Area' },
        { value: 'gps-coordinates', label: 'GPS Coordinates' },
        { value: 'boundary-mapper', label: 'Boundary Drawing Tool' },
        { value: 'location-picker', label: 'Location Picker' }
    ];

    const steps = [
        { id: 1, name: 'Module', description: 'Choose module' },
        { id: 2, name: 'Level', description: 'Select level' },
        { id: 3, name: 'Category', description: 'Pick category' },
        { id: 4, name: 'Form', description: 'Create form' },
        { id: 5, name: 'Structure', description: 'Build sections' },
        { id: 6, name: 'Preview', description: 'Test & preview' }
    ];

    const progress = (currentStep / steps.length) * 100;

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);

            // Auto-generate sections when moving to step 5
            if (currentStep === 4 && selectedCategory && formSections.length === 0) {
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
        if (!selectedCategory?.defaultSections) return;

        const defaultSections: FormSection[] = selectedCategory.defaultSections.map((sectionTemplate, index) => ({
            id: `section-${Date.now()}-${index}`,
            name: sectionTemplate.name || `Section ${index + 1}`,
            description: sectionTemplate.description || '',
            subforms: [],
            order: sectionTemplate.order || index + 1
        }));

        setFormSections(defaultSections);
    };

    const addSection = () => {
        const newSection: FormSection = {
            id: `section-${Date.now()}`,
            name: `Section ${formSections.length + 1}`,
            description: '',
            subforms: [],
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

    const addSubform = (sectionId: string) => {
        const section = formSections.find(s => s.id === sectionId);
        const newSubform: FormSubform = {
            id: `subform-${Date.now()}`,
            name: `Subform ${(section?.subforms.length || 0) + 1}`,
            description: '',
            fields: [],
            isRequired: false,
            order: (section?.subforms.length || 0) + 1
        };

        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        subforms: [...section.subforms, newSubform]
                    }
                    : section
            )
        );
        setActiveSubform(newSubform.id);
    };

    const updateSubform = (sectionId: string, subformId: string, updates: Partial<FormSubform>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        subforms: section.subforms.map(subform =>
                            subform.id === subformId ? { ...subform, ...updates } : subform
                        )
                    }
                    : section
            )
        );
    };

    const removeSubform = (sectionId: string, subformId: string) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        subforms: section.subforms.filter(subform => subform.id !== subformId)
                    }
                    : section
            )
        );
        if (activeSubform === subformId) {
            setActiveSubform(null);
        }
    };

    const addField = (sectionId: string, subformId: string) => {
        const section = formSections.find(s => s.id === sectionId);
        const subform = section?.subforms.find(sf => sf.id === subformId);
        const newField: FormField = {
            id: `field-${Date.now()}`,
            name: '',
            label: `Field ${(subform?.fields.length || 0) + 1}`,
            type: 'text',
            required: false,
            order: (subform?.fields.length || 0) + 1
        };

        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        subforms: section.subforms.map(subform =>
                            subform.id === subformId
                                ? {
                                    ...subform,
                                    fields: [...subform.fields, newField]
                                }
                                : subform
                        )
                    }
                    : section
            )
        );
    };

    const updateField = (sectionId: string, subformId: string, fieldId: string, updates: Partial<FormField>) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        subforms: section.subforms.map(subform =>
                            subform.id === subformId
                                ? {
                                    ...subform,
                                    fields: subform.fields.map(field =>
                                        field.id === fieldId ? { ...field, ...updates } : field
                                    )
                                }
                                : subform
                        )
                    }
                    : section
            )
        );
    };

    const removeField = (sectionId: string, subformId: string, fieldId: string) => {
        setFormSections(sections =>
            sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        subforms: section.subforms.map(subform =>
                            subform.id === subformId
                                ? {
                                    ...subform,
                                    fields: subform.fields.filter(field => field.id !== fieldId)
                                }
                                : subform
                        )
                    }
                    : section
            )
        );
    };

    const handleComplete = () => {
        if (!selectedModule || !selectedLevel || !selectedCategory) {
            toast.error('Please complete all required selections');
            return;
        }

        if (!formDetails.name) {
            toast.error('Please provide a form name');
            return;
        }

        if (formSections.length === 0) {
            toast.error('Please add at least one section to the form');
            return;
        }

        const formData: FormTemplate = {
            id: `form-${Date.now()}`,
            name: formDetails.name,
            description: formDetails.description,
            category: formDetails.category || selectedCategory.name,
            module: selectedModule.name,
            isActive: true,
            isTemplate: true,
            fields: [], // Advanced mode uses sections
            sections: formSections,
            mode: 'advanced',
            version: formDetails.version
        };

        onComplete(formData);
        toast.success('Form created successfully!');
    };

    // Create form data for preview
    const createFormForPreview = (): FormTemplate => {
        return {
            id: `form-preview-${Date.now()}`,
            name: formDetails.name || 'Untitled Form',
            description: formDetails.description,
            category: formDetails.category || selectedCategory?.name || 'General',
            module: selectedModule?.name || 'Unknown',
            isActive: true,
            isTemplate: true,
            fields: [], // Advanced mode uses sections
            sections: formSections,
            mode: 'advanced',
            version: formDetails.version
        };
    };

    const handlePreviewSave = (formData: FormTemplate) => {
        onComplete(formData);
        toast.success('Form saved successfully!');
    };

    const handlePreviewEdit = () => {
        setCurrentStep(5); // Go back to structure editing
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Select Module</h2>
                            <p className="text-muted-foreground">
                                Choose the system module where this form will be used
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modules.map((module) => (
                                <Card
                                    key={module.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedModule?.id === module.id
                                        ? 'ring-2 ring-primary border-primary'
                                        : 'hover:border-primary/50'
                                        }`}
                                    onClick={() => setSelectedModule(module)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${module.color}`}>
                                                {module.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium">{module.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {module.description}
                                                </p>
                                            </div>
                                            {selectedModule?.id === module.id && (
                                                <Check className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Select Level</h2>
                            <p className="text-muted-foreground">
                                Choose the administrative level for this form
                            </p>
                            {selectedModule && (
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="outline" className={selectedModule.color.replace('bg-', 'border-').replace('/10', '/20')}>
                                        {selectedModule.name}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {levels
                                .filter(level =>
                                    !selectedModule || level.applicableModules.includes(selectedModule.id)
                                )
                                .map((level) => (
                                    <Card
                                        key={level.id}
                                        className={`cursor-pointer transition-all hover:shadow-md ${selectedLevel?.id === level.id
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
                                                        {level.description}
                                                    </p>
                                                </div>
                                                {selectedLevel?.id === level.id && (
                                                    <Check className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Select Category</h2>
                            <p className="text-muted-foreground">
                                Choose the form category or type
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                {selectedModule && (
                                    <Badge variant="outline" className={selectedModule.color.replace('bg-', 'border-').replace('/10', '/20')}>
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

                        <div className="space-y-4">
                            {getCategories().map((category) => (
                                <Card
                                    key={category.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedCategory?.id === category.id
                                        ? 'ring-2 ring-primary border-primary'
                                        : 'hover:border-primary/50'
                                        }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium">{category.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {category.description}
                                                </p>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Layers className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {category.defaultSections.length} default sections
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedCategory?.id === category.id && (
                                                <Check className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Form Details</h2>
                            <p className="text-muted-foreground">
                                Define the basic information for your form
                            </p>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                {selectedModule && (
                                    <Badge variant="outline" className={selectedModule.color.replace('bg-', 'border-').replace('/10', '/20')}>
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
                                {selectedCategory && (
                                    <>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="outline">
                                            {selectedCategory.name}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="formName">Form Name *</Label>
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
                                    value={formDetails.description}
                                    onChange={(e) => setFormDetails({ ...formDetails, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="formCategory">Category</Label>
                                    <Select
                                        value={formDetails.category}
                                        onValueChange={(value) => setFormDetails({ ...formDetails, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="registration">Registration</SelectItem>
                                            <SelectItem value="assessment">Assessment</SelectItem>
                                            <SelectItem value="approval">Approval</SelectItem>
                                            <SelectItem value="monitoring">Monitoring</SelectItem>
                                            <SelectItem value="reporting">Reporting</SelectItem>
                                            <SelectItem value="workflow">Workflow</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="formVersion">Version</Label>
                                    <Input
                                        id="formVersion"
                                        value={formDetails.version}
                                        onChange={(e) => setFormDetails({ ...formDetails, version: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Build Form Structure</h2>
                                <p className="text-muted-foreground">
                                    Create sections, add subforms, and define fields
                                </p>
                                <div className="mt-2">
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {formDetails.name || 'Untitled Form'}
                                    </Badge>
                                </div>
                            </div>
                            <Button onClick={addSection} className="gap-2">
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
                                {formSections.map((section, sectionIndex) => (
                                    <Card key={section.id} className="relative">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <GripVertical className="h-4 w-4" />
                                                    <Layers className="h-4 w-4" />
                                                    <Badge variant="outline" className="text-xs">
                                                        Section {sectionIndex + 1}
                                                    </Badge>
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSection(section.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Subforms</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {section.subforms.length}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addSubform(section.id)}
                                                    className="gap-2"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Add Subform
                                                </Button>
                                            </div>

                                            {section.subforms.length === 0 ? (
                                                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                                    <div className="space-y-2">
                                                        <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto" />
                                                        <p className="text-sm text-muted-foreground">
                                                            No subforms in this section yet
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addSubform(section.id)}
                                                            className="gap-2"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add First Subform
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {section.subforms.map((subform, subformIndex) => (
                                                        <div key={subform.id} className="border rounded-lg p-4 bg-muted/30">
                                                            <div className="space-y-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <Move className="h-3 w-3" />
                                                                        <Badge variant="outline" className="text-xs">
                                                                            Subform {subformIndex + 1}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        <Input
                                                                            placeholder="Subform name"
                                                                            value={subform.name}
                                                                            onChange={(e) => updateSubform(section.id, subform.id, { name: e.target.value })}
                                                                        />
                                                                        <Input
                                                                            placeholder="Subform description"
                                                                            value={subform.description}
                                                                            onChange={(e) => updateSubform(section.id, subform.id, { description: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeSubform(section.id, subform.id)}
                                                                        className="text-destructive hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => updateSubform(section.id, subform.id, { isRequired: !subform.isRequired })}
                                                                        className={subform.isRequired ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}
                                                                    >
                                                                        {subform.isRequired ? 'Required' : 'Optional'}
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addField(section.id, subform.id)}
                                                                        className="gap-2"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                        Add Field
                                                                    </Button>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {subform.fields.length} fields
                                                                    </Badge>
                                                                </div>

                                                                {/* Fields */}
                                                                {subform.fields.length > 0 && (
                                                                    <div className="space-y-2 pl-4 border-l-2 border-border">
                                                                        {subform.fields.map((field, fieldIndex) => (
                                                                            <div key={field.id} className="flex items-center gap-3 p-3 bg-background rounded border">
                                                                                <span className="text-xs text-muted-foreground w-6">
                                                                                    {fieldIndex + 1}
                                                                                </span>
                                                                                <Input
                                                                                    placeholder="Field label"
                                                                                    value={field.label}
                                                                                    onChange={(e) => updateField(section.id, subform.id, field.id, {
                                                                                        label: e.target.value,
                                                                                        name: e.target.value.toLowerCase().replace(/\s+/g, '')
                                                                                    })}
                                                                                    className="flex-1"
                                                                                />
                                                                                <Select
                                                                                    value={field.type}
                                                                                    onValueChange={(value) => updateField(section.id, subform.id, field.id, { type: value })}
                                                                                >
                                                                                    <SelectTrigger className="w-40">
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
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => updateField(section.id, subform.id, field.id, { required: !field.required })}
                                                                                    className={field.required ? 'bg-primary/10 text-primary border-primary/20' : ''}
                                                                                >
                                                                                    {field.required ? 'Required' : 'Optional'}
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => removeField(section.id, subform.id, field.id)}
                                                                                    className="text-destructive hover:text-destructive"
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </Button>
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

            case 6:
                return (
                    <div className="h-screen -m-6">
                        <FormPreviewTester
                            formData={createFormForPreview()}
                            onSave={handlePreviewSave}
                            onEdit={handlePreviewEdit}
                            onCancel={onCancel}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    // Don't show normal layout for step 6 (preview)
    if (currentStep === 6) {
        return renderStepContent();
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Create New Form</h1>
                        <p className="text-muted-foreground">
                            Follow the steps to create a structured form with sections and subforms
                        </p>
                    </div>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>

                {/* Progress */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
                                <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
                            </div>
                            <Progress value={progress} className="w-full" />

                            <div className="flex items-center gap-4 overflow-x-auto">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${currentStep > step.id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : currentStep === step.id
                                                ? 'border-primary text-primary'
                                                : 'border-muted text-muted-foreground'
                                            }`}>
                                            {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                                                }`}>
                                                {step.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{step.description}</span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Step Content */}
                <Card className="min-h-96">
                    <CardContent className="p-6">
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
                                    (currentStep === 3 && !selectedCategory) ||
                                    (currentStep === 4 && !formDetails.name) ||
                                    (currentStep === 5 && formSections.length === 0)
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
                                disabled={!formDetails.name || formSections.length === 0}
                                className="gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Create Form
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}