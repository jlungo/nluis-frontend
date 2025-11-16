import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToolbarDefs } from "./tools";

export default function Toolbar() {
  const defs = useToolbarDefs();
  const [drawOpen, setDrawOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 px-2 py-1 border-b bg-muted/30">
      {defs.map((tb) => {
        if (tb.id === "draw") {
          const selectBtn = tb.buttons.find((b) => b.id === "select");
          const pointBtn = tb.buttons.find((b) => b.id === "draw-point");
          const lineBtn = tb.buttons.find((b) => b.id === "draw-line");
          const polyBtn = tb.buttons.find((b) => b.id === "draw-polygon");

          return (
            <div key={tb.id} className="flex items-center gap-1">
              {selectBtn && (
                <Button
                  key={selectBtn.id}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={selectBtn.onClick}
                  title={selectBtn.label}
                >
                  <selectBtn.icon className="w-4 h-4 mr-1" /> {selectBtn.label}
                </Button>
              )}
              <div className="relative">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => setDrawOpen((v) => !v)}
                  title="Draw"
                >
                  Draw
                </Button>
                {drawOpen && (
                  <div className="absolute z-50 mt-1 w-40 rounded border bg-popover shadow">
                    <div className="flex flex-col p-1 text-xs">
                      {pointBtn && (
                        <button
                          type="button"
                          className="flex items-center gap-2 px-2 py-1 hover:bg-muted"
                          onClick={() => {
                            pointBtn.onClick?.();
                            setDrawOpen(false);
                          }}
                        >
                          <pointBtn.icon className="w-4 h-4" /> Point
                        </button>
                      )}
                      {lineBtn && (
                        <button
                          type="button"
                          className="flex items-center gap-2 px-2 py-1 hover:bg-muted"
                          onClick={() => {
                            lineBtn.onClick?.();
                            setDrawOpen(false);
                          }}
                        >
                          <lineBtn.icon className="w-4 h-4" /> Line
                        </button>
                      )}
                      {polyBtn && (
                        <button
                          type="button"
                          className="flex items-center gap-2 px-2 py-1 hover:bg-muted"
                          onClick={() => {
                            polyBtn.onClick?.();
                            setDrawOpen(false);
                          }}
                        >
                          <polyBtn.icon className="w-4 h-4" /> Polygon
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Separator orientation="vertical" className="h-6 mx-1" />
            </div>
          );
        }

        return (
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
        );
      })}
    </div>
  );
}
