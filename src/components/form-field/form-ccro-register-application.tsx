import LandApplicationsTable from "@/components/ccro/LandApplicationsTable";

type Props = {
  disabled?: boolean;
  projectLocalityId: string;
  onValueChange?: (value: string) => void;
};

export default function FormCCRORegisterApplication({ disabled, projectLocalityId, onValueChange }: Props) {
  return (
    <div className="w-full">
      <LandApplicationsTable
        mode="application"
        scope="project"
        localityProjectId={projectLocalityId}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    </div>
  );
}
