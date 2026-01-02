"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";

import api from "@/lib/axios";
import { usePageStore } from "@/store/pageStore";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { APIResponse } from "@/types/api-response";
import { formatDate } from "@/lib/utils";

type PartyListItem = {
  id: number;
  party_type: "individual" | "organization";
  name: string;
  contact?: string | null;
  nida_number?: string | null;
  nida_verified?: boolean | null;
  created_at: string;
};

type NidaLookupResponse = {
  existing_party_id?: number | null;
  nida_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  gender?: "M" | "F" | "O" | null;
  date_of_birth?: string | null;
};

function isValidNida(nida: string) {
  return nida.length === 20 && /^\d+$/.test(nida);
}

export default function PartiesPage() {
  const { setPage } = usePageStore();

  const [items, setItems] = useState<PartyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [nidaNumber, setNidaNumber] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [prefill, setPrefill] = useState<NidaLookupResponse | null>(null);

  useLayoutEffect(() => {
    setPage({
      module: "ccro-management",
      title: "Parties",
    });
  }, [setPage]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<APIResponse<PartyListItem>>(`/ccro/parties/`, {
        params: {
          search: search.trim() ? search.trim() : undefined,
        },
      });
      const data = res.data;
      setItems(Array.isArray(data) ? (data as unknown as PartyListItem[]) : data?.results || []);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || e?.message || "Failed to load parties";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnDef<PartyListItem>[] = useMemo(() => {
    return [
      { id: "name", header: "Name", accessorFn: (r) => r.name },
      { id: "type", header: "Type", accessorFn: (r) => r.party_type },
      { id: "contact", header: "Contact", accessorFn: (r) => r.contact || "" },
      { id: "nida", header: "NIDA Number", accessorFn: (r) => r.nida_number || "" },
      {
        id: "verified",
        header: "NIDA Verified",
        accessorFn: (r) => (r.nida_verified == null ? "" : r.nida_verified ? "Yes" : "No"),
      },
      { id: "created", header: "Created", accessorFn: (r) => (r.created_at ? formatDate(r.created_at) : "") },
    ];
  }, []);

  const onLookup = async () => {
    const nida = nidaNumber.trim();
    if (!isValidNida(nida)) {
      toast.error("Invalid NIDA format. Must be exactly 20 digits");
      return;
    }

    setLookupLoading(true);
    setPrefill(null);
    try {
      const res = await api.post(`/ccro/parties/lookup_nida/`, { nida_number: nida });
      setPrefill(res.data as NidaLookupResponse);
      toast.success("NIDA details loaded");
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || e?.message || "NIDA lookup failed";
      toast.error(msg);
    } finally {
      setLookupLoading(false);
    }
  };

  const onCreate = async () => {
    if (!prefill) {
      toast.error("Lookup NIDA first");
      return;
    }

    if (prefill.existing_party_id) {
      toast.error("A party with this NIDA number already exists");
      return;
    }

    setCreateLoading(true);
    try {
      await api.post(`/ccro/parties/`, {
        party_type: "individual",
        individual_data: {
          first_name: prefill.first_name,
          middle_name: prefill.middle_name || null,
          last_name: prefill.last_name,
          gender: prefill.gender || "O",
          date_of_birth: prefill.date_of_birth || null,
          nida_number: prefill.nida_number,
          is_citizen: true,
        },
      });

      toast.success("Party created");
      setCreateOpen(false);
      setNidaNumber("");
      setPrefill(null);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || e?.message || "Failed to create party";
      toast.error(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-lg lg:text-2xl font-semibold">Parties</h1>
            <p className="text-muted-foreground text-sm">Manage registered individuals and organizations</p>
          </div>

          <Button type="button" size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>

        <div className="flex gap-2 items-center md:gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or NIDA number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") load();
              }}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={isLoading}>
            {isLoading ? "Loading..." : "Search"}
          </Button>
        </div>

        <DataTable<PartyListItem, unknown>
          columns={columns}
          data={items}
          isLoading={isLoading}
          showRowNumbers
          enableGlobalFilter={false}
          initialPageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
          emptyText="No parties found"
        />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Party (Individual)</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>NIDA Number (20 digits)</Label>
              <Input
                value={nidaNumber}
                onChange={(e) => setNidaNumber(e.target.value)}
                placeholder="Enter NIDA number"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={onLookup} disabled={lookupLoading}>
                {lookupLoading ? "Looking up..." : "Lookup"}
              </Button>
            </div>

            {prefill ? (
              <div className="border rounded p-3 space-y-2">
                <div className="text-sm text-muted-foreground">Fetched details</div>
                {prefill.existing_party_id ? (
                  <div className="text-sm">
                    A party with this NIDA number already exists (Party ID: <span className="font-medium">{prefill.existing_party_id}</span>).
                  </div>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">First name</div>
                    <div className="font-medium">{prefill.first_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Middle name</div>
                    <div className="font-medium">{prefill.middle_name || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Last name</div>
                    <div className="font-medium">{prefill.last_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Gender</div>
                    <div className="font-medium">{prefill.gender || "-"}</div>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <Button type="button" onClick={onCreate} disabled={createLoading || !!prefill.existing_party_id}>
                    {createLoading ? "Saving..." : "Save Party"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
