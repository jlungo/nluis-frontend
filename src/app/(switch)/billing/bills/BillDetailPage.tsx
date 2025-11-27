import { useLayoutEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { usePageStore } from "@/store/pageStore";
import { useBillDetailQuery } from "@/queries/useBillDetailQuery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPage } = usePageStore();
  const [searchParams] = useSearchParams();

  const billId = id ? Number(id) : NaN;
  const productIdParam = searchParams.get("product");
  const productId = productIdParam ? Number(productIdParam) : NaN;

  useLayoutEffect(() => {
    setPage({ module: "billing", title: "Bill details" });
  }, [setPage]);

  const { data: bill, isLoading, isError } = useBillDetailQuery(
    Number.isNaN(billId) ? undefined : billId,
  );

  if (!id || Number.isNaN(billId)) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Invalid bill id.</p>
      </div>
    );
  }

  if (isLoading && !bill) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Loading bill details…</p>
      </div>
    );
  }

  if (isError || !bill) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">Failed to load this bill. Please try again.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/billing/bills")}>Back to bills</Button>
      </div>
    );
  }

  const amount = bill.total_amount ?? bill.amount ?? "0.00";

  const isPending = bill.status === "Pending";
  const isPaid = bill.status === "Paid";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-xl 2xl:text-2xl font-semibold">
            Bill #{bill.id}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Payment details for your MapShop purchase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {bill.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate("/billing/bills")}>
            Back to bills
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Summary card */}
        <div className="rounded-md border p-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Summary
          </div>
          <div className="text-2xl font-semibold">
            {amount} {bill.currency_code || ""}
          </div>
          <div className="text-sm text-muted-foreground">
            Holder: {bill.holder_name} ({bill.holder_phone || "-"})
          </div>
          <div className="text-sm text-muted-foreground">
            Issued: {new Date(bill.issued_date).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Expires: {new Date(bill.expiry_date).toLocaleString()}
          </div>
        </div>

        {/* Control number & payment instructions */}
        <div className="rounded-md border p-4 space-y-3 md:col-span-2">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Control number
            </div>
            <div className="font-mono text-lg">
              {bill.control_number || "Pending assignment"}
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Use this control number to pay the above amount via your bank or mobile money
              channel supported by the government payment gateway.
            </p>
            <p>
              After you complete the payment, this page will automatically refresh and the bill
              status will change to <span className="font-medium">Paid</span> once confirmed.
            </p>
          </div>

          {isPending && (
            <div className="text-xs text-muted-foreground">
              Waiting for payment confirmation… This page polls every few seconds while the bill
              is pending.
            </div>
          )}

          {isPaid && (
            <div className="rounded-md border border-green-500/40 bg-green-50 p-3 space-y-2 text-sm">
              <div className="font-medium text-green-700">Payment received</div>
              <p className="text-green-700">
                Your payment has been confirmed. You can now continue to access your purchased
                map product.
              </p>

              {Number.isFinite(productId) && !Number.isNaN(productId) ? (
                <Button
                  size="sm"
                  onClick={() => navigate(`/mapshop/products/${productId}`)}
                >
                  Go to your product
                </Button>
              ) : (
                <Button size="sm" onClick={() => navigate("/mapshop")}>
                  Go to MapShop
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
