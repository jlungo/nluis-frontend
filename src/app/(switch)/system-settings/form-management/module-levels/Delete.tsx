import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { levelQueryKey, type LevelProps } from "@/queries/useLevelQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    level: LevelProps;
}

export default function Delete({ level }: Props) {
    const [open, setOpen] = useState(false)

    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => api.delete(`/form-management/levels/${level.slug}/delete/`),
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [levelQueryKey],
            }),
        onError: (e) => {
            console.log(e);
        },
    });

    const confirmDelete = () => {
        try {
            const res = mutateAsync();
            toast.promise(res, {
                loading: "Deleting...",
                success: () => {
                    setOpen(false);
                    return `Module Level deleted successfully!`;
                },
                error: (e: AxiosError) => `${e?.response?.data || "Network error!"}`,
            });
        } catch (error) {
            console.log(error)
            toast.error("Failed to delete level!");
        }
    };

    return (
        <AlertDialog open={open && level?.slug === level.slug} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpen(true)}
                >
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to delete <span className="font-semibold">{level?.name}</span>?
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirmDelete}
                        disabled={isPending}
                        className="bg-destructive text-white hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
