import { useEffect, useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import { Link, useNavigate, useParams } from 'react-router';
import { useWorkflowQuery, type SectionProps } from '@/queries/useWorkflowQuery';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, ChevronRight, ChevronDown, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import FormField from '@/components/form-field';

export default function Page() {
    const { workflow_slug } = useParams<{ workflow_slug: string }>();
    const { setPage } = usePageStore();
    const navigate = useNavigate()

    const { data, isLoading } = useWorkflowQuery(workflow_slug || "");

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: data ? data.name : isLoading ? "..." : "Form Workflow Details",
            backButton: 'Modules'
        })
    }, [setPage, data])

    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [activeForm, setActiveForm] = useState<string>('');

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const openSubForm = (formId: string, _section: SectionProps) => {
        // const subForm = section.forms.find(sf => sf.slug === formId);
        // if (subForm?.isAccessible) {
        setActiveForm(formId);
        // }
    };

    const renderForm = (formId: string) => {
        if (!data) return
        const form = data.sections
            .flatMap(section => section.forms)
            .find(sf => sf.slug === formId);

        if (!form) return null;

        return (
            <div className="h-full flex flex-col">
                <div className="bg-primary/5 border-b border-border p-4 md:p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={() => setActiveForm('')}>
                                <ArrowLeft className="h-4 w-4" />
                                Sections
                            </Button>
                            <div>
                                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">{form.name}</h2>
                                <p className="text-sm text-muted-foreground">{form?.description || null}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <Card>
                        <CardContent>
                            <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-between">
                                {form.fields.slice().sort((a, b) => a.position - b.position).map((field) => <FormField key={field.id} {...field} />)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

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
    }, [data])

    if (!data && !isLoading)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No workflow data found!</p>
        </div>

    if (!data || isLoading)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <Spinner />
                <p className="text-muted-foreground mt-4">Loading workflow...</p>
            </div>
        )

    if (isLoading) return <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading workflow...</p>
    </div>

    if (activeForm) return renderForm(activeForm);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-primary/5 border-b border-border p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">{data.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {data?.description || ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/system-settings/form-workflows/${workflow_slug}/edit`}
                            className={cn(buttonVariants({ variant: 'outline' }), 'text-sm')}
                        >
                            <Edit className="h-4 w-4" />
                            Edit<span className='hidden md:inline'>Workflow</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                    {data.sections.slice().sort((a, b) => a.position - b.position).slice().sort((a, b) => a.position - b.position).map((section) => (
                        <Card key={section.slug} className="overflow-hidden">
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

                                <CollapsibleContent className="border-t border-border">
                                    <div className="p-4 space-y-3">
                                        <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                                        <div className="grid gap-3">
                                            {section.forms.slice().sort((a, b) => a.position - b.position).map((form) => (
                                                <div
                                                    key={form.slug}
                                                    // className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${form.isAccessible
                                                    //     ? 'hover:bg-muted/50 cursor-pointer'
                                                    //     : 'bg-muted/20 cursor-not-allowed'
                                                    //     }`}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors bg-muted/20 cursor-pointer`}
                                                    // onClick={() => form.isAccessible && Sub(form.id, section)}
                                                    onClick={() => openSubForm(form.slug, section)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            {/* {form.isCompleted ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            ) : ( */}
                                                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                                                            {/* )} */}
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
                                            ))}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}