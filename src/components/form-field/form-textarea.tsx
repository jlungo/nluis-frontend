import { forwardRef, type TextareaHTMLAttributes } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import type { FieldsProps } from "@/queries/useWorkflowQuery";
import { Asterisk } from "lucide-react";

type FormTextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    data: FieldsProps;
};

const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
    ({ data, className, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                <Label htmlFor={data.name}>{data.label} {data.required ? <Asterisk className="text-destructive h-4 w-4" /> : null}</Label>
                <Textarea
                    id={data.name}
                    name={data.name}
                    ref={ref}
                    placeholder={data.placeholder || ""}
                    className={`bg-muted ${className || ""}`}
                    {...props}
                />
            </div>
        );
    }
);

FormTextArea.displayName = "FormTextArea";

export default FormTextArea;
