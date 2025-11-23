import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function OTPVerificationForm() {
  const navigate = useNavigate();
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= 3) {
      toast.error("Maximum attempts reached", {
        description: "Please request a new OTP"
      });
      return;
    }

    const requestId = sessionStorage.getItem('ccroRequestId');
    if (!requestId) {
      toast.error("No active verification session found");
      return;
    }

    // Mock OTP verification
    setVerifyLoading(true);
    setTimeout(() => {
      // Mock validation (accept any 6-digit number)
      if (otp.match(/^\d{6}$/)) {
        navigate("/lookup/results");
      } else {
        setAttempts((prev) => prev + 1);
        toast.error("Invalid OTP", {
          description: `Verification failed. ${3 - attempts} attempts remaining.`
        });
      }
      setVerifyLoading(false);
    }, 1000);
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0) return;

    const requestId = sessionStorage.getItem('ccroRequestId');
    if (!requestId) {
      toast.error("No active verification session found");
      return;
    }

    // Mock OTP resend
    setResendLoading(true);
    setTimeout(() => {
      setResendCooldown(60);
      toast.success("OTP Resent", {
        description: "A new OTP has been sent to your phone number"
      });
      setResendLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="otp">Enter OTP</Label>
        <Input
          id="otp"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          pattern="[0-9]{6}"
          required
        />
      </div>

      <div className="space-y-4">
        <Button type="submit" className="w-full" disabled={verifyLoading}>
          {verifyLoading ? "Verifying..." : "Verify OTP"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResendOTP}
          disabled={resendCooldown > 0 || resendLoading}
        >
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : resendLoading
            ? "Resending..."
            : "Resend OTP"}
        </Button>
      </div>
    </form>
  );
}