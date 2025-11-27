import { useLayoutEffect } from "react";
import { usePageStore } from "@/store/pageStore";

export default function MeDashboardPage() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({ module: "me", title: "My Dashboard" });
  }, [setPage]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl 2xl:text-2xl font-semibold">My Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Overview of your recent activity and billing status.
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        {/* Placeholder summary for now; can be extended with real stats later. */}
        <p>Welcome to your customer portal. Use the sidebar to view your bills and other details.</p>
      </div>
    </div>
  );
}
