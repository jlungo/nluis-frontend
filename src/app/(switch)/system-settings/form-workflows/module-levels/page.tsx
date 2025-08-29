import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";
import Form from "./Form";
import { useModulesQuery } from "@/queries/useModuleQuery";
import Delete from "./Delete";
import { useLevelsQuery, type LevelProps } from "@/queries/useLevelQuery";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  const { setPage: setPageData } = usePageStore();

  useLayoutEffect(() => {
    setPageData({
      module: 'system-settings',
      title: "Module Levels",
      backButton: 'Modules'
    })
  }, [setPageData])

  const [keyword, setKeyword] = useState<string>("");
  const [filterModule, setFilterModule] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const [editing, setEditing] = useState<LevelProps | null>(null);
  const [form, setForm] = useState<LevelProps | null>(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);

  const handleEdit = (level: LevelProps) => {
    setEditing(level);
    setForm(level);
    setOpenFormDialog(true);
  };

  const { data: levels, isLoading: isLoadingLevels } = useLevelsQuery(limit, offset, keyword, filterModule)
  const { data: modules, isLoading: isLoadingModules } = useModulesQuery()

  const totalPages = levels ? Math.ceil(levels.count / limit) : 1;

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
          <Form
            open={openFormDialog}
            setOpen={setOpenFormDialog}
            form={form}
            setForm={setForm}
            editing={editing}
            setEditing={setEditing}
            modules={modules || []}
          />
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
                placeholder="Search levels..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filterModule}
              onValueChange={(value) => {
                setPage(1)
                setFilterModule(value === "all" ? "" : value)
              }}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {!isLoadingModules && modules ? modules.map(m => (
                  <SelectItem key={m.slug} value={m.slug}>
                    {m.name}
                  </SelectItem>
                )) : <></>}
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
                <TableHead className="text-center">Module</TableHead>
                {/* <TableHead className="text-center">Sections</TableHead> */}
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoadingLevels && levels?.results && levels.results.length > 0 ? levels.results.map(level => (
                <TableRow key={level.slug}>
                  <TableCell>{level.name}</TableCell>
                  <TableCell className="text-center">{level.module_name}</TableCell>
                  <TableCell className="gap-2 flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(level)}
                    >
                      Edit
                    </Button>

                    <Delete level={level} />
                  </TableCell>
                </TableRow>
              )) : null}
              {isLoadingLevels ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-40">
                    <div className="m-auto w-fit h-fit">
                      <Spinner />
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
              {levels?.results && levels.results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-40">
                    No results found
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
        {levels && totalPages > 1 ?
          <CardFooter>
            <Pagination className="ml-auto mr-0 w-fit">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    isActive={levels?.previous ? true : false}
                    size="sm"
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                      size="sm"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    isActive={levels?.next ? true : false}
                    size="sm"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
          : null}
      </Card>
    </div>
  )
}