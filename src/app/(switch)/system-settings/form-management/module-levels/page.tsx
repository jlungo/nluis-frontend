import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Form from "./Form";

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

interface Level {
  id: number;
  name: string;
  module: string;
  sections?: Section[];
}

interface Section {
  id: number;
  name: string;
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

  const [levels, setLevels] = useState<Level[]>([]);
  const [editing, setEditing] = useState<Level | null>(null);
  const [filterModule, setFilterModule] = useState<string>("");
  const [form, setForm] = useState({ name: "", module: "" });

  // Dialog state for add/edit level
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null);

  const handleEdit = (level: Level) => {
    setEditing(level);
    setForm({ name: level.name, module: level.module });
    setOpen(true);
  };

  const handleDelete = (level: Level) => {
    setLevelToDelete(level);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (levelToDelete) {
      setLevels(levels.filter(l => l.id !== levelToDelete.id));
      setLevelToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const filteredLevels = filterModule && filterModule !== "all"
    ? levels.filter(l => l.module === filterModule)
    : levels;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Module Levels</h1>
          <p className="text-muted-foreground">
            Manage levels under modules that hold forms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Form open={open} setOpen={setOpen} form={form} setForm={setForm} editing={editing} setEditing={setEditing} />
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
                placeholder="Search projects..."
                // value={state.searchTerm}
                // onChange={(e) =>
                //   setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                // }
                className="pl-10"
              />
            </div>

            <Select
              value={filterModule}
              onValueChange={setFilterModule}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
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
                <TableHead>Level Name</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLevels.map(level => (
                <TableRow key={level.id}>
                  <TableCell>{level.name}</TableCell>
                  <TableCell>
                    {MODULES.find(m => m.value === level.module)?.label || level.module}
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc ml-4">
                      {(level.sections || []).map(section => (
                        <li key={section.id}>{section.name}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(level)}
                    >
                      Edit
                    </Button>

                    <AlertDialog open={deleteDialogOpen && levelToDelete?.id === level.id} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(level)}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to delete <span className="font-semibold">{levelToDelete?.name}</span>?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => {
                              setDeleteDialogOpen(false);
                              setLevelToDelete(null);
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
              {filteredLevels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No levels found.
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