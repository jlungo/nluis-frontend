import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useVerifyOTPQuery, useResendOTPQuery } from "@/queries/useCCROLookupQuery";

export function OTPVerificationForm() {
  const navigate = useNavigate();
  const verifyMutation = useVerifyOTPQuery();
  const resendMutation = useResendOTPQuery();
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
      navigate("/lookup");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    verifyMutation.mutate(
      {
        otp: otp,
        requestId: requestId
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Verification successful");
            sessionStorage.setItem('ccroLookupData', JSON.stringify(data.ccroData));
            navigate("/lookup/results");
          } else {
            setAttempts((prev) => prev + 1);
            toast.error("Invalid OTP", {
              description: `Verification failed. ${Math.max(0, 3 - attempts - 1)} attempts remaining.`
            });
          }
        },
        onError: (error) => {
          setAttempts((prev) => prev + 1);
          toast.error("Verification failed", {
            description: error instanceof Error ? error.message : `${Math.max(0, 3 - attempts - 1)} attempts remaining.`
          });
        }
      }
    );
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0) return;

    const requestId = sessionStorage.getItem('ccroRequestId');
    if (!requestId) {
      toast.error("No active verification session found");
      navigate("/lookup");
      return;
    }

    resendMutation.mutate(
      { requestId: requestId },
      {
        onSuccess: () => {
          setResendCooldown(60);
          setAttempts(0);
          setOtp("");
          toast.success("OTP Resent", {
            description: "A new OTP has been sent to your phone number"
          });
        },
        onError: (error) => {
          toast.error("Failed to resend OTP", {
            description: error instanceof Error ? error.message : "Please try again"
          });
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="otp" className="text-sm font-semibold">Enter OTP</Label>
        <Input
          id="otp"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          pattern="[0-9]{6}"
          className="h-12 text-center text-2xl font-bold tracking-widest rounded-lg border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
          required
        />
        <p className="text-xs text-muted-foreground text-center">6-digit code sent to your phone</p>
      </div>

      <div className="space-y-3">
        <Button 
          type="submit" 
          className="w-full h-11 text-base font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 transition-all shadow-lg hover:shadow-xl"
          disabled={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            "Verify OTP"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-lg"
          onClick={handleResendOTP}
          disabled={resendCooldown > 0 || resendMutation.isPending}
        >
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : resendMutation.isPending
            ? "Resending..."
            : "Resend OTP"}
        </Button>
      </div>

      {attempts > 0 && attempts < 3 && (
        <div className="text-xs text-center text-amber-600 dark:text-amber-400">
          {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
        </div>
      )}
    </form>
  );
}