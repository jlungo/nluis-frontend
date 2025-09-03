import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { workflowQueryKey, type WorkflowProps } from "@/queries/useWorkflowQuery";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { DeleteIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    workflow: WorkflowProps;
}

export default function Delete({ workflow }: Props) {
    const [open, setOpen] = useState(false)

    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => api.delete(`/form-management/workflows/${workflow.slug}/delete/`),
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [workflowQueryKey],
            }),
        onError: (e) => {
            console.log(e);
        },
    });

    const confirmDelete = () => {
        try {
            toast.promise(mutateAsync(), {
                loading: "Deleting...",
                success: () => {
                    setOpen(false);
                    return `Form Workflow deleted successfully!`;
                },
                error: (e: AxiosError) => `${e?.response?.data || "Network error!"}`,
            });
        } catch (error) {
            console.log(error)
            toast.error("Failed to delete form workflow!");
        }
    };

    return (
        <AlertDialog open={open && workflow?.slug === workflow.slug} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpen(true)}
                    className="gap-2"
                >
                    <DeleteIcon className="h-4 w-4" />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete <span className="font-semibold">{workflow?.name}</span>
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    Are you sure you want to delete <span className="font-semibold">{workflow?.name}</span> workflow?
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
