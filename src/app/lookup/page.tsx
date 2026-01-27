"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LookupForm } from "@/components/lookup";
import { Search, Shield } from "lucide-react";

export default function LookupPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="shadow-2xl border border-white/50 dark:border-slate-700/50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              CCRO Lookup
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter your NIDA number and phone number to look up your CCRO records
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <LookupForm />
          </CardContent>
          <div className="px-6 py-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-b-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your data is secure and encrypted</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

