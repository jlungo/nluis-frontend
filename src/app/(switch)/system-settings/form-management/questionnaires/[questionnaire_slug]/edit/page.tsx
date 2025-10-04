import { useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import QuestionnaireBuilder from '../../QuestionnaireBuilder';
import { useParams } from 'react-router';
import { useQuestionnaireQuery } from '@/queries/useQuestionnaireQuery';
import { Spinner } from '@/components/ui/spinner';
import type { FormSection } from '../../FormPreviewTester';

export default function Page() {
    const { questionnaire_slug } = useParams<{ questionnaire_slug: string }>();
    const { setPage } = usePageStore();

    const { data, isLoading } = useQuestionnaireQuery(questionnaire_slug || "");

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: "Edit Questionnaire",
        })
    }, [setPage])

    if (!data && !isLoading)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No questionnaire data found!</p>
        </div>

    if (!data || isLoading)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <Spinner />
                <p className="text-muted-foreground mt-4">Loading questionnaire...</p>
            </div>
        )

    if (isLoading) return <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading questionnaire...</p>
    </div>

    const sections: FormSection[] = data.sections.map(section => ({
        id: section.slug,
        name: section.name,
        description: section.description,
        order: section.position,
        is_active: section.is_active,
        forms: section.forms.map(form => ({
            id: form.slug,
            name: form.name,
            description: form.description,
            order: form.position,
            is_active: form.is_active,
            form_fields: form.form_fields.map(field => ({
                id: `${field.id}`,
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required,
                placeholder: field.placeholder,
                order: field.position,
                is_active: field.is_active,
                options: field.select_options.map(option => ({
                    id: option.value,
                    label: option.text_label,
                    name: option.value,
                    order: option.position
                }))
            }))
        }))
    }));

    return <QuestionnaireBuilder previousData={data} sections={sections} />
}