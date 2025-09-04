import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { usePageStore } from '@/store/pageStore';
import { queryProjectKey, useDeleteProject, useProjectQuery } from '@/queries/useProjectQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, MapPin, Calendar, Building, DollarSign, FileText, Users, Check, Trash2, Loader2 } from 'lucide-react';
import { ProjectI } from '@/types/projects';
import { DataTable } from '@/components/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { LocalityTableColumns, ProjectStatusBadge } from '@/components/project/ProjectDataTableColumns';
import { ProjectApprovalStatus, ProjectStatus } from '@/types/constants';
import { cn } from '@/lib/utils';
import { canApproveProject, canDeleteProject, canEditProject } from './permissions';
import { useAuth } from '@/store/auth';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

export default function ViewProjectPage({ moduleLevel }: { moduleLevel: string; }) {
  const { project_id } = useParams<{ project_id: string }>();
  const { setPage } = usePageStore();

  const { data: project, isLoading } = useProjectQuery(project_id);

  useEffect(() => {
    if (project) {
      setPage({
        module: 'land-uses',
        title: project.name,
      });
    }
  }, [project, setPage]);

  if (isLoading)
    return (
      <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    )

  if (!project) return <div className="text-center max-w-6xl mx-auto p-6">Project not found</div>;

  const projectStatus = ProjectStatus[project.project_status] || 'Unknown';
  const approvalStatus = ProjectApprovalStatus[project.approval_status] || 'Unknown';

  return (
    <div className="max-w-6xl mx-auto space-y-6 mb-6">
      {/* Main Project Card */}
      <Card className="overflow-hidden pt-0 md:pt-0 shadow-none">
        <CardHeader className="border-b pt-5 md:pt-6 [.border-b]:pb-4 md:[.border-b]:pb-4 bg-accent dark:bg-input/30">
          <div className="flex items-start gap-2 justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg lg:text-xl 2xl:text-2xl font-bold text-foreground/80">{project.name}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span className="text-sm lg:text-base">{project.organization}</span>
              </div>
            </div>
            <div className="flex flex-col-reverse items-end gap-4">
              <ButtonsComponent moduleLevel={moduleLevel} project={project} approval_status={project.approval_status} />
              <div className='flex flex-col md:flex-row-reverse items-end lg:items-start gap-2'>
                <ProjectStatusBadge status={approvalStatus} />
                <ProjectStatusBadge status={projectStatus} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Description */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            </div>
            <p className="text-foreground leading-relaxed">{project.description}</p>
          </div>

          <Separator className="mb-4" />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Type */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Project Type</h3>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {project.type}
              </Badge>
            </div>

            {/* Registration Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Registration Date</h3>
              </div>
              <p className="text-foreground">
                {new Date(project.registration_date).toLocaleDateString('en-UK')}
              </p>
            </div>

            {/* Authorization Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Authorization Date</h3>
              </div>
              <p className="text-foreground">
                {new Date(project.authorization_date).toLocaleDateString('en-UK')}
              </p>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
              </div>
              <p className="text-lg font-semibold text-foreground">
                TZS {Number(project.budget).toLocaleString('en-UK')}
              </p>
            </div>

            {/* Funders */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Funders</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.funders && project.funders.length > 0 ? (
                  project.funders.map(funder => (
                    <Badge key={funder.id} variant="secondary" className="px-3 py-1">
                      {funder.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground italic">No funders assigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          {project.remarks && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
                <p className="text-foreground dark:text-muted-foreground bg-muted dark:bg-accent/40 p-3 rounded-md">
                  {project.remarks}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CoverageAreasCard project={project} />
    </div>
  );
}

const ButtonsComponent: React.FC<{ moduleLevel: string, project: ProjectI, approval_status: number }> = ({ moduleLevel, project, approval_status }) => {
  const { user } = useAuth()
  const { mutateAsync: mutateAsyncDelete, isPending: isPendingDelete } = useDeleteProject();
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const { mutateAsync, isPending } = useMutation({
    // TODO : add appove project url
    mutationFn: (e: { remarks: string | null }) => api.post(``, e),
    onSuccess: () =>
      queryClient.invalidateQueries({
        refetchType: "active",
        queryKey: [queryProjectKey],
      }),
    onError: (e) => {
      console.log(e);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (!user || !user?.role?.name) return
      if (!canApproveProject(user.role.name, approval_status)) return

      const formData = new FormData(e.currentTarget);
      const remarks = formData.get("remarks") as string;

      toast.promise(mutateAsync({ remarks: remarks.length > 0 ? remarks : null }), {
        loading: "Approving...",
        success: () => {
          setOpen(false)
          return `Project approved successfully`
        },
        error: (err: AxiosError | any) => `${err?.message || err?.response?.data?.message || "Failed to approve project!"}`
      });
    } catch (err: any) {
      console.log(err)
    }
  }

  const handleDelete = () => {
    try {
      if (!user || !user?.role?.name) return
      if (!canDeleteProject(user.role.name, approval_status)) return

      toast.promise(mutateAsyncDelete(project.id), {
        loading: "Deleting project...",
        success: () => {
          setOpen(false)
          navigate(`/land-uses/${moduleLevel}`, { replace: true })
          return `Project deleted successfully`
        },
        error: (err: AxiosError | any) => `${err?.message || err?.response?.data?.message || "Failed to delete project!"}`
      });
    } catch (err: any) {
      console.log(err)
    }
  }

  if (!user || !user?.role?.name) return
  return (
    <div className='flex gap-2 flex-col md:flex-row items-end'>
      {canDeleteProject(user.role.name, approval_status) ?
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogTrigger asChild>
            <Button
              type='button'
              variant="outline"
              size='sm'
              className="gap-2 w-fit border-destructive dark:border-destructive text-destructive dark:text-destructive"
            >
              <Trash2 className="h-4 w-4 hidden md:inline-block text-destructive dark:text-destructive" />
              Delete Poject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this Project {project.id !== undefined ? ` (ID: ${String(project.id)})` : ""}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPendingDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isPendingDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isPendingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        : null}
      {canEditProject(user.role.name, approval_status) ?
        <Link to={`/land-uses/${moduleLevel}/${project.id}/edit`} className={cn(buttonVariants({ size: 'sm' }), "gap-2 w-fit")}>
          <Edit className="h-4 w-4 hidden md:inline-block" />
          Edit Project
        </Link>
        : null}
      {canApproveProject(user.role.name, approval_status) ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type='button'
              size='sm'
              className="gap-2 w-fit bg-green-700 dark:bg-green-900 hover:bg-green-700/90 dark:hover:bg-green-900/90"
            >
              <Check className="h-4 w-4 hidden md:inline-block" />
              Approve Project
            </Button>
          </DialogTrigger>
          <DialogContent >
            <form onSubmit={handleSubmit} className='space-y-4'>
              <DialogHeader className='border-b pb-4'>
                <DialogTitle>Approve Project</DialogTitle>
                <DialogDescription>
                  {project.name}
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label htmlFor="name-1">Remarks</Label>
                <Textarea id="name-1" name="remarks" placeholder='Enter remarks or description here' />
              </div>
              <DialogFooter className='flex-row justify-end'>
                <DialogClose asChild>
                  <Button type='button' variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending}
                  className='bg-green-700 hover:opacity-90 hover:bg-green-800 dark:bg-green-900'
                >
                  <Check />
                  Approve
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}

const CoverageAreasCard: React.FC<{ project: ProjectI }> = ({ project }) => {
  const navigate = useNavigate()

  return (
    <Card className='shadow-none'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Coverage Areas ({project.localities?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {project.localities && project.localities.length > 0 ? (
          <DataTable
            columns={LocalityTableColumns}
            data={project.localities}
            enableGlobalFilter={true}
            searchPlaceholder="Search localities..."
            onRowClick={(locality) => navigate(`${locality.id}/workflow`)}
            showRowNumbers={true}
            shadowed={false}
            rowActions={(locality) => (
              <Button
                variant="outline"
                className="btn-sm mx-4"
                onClick={() => navigate(`${locality.id}/workflow`)}
              >
                Workflow
              </Button>
            )}
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">No localities assigned to this project</p>
        )}
      </CardContent>
    </Card>
  )
};