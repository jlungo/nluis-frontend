import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Level {
    id: number;
    name: string;
    module: string;
    //   sections?: Section[];
}

interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    form: { name: string; module: string };
    setForm: React.Dispatch<React.SetStateAction<{ name: string; module: string }>>;
    editing: Level | null;
    setEditing: React.Dispatch<React.SetStateAction<Level | null>>;
}

const MODULES = [
    { value: "all", label: "All" },
    { value: "dashboard", label: "System Dashboard" },
    { value: "land-uses", label: "Land Use Planning" },
    { value: "ccro-management", label: "CCRO Management" },
    { value: "compliance", label: "Compliance Monitoring" },
    { value: "management-evaluation", label: "Management & Evaluation" },
    { value: "mapshop-management", label: "MapShop Management" },
    { value: "reports", label: "Reports & Analytics" },
    { value: "organizations", label: "Organizations" },
    { value: "user-management", label: "User Management" },
    { value: "system-settings", label: "System Administration" },
    { value: "audit-trail", label: "Audit & Activity" },
];

export default function AddForm({ open, setOpen, form, setForm, editing, setEditing }: Props) {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.module) return;
        if (editing) {
            //   setLevels(levels.map(l => l.id === editing.id ? { ...editing, ...form } : l));
            setEditing(null);
        } else {
            //   setLevels([...levels, { id: Date.now(), ...form, sections: [] }]);
        }
        setForm({ name: "", module: "" });
        setOpen(false);
    };

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    return (
        <Dialog open={open} onOpenChange={open => {
            setOpen(open);
            if (!open) {
                setEditing(null);
                setForm({ name: "", module: "" });
            }
        }}>
            <DialogTrigger asChild>
                <Button onClick={() => { setEditing(null); setForm({ name: "", module: "" }); }}>
                    Add Level
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editing ? "Edit Level" : "Add Level"}</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <Input
                        placeholder="Level name"
                        value={form.name}
                        onChange={e => handleChange("name", e.target.value)}
                    />
                    <Select
                        value={form.module}
                        onValueChange={val => handleChange("module", val)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                            {MODULES.filter(m => m.value !== "all").map(m => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
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
                                    setForm({ name: "", module: "" });
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            {editing ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
