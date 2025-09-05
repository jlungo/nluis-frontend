import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShapefileMap } from "./ShapefileMap";
import { Map } from "lucide-react";

interface MapDialogProps {
  title: string;
  baseMapId?: string;
  overlayMapsIds?: string[];
}

export function MapDialog({ title, baseMapId, overlayMapsIds = [] }: MapDialogProps) {
  const [resetKey, setResetKey] = useState(0);

  const handleClose = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <Map className="h-4 w-4 hidden md:inline-block" />
            View Map
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            This is the map of all localities in this project.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[400px] w-full">
          <ShapefileMap
            resetKey={resetKey}
            baseMapId={baseMapId}
            overlayMapsIds={overlayMapsIds}
            showLayersControl={false}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
