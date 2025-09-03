import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Spinner } from './ui/spinner';

export type SelectOption = {
  value: string | number;
  label: string;
  isDisabled?: boolean;
  description?: string;
  isSelected?: boolean; // New optional property to indicate pre-selected state
};

type MultiSelectShowListInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  values: string[];
  options: SelectOption[];
  isLoading?: boolean;
  required?: boolean;
  onChange?: (selected: SelectOption[]) => void;
  onValuesChange: (values: (string | number)[]) => void;
  isSingle?: boolean;
};

export default function MultiSelectShowListInput({
  placeholder = 'Select...',
  values,
  options,
  isLoading = false,
  onChange,
  onValuesChange,
  isSingle
}: MultiSelectShowListInputProps) {
  const [open, setOpen] = useState(false);

  // Merge values from props with values from options that have isSelected=true
  const mergedValues = [...new Set([
    ...values,
    ...options.filter(opt => opt.isSelected).map(opt => opt.value)
  ])];

  const selectedOptions = options.filter((opt) => mergedValues.includes(opt.value));

  const toggleValue = (value: string | number) => {
    let newValues: (string | number)[];

    if (mergedValues.includes(value)) {
      newValues = mergedValues.filter((v) => v !== value);
    } else {
      newValues = [...mergedValues, value];
    }

    onValuesChange(newValues);

    if (onChange) {
      const selected = options.filter((opt) => newValues.includes(opt.value));
      onChange(selected);
    }
  };

  const clearAll = () => {
    onValuesChange([]);
    if (onChange) onChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-accent dark:bg-input/30 font-normal text-muted-foreground dark:text-muted-foreground/90"
          >
            {selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 sm:w-96 md:w-96 xl:w-[495px] p-0">
          <Command>
            {!isSingle ? <CommandInput placeholder="Search..." /> : null}
            {isLoading ? (
              <CommandList>
                <CommandEmpty className="flex items-center justify-center h-20">
                  <Spinner />
                </CommandEmpty>
              </CommandList>
            ) : (
              <CommandList>
                <CommandEmpty>No item found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = mergedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => toggleValue(option.value)}
                        disabled={option.isDisabled}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary dark:border-primary bg-accent dark:bg-input/30',
                            isSelected
                              ? 'bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span>{option.label}</span>
                        {option.isSelected && !isSelected && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (pre-selected)
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {option.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 p-0"
                onClick={() => toggleValue(option.value)}
              >
                <X className="h-3 w-3 cursor-pointer" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-2 py-0 h-auto"
            onClick={clearAll}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}