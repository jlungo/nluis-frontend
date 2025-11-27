import { useLayoutEffect, useEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface CurrencyDto {
  id: number;
  name: string;
  code: string | null;
}

export default function CurrencySetupsPage() {
  const { setPage } = usePageStore();
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    setPage({
      module: "system-settings",
      title: "Currency Setups",
    });
  }, [setPage]);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const res = await api.get<CurrencyDto[]>("/setup/currencies/");
      setCurrencies(res.data || []);
    } catch (e) {
      console.error("Failed to load currencies", e);
      toast.error("Failed to load currencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const onCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      setSaving(true);
      await api.post("/setup/currencies/", {
        name: name.trim(),
        code: code.trim() || null,
      });
      setName("");
      setCode("");
      toast.success("Currency created");
      fetchCurrencies();
    } catch (e: any) {
      console.error("Failed to create currency", e);
      const msg = e?.response?.data?.detail || "Failed to create currency";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<CurrencyDto>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Currencies</h1>
        <p className="text-sm text-muted-foreground">
          Manage currencies used for billing and sales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end max-w-xl">
        <div className="space-y-1">
          <label className="text-xs font-medium" htmlFor="currency-name">
            Name
          </label>
          <Input
            id="currency-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tanzanian Shilling"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" htmlFor="currency-code">
            Code
          </label>
          <Input
            id="currency-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. TZS"
          />
        </div>
        <div className="flex items-end">
          <Button type="button" size="sm" onClick={onCreate} disabled={saving}>
            {saving ? "Saving..." : "Add currency"}
          </Button>
        </div>
      </div>

      <DataTable<CurrencyDto, unknown>
        columns={columns}
        data={currencies}
        isLoading={loading}
        showRowNumbers
        enableGlobalFilter={false}
        emptyText="No currencies configured yet."
      />
    </div>
  );
}
