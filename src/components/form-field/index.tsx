import type { FieldsProps } from "@/queries/useWorkflowQuery";
import FormInput from "./form-input";
import FormTextArea from "./form-textarea";
import DatePicker from "./form-date-picker";
import FormCheckbox from "./form-checkbox";
import FormFileInput from "./form-file-input";

export default function Index(data: FieldsProps & { disabled?: boolean }) {
    switch (data.type) {
        case ('textarea'):
            return <FormTextArea data={data} disabled={data.disabled} />
        case ('date'):
            return <DatePicker data={data} disabled={data.disabled} />
        case ('checkbox'):
            return <FormCheckbox data={data} disabled={data.disabled} />
        case ('file'):
            return <FormFileInput data={data} disabled={data.disabled} />
        default:
            return <FormInput data={data} disabled={data.disabled} />
    }
}
