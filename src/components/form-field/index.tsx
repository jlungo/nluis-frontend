import type { FieldsProps } from "@/queries/useWorkflowQuery";
import type { FieldsProps as QuestionnaireField } from "@/queries/useQuestionnaireQuery";
import type { InputType } from "@/types/input-types";
import type { TableRowI } from "./form-table";
import FormAddQuestionnaires, { type AddQuestionnaireProps } from "./form-add-questionnaire";
import FormViewQuestionnaires from "./form-view-questionnaire";
import FormMembers, { type MembersI } from "./form-members";
import FormInput from "./form-input";
import FormTextArea from "./form-textarea";
import DatePicker from "./form-date-picker";
import FormCheckbox from "./form-checkbox";
import FormFileInput from "./form-file-input";
import FormSelect from "./form-select";
import FormZoning from "./form-zoning";
import FormMultiselect from "./form-multiselect";
import FormTable from "./form-table";

export type ValueType = string | string[] | File[] | MembersI[] | TableRowI[] | AddQuestionnaireProps[]

export type FieldI = FieldsProps | QuestionnaireField

export default function Index(
    data: FieldI & {
        disabled?: boolean;
        project_locality_id: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any;
        setValue: (
            formSlug: string,
            value: ValueType,
            type: InputType,
            field_id: number,
            project_locality_id: string
        ) => void,
        baseMapId?: string;
        module: string;
        href?: string
        projectLocalityId?: string;
    }
) {
    const formSlug = 'form_slug' in data && data.form_slug
        ? data.form_slug
        : ('custom_form_slug' in data ? data.custom_form_slug : undefined)
    const selectOptions = 'select_options' in data && data.select_options
        ? data.select_options
        : ('questionnaire_select_options' in data ? data.questionnaire_select_options : [])
    if (!formSlug) return
    switch (data.type) {
        case ('textarea'):
            return (
                <FormTextArea
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    value={data?.value || undefined}
                    onChange={(e) => data.setValue(formSlug, e.target.value, data.type, data.id, data.project_locality_id)}
                />
            )
        case ('date'):
            return (
                <DatePicker
                    label={data.label}
                    name={data.name}
                    required={data.required}
                    disabled={data.disabled}
                    dateValue={data?.value ? new Date(data.value as string) : undefined}
                    onDateChange={(e) => data.setValue(formSlug, e.toISOString().split("T")[0], data.type, data.id, data.project_locality_id)}
                />
            )
        case ('checkbox'):
            return (
                <FormCheckbox
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    checked={data?.value && data.value === "true"}
                    onValueChange={(e) => data.setValue(formSlug, String(e), data.type, data.id, data.project_locality_id)}
                />
            )
        case ('file'):
            return (
                <FormFileInput
                    label={data.label}
                    name={data.name}
                    accept="PDF"
                    placeholder={data.placeholder}
                    disabled={data.disabled}
                    required={data.required}
                    value={data?.value}
                    onChange={(e) => data.setValue(formSlug, e, data.type, data.id, data.project_locality_id)}
                    className="w-full"
                />
            )
        case ('select'):
            return (
                <FormSelect
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    value={data?.value}
                    selectOptions={selectOptions}
                    onValueChange={(e) => data.setValue(formSlug, e, data.type, data.id, data.project_locality_id)}
                />
            )
        case ('multiselect'):
            return (
                <FormMultiselect
                    label={data.label}
                    name={data.name}
                    required={data.required}
                    selectOptions={selectOptions}
                    disabled={data?.disabled}
                    values={data?.value && Array.isArray(data.value) ? data.value : []}
                    setValues={(e) => data.setValue(formSlug, e, data.type, data.id, data.project_locality_id)}
                />
            )
        case ('zoning'):
            return (
                <FormZoning
                    label={data.label}
                    name={data.name}
                    disabled={data.disabled}
                    required={data.required}
                    baseMapId={data?.baseMapId ? data.baseMapId : undefined}
                />
            )
        case ('members'):
            return (
                <FormMembers
                    label={data.label}
                    name={data.name}
                    placeholder={data.placeholder}
                    required={data.required}
                    disabled={data.disabled}
                    value={data?.value}
                    setValue={(e) => data.setValue(formSlug, e, data.type, data.id, data.project_locality_id)}
                />
            )
        case ('table'):
            return (
                <FormTable
                    label={data.label}
                    name={data.name}
                    required={data.required}
                    selectOptions={selectOptions}
                    disabled={data?.disabled}
                    values={data?.value && Array.isArray(data.value) ? data.value : []}
                    setValues={(e) => data.setValue(formSlug, e, data.type, data.id, data.project_locality_id)}
                />
            )
        case ("addquestionnaires"):
            return (
                <FormAddQuestionnaires
                    label={data.label}
                    name={data.name}
                    required={data.required}
                    disabled={data?.required}
                    module={data.module}
                    values={data?.value || []}
                    onValueChange={(e) => data.setValue(formSlug, e, data.type, data.id, data.project_locality_id)}
                />
            )
        case ("viewquestionnaires"):
            return (
                <FormViewQuestionnaires
                    label={data.label}
                    name={data.name}
                    required={data.required}
                    disabled={data?.required}
                    module={data.module}
                    projectLocalityId={data?.projectLocalityId}
                    href={data?.href}
                // values={data?.value || []}
                // onValueChange={(e) => data.setValue(formSlug, e, data.type, data.id, data.project_locality_id)}
                />
            )
        default:
            return (
                <FormInput
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    value={data?.value}
                    onChange={(e) => data.setValue(formSlug, e.target.value, data.type, data.id, data.project_locality_id)}
                />
            )
    }
}
