import { useLayoutEffect } from "react";
import { usePageStore } from "@/store/pageStore";

export default function BillingReportsPage() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Billing Reports",
    });
  }, [setPage]);

  return null;
}
