import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "management-evaluation",
      title: "Spatial Data Management",
      backButton: "Back to Modules",
    });
  }, [setPage]);

  return <></>;
}
