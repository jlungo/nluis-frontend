import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { usePageStore } from '@/store/pageStore';
import { useProjectsQuery } from '@/queries/useProjectQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, MapPin, Calendar, Building, DollarSign, FileText, Users } from 'lucide-react';
import { ProjectI } from '@/types/projects';
import { DataTable } from '@/components/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { LocalityTableColumns, ProjectStatusBadge } from '@/components/project/ProjectDataTableColumns';
import { ProjectApprovalStatus, ProjectStatus } from '@/types/constants';

interface ViewProjectPageProps {
  moduleLevel: string;
}

const ProjectDetailsGrid: React.FC<{ project: ProjectI }> = ({ project }) => (
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
);

const ProjectHeader: React.FC<{ 
  project: ProjectI; 
  moduleLevel: string;
  onBack: () => void;
  onEdit: () => void;
}> = ({ onBack, onEdit }) => {

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Button>
      
      <div className="flex gap-2">
        <Button onClick={onEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Project
        </Button>
      </div>
    </div>
  );
};

const ProjectCardHeader: React.FC<{ project: ProjectI }> = ({ project }) => {
  const projectStatus = ProjectStatus[project.project_status] || 'Unknown';
  const approvalStatus = ProjectApprovalStatus[project.approval_status] || 'Unknown';

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <CardTitle className="text-2xl font-bold text-foreground">{project.name}</CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building className="h-4 w-4" />
          <span className="text-lg">{project.organization}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <ProjectStatusBadge status={projectStatus} />
        <ProjectStatusBadge status={approvalStatus} />
      </div>
    </div>
  );
};

const CoverageAreasCard: React.FC<{ 
  project: ProjectI; 
  onLocalityClick: (locality: any) => void;
}> = ({ project, onLocalityClick }) => (
  <Card>
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
          onRowClick={onLocalityClick}
        />
      ) : (
        <p className="text-muted-foreground text-center py-8">No localities assigned to this project</p>
      )}
    </CardContent>
  </Card>
);

const LoadingState: React.FC = () => (
  <div className='flex flex-col items-center justify-center h-60'>
    <Spinner />
    <p className="text-muted-foreground mt-4">Loading...</p>
  </div>
);

const ErrorState: React.FC = () => (
  <div className="container text-center max-w-6xl mx-auto p-6">Project not found</div>
);

export default function ViewProjectPage({ moduleLevel }: ViewProjectPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPage } = usePageStore();

  const { data: projectData, isLoading } = useProjectsQuery({ id });
  const project = projectData?.results as ProjectI | undefined;

  useEffect(() => {
    if (project) {
      setPage({
        module: 'land-uses',
        title: project.name,
      });
    }
  }, [project, setPage]);

  const handleBack = () => navigate(`/land-uses/${moduleLevel}`);
  const handleEdit = () => navigate(`/land-uses/${moduleLevel}/${id}/edit`);
  const handleLocalityClick = (locality: any) => navigate(`/${locality.id}/workflow`);

  if (isLoading) return <LoadingState />;
  if (!project) return <ErrorState />;

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <ProjectHeader 
        project={project} 
        moduleLevel={moduleLevel}
        onBack={handleBack}
        onEdit={handleEdit}
      />

      {/* Main Project Card */}
      <Card className="overflow-hidden pt-0 md:pt-0">
        <CardHeader className="dark:bg-blue-950/50 pt-6 md:pt-6 border-b">
          <ProjectCardHeader project={project} />
        </CardHeader>
        
        <CardContent>
          {/* Description */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            </div>
            <p className="text-foreground leading-relaxed">{project.description}</p>
          </div>

          <Separator className="mb-6" />

          <ProjectDetailsGrid project={project} />

          {/* Remarks */}
          {project.remarks && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
                <p className="text-foreground bg-muted/30 p-3 rounded-md">
                  {project.remarks}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CoverageAreasCard 
        project={project} 
        onLocalityClick={handleLocalityClick}
      />
    </div>
  );
}