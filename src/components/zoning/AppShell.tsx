import MenuBar from "./toolbar/MenuBar";
import Toolbar from "./toolbar/Toolbar";
import LeftDock from "./panels/LeftDock";
import RightDock from "./panels/RightDock";
import StatusBar from "./panels/StatusBar";
import MapEngine from "./map/MapEngine";
import { useZoningStore } from "./store/useZoningStore";

type Props = {
  baseMapId?: string;
  defaultLandUseId?: number;
  colorMode: "type" | "status";
  onColorModeChange: (m: "type" | "status") => void;
  isMaximized?: boolean;
  onMaximizeToggle?: () => void;
};

export default function AppShell(props: Props) {
  const leftOpen = useZoningStore((s) => s.leftDockOpen);
  const rightOpen = useZoningStore((s) => s.rightDockOpen);

  return (
    <div className="flex flex-col w-full h-full">
      <MenuBar
        colorMode={props.colorMode}
        onColorModeChange={props.onColorModeChange}
        isMaximized={props.isMaximized}
        onToggleMaximize={props.onMaximizeToggle}
      />
      <Toolbar />

      <div className="flex-1 min-h-0 flex">
        {leftOpen ? (
          <div className="w-80 border-r bg-card shrink-0 min-h-0 relative z-20">
            <LeftDock colorMode={props.colorMode} />
          </div>
        ) : null}

        <div className="flex-1 min-h-0 relative z-0">
          <MapEngine
            baseMapId={props.baseMapId}
            defaultLandUseId={props.defaultLandUseId}
            colorMode={props.colorMode}
          />
        </div>

        {rightOpen ? (
          <div className="w-72 border-l bg-card shrink-0 min-h-0 relative z-20">
            <RightDock />
          </div>
        ) : null}
      </div>

      <StatusBar />
    </div>
  );
}
