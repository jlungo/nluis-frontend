import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToolbarDefs } from './tools';
import { cn } from '@/lib/utils'; // make sure you have this utility
import { MoreHorizontal } from 'lucide-react';

type ToolbarProps = {
  onToggleFullscreen?: () => void;
  className?: string; // <-- added
};

export default function Toolbar({ onToggleFullscreen, className }: ToolbarProps) {
  const defs = useToolbarDefs();

  // Show up to `inlineLimit` buttons inline; put the rest into a 'More' dropdown
  const inlineLimit = 9;

  // Buttons that must always be shown in the overflow menu
  const forcedOverflowIds = new Set(['save', 'upload']);

  // Flatten all buttons into a single list
  const flatButtons = defs.flatMap((section) => section.buttons.map((b) => ({ ...b, sectionId: section.id })));

  // Ensure forced overflow buttons are moved to overflow
  const forced = flatButtons.filter((b) => forcedOverflowIds.has(b.id));
  const others = flatButtons.filter((b) => !forcedOverflowIds.has(b.id));

  const inline = others.slice(0, inlineLimit);
  const overflow = [...others.slice(inlineLimit), ...forced];

  return (
    <div className={cn("flex items-center gap-2 px-2 py-1 border-b bg-muted/30", className)}>
      <div className="toolbar-buttons flex items-center gap-2">
        {inline.map((b) => (
          <div key={b.id} className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 px-2 max-w-[12rem] overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => {
                if (b.id === 'fullscreen' && onToggleFullscreen) {
                  onToggleFullscreen();
                  return;
                }
                if (b.onClick) b.onClick();
              }}
              title={b.label}
              aria-label={b.label}
              disabled={(b as any).disabled}
            >
              <b.icon className="w-4 h-4 mr-1" /> {b.label}
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
          </div>
        ))}

        {overflow.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 px-2">
                <MoreHorizontal className="w-4 h-4" /> More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {overflow.map((b) => (
                <DropdownMenuItem key={b.id} onSelect={() => b.onClick && b.onClick()}>
                  <div className="flex items-center gap-2">
                    <b.icon className="w-4 h-4" />
                    <span className="truncate">{b.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
