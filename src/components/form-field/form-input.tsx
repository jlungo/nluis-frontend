import { forwardRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { FieldsProps } from "@/queries/useWorkflowQuery";
import { cn } from "@/lib/utils";

type FormInputProps = React.ComponentPropsWithoutRef<typeof Input> & {
    data: FieldsProps;
};

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ data, className, disabled, ...props }, ref) => (
        <div className="w-full space-y-2 md:w-[48%] xl:w-[49%]">
            <Label htmlFor={data.name}>{data.label}</Label>
            <Input
                id={data.name}
                type={data.type}
                name={data.name}
                ref={ref}
                placeholder={data.placeholder || ''}
                disabled={disabled}
                {...props}
                className={cn(`bg-muted ${className || ""}`)}
            />
        </div>
    )
);

FormInput.displayName = "FormInput";

export default FormInput;
