import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { sectionQueryKey, type SectionProps } from "@/queries/useSectionQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    section: SectionProps;
}

export default function Delete({ section }: Props) {
    const [open, setOpen] = useState(false)

    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => api.delete(`/form-management/sections/${section.slug}/delete/`),
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [sectionQueryKey],
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
                    return `Module Section deleted successfully!`;
                },
                error: (e: AxiosError) => `${e?.response?.data || "Network error!"}`,
            });
        } catch (error) {
            console.log(error)
            toast.error("Failed to delete section!");
        }
    };

    return (
        <AlertDialog open={open && section?.slug === section.slug} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpen(true)}
                >
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent aria-describedby={undefined}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete <span className="font-semibold">{section?.name}</span>?
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Are you sure you want to delete <span className="font-semibold">{section?.name}</span> level section?
                </AlertDialogDescription>
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
