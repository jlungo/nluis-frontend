"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Download, Share2, MapPin, Users, FileCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface CCROData {
  id: number;
  application_id: number;
  stage: string;
  nida_check_status: string;
  parcel_details?: {
    parcel_number: string;
    locality_name: string;
    area_sqm: number;
    allocations: Array<{
      id: number;
      party_name: string;
      proposed_share: number;
      party_details?: {
        nida_number?: string;
        id_type?: string;
      };
    }>;
  };
  certificate_details?: {
    certificate_number: string;
    issue_date: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<CCROData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ccroDataStr = sessionStorage.getItem('ccroLookupData');
    if (!ccroDataStr) {
      setError("No CCRO data found. Please complete the lookup process.");
      setLoading(false);
      return;
    }

    try {
      const ccroData = JSON.parse(ccroDataStr);
      setData(ccroData);
      setLoading(false);
    } catch (e) {
      setError("Failed to load CCRO data.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your CCRO records...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-red-900 dark:text-red-100">Error</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-800 dark:text-red-100">{error || "No CCRO data available"}</p>
              <Button onClick={() => navigate("/lookup")} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lookup
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const stageLabels: Record<string, string> = {
    draft: "Draft",
    submitted: "Submitted",
    review: "Under Review",
    approved: "Approved",
    issued: "Issued",
    rejected: "Rejected",
  };

  const stageColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-blue-100 text-blue-800",
    review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    issued: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const nidaStatusColors: Record<string, string> = {
    verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    missing: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    invalid: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Your CCRO Records</h1>
            <p className="text-muted-foreground mt-1">Application #{data.application_id}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/lookup")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            New Lookup
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Status Overview Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 dark:bg-slate-900/95 border-white/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Application Status</CardTitle>
                      <CardDescription>Current processing stage</CardDescription>
                    </div>
                  </div>
                  <Badge className={stageColors[data.stage] || "bg-gray-100"}>
                    {stageLabels[data.stage] || data.stage}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Application ID</p>
                  <p className="text-2xl font-bold text-primary">#{data.application_id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">NIDA Verification</p>
                  <div className="flex items-center gap-2">
                    {data.nida_check_status === 'verified' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    <Badge className={nidaStatusColors[data.nida_check_status] || "bg-gray-100"}>
                      {data.nida_check_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Parcel Details */}
          {data.parcel_details && (
            <motion.div variants={itemVariants}>
              <Card className="bg-white/95 dark:bg-slate-900/95 border-white/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>Parcel Information</CardTitle>
                      <CardDescription>Land details and location</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Parcel Number</p>
                    <p className="text-lg font-semibold">{data.parcel_details.parcel_number}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-lg font-semibold">{data.parcel_details.locality_name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Area</p>
                    <p className="text-lg font-semibold">{data.parcel_details.area_sqm?.toLocaleString() || "N/A"} sqm</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Allocations */}
          {data.parcel_details?.allocations && data.parcel_details.allocations.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="bg-white/95 dark:bg-slate-900/95 border-white/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle>Land Rights Allocations</CardTitle>
                      <CardDescription>Ownership shares and beneficiary information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.parcel_details.allocations.map((allocation, index) => (
                      <motion.div
                        key={allocation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-base">{allocation.party_name}</p>
                            {allocation.party_details?.id_type && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {allocation.party_details.id_type}: {allocation.party_details.nida_number || "N/A"}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="ml-2 text-lg px-3 py-1">
                            {allocation.proposed_share}%
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Certificate Details */}
          {data.certificate_details && (
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-green-900 dark:text-green-100">CCRO Certificate</CardTitle>
                        <CardDescription className="text-green-700 dark:text-green-300">Your certificate has been issued</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Certificate Number</p>
                      <p className="text-lg font-semibold text-green-900 dark:text-green-100">{data.certificate_details.certificate_number}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Issue Date</p>
                      <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                        {new Date(data.certificate_details.issue_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}