import { type FormEvent, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { questionnaireQueryKey, type FormProps, type SectionProps, type QuestionnaireProps } from '@/queries/useQuestionnaireQuery';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, ChevronRight, ChevronDown, Edit, Save, CheckCircle, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import FormField, { type ValueType } from '@/components/form-field';
import type { InputType } from '@/types/input-types';
import { useAuth } from '@/store/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { type questionnaireDataI, questionnaireDataQueryKey } from '@/queries/useQuestionnaireDataQuery';
import { Progress } from '../ui/progress';
import { queryProjectKey } from '@/queries/useProjectQuery';

interface FieldValue {
    value?: ValueType;
    type: InputType;
    field_id: number;
    project_locality_id: string;
    created_by: string;
}

type Props = {
    data: QuestionnaireProps;
    values?: questionnaireDataI[];
    disabled?: boolean;
    projectLocalityId?: string;
    projectName?: string;
    projectLocaleName?: string
    projectLocaleId?: string
    projectLocaleProgress?: number
}

export function SectionedForm({ data, values, disabled, projectLocalityId, projectName, projectLocaleName, projectLocaleId, projectLocaleProgress }: Props) {
    const queryClient = useQueryClient();
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams();
    const { user } = useAuth()

    const [isLoading, setIsLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [activeForm, setActiveForm] = useState<string>('');
    const [fieldData, setFieldData] = useState<Record<string, FieldValue>>({});
    const [editForm, setEditForm] = useState(false);

    const updateFieldValue = (formSlug: string, value: ValueType, type: InputType, field_id: number, project_locality_id: string) => {
        if (!user || project_locality_id.length === 0) return
        setFieldData(prev => ({
            ...prev,
            [`${formSlug}-${field_id}`]: { value, type, field_id, project_locality_id, created_by: user.id }
        }));
    };

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (e: FormData) => {
            // TODO: Add edit questionnairedata endpoint
            if (editForm) return api.post(`/form-management/submit-questionnaire-data/`, e, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            // TODO: Add edit questionnairedata endpoint
            return api.post(`/form-management/submit-questionnaire-data/`, e, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [questionnaireDataQueryKey],
            })
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [queryProjectKey],
            })
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [questionnaireQueryKey],
            })
        },
        onError: e => console.log(e),
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>, formSlug: string) => {
        e.preventDefault()
        if (!user) return
        try {
            setIsLoading(true)

            const entries = Object.entries(fieldData).filter(([key]) => {
                const i = key.lastIndexOf("-");
                if (i === -1) return false;
                const slug = key.slice(0, i); // everything before the last "-"
                return slug === formSlug;
            }).map(([key, value]) => {
                const i = key.lastIndexOf("-");
                const field_id = key.slice(i + 1); // everything before the last "-"
                return {
                    ...value,
                    field_id: isNaN(Number(field_id)) ? field_id : Number(field_id), // convert to number if numeric
                };
            });
            const formData = new FormData();

            entries.forEach((field) => {
                const { value, type, field_id, project_locality_id } = field;

                if (Array.isArray(value) && type === 'file')
                    // If value is File[] or multiple files
                    // @ts-expect-error incorrect type
                    formData.append(`data-${field_id}`, value[0]);
                else if (Array.isArray(value))
                    // If value is MembersI[] or string[]
                    formData.append(`data-${field_id}`, JSON.stringify(value));
                else formData.append(`data-${field_id}`, value as string);

                // Include project slug for field
                formData.append(`${field_id}`, project_locality_id);
            });

            toast.promise(mutateAsync(formData), {
                loading: "Processing...",
                success: () => {
                    const active = searchParams.get("form");
                    if (active) navigate(`${location.pathname}`, { replace: true });
                    else navigate(-1)
                    return `Success`
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

        } catch (e) {
            console.log(e)
            toast.error("Failed to post!");
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

    const isFilledForm = (formSlug: string): boolean => {
        if (!values) return false
        const formValues = values.filter(value => value.form_slug === formSlug)
        const formFields = data.sections.flatMap(section =>
            section.forms.filter(form => form.slug === formSlug).flatMap(form => form.form_fields))

        if (formValues.length !== formFields.length) return false
        return true
    }

    const areAllFieldsApproved = (formSlug: string) => {
        if (!values) return false
        const formValues = values.filter(value => value.form_slug === formSlug && value.is_approved === true)
        const formFields = data.sections.flatMap(section =>
            section.forms.filter(form => form.slug === formSlug).flatMap(form => form.form_fields))

        if (formValues.length !== formFields.length) return false
        return true
    }

    const canClickForm = (form: FormProps) => {
        if (!user) return false
        const isEditor = user.role?.name === "Admin"
        const allApproved = areAllFieldsApproved(form.slug)
        return !allApproved && isEditor
    }

    const isSectionApproved = (section: SectionProps) => {
        if (!user) return false
        const isApprover = user.role?.name === "Admin"
        const allApproved = section.forms.every(form => areAllFieldsApproved(form.slug))
        return allApproved && isApprover
    }

    const countFilledForms = (section: SectionProps) => {
        return section.forms.reduce((count, form) => {
            return count + (isFilledForm(form.slug) ? 1 : 0)
        }, 0)
    }

    const renderForm = (formId: string, isFilled: boolean) => {
        if (!data) return
        const section = data.sections.find(section => section.forms.some(form => form.slug === formId))
        if (!section) return null
        const form = section.forms.find(sf => sf.slug === formId);
        if (!form) return null;
        const isSingle = data.sections.length == 1 && data.sections.every(section => section.forms.length == 1)
        return (
            <div className="h-fit flex flex-col">
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
                        <div className="flex items-center gap-3">
                            {isFilled && !disabled && canClickForm(form) && !isSectionApproved(section) ?
                                editForm ?
                                    <Button
                                        type='button'
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setEditForm(false)}
                                    >
                                        <X />
                                        Cancel Edit
                                    </Button>
                                    :
                                    <Button
                                        type='button'
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditForm(true)}
                                        className='border-destructive/50 dark:border-destructive/50'
                                    >
                                        <Edit2 className="h-4 w-4 text-destructive" />
                                        Edit Form
                                    </Button>
                                : null}
                        </div>
                    </div>
                </div>

                <div className={`flex-1 overflow-y-auto ${!disabled ? "px-4 md:px-6 pb-4 md:pb-4" : ""}`}>
                    <Card>
                        <form onSubmit={(e) => handleSubmit(e, form.slug)} className='space-y-4'>
                            <CardContent>
                                <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-between">
                                    {form.form_fields.slice().sort((a, b) => a.position - b.position).map((field) => (
                                        <FormField
                                            key={field.id}
                                            disabled={disabled || !canClickForm(form) || (isFilled && !editForm)}
                                            value={fieldData[`${form.slug}-${field.id}`]?.value}
                                            setValue={updateFieldValue}
                                            project_locality_id={projectLocalityId || ""}
                                            baseMapId={projectLocaleId || undefined}
                                            {...field}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                            {!(disabled || !canClickForm(form) || isFilled) || editForm ? (
                                <CardFooter>
                                    <Button
                                        type='submit'
                                        className='w-full'
                                        disabled={disabled || !canClickForm(form) || isPending || isLoading}
                                    >
                                        {isPending || isLoading ?
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </>
                                            :
                                            editForm ? <>
                                                <Edit2 className="h-4 w-4" />
                                                Edit Data
                                            </> : <>
                                                <Save className="h-4 w-4" />
                                                Save Data
                                            </>
                                        }
                                    </Button>
                                </CardFooter>
                            ) : null}
                        </form>
                    </Card>
                </div>
            </div>
        );
    };

    useEffect(() => {
        const active = searchParams.get("form");
        setEditForm(false)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values])

    useEffect(() => {
        if (values && projectLocalityId)
            values.forEach(value => {
                updateFieldValue(value.form_slug, value.value, value.type, value.field_id, projectLocalityId)
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values, projectLocalityId])

    if (!user) return

    if (activeForm) return renderForm(activeForm, isFilledForm(activeForm));

    return (
        <div className="h-fit flex flex-col mb-20">
            {/* Header */}
            <div className={`bg-primary/5 border-b border-border px-4 md:px-6 py-3 mb-6 ${disabled && "-mt-6"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button type='button' variant="ghost" size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-sm md:text-base lg:text-lg font-semibold text-foreground/70">{data.name}{projectLocaleName ? <span className='text-foreground'>: {projectLocaleName}</span> : null}{projectLocaleName ? <span className='text-foreground'> - {projectName}</span> : null}</h1>
                            <p className="text-xs lg:text-sm text-muted-foreground">
                                {data?.description || ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {disabled ? (
                            <Link
                                to={`/system-settings/form-management/form-questionnaires/${data.slug}/edit`}
                                className={cn(buttonVariants({ variant: 'outline' }), 'text-sm')}
                            >
                                <Edit className="h-4 w-4" />
                                Edit<span className='hidden md:inline'> Questionnaire</span>
                            </Link>
                        ) : null}
                        {projectLocaleProgress !== undefined ? (
                            <div className='flex flex-col gap-1 items-end'>
                                <p className='text-xs md:text-sm'>{Number.isInteger(projectLocaleProgress)
                                    ? projectLocaleProgress
                                    : Math.floor(projectLocaleProgress * 100) / 100}% Complete</p>
                                <Progress value={projectLocaleProgress} className='w-20 md:w-24 lg:w-32' />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto ${!disabled ? "px-4 md:px-6 pb-4 md:pb-4" : ""}`}>
                <div className="space-y-4">
                    {data.sections.slice().sort((a, b) => a.position - b.position).slice().sort((a, b) => a.position - b.position).map((section) => (
                        <Card key={section.slug} className={`overflow-hidden gap-2 lg:gap-2 pb-3 md:pb-3 ${isSectionApproved(section) ? 'border-green-800 dark:border-green-900' : ''}`}>
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

                                            {!disabled
                                                ? <>
                                                    <Badge
                                                        variant={countFilledForms(section) === section.forms.length ? 'default' : 'secondary'}
                                                        className={countFilledForms(section) === section.forms.length ? 'bg-green-700 dark:bg-green-900' : ''}
                                                    >
                                                        {countFilledForms(section)} / {section.forms.length} filled
                                                    </Badge>

                                                    {isSectionApproved(section)
                                                        ? <Badge className="bg-green-700 dark:bg-green-900">Approved</Badge>
                                                        : null}
                                                </> : null}

                                            {/* {!section.isAccessible && (
                                            <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-600 dark:text-yellow-600">
                                                <Lock className="h-3 w-3 mr-1 text-yellow-600" />
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
                                                <button
                                                    type='button'
                                                    key={form.slug}
                                                    className={cn(`text-start flex items-center justify-between p-3 rounded-lg border transition-all bg-muted/20 disabled:cursor-not-allowed disabled:opacity-70 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer hover:bg-muted/50 disabled:hover:bg-muted/20`,
                                                        {
                                                            "border-green-700 dark:border-green-800": isFilledForm(form.slug),
                                                        }
                                                    )}
                                                    onClick={() => navigate(`?form=${form.slug}`)}
                                                    disabled={!canClickForm(form) && !(user.role?.name === "Admin" || user.role?.name === "Dg")}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            {isFilledForm(form.slug)
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
                                                        <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-600 dark:text-yellow-600">
                                                            <Lock className="h-3 w-3 mr-1 text-yellow-600" />
                                                            Locked
                                                        </Badge>
                                                        )} */}
                                                        {areAllFieldsApproved(form.slug) && (
                                                            <Badge variant="default" className="bg-green-800 text-xs">
                                                                Complete
                                                            </Badge>
                                                        )}
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                            <CardFooter className='flex items-center justify-between px-3 md:px-4 py-1' />
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}