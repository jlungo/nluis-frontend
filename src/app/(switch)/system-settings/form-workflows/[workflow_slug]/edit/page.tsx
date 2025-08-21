import { useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import WorkflowBuilder from '../../WorkflowBuilder';
import { useParams } from 'react-router';
import { useWorkflowQuery } from '@/queries/useWorkflowQuery';
import { Spinner } from '@/components/ui/spinner';
import type { FormSection } from '../../FormPreviewTester';

export default function Page() {
    const { workflow_slug } = useParams<{ workflow_slug: string }>();
    const { setPage } = usePageStore();

    const { data, isLoading } = useWorkflowQuery(workflow_slug || "");

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: "Edit Workflow",
            backButton: 'Modules'
        })
    }, [setPage])

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

    const sections: FormSection[] = data.sections.map(section => ({
        id: section.slug,
        name: section.name,
        description: section.description,
        order: section.position,
        forms: section.forms.map((form, index) => ({
            id: form.slug,
            name: form.name,
            description: form.description,
            isRequired: true,
            order: index + 1,
            fields: form.fields.map((field, i) => ({
                id: `${field.id}`,
                label: field.label,
                name: field.name,
                type: field.type,
                required: field.required,
                placeholder: field.placeholder,
                order: i + 1
            }))
        }))
    }));

    console.log(data)

    return <WorkflowBuilder previousData={data} sections={sections} />
}