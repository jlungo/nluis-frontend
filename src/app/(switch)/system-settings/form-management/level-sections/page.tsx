import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Dummy modules and levels for demonstration
const MODULES = [
  // { value: "all", label: "All" },
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

interface Level {
  id: number;
  name: string;
  module: string;
}

interface Section {
  id: number;
  name: string;
  module: string;
  levelId: number;
}

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: 'system-settings',
      title: "System Settings",
      backButton: 'Back',
    })
  }, [setPage])

  // Dummy levels for demonstration. Replace with API data as needed.
  const [levels] = useState<Level[]>([
    { id: 1, name: "Village", module: "land-uses" },
    { id: 2, name: "District", module: "land-uses" },
    { id: 3, name: "Compliance Level 1", module: "compliance" },
    { id: 4, name: "Compliance Level 2", module: "compliance" },
    { id: 5, name: "Dashboard Level", module: "dashboard" },
  ]);

  const [sections, setSections] = useState<Section[]>([]);
  const [editing, setEditing] = useState<Section | null>(null);
  const [filterModule, setFilterModule] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<number | "">("");
  const [form, setForm] = useState({ name: "", module: "", levelId: "" as number | "" });

  // Dialog state for add/edit section
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  // Filter levels by selected module
  const filteredLevelsForSelect = filterModule && filterModule !== "all"
    ? levels.filter(l => l.module === filterModule)
    : levels;

  // Filter levels for the form dialog
  const filteredLevelsForForm = form?.module
    ? levels.filter(l => l.module === form.module)
    : [];

  // Filter sections by module and level
  const filteredSections = sections.filter(section => {
    let match = true;
    if (filterModule && filterModule !== "all") {
      match = match && section.module === filterModule;
    }
    if (filterLevel) {
      match = match && section.levelId === filterLevel;
    }
    return match;
  });

  const handleChange = (key: string, value: string | number) => {
    console.log(key, value)
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.module || !form.levelId) return;
    if (editing) {
      setSections(sections.map(s => s.id === editing.id ? { ...editing, ...form, levelId: Number(form.levelId) } : s));
      setEditing(null);
    } else {
      setSections([...sections, { id: Date.now(), ...form, levelId: Number(form.levelId) }]);
    }
    setForm({ name: "", module: "", levelId: "" });
    setSectionDialogOpen(false);
  };

  const handleEdit = (section: Section) => {
    setEditing(section);
    setForm({ name: section.name, module: section.module, levelId: section.levelId });
    setSectionDialogOpen(true);
  };

  const handleDelete = (section: Section) => {
    setSectionToDelete(section);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sectionToDelete) {
      setSections(sections.filter(s => s.id !== sectionToDelete.id));
      setSectionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sections</h1>
          <p className="text-muted-foreground">
            Manage sections under module levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={sectionDialogOpen} onOpenChange={open => {
            setSectionDialogOpen(open);
            if (!open) {
              setEditing(null);
              setForm({ name: "", module: "", levelId: "" });
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm({ name: "", module: "", levelId: "" }); }}>
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
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                  required
                />
                <Select
                  value={form.module}
                  required
                  onValueChange={val => {
                    handleChange("module", val);
                    // Reset levelId if module changes
                    // handleChange("levelId", "");
                  }}
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
                <Select
                  value={form.levelId === "" ? "" : String(form.levelId)}
                  onValueChange={val => handleChange("levelId", Number(val))}
                  disabled={!form.module}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLevelsForForm.map(l => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
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
                        setForm({ name: "", module: "", levelId: "" });
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
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
                // value={state.searchTerm}
                // onChange={(e) =>
                //   setState((prev) => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={filterModule}
              onValueChange={val => {
                setFilterModule(val);
                setFilterLevel("");
              }}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterLevel === "" ? "" : String(filterLevel)}
              onValueChange={val => setFilterLevel(Number(val))}
              disabled={!filterModule || filterModule === "all"}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                {filteredLevelsForSelect.map(l => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section Name</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSections.map(section => (
                <TableRow key={section.id}>
                  <TableCell>{section.name}</TableCell>
                  <TableCell>
                    {MODULES.find(m => m.value === section.module)?.label || section.module}
                  </TableCell>
                  <TableCell>
                    {levels.find(l => l.id === section.levelId)?.name || section.levelId}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(section)}
                    >
                      Edit
                    </Button>
                    <AlertDialog open={deleteDialogOpen && sectionToDelete?.id === section.id} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(section)}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to delete <span className="font-semibold">{sectionToDelete?.name}</span>?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => {
                              setDeleteDialogOpen(false);
                              setSectionToDelete(null);
                            }}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No sections found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}