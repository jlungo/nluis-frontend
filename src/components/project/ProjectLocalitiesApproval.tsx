import { Check, X } from "lucide-react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import type { ProjectI } from "@/types/projects";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryProjectKey } from "@/queries/useProjectQuery";
import api from "@/lib/axios";
// import { useAuth } from "@/store/auth";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

type ApprovalProps = { locality_id: string; approval_status: 2 | 3; remarks: string }

export default function ProjectLocalitiesApproval({ project, isApproval }: { project: ProjectI; isApproval: boolean }) {
    //   const { user } = useAuth();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [generalRemarks, setGeneralRemarks] = useState<string>('');
    const [selected, setSelected] = useState<ApprovalProps[]>([]);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (e: ApprovalProps[]) => api.put(`/projects/projects/${project.id}/approval/`, e),
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [queryProjectKey],
            }),
        onError: e => console.log(e),
    });

    const toggleLocality = (id: string) => {
        setSelected(prev =>
            prev.some((s) => s.locality_id === id)
                ? prev.filter((s) => s.locality_id !== id)
                : [...prev, { locality_id: id, approval_status: isApproval ? 2 : 3, remarks: generalRemarks }]
        );
    };

    const updateRemarks = (id: string, value: string) => {
        setSelected(prev =>
            prev.map(s => s.locality_id === id ? { ...s, remarks: value } : s)
        );
    };

    const handleApprove = async () => {
        try {
            if (selected.length === 0) {
                toast.error("Please select at least one locality");
                return;
            }

            toast.promise(mutateAsync(selected), {
                loading: isApproval ? "Approving localities..." : "Rejecting localities...",
                success: () => {
                    setSelected([]);
                    setOpen(false)
                    if (isApproval) return "Localities approved successfully"
                    return "Localities rejected successfully"
                },
                error: (err: AxiosError | any) =>
                    `${err?.message || err?.response?.data?.message || isApproval ? "Failed to approve!" : "Failed to reject!"}`,
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={e => {
                setSelected([])
                setOpen(e)
            }}
        >
            <DialogTrigger asChild>
                {isApproval
                    ? <Button
                        type="button"
                        size="sm"
                        className="gap-2 w-fit bg-green-700 dark:bg-green-900 hover:bg-green-700/90 dark:hover:bg-green-900/90"
                    >
                        <Check className="h-4 w-4 hidden md:inline-block" />
                        {isApproval ? "Approve Locality" : "Reject Locality"}
                    </Button>
                    : <Button
                        type='button'
                        size='sm'
                        className="gap-2 w-fit bg-destructive/20 text-destructive hover:bg-destructive/30 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:text-destructive"
                    >
                        <X className="h-4 w-4 hidden md:inline-block" />
                        Reject Locality
                    </Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle>{isApproval ? "Approve" : "Reject"} Project Localities</DialogTitle>
                    <DialogDescription>{project.name}</DialogDescription>
                </DialogHeader>

                {project?.localities && project.localities.length > 0 ? (
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto overflow-x-visible p-2">
                        <div className="mb-4">
                            <Label htmlFor={`general-remarks`} className="font-bold">General Remarks</Label>
                            <Textarea
                                id={`general-remarks`}
                                value={generalRemarks}
                                onChange={e => setGeneralRemarks(e.target.value)}
                                placeholder="General remarks..."
                                className="mt-1"
                            />
                        </div>
                        <div className="font-bold text-center">Select Modules to {isApproval ? 'Approve' : 'Reject Approval'}</div>
                        {project.localities
                            .filter((locality) => isApproval ? locality.approval_status !== 2 : locality.approval_status === 1)
                            .map((locality) => {
                                const isChecked = selected.some(s => s.locality_id === locality.id);
                                const currentRemarks = selected.find(s => s.locality_id === locality.id)?.remarks || "";

                                return (
                                    <div key={locality.id} className="flex flex-col gap-2 border-t pt-1.5">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={locality.id}
                                                checked={isChecked}
                                                onCheckedChange={() => toggleLocality(locality.id)}
                                            />
                                            <Label
                                                htmlFor={locality.id}
                                                className="cursor-pointer font-medium mt-2.5"
                                            >
                                                {locality.locality__name}
                                            </Label>
                                        </div>
                                        {isChecked && (
                                            <div>
                                                <Label htmlFor={`remarks-${locality.id}`}>Remarks</Label>
                                                <Textarea
                                                    id={`remarks-${locality.id}`}
                                                    value={currentRemarks}
                                                    onChange={e => updateRemarks(locality.id, e.target.value)}
                                                    placeholder="Locality remarks..."
                                                    className="mt-1"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <div className="h-40 text-center flex flex-col items-center justify-center">
                        <p>No localities for this project</p>
                    </div>
                )}

                <DialogFooter className="flex-row justify-end gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    {isApproval
                        ? <Button
                            type="button"
                            disabled={isPending || selected.length === 0}
                            onClick={handleApprove}
                            className="bg-green-700 hover:opacity-90 hover:bg-green-800 dark:bg-green-900"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                        </Button>
                        : <Button
                            type="submit"
                            disabled={isPending || selected.length === 0}
                            className='bg-destructive/20 text-destructive hover:bg-destructive/30 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:text-destructive'
                        >
                            <X />
                            Reject
                        </Button>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
