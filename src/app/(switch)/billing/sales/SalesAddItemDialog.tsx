import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { saleProductsQueryKey } from "@/queries/useSalesProductsQuery";
import { useQueryClient } from "@tanstack/react-query";

interface LandUsePlanDto {
  id: number;
  name: string;
}

interface PlanDocumentDto {
  id: number;
  title: string;
  document_type: string;
}

interface SalesAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalesAddItemDialog({ open, onOpenChange }: SalesAddItemDialogProps) {
  const queryClient = useQueryClient();

  const [plans, setPlans] = useState<LandUsePlanDto[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [plansSearch, setPlansSearch] = useState("");

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [documents, setDocuments] = useState<PlanDocumentDto[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load plans when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError(null);
        const res = await api.get<LandUsePlanDto[]>("/zoning/plans/");
        setPlans(res.data || []);
      } catch (e: any) {
        console.error("Failed to load plans", e);
        setPlansError("Failed to load plans");
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [open]);

  // Load documents when plan changes
  useEffect(() => {
    if (!open || !selectedPlanId) {
      setDocuments([]);
      setSelectedDocumentId(null);
      return;
    }

    const fetchDocuments = async () => {
      try {
        setDocumentsLoading(true);
        setDocumentsError(null);
        const res = await api.get<PlanDocumentDto[]>(
          `/zoning/plan-documents/?plan=${selectedPlanId}`
        );
        setDocuments(res.data || []);
      } catch (e: any) {
        console.error("Failed to load plan documents", e);
        setDocumentsError("Failed to load documents");
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [open, selectedPlanId]);

  // Prefill name when document is selected
  useEffect(() => {
    if (!selectedDocumentId) return;
    const doc = documents.find((d) => d.id === selectedDocumentId);
    if (doc) {
      setName((prev) => (prev ? prev : doc.title));
    }
  }, [selectedDocumentId, documents]);

  const resetState = () => {
    setPlansSearch("");
    setSelectedPlanId(null);
    setDocuments([]);
    setSelectedDocumentId(null);
    setName("");
    setDescription("");
    setBasePrice("");
    setIsActive(true);
    setSaving(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    if (!selectedDocumentId) {
      toast.error("Please select a plan document.");
      return;
    }
    if (!basePrice) {
      toast.error("Please enter a base price.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/sales/products/from-plan-document/", {
        plan_document_id: selectedDocumentId,
        name: name || undefined,
        description: description || undefined,
        base_price: basePrice,
        is_active: isActive,
      });

      toast.success("Sale item created.");
      await queryClient.invalidateQueries({ queryKey: [saleProductsQueryKey] });
      handleClose(false);
    } catch (e: any) {
      console.error("Failed to create sale item", e);
      const message =
        e?.response?.data?.detail ||
        e?.response?.data?.non_field_errors?.[0] ||
        "Failed to create sale item.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const filteredPlans = plansSearch
    ? plans.filter((p) =>
        p.name.toLowerCase().includes(plansSearch.toLowerCase())
      )
    : plans;

  const selectedPlan = selectedPlanId
    ? plans.find((p) => p.id === selectedPlanId)
    : null;

  const selectedDocument = selectedDocumentId
    ? documents.find((d) => d.id === selectedDocumentId)
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[95vw] max-w-[95vw] md:w-[85vw] md:max-w-[85vw] lg:w-[70vw] lg:max-w-[70vw] h-[70vh]"
      >
        <DialogHeader>
          <DialogTitle>Add sale item</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Plans column */}
          <div className="border rounded-md p-2 flex flex-col min-h-0">
            <div className="mb-2">
              <div className="text-xs font-medium mb-1">Plans</div>
              <Input
                placeholder="Search plans..."
                value={plansSearch}
                onChange={(e) => setPlansSearch(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-sm">
              {plansLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Spinner className="h-3 w-3" /> Loading plans...
                </div>
              ) : plansError ? (
                <div className="text-xs text-red-600">{plansError}</div>
              ) : filteredPlans.length === 0 ? (
                <div className="text-xs text-muted-foreground">No plans found.</div>
              ) : (
                filteredPlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className={`w-full text-left px-2 py-1 rounded-md text-xs md:text-sm border transition-colors ${
                      selectedPlanId === plan.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent hover:bg-muted"
                    }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    {plan.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Plan documents column */}
          <div className="border rounded-md p-2 flex flex-col min-h-0">
            <div className="mb-2">
              <div className="text-xs font-medium mb-1">Plan documents</div>
              <div className="text-[11px] text-muted-foreground">
                {selectedPlan
                  ? `Documents for: ${selectedPlan.name}`
                  : "Select a plan to see documents"}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-sm">
              {documentsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Spinner className="h-3 w-3" /> Loading documents...
                </div>
              ) : documentsError ? (
                <div className="text-xs text-red-600">{documentsError}</div>
              ) : !selectedPlan ? (
                <div className="text-xs text-muted-foreground">
                  Select a plan first.
                </div>
              ) : documents.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No documents for this plan.
                </div>
              ) : (
                documents.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    className={`w-full text-left px-2 py-1 rounded-md text-xs md:text-sm border transition-colors ${
                      selectedDocumentId === doc.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent hover:bg-muted"
                    }`}
                    onClick={() => setSelectedDocumentId(doc.id)}
                  >
                    <div>{doc.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {doc.document_type}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Sales details column */}
          <div className="border rounded-md p-3 flex flex-col gap-3">
            <div>
              <div className="text-xs font-medium mb-1">Sales details</div>
              <div className="text-[11px] text-muted-foreground mb-2">
                {selectedDocument
                  ? `Creating sale for: ${selectedDocument.title}`
                  : "Select a plan document to continue"}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium" htmlFor="sale-name">
                  Name
                </label>
                <Input
                  id="sale-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Defaults to plan document title"
                  className="h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium" htmlFor="sale-description">
                  Description
                </label>
                <Textarea
                  id="sale-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium" htmlFor="sale-price">
                  Base price
                </label>
                <Input
                  id="sale-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 10000"
                  className="h-8"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="sale-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(Boolean(v))}
                />
                <label htmlFor="sale-active" className="text-xs">
                  Active (visible for sale)
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleClose(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
