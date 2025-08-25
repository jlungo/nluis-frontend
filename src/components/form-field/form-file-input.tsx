import { forwardRef, useState, type ChangeEvent } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { FieldsProps } from "@/queries/useWorkflowQuery";
import { UploadCloud } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

type FileInputProps = ComponentPropsWithoutRef<typeof Input> & {
    data: FieldsProps;
};

const FormFileInput = forwardRef<HTMLInputElement, FileInputProps>(
    ({ data, onChange, disabled, ...props }, ref) => {
        const [fileName, setFileName] = useState<string>("");

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) setFileName(file.name);
            onChange?.(e);
        };

        return (
            <div className="w-full space-y-2 md:w-[48%] xl:w-[49%]">
                <Label htmlFor={data.name}>{data.label}</Label>
                <div className="relative">
                    <Input
                        id={data.name}
                        type="file"
                        name={data.name}
                        placeholder={data.placeholder || "Select a file"}
                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                        disabled={disabled}
                        onChange={handleChange}
                        ref={ref}
                        {...props}
                    />

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full flex justify-between items-center pointer-events-none"
                    >
                        {fileName || data.placeholder || "Select a file"}
                        <UploadCloud className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        );
    }
);

FormFileInput.displayName = "FormFileInput";

export default FormFileInput;
