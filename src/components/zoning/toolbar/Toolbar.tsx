import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToolbarDefs } from "./tools";

export default function Toolbar() {
  const defs = useToolbarDefs();

  return (
    <div className="flex items-center gap-2 px-2 py-1 border-b bg-muted/30">
      {defs.map((tb) => (
        <div key={tb.id} className="flex items-center gap-1">
          {tb.buttons.map((b) => (
            <Button
              key={b.id}
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={b.onClick}
              title={b.label}
            >
              <b.icon className="w-4 h-4 mr-1" /> {b.label}
            </Button>
          ))}
          <Separator orientation="vertical" className="h-6 mx-1" />
        </div>
      ))}
    </div>
  );
}
