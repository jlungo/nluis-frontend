"use client";

import { OwnershipType, OWNERSHIP_LABELS } from "@/types/landApplication";
import { cn } from "@/lib/utils";

interface OwnershipTypeBadgeProps {
  type: OwnershipType;
  size?: "sm" | "md" | "lg";
  showForm?: boolean;
}

const palette: Record<OwnershipType, string> = {
  individual: "bg-blue-50 text-blue-700 border-blue-200",
  joint_spouse: "bg-rose-50 text-rose-700 border-rose-200",
  group_resident: "bg-emerald-50 text-emerald-700 border-emerald-200",
  group_non_resident: "bg-amber-50 text-amber-700 border-amber-200",
  institution: "bg-purple-50 text-purple-700 border-purple-200",
};

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

export function OwnershipTypeBadge({ type, size = "md", showForm = false }: OwnershipTypeBadgeProps) {
  const label = OWNERSHIP_LABELS[type];
  const text = showForm ? `${label.en} (${label.form})` : label.en;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        palette[type],
        sizes[size]
      )}
    >
      {text}
    </span>
  );
}
