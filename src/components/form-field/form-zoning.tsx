// FormZoning.tsx
import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { ZoningMapCore } from "../zoning/Zoning";
import { useEffect, useState, useCallback } from "react";

type FormZoningProps = {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  baseMapId?: string;
};

const FormZoning: React.FC<FormZoningProps> = ({
  label,
  name,
  required,
  baseMapId,
}) => {
  const { isDarkMode } = useThemeStore();
  const [colorMode, setColorMode] = useState<"type" | "status">("type");

  // maximize state
  const [isMaximized, setIsMaximized] = useState(false);

  // ESC to exit full screen
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMaximized(false);
    };
    if (isMaximized) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isMaximized]);

  const handleToggleMax = useCallback(() => {
    setIsMaximized((v) => !v);
  }, []);

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={name}>
        {label}{" "}
        {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}
      </Label>

      {/* Embedded (normal). IMPORTANT: fixed height + overflow hidden; let child panes scroll */}
      <div className="w-full h-[70vh] border rounded overflow-hidden">
        <ZoningMapCore
          project={"One"}
          isMaximized={false}
          onMaximizeToggle={handleToggleMax}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
          baseMapId={baseMapId || undefined}
        />
      </div>

      {/* Full-screen overlay when maximized */}
      {isMaximized && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 overflow-hidden">
          {/* Use a full-height flex column, child fills and manages its own scrolls */}
          <div className="h-screen flex flex-col">
            <div className="flex-1 min-h-0">
              <ZoningMapCore
                project={"One"}
                isMaximized={true}
                onMaximizeToggle={handleToggleMax}
                colorMode={colorMode}
                onColorModeChange={setColorMode}
                baseMapId={baseMapId || undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

FormZoning.displayName = "FormZoning";
export default FormZoning;

