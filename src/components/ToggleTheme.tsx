import { useThemeStore } from "@/store/themeStore";
import { Button } from "./ui/button";
import { Laptop, Laptop2, Moon, Sun } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export const ToggleTheme = () => {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="rounded-full border border-border p-0.5 transition-colors flex gap-0.5 items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMode("light")}
        className={`rounded-full ${mode === "light" && "bg-primary/20"}`}
      >
        <span className="sr-only">Light Mode</span>
        <Sun size={10} className={`${mode === "light" && "text-primary"}`} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMode("system")}
        className={`rounded-full ${mode === "system" && "bg-primary/20"}`}
      >
        <span className="sr-only">System Theme</span>
        <Laptop2
          size={10}
          className={`${mode === "system" && "text-primary"}`}
        />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMode("dark")}
        className={`rounded-full ${mode === "dark" && "bg-primary/20"}`}
      >
        <span className="sr-only">System Theme</span>
        <Moon size={10} className={`${mode === "dark" && "text-primary"}`} />
      </Button>
    </div>
  );
};

export const ThemeTogglePopover = () => {
  const { mode, setMode } = useThemeStore()

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ] as const

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Change theme">
                {mode === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Change theme
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-40 p-2 rounded-xl">
          {options.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                mode === value && "bg-accent"
              )}
              onClick={() => setMode(value)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}