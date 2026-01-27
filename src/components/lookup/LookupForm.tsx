import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useCCROLookupQuery } from "@/queries/useCCROLookupQuery";
import { AlertCircle } from "lucide-react";

export function LookupForm() {
  const navigate = useNavigate();
  const lookupMutation = useCCROLookupQuery();
  const [formData, setFormData] = useState({
    nidaNumber: "",
    phoneNumber: "",
    consentPDPA: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentPDPA) {
      toast.error("Please accept the PDPA compliance terms to proceed.");
      return;
    }

    if (!formData.nidaNumber.trim()) {
      toast.error("Please enter your NIDA number");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    lookupMutation.mutate(
      {
        nidaNumber: formData.nidaNumber.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      },
      {
        onSuccess: (data) => {
          toast.success("OTP sent to your phone number");
          sessionStorage.setItem('ccroRequestId', data.requestId);
          navigate("/lookup/verify");
        },
        onError: (error) => {
          toast.error("Lookup failed", {
            description: error instanceof Error ? error.message : "Please try again"
          });
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nidaNumber" className="text-sm font-semibold">NIDA Number</Label>
        <Input
          id="nidaNumber"
          placeholder="Enter your 20-digit NIDA number"
          value={formData.nidaNumber}
          onChange={(e) =>
            setFormData({ ...formData, nidaNumber: e.target.value })
          }
          className="h-11 rounded-lg border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
          required
        />
        <p className="text-xs text-muted-foreground">Your National ID number</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-sm font-semibold">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          className="h-11 rounded-lg border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
          required
        />
        <p className="text-xs text-muted-foreground">We'll send an OTP to this number</p>
      </div>

      <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Checkbox
          id="consentPDPA"
          checked={formData.consentPDPA}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, consentPDPA: checked as boolean })
          }
          className="mt-1"
        />
        <Label htmlFor="consentPDPA" className="text-xs leading-relaxed cursor-pointer">
          I consent to the processing of my personal data in accordance with PDPA regulations
        </Label>
      </div>

      {lookupMutation.isError && (
        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-800 dark:text-red-100 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{lookupMutation.error instanceof Error ? lookupMutation.error.message : "An error occurred"}</span>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full h-11 text-base font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 transition-all shadow-lg hover:shadow-xl"
        disabled={lookupMutation.isPending}
      >
        {lookupMutation.isPending ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending OTP...
          </div>
        ) : (
          "Send OTP"
        )}
      </Button>
    </form>
  );
}