import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { CreateMNEProject } from "@/components/mne_projects";
import { LOCALITY_LEVELS } from "@/types/constants";
import { useParams } from "react-router";

export default function ViewMNEProjectPage() {
  const { project_id } = useParams();
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "management-evaluation",
      title: "Monitoring & Evaluation Project",
      isFormPage: true,
    });
  }, [setPage]);

  return (
    <div className="w-full">
      <CreateMNEProject
        moduleLevel={LOCALITY_LEVELS.NATIONAL}
        redirectPath="/management-evaluation/projects"
        projectId={project_id}
      />
    </div>
  );
}
