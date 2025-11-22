import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { CreateComplianceProject } from "@/components/compliance_projects";
import { LOCALITY_LEVELS } from "@/types/constants";

export default function CreateComplianceProjectPage() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "compliance",
      title: "Create Compliance Project",
      isFormPage: true,
    });
  }, [setPage]);

  return (
    <div className="w-full">
      <CreateComplianceProject
        moduleLevel={LOCALITY_LEVELS.COMPLIANCE}
        redirectPath="/compliance/projects"
      />
    </div>
  );
}
