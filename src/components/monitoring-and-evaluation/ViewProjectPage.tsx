import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { usePageStore } from '@/store/pageStore';
import { useDeleteProject, useProjectQuery } from '@/queries/useProjectQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, MapPin, Calendar, Building, DollarSign, FileText, Users, Trash2, Loader2, IdCard } from 'lucide-react';
import { ProjectI } from '@/types/projects';
import { DataTable } from '@/components/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { LocalityColumns } from '@/components/project/locality-columns';
import { ProjectApprovalStatus } from '@/types/constants';
import { cn } from '@/lib/utils';
import { canApproveProject, canDeleteProject, canEditProject } from './permissions';
import { useAuth } from '@/store/auth';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { MapDialog } from '../zoning/MapDialog';
import ProjectLocalitiesApproval from './ProjectLocalitiesApproval';
import { Progress } from '../ui/progress';
import { approvalStatus, approvalStatusAtleastOne } from './utils';
import { ProjectStatusBadge } from './project-status-badge';

export default function ViewProjectPage({ moduleLevel }: { moduleLevel: string; }) {
  const { project_id } = useParams<{ project_id: string }>();
  const { setPage } = usePageStore();

  const { data: project, isLoading } = useProjectQuery(project_id);

  useEffect(() => {
    if (project)
      setPage({
        module: 'land-uses',
        title: project.name,
      });
  }, [project, setPage]);

  if (isLoading)
    return (
      <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    )

  if (!project) return <div className="text-center max-w-6xl mx-auto p-6">Project not found</div>;

  const approval_status = approvalStatus(project?.localities)

  const approval_status_atleast_one = approvalStatusAtleastOne(project?.localities)

  const progress =
    project?.localities && project.localities.length > 0
      ? project.localities.reduce((sum, locality) => sum + locality.progress, 0) /
      project.localities.length
      : 0;

  const approvalStatusName = ProjectApprovalStatus[approval_status] || 'Unknown';

  const renderProgress = () => (
    <div className='flex flex-col md:flex-row-reverse md:items-end lg:items-start gap-2'>
      <ProjectStatusBadge id={approval_status} status={approvalStatusName} />
      <div className="flex flex-row items-center gap-1 md:gap-1">
        <p className="text-xs md:text-sm w-fit shrink-0">{Number.isInteger(progress)
          ? progress
          : Math.floor(progress * 100) / 100}% Complete</p>
        <Progress value={progress} className="w-full min-w-32 max-min-w-44" />
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 mb-10">
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
              <div className='md:hidden'>
                {renderProgress()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-4">
              {/* <div className='flex flex-col md:flex-row-reverse items-end lg:items-start gap-2'>
                <ProjectStatusBadge id={approval_status} status={approvalStatusName} />
                <div className="flex flex-col md:flex-row-reverse md:items-center gap-1 md:gap-1">
                  <Progress value={progress} className="min-w-32 lg:min-w-44" />
                  <p className="text-xs md:text-sm ml-auto w-fit shrink-0">{progress}% Complete</p>
                </div>
              </div> */}
              <div className='hidden md:block'>
                {renderProgress()}
              </div>
              <ButtonsComponent
                moduleLevel={moduleLevel}
                project={project}
                approval_status={approval_status}
                approval_status_atleast_one={approval_status_atleast_one}
              />
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
            {project?.description ? <p className="text-foreground leading-relaxed">{project?.description}</p> : null}
          </div>

          <Separator className="mb-4" />

          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
            {/* Type */}
            {/* <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Project Type</h3>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {project.type}
              </Badge>
            </div> */}

            {/* Registration Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Reference Number/Id</h3>
              </div>
              <p className="text-foreground">
                {project.reference_number}
              </p>
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
              <p className="text-base md:text-lg font-semibold text-foreground">
                TZS {Number(project.budget).toLocaleString('en-UK')}
              </p>
            </div>

            {/* Funders */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Funders</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.funders && project.funders.length > 0
                  ? project.funders.map(funder => (
                    <Badge key={funder.id} variant="secondary" className="px-3 py-1">
                      {funder.name}
                    </Badge>
                  ))
                  : <span className="text-muted-foreground italic">No funders assigned</span>}
              </div>
            </div>
          </div>

          {/* Remarks */}
          {project.remarks && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
                <p className="text-foreground text-sm dark:text-muted-foreground bg-muted dark:bg-input/30 p-3 rounded-md">
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

const ButtonsComponent: React.FC<{ moduleLevel: string, project: ProjectI, approval_status: number, approval_status_atleast_one: number }> = ({ moduleLevel, project, approval_status, approval_status_atleast_one }) => {
  const { user } = useAuth()
  const { mutateAsync: mutateAsyncDelete, isPending: isPendingDelete } = useDeleteProject();
  const navigate = useNavigate()

  const [openDelete, setOpenDelete] = useState(false)

  const handleDelete = () => {
    try {
      if (!user || !user?.role?.name) return
      if (!canDeleteProject(user.role.name, approval_status_atleast_one)) return

      toast.promise(mutateAsyncDelete(project.id), {
        loading: "Deleting project...",
        success: () => {
          setOpenDelete(false)
          navigate(`/land-uses/${moduleLevel}`, { replace: true })
          return `Project deleted successfully`
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (err: AxiosError | any) => `${err?.message || err?.response?.data?.message || "Failed to delete project!"}`
      });
    } catch (err: unknown) {
      console.log(err)
    }
  }

  if (!user || !user?.role?.name) return
  return (
    <div className='flex gap-2 flex-col md:flex-row items-end'>
      {canDeleteProject(user.role.name, approval_status_atleast_one) ?
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

      {canEditProject(user.role.name, approval_status_atleast_one) ?
        <Link to={`/land-uses/${moduleLevel}/${project.id}/edit`} className={cn(buttonVariants({ size: 'sm' }), "gap-2 w-fit")}>
          <Edit className="h-4 w-4 hidden md:inline-block" />
          Edit Project
        </Link> : null}

      {canApproveProject(user.role.name, approval_status) ? <ProjectLocalitiesApproval project={project} isApproval /> : null}

      {canApproveProject(user.role.name, approval_status) ? <ProjectLocalitiesApproval project={project} isApproval={false} /> : null}
    </div>
  )
}

const CoverageAreasCard: React.FC<{ project: ProjectI }> = ({ project }) => {
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState<number | null>(null)

  const localities = project?.localities ? statusFilter
    ? project.localities.filter(loc => loc.approval_status === statusFilter)
    : project.localities : []

  return (
    <Card className='shadow-none pt-0 md:pt-0 overflow-hidden'>
      <CardHeader className="border-b pt-5 md:pt-6 [.border-b]:pb-4 md:[.border-b]:pb-4 bg-accent dark:bg-input/30">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Coverage Areas ({project?.localities?.length || 0})
          </div>
          {project.localities && project.localities.length > 0 && (
            <MapDialog
              title={project.name}
              overlayMapsIds={project?.localities.map((loc) => loc.locality__id)}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {project.localities && project.localities.length > 0 ?
          <DataTable
            columns={LocalityColumns}
            data={localities}
            enableGlobalFilter={true}
            searchPlaceholder="Search localities..."
            // onRowClick={approval_status === 2 ? (locality) => navigate(`${locality.id}/workflow`) : undefined}
            showRowNumbers={true}
            shadowed={false}
            rowActions={(locality) => (
              <Button
                type='button'
                size="sm"
                className={"disabled:opacity-10 mr-5 bg-primary/20 text-primary hover:bg-primary/30 dark:text-primary"}
                disabled={locality.approval_status !== 2}
                onClick={() => navigate(`${locality.id}/workflow`)}
              >
                Workflow
              </Button>
            )}
            rightToolbar={
              <div className='flex gap-0.5'>
                <Button
                  size='sm'
                  type='button'
                  onClick={() => setStatusFilter(null)}
                  className={`font-normal rounded-l-md rounded-r-xs w-12 ${statusFilter === null ? 'bg-primary' : 'bg-accent dark:bg-input/30 text-foreground hover:text-foreground/80 hover:bg-accent/80 dark:hover:bg-muted/80'}`}
                >
                  All
                </Button>
                {Object.entries(ProjectApprovalStatus).map(([k, l], index, arr) =>
                  <Button
                    key={k}
                    size='sm'
                    type='button'
                    onClick={() => setStatusFilter(Number(k))}
                    className={`font-normal
                      ${index === arr.length - 1
                        ? 'rounded-r-md rounded-l-xs'
                        : 'rounded-xs'}
                      ${statusFilter === Number(k) ? 'bg-primary' : 'bg-accent dark:bg-input/30 text-foreground hover:text-foreground/80 hover:bg-accent/80 dark:hover:bg-muted/80'}
                    `}
                  >
                    {l}
                  </Button>)
                }
              </div>
            }
          />
          : <p className="text-muted-foreground text-center py-8">No localities assigned to this project</p>}
      </CardContent>
    </Card>
  )
};