import type { ComponentPropsWithoutRef } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import type { FieldsProps } from "@/queries/useWorkflowQuery";

type CheckboxProps = ComponentPropsWithoutRef<typeof Checkbox> & {
    data: FieldsProps;
};

export default function FormCheckbox(props: CheckboxProps) {
    return (
        <div className='w-full md:w-[48%] xl:w-[49%] flex gap-4 items-center'>
            <Checkbox
                id={props.data.name}
                name={props.data.name}
                disabled={props.disabled}
                {...props}
            />
            <Label htmlFor={props.data.name}>{props.data.label}</Label>
        </div>
    )
}
