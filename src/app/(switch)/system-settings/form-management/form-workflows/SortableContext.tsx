import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GripVertical, Layers, Move } from "lucide-react";

export function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <Card className="relative" ref={setNodeRef} style={style}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger {...attributes} {...listeners} className='flex gap-2 cursor-grab absolute top-5 md:top-6 left-0 pl-5 md:pl-6 pt-4 opacity-60 h-12'>
                        <GripVertical className="h-4 w-4" />
                        <Layers className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Drag to change position</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {children}
        </Card>
    );
}

export function SortableForm({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} className="relative">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger {...attributes} {...listeners} className='flex gap-2 cursor-grab absolute top-[1.0625rem] left-0 pl-[1.0625rem] pt-4.5 opacity-60 h-12'>
                        <Move className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Drag to change position</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {children}
        </div>
    );
}

export function SortableField({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} className="relative">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger {...attributes} {...listeners} className='flex gap-2 cursor-grab absolute top-0.5 left-0 pt-4.5 opacity-60 h-9 md:h-14 w-full md:w-12'>
                        <Move className="h-3 w-3 hidden" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Drag to change position</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {children}
        </div>
    );
}