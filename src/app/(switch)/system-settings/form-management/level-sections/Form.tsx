import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";
import { sectionQueryKey, type SectionProps } from "@/queries/useSectionQuery";
import type { ModuleProps } from "@/queries/useModuleQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { LevelProps } from "@/queries/useLevelQuery";
import { useState } from "react";

interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    form: SectionProps | null;
    setForm: React.Dispatch<React.SetStateAction<SectionProps | null>>;
    editing: SectionProps | null;
    setEditing: React.Dispatch<React.SetStateAction<SectionProps | null>>;
    modules: ModuleProps[];
    levels: LevelProps[]
}

export default function AddForm({ open, setOpen, form, setForm, editing, setEditing, modules, levels }: Props) {
    const queryClient = useQueryClient();

    const [filterModule, setFilterModule] = useState<string>("");

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (e: { slug?: string; data: { name: string; level: string } }) => {
            if (e?.slug) return api.put(`/form-management/sections/${e.slug}/`, e.data)
            return api.post(`/form-management/sections/create/`, e.data)
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [sectionQueryKey],
            }),
        onError: (e) => {
            console.log(e);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as { name: string; level: string };
        if (!data || !data?.level || !data?.name || !form) return;
        if (editing) {
            try {
                toast.promise(mutateAsync({ slug: form.slug, data }), {
                    loading: "Editing section...",
                    success: () => {
                        setOpen(false);
                        return `Section edited successfully!`;
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
                toast.error("Failed to edit section!");
            } finally {
                setEditing(null);
                setOpen(false);
                setForm(null);
            }
        } else {
            try {
                toast.promise(mutateAsync({ data }), {
                    loading: "Adding section...",
                    success: () => {
                        setOpen(false);
                        return `Section added successfully!`;
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
                toast.error("Failed to add section!");
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
                <Button onClick={() => { setEditing(null); setForm({ slug: "", name: "", module_slug: "", module_name: "", level_name: "", level_slug: "" }); }}>
                    Add Section
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editing ? "Edit Section" : "Add Section"}</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <Input
                        placeholder="Section name"
                        defaultValue={form?.name}
                        name="name"
                    />
                    <Select
                        defaultValue={form?.module_slug}
                        value={filterModule}
                        onValueChange={value => setFilterModule(value === "all" ? "" : value)}
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
                    <Select
                        defaultValue={form?.level_slug}
                        name="level"
                        disabled={!filterModule || filterModule === "all"}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                            {levels.filter(m => m.slug !== "all" && m.module_slug === filterModule).map(m => (
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
