import { CCROStage, STAGE_LABELS } from "@/types/ccro";

interface CCROStatusBadgeProps {
  status: CCROStage;
}

const STATUS_COLORS: Record<CCROStage, string> = {
  draft: 'bg-gray-200 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  issued: 'bg-emerald-100 text-emerald-800'
};

export function CCROStatusBadge({ status }: CCROStatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`}>
      {STAGE_LABELS[status]}
    </span>
  );
}