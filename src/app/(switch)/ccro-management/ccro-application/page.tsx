"use client";

import { useLayoutEffect } from "react";
import { usePageStore } from "@/store/pageStore";
import LandApplicationsTable from "@/components/ccro/LandApplicationsTable";

export default function CCROPage() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "ccro-management",
      title: "CCRO Applications",
    });
  }, [setPage]);

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4">
        <LandApplicationsTable mode="review" scope="global" />
      </div>
    </div>
  );
}
