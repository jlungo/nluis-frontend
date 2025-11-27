import { useLayoutEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import { useFeesQuery, type FeeDto, feesQueryKey } from "@/queries/useFeesQuery";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function FeesConfigPage() {
  const { setPage } = usePageStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FeeDto | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Billing Configurations - Fees",
    });
  }, [setPage]);

  const { data: fees = [], isLoading, isError } = useFeesQuery();

  const filteredFees = search
    ? fees.filter((f) =>
        (f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.gfs_code.toLowerCase().includes(search.toLowerCase()))
      )
    : fees;

  const columns: ColumnDef<FeeDto>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "gfs_code",
      header: "GFS Code",
    },
    {
      accessorKey: "payment_option",
      header: "Payment option",
      cell: ({ row }) => row.original.payment_option || "-",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.price}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl 2xl:text-2xl font-semibold">Fees</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage billing fees used when generating bills and MapShop orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
            Add fee
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search fees (name or GFS code)..."
          className="h-9 w-full md:w-1/2 rounded-md border border-input bg-background px-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isError && (
        <div className="text-sm text-red-600">Failed to load fees. Please try again.</div>
      )}

      <DataTable<FeeDto, unknown>
        columns={columns}
        data={filteredFees}
        isLoading={isLoading}
        enableGlobalFilter={false}
        showRowNumbers
        rowActions={(fee) => (
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditing(fee)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={async () => {
                if (!window.confirm(`Delete fee "${fee.name}"?`)) return;
                try {
                  await api.delete(`/billing/fees/${fee.id}`);
                  toast.success("Fee deleted");
                  await queryClient.invalidateQueries({ queryKey: [feesQueryKey] });
                } catch (e: any) {
                  console.error("Failed to delete fee", e);
                  const msg = e?.response?.data?.detail || "Failed to delete fee";
                  toast.error(msg);
                }
              }}
            >
              Delete
            </Button>
          </div>
        )}
        emptyText="No fees configured yet."
      />

      {/* Add fee dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add fee</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <FeeForm
              initial={null}
              saving={addSaving}
              onSubmit={async (payload) => {
                try {
                  setAddSaving(true);
                  await api.post("/billing/fees", payload);
                  toast.success("Fee created");
                  setAddOpen(false);
                  await queryClient.invalidateQueries({ queryKey: [feesQueryKey] });
                } catch (e: any) {
                  console.error("Failed to create fee", e);
                  const msg = e?.response?.data?.detail || "Failed to create fee";
                  toast.error(msg);
                } finally {
                  setAddSaving(false);
                }
              }}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddOpen(false)}
              disabled={addSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              form="fee-form"
              disabled={addSaving}
            >
              {addSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit fee dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit fee</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 text-sm">
              <FeeForm
                initial={editing}
                saving={editSaving}
                onSubmit={async (payload) => {
                  try {
                    setEditSaving(true);
                    await api.patch(`/billing/fees/${editing.id}`, payload);
                    toast.success("Fee updated");
                    setEditing(null);
                    await queryClient.invalidateQueries({ queryKey: [feesQueryKey] });
                  } catch (e: any) {
                    console.error("Failed to update fee", e);
                    const msg = e?.response?.data?.detail || "Failed to update fee";
                    toast.error(msg);
                  } finally {
                    setEditSaving(false);
                  }
                }}
              />
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(null)}
              disabled={editSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              form="fee-form"
              disabled={editSaving || !editing}
            >
              {editSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FeeFormProps {
  initial: FeeDto | null;
  saving: boolean;
  onSubmit: (payload: { name: string; gfs_code: string; payment_option: string | null; price: string }) => void;
}

function FeeForm({ initial, saving, onSubmit }: FeeFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gfsCode, setGfsCode] = useState(initial?.gfs_code ?? "");
  const [paymentOption, setPaymentOption] = useState<string | "">(initial?.payment_option ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");

  return (
    <form
      id="fee-form"
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name,
          gfs_code: gfsCode,
          payment_option: paymentOption || null,
          price,
        });
      }}
    >
      <div className="space-y-1">
        <label className="text-xs font-medium" htmlFor="fee-name">
          Name
        </label>
        <Input
          id="fee-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8"
          disabled={saving}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium" htmlFor="fee-gfs">
          GFS code
        </label>
        <Input
          id="fee-gfs"
          value={gfsCode}
          onChange={(e) => setGfsCode(e.target.value)}
          className="h-8"
          disabled={saving}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium" htmlFor="fee-payment-option">
          Payment option
        </label>
        <select
          id="fee-payment-option"
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
          value={paymentOption}
          onChange={(e) => setPaymentOption(e.target.value)}
          disabled={saving}
        >
          <option value="">(default)</option>
          <option value="1">Full Payment</option>
          <option value="2">Partial Payment</option>
          <option value="3">Exact Payment</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium" htmlFor="fee-price">
          Price
        </label>
        <Input
          id="fee-price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-8"
          disabled={saving}
        />
      </div>
    </form>
  );
}
