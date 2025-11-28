import { forwardRef, type TextareaHTMLAttributes } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Asterisk } from "lucide-react";
import { FieldI } from ".";

type FormTextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    data: FieldI;
};

const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
    ({ data, className, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                <Label htmlFor={data.name}>{data.label} {data.required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
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
