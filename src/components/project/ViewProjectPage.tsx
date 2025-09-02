import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { usePageStore } from '@/store/pageStore';
import { useProjectsQuery } from '@/queries/useProjectQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, MapPin, Calendar, Building, DollarSign, FileText, Users, Check } from 'lucide-react';
import { ProjectI } from '@/types/projects';
import { DataTable } from '@/components/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { LocalityTableColumns, ProjectStatusBadge } from '@/components/project/ProjectDataTableColumns';
import { ProjectApprovalStatus, ProjectStatus } from '@/types/constants';
import { cn } from '@/lib/utils';
import { canApproveProject, canEditProject } from './permissions';

export default function ViewProjectPage({ moduleLevel }: { moduleLevel: string; }) {
  const { project_id } = useParams<{ project_id: string }>();
  const { setPage } = usePageStore();
  const navigate = useNavigate();

  const { data: projectData, isLoading } = useProjectsQuery({ project_id });
  const project = projectData?.results as ProjectI | undefined;

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
              <CardTitle className="text-lg lg:text-xl 2xl:text-2xl font-bold text-foreground">{project.name}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span className="text-sm lg:text-base">{project.organization}</span>
              </div>
            </div>
            <div className="flex flex-col-reverse items-end gap-4">
              <ButtonsComponent moduleLevel={moduleLevel} project_id={project_id!} approval_status={project.approval_status} />
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

      <CoverageAreasCard project={project} navigate={navigate} />
    </div>
  );
}

const ButtonsComponent: React.FC<{ moduleLevel: string, project_id: string, approval_status: number }> = ({ moduleLevel, project_id, approval_status }) => {
  return (
    <div className='flex gap-2 flex-col md:flex-row items-end'>
      {canEditProject(approval_status) ? (
        <>
          <Link to={`/land-uses/${moduleLevel}/${project_id}/edit`} className={cn(buttonVariants({ size: 'sm' }), "gap-2 w-fit")}>
            <Edit className="h-4 w-4 hidden md:inline-block" />
            Edit Project
          </Link>
        </>
      ) : null}
      {canApproveProject(approval_status) ? (
        <>
          <Link to={`/land-uses/${moduleLevel}/${project_id}/approve`} className={cn(buttonVariants({ size: 'sm' }), "gap-2 w-fit bg-green-700 dark:bg-green-900 hover:bg-green-700/90 dark:hover:bg-green-900/90")}>
            <Check className="h-4 w-4 hidden md:inline-block" />
            Approve Project
          </Link>
        </>
      ) : null}
    </div>
  )
}

const CoverageAreasCard: React.FC<{ project: ProjectI; navigate: (path: string) => void; }> = ({
  project,
  navigate,
}) => (
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
);