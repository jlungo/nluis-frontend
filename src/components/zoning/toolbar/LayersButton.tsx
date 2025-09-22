import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { useZoningStore } from "../store/useZoningStore";

export default function LayersButton() {
  const open = useZoningStore((s) => s.leftDockOpen);
  const setOpen = useZoningStore((s) => s.setLeftDockOpen);
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => setOpen(!open)}>
      <Layers className="w-4 h-4 mr-1" /> {open ? "Hide" : "Show"} Layers
    </Button>
  );
}
