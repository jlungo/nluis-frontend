import Toolbar from '../toolbar/Toolbar';
import MenuBar from '../toolbar/MenuBar';
import SearchBar from '../SearchBar';
import { cn } from '@/lib/utils';
import { useOptionalSidebar } from '@/components/ui/sidebar';

interface TopToolbarProps {
  onToggleFullscreen?: () => void;
  isMaximized?: boolean;
}

export default function TopToolbar({ onToggleFullscreen, isMaximized }: TopToolbarProps) {
  const optionalSidebar = typeof useOptionalSidebar === 'function' ? useOptionalSidebar() : null;
  const hideOnMobile = optionalSidebar ? (optionalSidebar.isMobile && optionalSidebar.openMobile) : false;

  return (
    <div className={cn(
      // hide on small screens when sidebar is open; keep visible on md+
      hideOnMobile ? 'hidden md:flex' : 'flex',
      'flex-col sticky top-0 z-10',
      'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      isMaximized && 'border-b shadow-sm'
    )}>
      <MenuBar onToggleMaximize={onToggleFullscreen} />
      <div className="grid grid-cols-1 md:grid-cols-[1fr,minmax(200px,400px)] gap-4 px-4 py-2">
        <Toolbar className="border-none bg-transparent px-0" />
        <SearchBar />
      </div>
    </div>
  );
}
