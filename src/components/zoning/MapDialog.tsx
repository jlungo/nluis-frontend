import { useState, useEffect } from "react";
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
import { Map, Maximize2, Minimize2, X } from "lucide-react";

interface MapDialogProps {
  title: string;
  baseMapId?: string;
  overlayMapsIds?: string[];
}

export function MapDialog({ title, baseMapId, overlayMapsIds = [] }: MapDialogProps) {
  const [resetKey, setResetKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleClose = () => {
    setResetKey(prev => prev + 1);
    setIsFullscreen(false);
    setMapKey(prev => prev + 1);
    setIsMapLoaded(false);
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => setIsMapLoaded(true), 200);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Resize map when fullscreen changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          handleOpen();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Map className="h-4 w-4 hidden md:inline-block" />
          <span className="ml-2">View Map</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={`
          flex flex-col transition-all duration-100 ease-in-out
          ${isFullscreen
            ? "min-w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none"
            : "sm:max-w-[800px] h-[600px] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2"
          }
        `}
      >

        <div className="relative">
          {/* Top-right controls - hidden on mobile */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10 hidden sm:flex">
            <Button
              onClick={toggleFullscreen}
              size="icon"
              variant="ghost"
              className="hover:bg-gray-100 active:scale-95 rounded-full"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <DialogClose asChild>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-gray-100 active:scale-95 rounded-full"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>

          {/* Header */}
          <DialogHeader className={isFullscreen ? "p-6 pt-6" : "pt-4 px-4"}>
            <DialogTitle className="text-base sm:text-lg font-semibold">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              This is the map of all localities in this project.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Map container */}
        <div
          className={`flex-1 w-full relative overflow-hidden ease-in-out
            ${isFullscreen ? "px-6" : ""}
          `}
        >
          {/* Loading overlay */}
          {!isMapLoaded && isOpen && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br animate-pulse z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600 animate-in fade-in-0 duration-200">
                  Loading map...
                </span>
              </div>
            </div>
          )}

          {/* Map component */}
          <div
            className={`
              w-full h-full ease-out
              ${isMapLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
              }
            `}
          >
            <ShapefileMap
              key={`${resetKey}-${mapKey}`}
              resetKey={`${resetKey}-${mapKey}`}
              baseMapId={baseMapId}
              overlayMapsIds={overlayMapsIds}
              showLayersControl={isFullscreen}
            />
          </div>
        </div>

        {/* Footer with mobile toggle & close buttons */}
        <DialogFooter
          className={`
            mt-4 animate-in fade-in-0 slide-in-from-bottom-4
            ${isFullscreen ? "p-6 pt-0" : ""}
            flex justify-between sm:justify-end
          `}
        >
          {/* Mobile toggle fullscreen button */}
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            className="sm:hidden"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4 mr-2" />
                Minimize
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>

          {/* Mobile close button (on right) */}
          <DialogClose asChild>
            <Button
              variant="outline"
              className="hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:ml-2"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
