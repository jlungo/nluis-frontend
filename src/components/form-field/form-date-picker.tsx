import { forwardRef, useState } from "react";
import { Asterisk, ChevronDownIcon } from "lucide-react";
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
    dateValue?: Date;
    onDateChange?: (e: Date) => void;
};

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
    ({ data, dateValue, onDateChange, ...props }, ref) => {
        const [open, setOpen] = useState(false);
        const [date, setDate] = useState<Date | undefined>(dateValue);

        const handleSelect = (d: Date | undefined) => {
            if (!d) return
            setDate(d);
            setOpen(false);
            onDateChange?.(d);
        };

        return (
            <div className="w-full space-y-2 md:w-[48%] xl:w-[49%]">
                <Label htmlFor={data.name}>{data.label} {data.required ? <Asterisk className="text-destructive h-4 w-4" /> : null}</Label>

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
                            endMonth={new Date(2099, 11)}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
