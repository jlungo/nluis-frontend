import { useLayoutEffect } from "react";
import { usePageStore } from "@/store/pageStore";

export default function BillingAdminPage() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Billing Management",
    });
  }, [setPage]);

  return null;
}
