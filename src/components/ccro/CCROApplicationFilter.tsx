"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CCROApplicationFilterProps {
  onFilterChange: (filters: Record<string, any>) => void;
}

export function CCROApplicationFilter({ onFilterChange }: CCROApplicationFilterProps) {
  const [stage, setStage] = useState<string>("submitted");
  const [nidaStatus, setNidaStatus] = useState<string>("");
  const [showBlocked, setShowBlocked] = useState(false);
  const [showReady, setShowReady] = useState(false);

  const handleApplyFilters = () => {
    const filters: Record<string, any> = {};

    if (stage) {
      filters.stage = stage;
    }

    if (nidaStatus) {
      filters.nida_status = nidaStatus;
    }

    if (showBlocked) {
      filters.blocked_by_nida = "true";
    }

    if (showReady) {
      filters.ready_to_issue = "true";
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    setStage("submitted");
    setNidaStatus("");
    setShowBlocked(false);
    setShowReady(false);
    onFilterChange({ stage: "submitted" });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold">Filter Applications</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stage Filter */}
        <div>
          <label className="text-sm font-medium">Stage</label>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Stages</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* NIDA Status Filter */}
        <div>
          <label className="text-sm font-medium">NIDA Status</label>
          <Select value={nidaStatus} onValueChange={setNidaStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select NIDA status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="pending">Pending Verification</SelectItem>
              <SelectItem value="verified">All NIDA Verified</SelectItem>
              <SelectItem value="missing">NIDA Missing</SelectItem>
              <SelectItem value="invalid">NIDA Invalid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quick Filters</label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowBlocked(!showBlocked)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              showBlocked
                ? "bg-red-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Blocked by NIDA {showBlocked && "✓"}
          </button>
          <button
            onClick={() => setShowReady(!showReady)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              showReady
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Ready to Issue {showReady && "✓"}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
