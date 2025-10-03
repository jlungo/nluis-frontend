import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { MultiSelect } from "../multiselect";
import type { SelectOptionProps } from "@/queries/useWorkflowQuery";
import { cn } from "@/lib/utils";

interface FormMultiselectProps {
    name: string;
    label: string;
    required: boolean;
    selectOptions: SelectOptionProps[]
    values?: string[];
    setValues: (values: string[]) => void;
    disabled?: boolean;
    className?: string;
}

const FormMultiselect = (props: FormMultiselectProps) => {
    const { name, label, required, selectOptions, values = [], setValues, disabled, className } = props
    return (
        <div className={cn("w-full space-y-2 md:w-[48%] xl:w-[49%]", className)}>
            <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
            <MultiSelect
                title={label ?? ''}
                data={selectOptions.sort((a, b) => a.position - b.position).map(option => ({ label: option.text_label, value: option.text_label }))}
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