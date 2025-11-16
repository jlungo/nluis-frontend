import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronRight,
    Component,
    FileText,
    Trash2,
    GripVertical,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useModulesQuery, type ModuleProps } from '@/queries/useModuleQuery';
import { useLevelsQuery, type LevelProps } from '@/queries/useLevelQuery';
import { useNavigate } from 'react-router';
import { Spinner } from '@/components/ui/spinner';
import { useCreateReportTemplateMutation, type ReportTemplateProps } from '@/queries/useReportTemplateQuery';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    DragEndEvent,
    MouseSensor,
    TouchSensor,
    DragOverlay,
    PointerSensor,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface DataSource {
    id: string;
    label: string;
    type: string;
    description?: string;
}

export default function ReportTemplateBuilder({ previousData }: { previousData?: ReportTemplateProps }) {
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedModule, setSelectedModule] = useState<ModuleProps | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<LevelProps | null>(null);
    const [templateDetails, setTemplateDetails] = useState<{
        name: string;
        description: string;
        is_active: boolean;
    }>({
        name: '',
        description: '',
        is_active: true,
    });
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [extractedPlaceholders, setExtractedPlaceholders] = useState<string[]>([]);
    const [placeholderMappings, setPlaceholderMappings] = useState<Record<string, DataSource | null>>({});
    const [activeId, setActiveId] = useState<string | null>(null);

    const { data: modules, isLoading: isLoadingModules } = useModulesQuery();
    const { data: levels, isLoading: isLoadingLevels } = useLevelsQuery(1000, 0, '', selectedModule?.slug ? selectedModule.slug : "");
    const { mutateAsync: createTemplate, isPending } = useCreateReportTemplateMutation();

    // Mock data sources
    const dataSources: DataSource[] = useMemo(() => [
        { id: 'village_name', label: 'Village Name', type: 'Text', description: 'Name of the village' },
        { id: 'district_name', label: 'District Name', type: 'Text', description: 'Name of the district' },
        { id: 'region_name', label: 'Region Name', type: 'Text', description: 'Name of the region' },
        { id: 'population_total', label: 'Total Population', type: 'Number', description: 'Total population count' },
        { id: 'population_male', label: 'Male Population', type: 'Number', description: 'Male population count' },
        { id: 'population_female', label: 'Female Population', type: 'Number', description: 'Female population count' },
        { id: 'report_date', label: 'Report Date', type: 'Date', description: 'Date of report generation' },
        { id: 'land_use_residential', label: 'Residential Land Use', type: 'Number', description: 'Residential area in hectares' },
        { id: 'land_use_agricultural', label: 'Agricultural Land Use', type: 'Number', description: 'Agricultural area in hectares' },
        { id: 'land_use_commercial', label: 'Commercial Land Use', type: 'Number', description: 'Commercial area in hectares' },
        { id: 'created_by', label: 'Created By', type: 'Text', description: 'User who created the report' },
        { id: 'executive_summary', label: 'Executive Summary', type: 'Long Text', description: 'Summary content' },
    ], []);

    const steps = useMemo(() => [
        { id: 1, name: 'Module', description: 'Choose module' },
        { id: 2, name: 'Level', description: 'Choose locality level' },
        { id: 3, name: 'Template', description: 'Template details' },
        { id: 4, name: 'Upload & Map', description: 'Upload and map placeholders' },
        { id: 5, name: 'Preview', description: 'Review & save' }
    ], []);

    const progress = useMemo(() => (currentStep / steps.length) * 100, [currentStep, steps.length]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(MouseSensor),
        useSensor(TouchSensor)
    );

    const handleNext = useCallback(() => {
        setCurrentStep(prevStep => {
            const nextStep = prevStep < steps.length ? prevStep + 1 : prevStep;
            return nextStep;
        });
    }, [setCurrentStep, steps.length]);

    const handleBack = useCallback(() => {
        setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));
    }, [setCurrentStep]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.docx')) {
                toast.error('Please upload a .docx file');
                return;
            }
            setTemplateFile(file);
            
            setTimeout(() => {
                const mockPlaceholders = [
                    'village_name',
                    'district_name',
                    'population_total',
                    'report_date',
                    'executive_summary'
                ];
                setExtractedPlaceholders(mockPlaceholders);
                
                const initialMappings: Record<string, DataSource | null> = {};
                mockPlaceholders.forEach(p => {
                    initialMappings[p] = null;
                });
                setPlaceholderMappings(initialMappings);
                toast.success(`Extracted ${mockPlaceholders.length} placeholders from template`);
            }, 500);
        }
    };

    const handleDragStart = (event: DragEndEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && extractedPlaceholders.includes(over.id as string)) {
            const source = dataSources.find(s => s.id === active.id);
            if (source) {
                setPlaceholderMappings(prev => ({
                    ...prev,
                    [over.id as string]: source
                }));
                toast.success(`Mapped ${source.label} to {{${over.id}}}`);
            }
        }
        
        setActiveId(null);
    };

    const handleRemoveMapping = (placeholder: string) => {
        setPlaceholderMappings(prev => ({
            ...prev,
            [placeholder]: null
        }));
    };

    const handleComplete = async () => {
        try {
            if (!selectedModule || !selectedLevel || !templateFile) {
                toast.error('Missing required data');
                return;
            }

            const formData = new FormData();
            formData.append('name', templateDetails.name);
            formData.append('description', templateDetails.description);
            formData.append('module', selectedModule.slug);
            formData.append('module_level', selectedLevel.slug);
            formData.append('is_active', String(templateDetails.is_active));
            formData.append('template_file', templateFile);
            
            const mappings: Record<string, string> = {};
            Object.entries(placeholderMappings).forEach(([placeholder, source]) => {
                if (source) {
                    mappings[placeholder] = source.id;
                }
            });
            formData.append('placeholder_mappings', JSON.stringify(mappings));

            const response = await createTemplate(formData);
            toast.success('Report template created successfully!');
            navigate(`/system-settings/form-management/reports/${response.slug}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create template');
            console.error(error);
        }
    };

    useEffect(() => {
        if (!previousData) return;
        setSelectedModule({
            slug: previousData.module_slug || '',
            name: previousData.module_name || '',
        });
        setSelectedLevel({
            slug: previousData.level_slug || '',
            name: previousData.level_name || '',
            module_slug: previousData.module_slug || '',
            module_name: previousData.module_name || '',
        });
        setTemplateDetails({
            name: previousData.name,
            description: previousData.description || '',
            is_active: previousData.is_active,
        });
        setCurrentStep(4);
    }, [previousData]);

    const activeSource = dataSources.find(s => s.id === activeId);
    const unmappedCount = extractedPlaceholders.filter(p => !placeholderMappings[p]).length;
    const mappingsArray = Object.entries(placeholderMappings).filter(([_, source]) => source !== null);

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-base xl:text-xl font-semibold mb-2">Select Module</h2>
                            <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                                Choose the system module where this report template will be used
                            </p>
                        </div>

                        {!isLoadingModules && modules && modules.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {modules.map((module: ModuleProps) => (
                                    <Card
                                        key={module.slug}
                                        className={`py-4 md:py-6 cursor-pointer transition-all hover:shadow-md ${
                                            selectedModule?.slug === module.slug
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
                                                        Create a report template for {module.name} module.
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
                        ) : (
                            <div className='w-full h-40 flex flex-col items-center justify-center'>
                                {isLoadingModules ? (
                                    <Spinner />
                                ) : (
                                    <p className='text-muted-foreground'>
                                        Either there is no network connection, or there are no modules yet. Contact the administrator to add modules
                                    </p>
                                )}
                            </div>
                        )}
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
                                        Choose the administrative level for this report template
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge variant="outline">
                                            {selectedModule.name}
                                        </Badge>
                                    </div>
                                </div>

                                {!isLoadingLevels && levels && levels?.results && levels.results.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {levels.results.map((level) => (
                                            <Card
                                                key={level.slug}
                                                className={`cursor-pointer transition-all hover:shadow-md ${
                                                    selectedLevel?.slug === level.slug
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
                                                                Create a report template for {level.name} level
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
                                ) : (
                                    <div className='w-full h-40 flex flex-col items-center justify-center'>
                                        {isLoadingLevels ? (
                                            <Spinner />
                                        ) : (
                                            <p className='text-muted-foreground'>
                                                This module has no levels yet. Contact the administrator.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-base xl:text-xl font-semibold mb-2">Template Details</h2>
                            <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                                Define the basic information for your report template
                            </p>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                {selectedModule && (
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
                                <Label htmlFor="templateName">Template Name *</Label>
                                <Input
                                    id="templateName"
                                    placeholder="e.g., Village Land Use Report"
                                    value={templateDetails.name}
                                    onChange={(e) => setTemplateDetails({ ...templateDetails, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="templateDescription">Description</Label>
                                <Textarea
                                    id="templateDescription"
                                    placeholder="Describe the purpose of this report template..."
                                    value={templateDetails.description}
                                    onChange={(e) => setTemplateDetails({ ...templateDetails, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label htmlFor="is_active">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Make this template available for use
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={templateDetails.is_active}
                                    onCheckedChange={(checked) =>
                                        setTemplateDetails({ ...templateDetails, is_active: checked })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                );

            case 4:
                // Draggable Data Source Component
                const DraggableDataSource = ({ source }: { source: DataSource }) => {
                    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
                        id: source.id,
                        data: source,
                    });

                    const style = {
                        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                        opacity: isDragging ? 0.5 : 1,
                    };

                    return (
                        <div
                            ref={setNodeRef}
                            style={style}
                            {...listeners}
                            {...attributes}
                            className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-primary hover:shadow-sm transition-all"
                        >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">{source.label}</p>
                                {source.description && (
                                    <p className="text-xs text-muted-foreground">{source.description}</p>
                                )}
                            </div>
                            <Badge variant="outline" className="text-xs">{source.type}</Badge>
                        </div>
                    );
                };

                // Droppable Placeholder Component
                const DroppablePlaceholder = ({
                    placeholder,
                    mapping,
                    onRemove,
                }: {
                    placeholder: string;
                    mapping: DataSource | null;
                    onRemove: () => void;
                }) => {
                    const { setNodeRef, isOver } = useDroppable({
                        id: placeholder,
                    });

                    return (
                        <div
                            ref={setNodeRef}
                            className={`p-4 border-2 border-dashed rounded-lg transition-all ${
                                isOver
                                    ? 'border-primary bg-primary/5 scale-105'
                                    : mapping
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 bg-gray-50'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {`{{${placeholder}}}`}
                                        </Badge>
                                    </div>
                                    {mapping ? (
                                        <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                                            <div>
                                                <p className="text-sm font-medium text-green-700">{mapping.label}</p>
                                                <p className="text-xs text-muted-foreground">{mapping.type}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={onRemove}
                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            Drag and drop a data source here
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-base xl:text-xl font-semibold mb-2">Upload Template & Map Placeholders</h2>
                            <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                                Upload your .docx template and drag data sources to map placeholders
                            </p>
                            <div className="mt-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                    {templateDetails.name || 'Untitled Template'}
                                </Badge>
                            </div>
                        </div>

                        {/* File Upload */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="template_file">Upload .docx Template *</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="template_file"
                                                type="file"
                                                accept=".docx"
                                                onChange={handleFileChange}
                                                className="max-w-md"
                                            />
                                            {templateFile && (
                                                <Badge variant="secondary" className="gap-2">
                                                    <FileText className="h-3 w-3" />
                                                    {templateFile.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Use placeholders in format: {`{{placeholder_name}}`}
                                        </p>
                                    </div>

                                    {extractedPlaceholders.length > 0 && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Found {extractedPlaceholders.length} placeholder(s) in the template.
                                                {unmappedCount > 0 && (
                                                    <span className="text-orange-600 font-medium">
                                                        {' '}
                                                        {unmappedCount} unmapped.
                                                    </span>
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Drag & Drop Mapping */}
                        {extractedPlaceholders.length > 0 && (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Data Sources */}
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="mb-4">
                                                <h3 className="text-base font-semibold mb-1">Available Data Sources</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Drag data sources to map them to placeholders
                                                </p>
                                            </div>
                                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                                {dataSources.map((source) => (
                                                    <DraggableDataSource key={source.id} source={source} />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Placeholders */}
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="mb-4">
                                                <h3 className="text-base font-semibold mb-1">Template Placeholders</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Drop data sources here to map them
                                                </p>
                                            </div>
                                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                                {extractedPlaceholders.map((placeholder) => (
                                                    <DroppablePlaceholder
                                                        key={placeholder}
                                                        placeholder={placeholder}
                                                        mapping={placeholderMappings[placeholder]}
                                                        onRemove={() => handleRemoveMapping(placeholder)}
                                                    />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <DragOverlay>
                                    {activeSource && (
                                        <div className="p-3 bg-white border-2 border-primary rounded-lg shadow-lg">
                                            <p className="text-sm font-medium">{activeSource.label}</p>
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {activeSource.type}
                                            </Badge>
                                        </div>
                                    )}
                                </DragOverlay>
                            </DndContext>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-base xl:text-xl font-semibold mb-2">Review & Save</h2>
                            <p className="text-xs md:text-sm xl:text-base text-muted-foreground">
                                Review your report template configuration before saving
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="space-y-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Check className="h-5 w-5 text-green-600" />
                                        <h3 className="text-base font-semibold">Template Information</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Name</p>
                                                <p className="font-medium">{templateDetails.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Status</p>
                                                <Badge variant={templateDetails.is_active ? 'default' : 'secondary'}>
                                                    {templateDetails.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Module</p>
                                                <p className="font-medium">{selectedModule?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Locality Level</p>
                                                <p className="font-medium">{selectedLevel?.name}</p>
                                            </div>
                                        </div>
                                        {templateDetails.description && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Description</p>
                                                <p className="text-sm">{templateDetails.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Check className="h-5 w-5 text-green-600" />
                                        <h3 className="text-base font-semibold">Template File</h3>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="font-medium">{templateFile?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {templateFile?.size && `${(templateFile.size / 1024).toFixed(2)} KB`}
                                            </p>
                                        </div>
                                        <Badge>DOCX</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Check className="h-5 w-5 text-green-600" />
                                        <h3 className="text-base font-semibold">Placeholder Mappings</h3>
                                        <Badge variant="secondary">{mappingsArray.length} mapped</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {mappingsArray.map(([placeholder, source]) => (
                                            <div
                                                key={placeholder}
                                                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {`{{${placeholder}}}`}
                                                    </Badge>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium text-green-700">{source!.label}</p>
                                                        <p className="text-xs text-muted-foreground">{source!.type}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-green-200 bg-green-50/50">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-green-900">Ready to save!</p>
                                            <p className="text-sm text-green-700 mt-1">
                                                Your report template is configured and ready to be saved. Click "{previousData ? 'Update' : 'Create'} Report Template" below.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-semibold">
                        {previousData ? 'Edit' : 'Create'} Report Template
                    </h1>
                    <p className="text-muted-foreground">
                        {previousData ? 'Update your report template' : 'Follow the steps to create a new report template'}
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            {steps.map((step, index) => (
                                <Fragment key={step.id}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                                currentStep > step.id
                                                    ? 'bg-primary border-primary text-white'
                                                    : currentStep === step.id
                                                    ? 'border-primary text-primary'
                                                    : 'border-gray-300 text-gray-400'
                                            }`}
                                        >
                                            {currentStep > step.id ? (
                                                <Check className="h-5 w-5" />
                                            ) : (
                                                <span className="font-semibold">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium">{step.name}</p>
                                            <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-0.5 bg-gray-200 mx-4 mt-[-2rem]">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: currentStep > step.id ? '100%' : '0%' }}
                                            />
                                        </div>
                                    )}
                                </Fragment>
                            ))}
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Step Content */}
            <Card className="min-h-[500px]">
                <CardContent className="pt-6">
                    {renderStepContent()}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </Button>
                </div>
                <div>
                    {currentStep === steps.length ? (
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/system-settings/form-management/reports')}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleComplete}
                                disabled={!templateDetails.name || !templateFile || isPending}
                                className="gap-2"
                            >
                                <Check className="h-4 w-4" />
                                {previousData ? 'Update' : 'Create'} Report Template
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={
                                (currentStep === 1 && !selectedModule) ||
                                (currentStep === 2 && !selectedLevel) ||
                                (currentStep === 3 && !templateDetails.name) ||
                                (currentStep === 4 && !templateFile)
                            }
                            className="gap-2"
                        >
                            Next
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
