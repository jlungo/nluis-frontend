"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Allocation } from "@/types/ccro";

interface AllocationShareValidatorProps {
  allocations: Allocation[];
  compact?: boolean;
}

export function AllocationShareValidator({ allocations, compact = false }: AllocationShareValidatorProps) {
  const totalShare = allocations.reduce((sum, a) => sum + (a.proposed_share || 0), 0);
  const isValid = totalShare === 100;
  const remaining = 100 - totalShare;

  if (compact) {
    return (
      <div className={`p-3 rounded border ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {isValid ? '✅ Allocations Valid' : '❌ Allocations Invalid'}
          </span>
          <span className={`text-sm font-bold ${isValid ? 'text-green-700' : 'text-red-700'}`}>
            {totalShare}% / 100%
          </span>
        </div>
        {!isValid && (
          <p className="text-xs mt-1 text-red-700">
            {remaining > 0 ? `Missing: ${remaining}%` : `Overallocated by: ${Math.abs(remaining)}%`}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className={isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
      <CardHeader>
        <CardTitle className={isValid ? 'text-green-900' : 'text-red-900'}>
          Allocation Share Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Allocation</span>
            <span className="font-bold">{totalShare}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isValid ? 'bg-green-500' : totalShare > 100 ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(totalShare, 100)}%` }}
            />
          </div>
        </div>

        {/* Status message */}
        <div>
          {isValid ? (
            <p className="text-sm text-green-800 font-medium">
              ✅ All allocations sum to exactly 100%
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-red-800 font-medium">
                ❌ Invalid allocation total
              </p>
              <p className="text-xs text-red-700">
                {remaining > 0
                  ? `Need to allocate ${remaining}% more`
                  : `Overallocated by ${Math.abs(remaining)}%`}
              </p>
            </div>
          )}
        </div>

        {/* Allocations list */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Breakdown:</p>
          <div className="space-y-1">
            {allocations.map((alloc) => (
              <div key={alloc.id} className="flex justify-between text-xs">
                <span className="text-gray-700">{alloc.party_name}</span>
                <span className="font-medium text-gray-900">{alloc.proposed_share || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
