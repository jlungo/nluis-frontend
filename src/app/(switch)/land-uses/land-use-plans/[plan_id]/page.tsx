import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import api from "@/lib/axios";
import { usePageStore } from "@/store/pageStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PlanVersionMap from "@/components/zoning/map/PlanVersionMap";
import { toast } from "sonner";

interface LandUsePlanDto {
  id: number;
  name: string;
  locality: number;
  effective_from: string;
  effective_to: string | null;
  description: string | null;
}

interface PlanVersionDto {
  id: number;
  plan: number;
  plan_name: string;
  version_number: number;
  notes: string | null;
  feature_count: number;
  geom_hash: string | null;
  artifact_file: string | null;
  finalized_at: string | null;
}

interface PlanDocumentDto {
  id: number;
  plan: number;
  document_type: string;
  title: string;
  description: string | null;
  file: string;
  file_url: string;
  thumbnail: string | null;
  thumbnail_url: string | null;
  file_size: number | null;
  created_at: string;
  created_by: number;
  created_by_name?: string | null;
}

export default function LandUsePlanDetailPage() {
  const { plan_id } = useParams();
  const { setPage } = usePageStore();
  const [plan, setPlan] = useState<LandUsePlanDto | null>(null);
  const [versions, setVersions] = useState<PlanVersionDto[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<PlanDocumentDto[]>([]);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LandUsePlanDto>>({});
  const [uploadForm, setUploadForm] = useState({
    document_type: "Plan Document",
    title: "",
    description: "",
    file: null as File | null,
    thumbnail: null as File | null,
  });
  const [isEditDocDialogOpen, setIsEditDocDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<PlanDocumentDto | null>(null);
  const [editDocForm, setEditDocForm] = useState({
    document_type: "Plan Document",
    title: "",
    description: "",
    file: null as File | null,
    thumbnail: null as File | null,
  });

  useEffect(() => {
    setPage({ module: "land-uses", title: "Land use Plan" });
  }, [setPage]);

  useEffect(() => {
    const id = Number(plan_id);
    if (!id) return;

    const fetchPlan = async () => {
      try {
        const res = await api.get(`/zoning/plans/${id}/`);
        setPlan(res.data);
        setEditForm(res.data);
      } catch (e) {
        console.error("Failed to load plan", e);
      }
    };

    const fetchVersions = async () => {
      try {
        const res = await api.get(`/zoning/plans/${id}/versions/`);
        const list = res.data as PlanVersionDto[];
        setVersions(list);
        if (list.length && !selectedVersionId) {
          setSelectedVersionId(list[0].id);
        }
      } catch (e) {
        console.error("Failed to load versions", e);
      }
    };

    const fetchDocuments = async () => {
      try {
        const res = await api.get(`/zoning/plan-documents/?plan=${id}`);
        setDocuments(res.data as PlanDocumentDto[]);
      } catch (e) {
        console.error("Failed to load documents", e);
      }
    };

    fetchPlan();
    fetchVersions();
    fetchDocuments();
  }, [plan_id, selectedVersionId]);

  const activeVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId) || null,
    [versions, selectedVersionId]
  );

  const onFinalize = async () => {
    if (!plan) return;
    try {
      const res = await api.post(`/zoning/plans/${plan.id}/finalize/`, {
        notes: "",
        dissolve_by_land_use: false,
      });
      const created = res.data?.version as PlanVersionDto;
      if (created) {
        setVersions((prev) => [created, ...prev]);
        setSelectedVersionId(created.id);
        toast.success(`Version ${created.version_number} created successfully!`);
      }
    } catch (e: any) {
      console.error("Finalize failed", e);
      
      // Check for specific error messages from the backend
      const errorMessage = e?.response?.data?.detail || e?.response?.data?.message;
      
      if (errorMessage) {
        toast.error(errorMessage);
      } else if (e?.response?.status === 400) {
        toast.error("Cannot finalize plan. Please check the plan configuration.");
      } else {
        toast.error("Failed to finalize plan. Please try again.");
      }
    }
  };

  const handlePlanSave = async () => {
    if (!plan) return;
    try {
      const payload: Partial<LandUsePlanDto> = {
        name: editForm.name ?? plan.name,
        description: editForm.description ?? plan.description,
      };
      const res = await api.patch(`/zoning/plans/${plan.id}/`, payload);
      setPlan(res.data);
      setEditForm(res.data);
      setIsEditingPlan(false);
      toast.success("Plan details updated");
    } catch (e) {
      console.error("Failed to update plan", e);
      toast.error("Failed to update plan details");
    }
  };

  const handleDocumentUpload = async () => {
    if (!plan) return;
    if (!uploadForm.file) {
      toast.error("Please choose a file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("plan", String(plan.id));
      formData.append("document_type", uploadForm.document_type);
      formData.append("title", uploadForm.title || uploadForm.file.name);
      formData.append("description", uploadForm.description || "");
      formData.append("file", uploadForm.file);
      if (uploadForm.thumbnail) {
        formData.append("thumbnail", uploadForm.thumbnail);
      }

      const res = await api.post("/zoning/plan-documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDocuments((prev) => [res.data as PlanDocumentDto, ...prev]);
      setUploadForm({
        document_type: "Plan Document",
        title: "",
        description: "",
        file: null,
        thumbnail: null,
      });
      toast.success("Document uploaded");
    } catch (e) {
      console.error("Failed to upload document", e);
      toast.error("Failed to upload document");
    }
  };

  const handleDocumentDelete = async (docId: number) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/zoning/plan-documents/${docId}/`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document deleted");
    } catch (e) {
      console.error("Failed to delete document", e);
      toast.error("Failed to delete document");
    }
  };

  const handleDocumentOpenOrDownload = (doc: PlanDocumentDto) => {
    const url = doc.file_url || doc.file;
    if (!url) return;
    const lower = url.toLowerCase();
    // PDFs open in a new tab, shapefiles (usually zip) download
    if (lower.endsWith(".pdf")) {
      window.open(url, "_blank");
      return;
    }
    if (doc.document_type === "Shapefile" || lower.endsWith(".zip") || lower.endsWith(".shp")) {
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.title || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    // Fallback: open in new tab
    window.open(url, "_blank");
  };

  const handleDocumentDownload = (doc: PlanDocumentDto) => {
    const url = doc.file_url || doc.file;
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.title || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const openEditDocumentDialog = (doc: PlanDocumentDto) => {
    setSelectedDoc(doc);
    setEditDocForm({
      document_type: doc.document_type,
      title: doc.title,
      description: doc.description || "",
      file: null,
      thumbnail: null,
    });
    setIsEditDocDialogOpen(true);
  };

  const handleDocumentUpdate = async () => {
    if (!selectedDoc) return;

    try {
      const formData = new FormData();
      formData.append("document_type", editDocForm.document_type);
      formData.append("title", editDocForm.title);
      formData.append("description", editDocForm.description || "");
      if (editDocForm.file) {
        formData.append("file", editDocForm.file);
      }
      if (editDocForm.thumbnail) {
        formData.append("thumbnail", editDocForm.thumbnail);
      }

      const res = await api.patch(`/zoning/plan-documents/${selectedDoc.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data as PlanDocumentDto;
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setIsEditDocDialogOpen(false);
      setSelectedDoc(null);
      toast.success("Document updated");
    } catch (e) {
      console.error("Failed to update document", e);
      toast.error("Failed to update document");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {isEditingPlan && plan ? (
                    <Input
                      value={editForm.name ?? plan.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="h-8 text-base"
                    />
                  ) : (
                    plan ? plan.name : "Land use Plan"
                  )}
                </CardTitle>
                {plan && !isEditingPlan && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Locality ID: {plan.locality} • Effective {plan.effective_from}
                    {plan.effective_to ? ` - ${plan.effective_to}` : " (ongoing)"}
                  </div>
                )}
                {plan && (
                  <div className="mt-2">
                    {isEditingPlan ? (
                      <div className="space-y-2">
                        <Label
                          htmlFor="plan-description"
                          className="text-xs text-muted-foreground"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="plan-description"
                          rows={3}
                          value={editForm.description ?? plan.description ?? ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      plan.description && (
                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                          {plan.description}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {plan && (
                  isEditingPlan ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditForm(plan);
                          setIsEditingPlan(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handlePlanSave}>
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditForm(plan);
                        setIsEditingPlan(true);
                      }}
                    >
                      Edit details
                    </Button>
                  )
                )}
                <Button size="sm" variant="outline" onClick={onFinalize} disabled={!plan}>
                  Finalize from current zoning
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Versions</div>
                {versions.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    No versions yet. Use "Finalize from current zoning" to create the first version.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {versions.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className={`px-3 py-1 rounded-full text-xs border ${
                          v.id === selectedVersionId
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border"
                        }`}
                        onClick={() => setSelectedVersionId(v.id)}
                      >
                        v{v.version_number} {v.notes ? `- ${v.notes}` : ""}
                      </button>
                    ))}
                  </div>
                )}

                {activeVersion && (
                  <div className="text-xs text-muted-foreground">
                    Finalized at: {activeVersion.finalized_at || "n/a"} • Features: {" "}
                    {activeVersion.feature_count ?? 0}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="h-[480px]">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Plan map</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] p-0">
              {plan && activeVersion ? (
                activeVersion.feature_count > 0 ? (
                  <PlanVersionMap
                    planId={plan.id}
                    versionId={activeVersion.id}
                    localityId={plan.locality}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    <div className="text-center">
                      <p>No features in this version</p>
                      <p className="text-xs mt-1">
                        This version has 0 zones. Zones need to be approved before finalizing.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Select a version to view its map.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Plan documents</CardTitle>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Add document</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add plan document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Document type</Label>
                      <select
                        className="border rounded-md px-2 py-1 text-sm w-full"
                        value={uploadForm.document_type}
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            document_type: e.target.value,
                          }))
                        }
                      >
                        <option value="Plan Document">Plan Document</option>
                        <option value="Shapefile">Shapefile</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={uploadForm.title}
                        onChange={(e) =>
                          setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="Document title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Description (optional)</Label>
                      <Textarea
                        rows={2}
                        value={uploadForm.description}
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">File</Label>
                      <Input
                        type="file"
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            file: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Thumbnail (optional)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            thumbnail: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsUploadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleDocumentUpload();
                          setIsUploadDialogOpen(false);
                        }}
                        disabled={!uploadForm.file || !plan}
                      >
                        Save document
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Existing documents</div>
                {documents.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    No documents uploaded for this plan yet.
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium bg-muted">
                      <div className="col-span-4">Title</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-2">Uploaded</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center border-t"
                      >
                        <div className="col-span-4 truncate" title={doc.title}>
                          {doc.title}
                        </div>
                        <div className="col-span-2">{doc.document_type}</div>
                        <div className="col-span-2">
                          {formatFileSize(doc.file_size)}
                        </div>
                        <div className="col-span-2">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 text-xs"
                            onClick={() => handleDocumentOpenOrDownload(doc)}
                            title="Open / download"
                          >
                            ↗
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 text-xs"
                            onClick={() => handleDocumentDownload(doc)}
                            title="Download"
                          >
                            ⬇
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 text-xs"
                            onClick={() => openEditDocumentDialog(doc)}
                            title="Edit document"
                          >
                            ✎
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 text-xs text-red-600"
                            onClick={() => handleDocumentDelete(doc.id)}
                            title="Delete"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Dialog open={isEditDocDialogOpen} onOpenChange={setIsEditDocDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit plan document</DialogTitle>
              </DialogHeader>
              {selectedDoc && (
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Document type</Label>
                    <select
                      className="border rounded-md px-2 py-1 text-sm w-full"
                      value={editDocForm.document_type}
                      onChange={(e) =>
                        setEditDocForm((prev) => ({
                          ...prev,
                          document_type: e.target.value,
                        }))
                      }
                    >
                      <option value="Plan Document">Plan Document</option>
                      <option value="Shapefile">Shapefile</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={editDocForm.title}
                      onChange={(e) =>
                        setEditDocForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Document title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Description (optional)</Label>
                    <Textarea
                      rows={2}
                      value={editDocForm.description}
                      onChange={(e) =>
                        setEditDocForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Replace file (optional)</Label>
                    <Input
                      type="file"
                      onChange={(e) =>
                        setEditDocForm((prev) => ({
                          ...prev,
                          file: e.target.files?.[0] ?? null,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Replace thumbnail (optional)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditDocForm((prev) => ({
                          ...prev,
                          thumbnail: e.target.files?.[0] ?? null,
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditDocDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDocumentUpdate}
                      disabled={!editDocForm.title}
                    >
                      Save changes
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
