import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import ReportTemplateBuilder from "../ReportTemplateBuilder";

export default function Page() {
  const { setPage: PageData } = usePageStore();

  useLayoutEffect(() => {
    PageData({
      module: "system-settings",
      title: "Create Report Template",
    });
  }, [PageData]);

  return <ReportTemplateBuilder />;
}
