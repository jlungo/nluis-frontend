import type { FieldsProps } from "@/queries/useWorkflowQuery";
import FormInput from "./form-input";
import FormTextArea from "./form-textarea";
import DatePicker from "./form-date-picker";
import FormCheckbox from "./form-checkbox";
import FormFileInput from "./form-file-input";
import FormSelect from "./form-select";
import type { InputType } from "@/types/input-types";
import FormZoning from "./form-zoning";

export default function Index(
    data: FieldsProps & {
        disabled?: boolean;
        project_locality_id: string;
        value: any;
        setValue: (
            formSlug: string,
            value: string | File[],
            type: InputType,
            field_id: number,
            project_locality_id: string
        ) => void,
        isFilled: boolean,
        baseMapId?: string
    }
) {
    switch (data.type) {
        case ('textarea'):
            return (
                <FormTextArea
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    value={data?.value || undefined}
                    onChange={(e) => data.setValue(data.form_slug, e.target.value, data.type, data.id, data.project_locality_id)}
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
                    onDateChange={(e) => data.setValue(data.form_slug, e.toISOString().split("T")[0], data.type, data.id, data.project_locality_id)}
                />
            )
        case ('checkbox'):
            return (
                <FormCheckbox
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    checked={data?.value && data.value === "true"}
                    onValueChange={(e) => data.setValue(data.form_slug, String(e), data.type, data.id, data.project_locality_id)}
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
                    onChange={(e) => data.setValue(data.form_slug, e, data.type, data.id, data.project_locality_id)}
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
                    onValueChange={(e) => data.setValue(data.form_slug, e, data.type, data.id, data.project_locality_id)}
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
                // value={data?.value}
                // onValueChange={(e) => data.setValue(data.form_slug, e, data.type, data.id, data.project_locality_id)}
                />
            )
        default:
            return (
                <FormInput
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    value={data?.value}
                    onChange={(e) => data.setValue(data.form_slug, e.target.value, data.type, data.id, data.project_locality_id)}
                />
            )
    }
}
