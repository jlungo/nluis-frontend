import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function LookupForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

    // Mock API call
    setIsLoading(true);
    setTimeout(() => {
      // Store mock requestId for testing
      sessionStorage.setItem('ccroRequestId', 'mock-request-id');
      setIsLoading(false);
      navigate("/lookup/verify");
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nidaNumber">NIDA Number</Label>
        <Input
          id="nidaNumber"
          placeholder="Enter your NIDA number"
          value={formData.nidaNumber}
          onChange={(e) =>
            setFormData({ ...formData, nidaNumber: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="consentPDPA"
          checked={formData.consentPDPA}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, consentPDPA: checked as boolean })
          }
        />
        <Label htmlFor="consentPDPA" className="text-sm">
          I consent to the processing of my personal data in accordance with PDPA
          regulations
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );
}