import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";

export default function OrganizationProjectsPage() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "organizations",
      title: "Organization Projects",
    });
  }, [setPage]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Organization Projects</h1>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
        <p className="text-gray-600 dark:text-gray-300">
          Organization projects management page. This feature is under development.
        </p>
      </div>
    </div>
  );
}
