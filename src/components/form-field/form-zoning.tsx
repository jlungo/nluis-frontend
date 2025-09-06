import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { ShapefileMap } from "../zoning/ShapefileMap";
import { useThemeStore } from "@/store/themeStore";

type FormZoningProps = {
    label: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
    baseMapId?: string;
};

const FormZoning: React.FC<FormZoningProps> = ({ label, name, required, baseMapId }) => {
    const { isDarkMode } = useThemeStore()
    return (
        <div className="w-full space-y-2">
            <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
            <div className=" aspect-square lg:aspect-video w-full max-h-[70vh]">
                <ShapefileMap
                    baseMapId={baseMapId ? baseMapId : undefined}
                    key={`${isDarkMode}`}
                />
            </div>
        </div>
    );
}

FormZoning.displayName = "FormZoning";

export default FormZoning;
