import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { MultiSelect } from "../multiselect";
import type { SelectOptionProps } from "@/queries/useWorkflowQuery";
import type { SelectOptionProps as SelectQProps } from "@/queries/useQuestionnaireQuery";
import { cn } from "@/lib/utils";

interface FormMultiselectProps {
    name: string;
    label: string;
    required: boolean;
    selectOptions: (SelectOptionProps | SelectQProps)[]
    values?: string[];
    setValues: (values: string[]) => void;
    disabled?: boolean;
    className?: string;
    isPreview?: boolean;
}

const FormMultiselect = (props: FormMultiselectProps) => {
    const { name, label, required, selectOptions, values = [], setValues, disabled, className, isPreview = false } = props
    return (
        <div className={cn("w-full space-y-2 md:w-[48%] xl:w-[49%]", className)}>
            <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
            <MultiSelect
                title={label ?? ''}
                data={selectOptions.sort((a, b) => a.position - b.position).map(option => ({ label: option.text_label, value: option.text_label }))}
                selected={values}
                setSelected={!disabled ? (e) => setValues(e) : undefined}
                // disabled={disabled}
                className="2xl:w-[600px]"
                mutedColor={!isPreview}
            />
        </div>
    )
}

FormMultiselect.displayName = "FormMultiselect";

export default FormMultiselect;