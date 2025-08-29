import { FormEvent, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import type { WorkflowProps } from '@/queries/useWorkflowQuery';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, ChevronRight, ChevronDown, Edit, Save, Check, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import FormField, { FieldValue } from '@/components/form-field';
import { InputType } from '@/types/input-types';
import { useAuth } from '@/store/auth';

export function SectionedForm({ data, disabled, isSubmitting, projectId }: { data: WorkflowProps; disabled?: boolean; isSubmitting?: boolean; projectId?: string }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams();
    const { user } = useAuth()

    const [isLoading, setIsLoading] = useState(false);

    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [activeForm, setActiveForm] = useState<string>('');

    // const [formData, setFormData] = useState<Record<string, FieldValue>>({});
    const [fieldData, setFieldData] = useState<Record<string, FieldValue>>({});

    const updateFieldValue = (formSlug: string, value: string, type: InputType, name: string, field_id: number, project_id: string) => {
        if (!user || project_id.length === 0) return
        setFieldData(prev => ({
            ...prev,
            [`${formSlug}-${field_id}`]: { value, type, name, field_id, project_id, created_by: user.id }
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>, formSlug: string) => {
        e.preventDefault()
        if (!user) return
        try {
            setIsLoading(true)
            console.log(formSlug)
            console.log(fieldData)
        } catch (e) {
            console.log(e)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const renderForm = (formId: string) => {
        if (!data) return

        const form = data.sections
            .flatMap(section => section.forms)
            .find(sf => sf.slug === formId);

        if (!form) return null;

        const isSingle = data.sections.length == 1 && data.sections.every(section => section.forms.length == 1)

        if (isSingle)
            return (
                <Card className='max-w-4xl mx-auto pt-0 md:pt-0 overflow-hidden'>
                    <CardHeader className='bg-muted dark:bg-accent/50 pb-2 pt-6 flex justify-between gap-1'>
                        <div className='w-full'>
                            <CardTitle>
                                <h1 className="text-sm md:text-base lg:text-lg font-semibold text-foreground">{form.name}</h1>
                            </CardTitle>
                            <CardDescription>
                                <p className="text-xs lg:text-sm text-muted-foreground">{form?.description || null}</p>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            {disabled ? (
                                <Link
                                    to={`/system-settings/form-workflows/${data.slug}/edit`}
                                    className={cn(buttonVariants({ variant: 'outline' }), 'text-sm')}
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit<span className='hidden md:inline'> Workflow</span>
                                </Link>
                            ) : null}
                        </div>
                    </CardHeader>
                    <form onSubmit={(e) => handleSubmit(e, form.slug)} className='space-y-4'>
                        <CardContent>
                            <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-between">
                                {form.fields.slice().sort((a, b) => a.position - b.position).map((field) =>
                                    <FormField
                                        key={field.id}
                                        disabled={disabled}
                                        value={fieldData[`${form.slug}-${field.id}`]?.value}
                                        setValue={updateFieldValue}
                                        project_id={projectId || ""}
                                        {...field}
                                    />
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type='submit' className='w-full' disabled={disabled || isSubmitting || isLoading}>
                                {isSubmitting || isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )

        return (
            <div className="h-full flex flex-col">
                <div className={`bg-primary/5 border-b border-border px-4 md:px-6 py-3 mb-6 ${disabled && "-mt-6"}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button type='button' variant="ghost" size="sm" onClick={() => navigate(-1)}>
                                <ArrowLeft className="h-4 w-4" />
                                {isSingle ? 'Back' : 'Sections'}
                            </Button>
                            <div>
                                <h1 className="text-sm md:text-base lg:text-lg font-semibold text-foreground">{form.name}</h1>
                                <p className="text-xs lg:text-sm text-muted-foreground">{form?.description || null}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`flex-1 overflow-y-auto ${!disabled ? "px-4 md:px-6 pb-4 md:pb-4" : ""}`}>
                    <Card>
                        <form onSubmit={(e) => handleSubmit(e, form.slug)} className='space-y-4'>
                            <CardContent>
                                <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-between">
                                    {form.fields.slice().sort((a, b) => a.position - b.position).map((field) => (
                                        <FormField
                                            key={field.id}
                                            disabled={disabled}
                                            value={fieldData[form.slug]?.value}
                                            setValue={updateFieldValue}
                                            project_id={projectId || ""}
                                            {...field}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type='submit' className='w-full' disabled={disabled || isSubmitting || isLoading}>
                                    {isSubmitting || isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        );
    };

    useEffect(() => {
        const active = searchParams.get("form");
        if (active) setActiveForm(active)
        else setActiveForm('')
    }, [searchParams])

    useEffect(() => {
        if (!data) return
        if (data.sections.length == 1 && data.sections.every(section => section.forms.length == 1))
            setActiveForm(data.sections[0].forms[0].slug);
        if (data?.sections.length > 0) {
            const lowest = [...data.sections].sort(
                (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
            )[0]
            if (lowest) setExpandedSections([lowest.slug])
        }
    }, [])

    if (activeForm) return renderForm(activeForm);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className={`bg-primary/5 border-b border-border px-4 md:px-6 py-3 mb-6 ${disabled && "-mt-6"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button type='button' variant="ghost" size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-sm md:text-base lg:text-lg font-semibold text-foreground">{data.name}</h1>
                            <p className="text-xs lg:text-sm text-muted-foreground">
                                {data?.description || ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {disabled ? (
                            <Link
                                to={`/system-settings/form-workflows/${data.slug}/edit`}
                                className={cn(buttonVariants({ variant: 'outline' }), 'text-sm')}
                            >
                                <Edit className="h-4 w-4" />
                                Edit<span className='hidden md:inline'> Workflow</span>
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto ${!disabled ? "px-4 md:px-6 pb-4 md:pb-4" : ""}`}>
                <div className="space-y-4">
                    {data.sections.slice().sort((a, b) => a.position - b.position).slice().sort((a, b) => a.position - b.position).map((section) => (
                        <Card key={section.slug} className="overflow-hidden gap-2 lg:gap-2 pb-3 md:pb-3">
                            <Collapsible
                                open={expandedSections.includes(section.slug)}
                                onOpenChange={() => toggleSection(section.slug)}
                            >
                                <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-4 bg-muted/60 dark:bg-muted/20 hover:bg-muted/90 dark:hover:bg-muted/40 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                {/* {section.icon} */}
                                                <span className="font-medium">{section.name}</span>
                                            </div>
                                            {/* <Badge variant={section.isCompleted ? "default" : "secondary"} className={section.isCompleted ? "bg-green-600" : ""}> */}
                                            <Badge variant={"secondary"} className={""}>
                                                {/* {section.isCompleted ? "Complete" : `${section.subForms.filter(sf => sf.isCompleted).length}/${section.subForms.length}`} */}
                                                {/* {`${section.forms.filter(sf => sf.isCompleted).length}/${section.forms.length}`} */}
                                                {section.forms.length}
                                            </Badge>
                                            {/* {!section.isAccessible && (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Locked
                                                </Badge>
                                            )} */}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">{section.forms.length === 1 ? `1 form` : `${section.forms.length} forms`}</span>
                                            {expandedSections.includes(section.slug) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent className="border-y border-border">
                                    <div className="p-4 space-y-3">
                                        <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                                        <div className="grid gap-3">
                                            {section.forms.slice().sort((a, b) => a.position - b.position).map((form) => (
                                                <Link to={`${window.location.origin}${location.pathname}?form=${form.slug}`}>
                                                    <div
                                                        key={form.slug}
                                                        // className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${form.isAccessible
                                                        //     ? 'hover:bg-muted/50 cursor-pointer'
                                                        //     : 'bg-muted/20 cursor-not-allowed'
                                                        //     }`}
                                                        className={cn(`flex items-center justify-between p-3 rounded-lg border transition-colors bg-muted/20 cursor-pointer`,
                                                            {
                                                                "border-green-700 dark:border-green-800": form.slug,
                                                            }
                                                        )}
                                                    // onClick={() => form.isAccessible && Sub(form.id, section)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2">
                                                                {form.slug
                                                                    ? <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-800" />
                                                                    : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
                                                                <div>
                                                                    <div className="font-medium text-sm">{form.name}</div>
                                                                    <div className="text-xs text-muted-foreground">{form?.description || null}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/* {!form.isAccessible && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <Lock className="h-3 w-3 mr-1" />
                                                                Locked
                                                            </Badge>
                                                        )}
                                                        {form.isCompleted && (
                                                            <Badge variant="default" className="bg-green-600 text-xs">
                                                                Complete
                                                            </Badge>
                                                        )} */}
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                            <CardFooter className='flex items-center justify-between px-3 md:px-4'>
                                <p className='text-muted-foreground text-xs md:text-sm'>Approval</p>
                                <Button type='button' size='sm' disabled={disabled || isSubmitting || isLoading}>
                                    {isSubmitting || isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Approving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Approve
                                        </>
                                    )}
                                    {"  "}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}