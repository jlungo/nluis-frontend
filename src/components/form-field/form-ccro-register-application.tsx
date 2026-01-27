import LandApplicationsTable from "@/components/ccro/LandApplicationsTable";

type Props = {
  disabled?: boolean;
  projectLocalityId: string;
  projectId?: string;
  onValueChange?: (value: string) => void;
};

export default function FormCCRORegisterApplication({ disabled, projectLocalityId, projectId, onValueChange }: Props) {
  return (
    <div className="w-full">
      <LandApplicationsTable
        mode="application"
        scope="project"
        localityProjectId={projectLocalityId}
        projectId={projectId}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    </div>
  );
}
