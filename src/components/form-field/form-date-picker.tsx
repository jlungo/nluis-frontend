import { forwardRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { FieldsProps } from "@/queries/useWorkflowQuery";
import type { ComponentPropsWithoutRef } from "react";

type DatePickerProps = ComponentPropsWithoutRef<typeof Button> & {
    data: FieldsProps;
    value?: Date;
    onChange?: (e: { target: { name: string; value: string } }) => void;
};

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
    ({ data, value, onChange, ...props }, ref) => {
        const [open, setOpen] = useState(false);
        const [date, setDate] = useState<Date | undefined>(value);

        const formatDate = (d?: Date) => (d ? d.toISOString().split("T")[0] : "");

        const handleSelect = (d: Date | undefined) => {
            setDate(d);
            setOpen(false);
            onChange?.({ target: { name: data.name, value: formatDate(d) } });
        };

        return (
            <div className="w-full space-y-2 md:w-[48%] xl:w-[49%]">
                <Label htmlFor={data.name}>{data.label}</Label>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id={data.name}
                            ref={ref}
                            className="w-full justify-between bg-muted"
                            {...props}
                        >
                            {date ? date.toLocaleDateString() : data.placeholder || "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={handleSelect}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
