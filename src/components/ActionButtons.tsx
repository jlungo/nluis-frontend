// components/ActionButtons.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { EllipsisVertical, Pencil, Eye, Trash2, Loader2 } from "lucide-react";

type IdLike = string | number | undefined;

type ActionButtonsProps<T> = {
  entity: T;
  entityName?: string;
  // Called when the user confirms deletion.
  // Will receive either the entity id (if found) or the whole entity.
  deleteFunction?: (payload: any) => Promise<any> | any;

  // Optional callbacks to wire view/edit behavior.
  onView?: (entity: T) => void;
  onEdit?: (entity: T) => void;

  // Optional custom id extractor. Default tries id/_id/uuid.
  getId?: (entity: any) => IdLike;

  // Disable all actions (e.g., while parent is busy).
  disabled?: boolean;

  // Optional: not used directly here, but kept for parity with your DataTable API.
  queryKey?: string;
};

function defaultGetId<T extends Record<string, any>>(entity: T): IdLike {
  return entity?.id ?? entity?._id ?? entity?.uuid;
}

export default function ActionButtons<T>({
  entity,
  entityName = "Item",
  deleteFunction,
  onView,
  onEdit,
  getId = defaultGetId,
  disabled,
}: ActionButtonsProps<T>) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const id = getId(entity);

  const handleDelete = async () => {
    if (!deleteFunction) return;
    try {
      setIsDeleting(true);
      await Promise.resolve(deleteFunction(id ?? entity));
      toast.success(`${entityName} deleted`);
    } catch (err: any) {
      const msg =
        err?.message || err?.response?.data?.message || `Failed to delete ${entityName}`;
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={disabled || isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <EllipsisVertical className="h-4 w-4" />
            )}
            <span className="sr-only">Open row actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {onView && (
            <DropdownMenuItem onClick={() => onView(entity)} disabled={disabled}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(entity)} disabled={disabled}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {(onView || onEdit) && <DropdownMenuSeparator />}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setConfirmOpen(true)}
            disabled={disabled || !deleteFunction}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirm Delete */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {entityName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {entityName.toLowerCase()}
              {id !== undefined ? ` (ID: ${String(id)})` : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || !deleteFunction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
