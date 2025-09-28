// FormZoning.tsx
import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/zoning/AppShell";

type FormZoningProps = {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  baseMapId?: string;
};

const FormZoning: React.FC<FormZoningProps> = ({ label, name, required, baseMapId }) => {
  useThemeStore();
  const [colorMode, setColorMode] = useState<"type" | "status">("type");
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMaximized(false); };
    if (isMaximized) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isMaximized]);

  const handleToggleMax = useCallback(() => setIsMaximized((v) => !v), []);

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={name}>
        {label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}
      </Label>

      <div className="w-full h-[70vh] border rounded overflow-hidden">
        <AppShell
          baseMapId={baseMapId}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
          isMaximized={false}
          onMaximizeToggle={handleToggleMax}
        />
      </div>

      {isMaximized && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 overflow-hidden">
          <div className="h-screen flex flex-col">
            <div className="flex-1 min-h-0">
              <AppShell
                baseMapId={baseMapId}
                colorMode={colorMode}
                onColorModeChange={setColorMode}
                isMaximized={true}
                onMaximizeToggle={handleToggleMax}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormZoning;
