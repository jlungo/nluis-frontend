"use client";

import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { useCCROStore } from "@/store/ccroStore";
import { CCROApplicationDetail } from "@/components/ccro/CCROApplicationDetail";
import { Skeleton } from "@/components/ui/skeleton";

export default function CCROApplicationDetailPage() {
  const { id } = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const { selectedApplication, loading, error, fetchApplicationDetail } = useCCROStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && id && typeof id === 'string') {
      fetchApplicationDetail(parseInt(id, 10));
    }
  }, [id, isMounted, fetchApplicationDetail]);

  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-sm text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!selectedApplication) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm text-yellow-800">Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <CCROApplicationDetail application={selectedApplication} />
    </div>
  );
}