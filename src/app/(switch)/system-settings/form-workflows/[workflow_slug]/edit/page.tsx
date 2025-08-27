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
        approval_roles: section.approval_roles || [],
        description: section.description,
        order: section.position,
        forms: section.forms.map(form => ({
            id: form.slug,
            name: form.name,
            editor_roles: form.editor_roles || [],
            description: form.description,
            order: form.position,
            fields: form.fields.map(field => ({
                id: `${field.id}`,
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required,
                placeholder: field.placeholder,
                order: field.position,
                options: field.select_options.map(option => ({
                    id: option.value,
                    label: option.text_label,
                    name: option.value,
                    order: option.position
                }))
            }))
        }))
    }));

    return <WorkflowBuilder previousData={data} sections={sections} />
}