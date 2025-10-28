import { CCROStatus, STATUS_LABELS } from "@/types/ccro";

interface CCROStatusBadgeProps {
  status: CCROStatus;
}

const STATUS_COLORS: Record<CCROStatus, string> = {
  draft: 'bg-gray-200 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  surveying: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-emerald-100 text-emerald-800'
};

export function CCROStatusBadge({ status }: CCROStatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}