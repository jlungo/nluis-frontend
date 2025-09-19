import { useState } from 'react';
import {
    CheckCircle,
    Circle,
    ArrowLeft,
    ArrowRight,
    X,
    Save,
    FileText,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export interface FormStep {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    isCompleted: boolean;
    isRequired: boolean;
    validationErrors?: string[];
    isOffline?: boolean;
}

interface MultiStepFormProps {
    steps: FormStep[];
    currentStepId: string;
    formTitle: string;
    formDescription?: string;
    children: React.ReactNode;
    onStepChange: (stepId: string) => void;
    onNext: () => void;
    onPrevious: () => void;
    onSave: () => void;
    onCancel: () => void;
    onComplete: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
    isLastStep: boolean;
    isSaving?: boolean;
    className?: string;
    onSectionClick?: (sectionId: string) => void;
    projectId?: string;
}

export default function MultiStepForm({
    steps,
    currentStepId,
    formTitle,
    //   formDescription,
    children,
    onStepChange,
    onNext,
    onPrevious,
    onSave,
    onCancel,
    onComplete,
    canGoNext,
    canGoPrevious,
    isLastStep,
    isSaving = false,
    //   className = "",
    //   onSectionClick,
    //   projectId
}: MultiStepFormProps) {
    const [formSidebarCollapsed, setFormSidebarCollapsed] = useState(false);
    const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
    const currentStep = steps[currentStepIndex];
    const completedSteps = steps.filter(step => step.isCompleted).length;
    const progressPercentage = (completedSteps / steps.length) * 100;

    const getStepIcon = (step: FormStep, _index: number) => {
        if (step.isCompleted) {
            return <CheckCircle className="h-5 w-5 text-progress-completed" />;
        } else if (step.id === currentStepId) {
            return <Circle className="h-5 w-5 text-primary" />;
        } else if (step.validationErrors && step.validationErrors.length > 0) {
            return <AlertCircle className="h-5 w-5 text-destructive" />;
        } else {
            return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const canNavigateToStep = (step: FormStep, index: number) => {
        // Can navigate to completed steps or the current step
        if (step.isCompleted || step.id === currentStepId) return true;

        // Can navigate to the next uncompleted step if previous steps are completed
        if (index === 0) return true;
        return steps.slice(0, index).every(prevStep => prevStep.isCompleted);
    };

    return (
        <div className="h-full flex overflow-hidden">
            {/* Form Steps Sidebar - FIXED */}
            <div className={`${formSidebarCollapsed ? 'w-16' : 'w-72'} transition-all duration-300 bg-card border-r border-border flex flex-col flex-shrink-0`}>
                {/* Compact Sidebar Header - FIXED */}
                <div className="flex-shrink-0 p-3 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {!formSidebarCollapsed && (
                                <>
                                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                                        <FileText className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                    <span className="font-medium text-foreground text-sm">Steps</span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFormSidebarCollapsed(!formSidebarCollapsed)}
                                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                            >
                                {formSidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {!formSidebarCollapsed && (
                        <div className="space-y-1 mt-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="text-foreground">{completedSteps}/{steps.length}</span>
                            </div>
                            <Progress value={progressPercentage} className="h-1" />
                        </div>
                    )}
                </div>

                {/* Steps List - SCROLLABLE - More compact */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {steps.map((step, index) => {
                            const isActive = step.id === currentStepId;
                            const canNavigate = canNavigateToStep(step, index);

                            if (formSidebarCollapsed) {
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => canNavigate && onStepChange(step.id)}
                                        disabled={!canNavigate}
                                        className={`w-full p-2 rounded transition-colors relative flex items-center justify-center ${isActive
                                            ? 'bg-primary/10 border border-primary/20'
                                            : step.isCompleted
                                                ? 'bg-progress-completed/10 hover:bg-progress-completed/20'
                                                : canNavigate
                                                    ? 'hover:bg-muted/50'
                                                    : 'opacity-50 cursor-not-allowed'
                                            }`}
                                        title={step.title}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : step.isCompleted
                                                ? 'bg-progress-completed text-white'
                                                : step.validationErrors && step.validationErrors.length > 0
                                                    ? 'bg-destructive text-destructive-foreground'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {step.isCompleted ? (
                                                <CheckCircle className="h-3 w-3" />
                                            ) : step.validationErrors && step.validationErrors.length > 0 ? (
                                                <AlertCircle className="h-3 w-3" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>

                                        {step.isRequired && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-destructive rounded-full" />}
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => canNavigate && onStepChange(step.id)}
                                    disabled={!canNavigate}
                                    className={`w-full text-left p-2 rounded transition-colors ${isActive
                                        ? 'bg-primary/10 border border-primary/20'
                                        : step.isCompleted
                                            ? 'bg-progress-completed/10 hover:bg-progress-completed/20'
                                            : canNavigate
                                                ? 'hover:bg-muted/50'
                                                : 'opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {getStepIcon(step, index)}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-medium text-xs ${isActive ? 'text-primary' :
                                                    step.isCompleted ? 'text-progress-completed' :
                                                        'text-foreground'
                                                    }`}>
                                                    {step.title}
                                                </span>
                                                {step.isRequired && (
                                                    <span className="text-xs text-destructive">*</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs px-1 py-0 h-4 ${step.isCompleted
                                                        ? 'border-progress-completed text-progress-completed'
                                                        : isActive
                                                            ? 'border-primary text-primary'
                                                            : 'border-muted-foreground text-muted-foreground'
                                                        }`}
                                                >
                                                    {index + 1}
                                                </Badge>

                                                {step.validationErrors && step.validationErrors.length > 0 && (
                                                    <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                                                        {step.validationErrors.length}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Auto-save indicator - FIXED - More compact */}
                {!formSidebarCollapsed && (
                    <div className="flex-shrink-0 p-1 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Save className="h-2 w-2" />
                            <span>Saved</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area - NO WASTED SPACE */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Minimal Header - FIXED */}
                <div className="flex-shrink-0 border-b border-border bg-card">
                    {/* Title Section - Ultra compact */}
                    <div className="px-4 py-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-medium text-foreground">
                                    {formTitle}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {completedSteps}/{steps.length}
                                </Badge>
                                {currentStep?.isRequired && (
                                    <Badge variant="destructive" className="text-xs">
                                        Required
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="px-4 pb-0.5">
                        <Progress value={progressPercentage} className="h-0.5" />
                    </div>
                </div>

                {/* Form Content - MAXIMUM SPACE - NO PADDING */}
                <div className="flex-1 overflow-y-auto">
                    <div className="h-full">
                        {children}
                    </div>
                </div>

                {/* Navigation Footer - FIXED - Extra Compact */}
                <div className="flex-shrink-0 p-2 border-t border-border bg-card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onPrevious}
                                disabled={!canGoPrevious}
                                className="h-8"
                            >
                                <ArrowLeft className="h-3 w-3 mr-1" />
                                Previous
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onSave}
                                disabled={isSaving}
                                className="h-8"
                            >
                                <Save className="h-3 w-3 mr-1" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>

                            {isLastStep ? (
                                <Button
                                    size="sm"
                                    onClick={onComplete}
                                    disabled={!canGoNext}
                                    className="bg-progress-completed hover:bg-progress-completed/90 h-8"
                                >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Complete
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={onNext}
                                    disabled={!canGoNext}
                                    className="h-8"
                                >
                                    Next
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}