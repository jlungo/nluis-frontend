import { cn } from "@/lib/utils"

function Spinner({ className }: { className?: string }) {
    return (
        <svg
            className={cn("size-5 animate-spin text-muted-foreground/70 dark:text-muted-foreground/40", className)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
        >
            <path
                stroke="currentColor"
                d="M12 2a10 10 0 1 1-10 10"
                strokeLinecap="round"
            />
        </svg>
    )
}

export { Spinner }
