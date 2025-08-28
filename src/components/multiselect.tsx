import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import { Spinner } from "./ui/spinner"

interface MultiselectProps {
    title: string;
    data: { value: string; label: string }[];
    selected: string[]; setSelected: (selected: string[]) => void;
    isLoading: boolean
}

export function MultiSelect({ title, data, selected, setSelected, isLoading }: MultiselectProps) {
    const [open, setOpen] = useState(false)

    const toggleValue = (value: string) => {
        if (selected.includes(value)) {
            setSelected(selected.filter((v) => v !== value))
        } else {
            setSelected([...selected, value])
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-accent dark:bg-input/30 font-normal text-muted-foreground dark:text-muted-foreground/90"
                >
                    {selected && selected.length > 0
                        ? data
                            .filter((item) => selected.includes(item.value))
                            .map((item) => item.label)
                            .join(", ")
                        : `Select ${title}`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 md:w-96 xl:w-[495px] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
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
                                {data.map((fw) => (
                                    <CommandItem
                                        key={fw.value}
                                        onSelect={() => toggleValue(fw.value)}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selected.includes(fw.value) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {fw.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    )
}
