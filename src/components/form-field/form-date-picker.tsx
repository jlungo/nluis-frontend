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
import type { ComponentPropsWithoutRef } from "react";

type DatePickerProps = ComponentPropsWithoutRef<typeof Button> & {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    dateValue?: Date;
    onDateChange?: (e: Date) => void;
    fullWidth?: boolean
};

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
    ({ name, label, required, placeholder, dateValue, fullWidth = false, onDateChange, ...props }, ref) => {
        const [open, setOpen] = useState(false);
        const [date, setDate] = useState<Date | undefined>(dateValue);

        const handleSelect = (d: Date | undefined) => {
            if (!d) return
            setDate(d);
            setOpen(false);
            onDateChange?.(d);
        };

        return (
            <div className={fullWidth ? "w-full space-y-2" : "w-full space-y-2 md:w-[48%] xl:w-[49%]"}>
                <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id={name}
                            ref={ref}
                            className={`w-full justify-between ${fullWidth ? 'bg-accent dark:bg-input/30' : 'bg-muted'}`}
                            {...props}
                        >
                            {date ? date.toLocaleDateString() : placeholder || "Select date"}
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
