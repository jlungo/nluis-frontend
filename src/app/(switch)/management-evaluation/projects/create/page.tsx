import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { CreateMNEProject } from "@/components/mne_projects";
import { LOCALITY_LEVELS } from "@/types/constants";

export default function CreateMNEProjectPage() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "management-evaluation",
      title: "Create Monitoring & Evaluation Project",
      isFormPage: true,
    });
  }, [setPage]);

  return (
    <div className="w-full">
      <CreateMNEProject
        moduleLevel={LOCALITY_LEVELS.MNE}
        redirectPath="/management-evaluation/projects"
      />
    </div>
  );
}
