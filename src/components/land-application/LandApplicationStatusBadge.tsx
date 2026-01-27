"use client";

import { LandApplicationStatus, LAND_APPLICATION_STATUS_LABELS } from "@/types/landApplication";
import { cn } from "@/lib/utils";

interface LandApplicationStatusBadgeProps {
  status: LandApplicationStatus;
  size?: "sm" | "md" | "lg";
}

const palette: Record<LandApplicationStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending_verification: "bg-yellow-50 text-yellow-700 border-yellow-200",
  verified: "bg-blue-50 text-blue-700 border-blue-200",
  pending_council: "bg-orange-50 text-orange-700 border-orange-200",
  council_approved: "bg-teal-50 text-teal-700 border-teal-200",
  pending_assembly: "bg-indigo-50 text-indigo-700 border-indigo-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  assigned: "bg-cyan-50 text-cyan-700 border-cyan-200",
  surveying: "bg-violet-50 text-violet-700 border-violet-200",
  survey_complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

export function LandApplicationStatusBadge({ status, size = "sm" }: LandApplicationStatusBadgeProps) {
  const label = LAND_APPLICATION_STATUS_LABELS[status]?.en || status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        palette[status] || "bg-gray-100 text-gray-700 border-gray-200",
        sizes[size]
      )}
    >
      {label}
    </span>
  );
}
