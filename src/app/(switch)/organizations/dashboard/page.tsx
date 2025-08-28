import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";

export default function OrganizationDashboard() {
    // set layout
      const { setPage } = usePageStore();
      useLayoutEffect(() => {
        setPage({
          module: "organizations",
          title: "Organizations",
          backButton: "Back to Modules",
        });
      }, [setPage]);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Organization Dashboard</h1>
      <p>
        Welcome to the Organization Dashboard. Here you can manage and view all
        organizations.
      </p>
      {/* Additional dashboard content can be added here */}
    </div>
  );
}
