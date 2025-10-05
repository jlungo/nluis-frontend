import Toolbar from '../toolbar/Toolbar';
import MenuBar from '../toolbar/MenuBar';
import SearchBar from '../SearchBar';
import { cn } from '@/lib/utils';

interface TopToolbarProps {
  onToggleFullscreen?: () => void;
  isMaximized?: boolean;
}

export default function TopToolbar({ onToggleFullscreen, isMaximized }: TopToolbarProps) {
  return (
    <div className={cn(
      "flex flex-col sticky top-0 z-50",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isMaximized && "border-b shadow-sm"
    )}>
      <MenuBar onToggleMaximize={onToggleFullscreen} />
      <div className="grid grid-cols-[1fr,minmax(200px,400px)] gap-4 px-4 py-2">
        <Toolbar className="border-none bg-transparent px-0" />
        <SearchBar />
      </div>
    </div>
  );
}
