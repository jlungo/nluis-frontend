import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import SubdivisionShell from '@/components/subdivision/SubdivisionShell';

type FormSubdivisionProps = {
  label: string;
  name: string;
  required?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
  localityId?: string | number | null;
};

const FormSubdivision: React.FC<FormSubdivisionProps> = ({ 
  label, 
  name,
  required,
  value,
  onChange,
  disabled,
  localityId,
}) => {

  
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={name}>
          {label} {required && <Asterisk className="inline h-3 w-3 text-destructive" />}
        </Label>
      </div>

      <div className="h-[700px] border rounded-md overflow-hidden">
        <div className="w-full h-full relative">
          {/* Render the full SubdivisionShell so workflows show the intended component with toolbars and panels. */}
          <SubdivisionShell
            value={typeof value === 'string' ? value : value ? JSON.stringify(value) : undefined}
            onChange={onChange}
            className="w-full h-full"
            disabled={disabled}
              localityId={localityId}
          />
        </div>
      </div>
    </div>
  );
};

export default FormSubdivision;