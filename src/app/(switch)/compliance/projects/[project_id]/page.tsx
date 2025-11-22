import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { CreateComplianceProject } from "@/components/compliance_projects";
import { LOCALITY_LEVELS } from "@/types/constants";
import { useParams } from "react-router";

export default function ViewComplianceProjectPage() {
  const { project_id } = useParams();
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "compliance",
      title: "Compliance Project",
      isFormPage: true,
    });
  }, [setPage]);

  return (
    <div className="w-full">
      <CreateComplianceProject
        moduleLevel={LOCALITY_LEVELS.NATIONAL}
        redirectPath="/compliance/projects"
        projectId={project_id}
      />
    </div>
  );
}
