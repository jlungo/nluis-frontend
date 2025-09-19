import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";
import { levelQueryKey, type LevelProps } from "@/queries/useLevelQuery";
import type { ModuleProps } from "@/queries/useModuleQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    form: LevelProps | null;
    setForm: React.Dispatch<React.SetStateAction<LevelProps | null>>;
    editing: LevelProps | null;
    setEditing: React.Dispatch<React.SetStateAction<LevelProps | null>>;
    modules: ModuleProps[]
}

export default function AddForm({ open, setOpen, form, setForm, editing, setEditing, modules }: Props) {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (e: { slug?: string; data: { name: string; module: string } }) => {
            if (e?.slug) return api.put(`/form-management/module/levels/${e.slug}/`, e.data)
            return api.post(`/form-management/module/levels/create/`, e.data)
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [levelQueryKey],
            }),
        onError: (e) => {
            console.log(e);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as { name: string; module: string };
        if (!data || !data?.module || !data?.name || !form) return;
        if (editing) {
            try {
                toast.promise(mutateAsync({ slug: form.slug, data }), {
                    loading: "Editing level...",
                    success: () => {
                        setOpen(false);
                        return `Module Level edited successfully!`;
                    },
                    error: (e: AxiosError) => {
                        const detail =
                            e?.response?.data &&
                                typeof e.response.data === "object" &&
                                "detail" in e.response.data
                                ? (e.response.data as { detail?: string }).detail
                                : undefined;
                        return `${detail || "Network error!"}`;
                    }
                });
            } catch (error) {
                console.log(error)
                toast.error("Failed to edit module level!");
            } finally {
                setEditing(null);
                setOpen(false);
                setForm(null);
            }
        } else {
            try {
                toast.promise(mutateAsync({ data }), {
                    loading: "Adding level...",
                    success: () => {
                        setOpen(false);
                        return `Level added successfully!`;
                    },
                    error: (e: AxiosError) => {
                        const detail =
                            e?.response?.data &&
                                typeof e.response.data === "object" &&
                                "detail" in e.response.data
                                ? (e.response.data as { detail?: string }).detail
                                : undefined;
                        return `${detail || "Network error!"}`;
                    }
                });
            } catch (error) {
                console.log(error)
                toast.error("Failed to add level!");
            } finally {
                setEditing(null);
                setOpen(false);
                setForm(null);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={open => {
            setOpen(open);
            if (!open) {
                setEditing(null);
                setForm(null);
            }
        }}>
            <DialogTrigger asChild>
                <Button onClick={() => { setEditing(null); setForm({ slug: "", name: "", module_slug: "", module_name: "" }); }}>
                    Add Level
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{editing ? "Edit Level" : "Add Level"}</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <Input
                        placeholder="Level name"
                        defaultValue={form?.name}
                        name="name"
                    />
                    <Select
                        defaultValue={form?.module_slug}
                        name="module"
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                            {modules.filter(m => m.slug !== "all").map(m => (
                                <SelectItem key={m.slug} value={m.slug}>
                                    {m.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setEditing(null);
                                    setForm(null);
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {editing ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
