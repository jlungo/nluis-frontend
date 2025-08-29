import type { FieldsProps } from "@/queries/useWorkflowQuery";
import FormInput from "./form-input";
import FormTextArea from "./form-textarea";
import DatePicker from "./form-date-picker";
import FormCheckbox from "./form-checkbox";
// import FormFileInput from "./form-file-input";
import FormSelect from "./form-select";
import { InputType } from "@/types/input-types";
import CompactFileUpload from "./CompactFileUpload";

export interface FieldValue {
    value?: string;
    type: InputType;
    name: string;
    field_id: number;
    project_id: string;
    created_by: string;
}

export default function Index(data: FieldsProps & { disabled?: boolean; project_id: string; value: any; setValue: (formSlug: string, value: string, type: InputType, name: string, field_id: number, project_id: string) => void }) {
    switch (data.type) {
        case ('textarea'):
            return (
                <FormTextArea
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    value={data?.value || undefined}
                    onChange={(e) => data.setValue(data.form_slug, e.target.value, data.type, data.name, data.id, data.project_id)}
                />
            )
        case ('date'):
            return (
                <DatePicker
                    data={data}
                    disabled={data.disabled}
                    dateValue={data?.value ? new Date(data.value as string) : undefined}
                    onDateChange={(e) => data.setValue(data.form_slug, e.toISOString().split("T")[0], data.type, data.name, data.id, data.project_id)}
                />
            )
        case ('checkbox'):
            return (
                <FormCheckbox
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    checked={data?.value && data.value === "true"}
                    onValueChange={(e) => data.setValue(data.form_slug, String(e), data.type, data.name, data.id, data.project_id)}
                />
            )
        case ('file'):
            return (
                // <FormFileInput
                //     data={data}
                //     disabled={data.disabled}
                //     required={data.required}
                //     value={data?.value}
                //     onChange={(e) => data.setValue(data.form_slug, e.target.value, data.type, data.name, data.id, data.project_id)}
                // />
                <CompactFileUpload
                    // disabled={data.disabled}
                    // required={data.required}
                    // value={data?.value}
                    disabled
                    className="w-full"
                />
            )
        case ('select'):
            return (
                <FormSelect
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                />
            )
        default:
            return (
                <FormInput
                    data={data}
                    disabled={data.disabled}
                    required={data.required}
                    value={data?.value}
                    onChange={(e) => data.setValue(data.form_slug, e.target.value, data.type, data.name, data.id, data.project_id)}
                />
            )
    }
}
