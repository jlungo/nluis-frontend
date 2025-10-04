import type { ComponentPropsWithoutRef } from "react";
import type { FieldI } from ".";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";

type CheckboxProps = Omit<ComponentPropsWithoutRef<typeof Checkbox>, "onCheckedChange"> & {
    data: FieldI;
    checked?: boolean;
    onValueChange?: (value: boolean) => void;
};

export default function FormCheckbox({ data, checked, onValueChange, ...rest }: CheckboxProps) {
    return (
        <div className="w-full md:w-[48%] xl:w-[49%] flex gap-4 items-center">
            <Checkbox
                id={data.name}
                name={data.name}
                checked={checked}
                onCheckedChange={(val) => onValueChange?.(val === true)} // normalize to boolean
                {...rest}
            />
            <Label htmlFor={data.name}>{data.label} {data.required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
        </div>
    );
}