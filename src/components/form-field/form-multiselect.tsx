import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { MultiSelect } from "../multiselect";
import type { FieldsProps } from "@/queries/useWorkflowQuery";

interface FormMultiselectProps {
    data: FieldsProps;
    values?: string[];
    setValues: (values: string[]) => void;
    disabled?: boolean
}

const FormMultiselect = ({ data, values = [], setValues, disabled }: FormMultiselectProps) => {
    const { name, label, required, select_options } = data
    return (
        <div className="w-full space-y-2 md:w-[48%] xl:w-[49%]">
            <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
            <MultiSelect
                title={label ?? ''}
                data={select_options.sort((a, b) => a.position - b.position).map(option => ({ label: option.text_label, value: option.text_label }))}
                selected={values}
                setSelected={(e) => setValues(e)}
                disabled={disabled}
                className="2xl:w-[600px]"
            />
        </div>
    )
}

FormMultiselect.displayName = "FormMultiselect";

export default FormMultiselect;