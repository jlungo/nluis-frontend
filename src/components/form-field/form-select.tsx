import { forwardRef } from "react";
import { Label } from "../ui/label";
import type { FieldsProps } from "@/queries/useWorkflowQuery";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Asterisk } from "lucide-react";

type FormSelectProps = React.ComponentPropsWithoutRef<typeof Select> & {
    data: FieldsProps;
    className?: string;
};

const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
    ({ data, className, disabled, ...props }, ref) => (
        <div className="w-full space-y-2 md:w-[48%] xl:w-[49%]">
            <Label htmlFor={data.name}>{data.label} {data.required ? <Asterisk className="text-destructive h-4 w-4" /> : null}</Label>
            <Select name={data.name} disabled={disabled} {...props}>
                <SelectTrigger ref={ref} className={cn("bg-muted w-full", className)}>
                    <SelectValue placeholder={data.placeholder || "Select..."} />
                </SelectTrigger>
                <SelectContent>
                    {data.select_options
                        ?.sort((a, b) => a.position - b.position) // order by position
                        .map((option) => (
                            <SelectItem key={option.value} value={option.text_label}>
                                {option.text_label}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
        </div>
    )
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
