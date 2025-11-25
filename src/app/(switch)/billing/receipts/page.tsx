import { useLayoutEffect } from "react";
import { usePageStore } from "@/store/pageStore";

export default function ReceiptsPage() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Receipts",
    });
  }, [setPage]);

  return null;
}
