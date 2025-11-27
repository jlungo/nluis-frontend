"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OTPVerificationForm } from "@/components/lookup";
import { ShieldCheck } from "lucide-react";

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="shadow-xl border border-gray-200/70 dark:border-gray-800/70 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Verify Your OTP
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to your registered phone number.
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-4">
            <OTPVerificationForm />
          </CardContent>

          <div className="text-center py-4 text-sm text-muted-foreground">
            Didn’t receive the code?{" "}
            <button className="text-primary hover:underline font-medium">
              Resend OTP
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
