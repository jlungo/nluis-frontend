// FormReportMock.tsx
import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import FormReportBinding from "../report/FormReportBinding";

type FormReportProps = {
  label: string;
  name: string;
  required?: boolean;
};

const FormReport: React.FC<FormReportProps> = ({ label, name, required }) => {

  // Mock data



  return (
    <div className="w-full space-y-2">
      <Label htmlFor={name}>
        {label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}
      </Label>

      <div className="w-full border rounded overflow-hidden">
        <FormReportBinding
        //   mappingId="mock-mapping"
        //   workflowSlug="mock-workflow"
        //   workflowVersion={1}
        //   fetchPlaceholders={async () => mockPlaceholders}
        //   fetchFieldTree={async () => mockFieldTree}
        //   fetchExistingBindings={async () => mockExistingBindings}
        //   onSaveBindings={async ({ bindings }) => {
        //     console.log("Saved bindings:", bindings);
        //     setBindings(bindings);
        //   }}
        //   onPreview={async ({ localityProjectId, bindings }) => {
        //     console.log("Preview called with:", localityProjectId, bindings);
        //     return {
        //       context: {
        //         title: "Village Report Preview",
        //         population: 12345,
        //         area: "250 km²",
        //         previewLocality: localityProjectId,
        //       },
        //     };
        //   }}
        />
      </div>
    </div>
  );
};

export default FormReport;
