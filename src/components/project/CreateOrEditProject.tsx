import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, DollarSign, FileText, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useFunders, useCreateProject, queryProjectKey, useUpdateProject, useProjectQuery } from '@/queries/useProjectQuery';
import { FormFieldInput } from '@/components/FormFieldInput';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreateProjectDataI, LocalityI, ProjectFunderI, ProjectI } from '@/types/projects';
import { LOCALITY_LEVEL_NAMES, LOCALITY_LEVELS, MODULE_LEVEL_SLUG, tanzaniaLocalityKey } from '@/types/constants';
import { useNavigate } from 'react-router';
import { canCreateProject, canEditProject } from './permissions';
import { useAuth } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { useLocalitiesQuery } from '@/queries/useLocalityQuery';

interface Props {
  moduleLevel: string;
  redirectPath: string;
  projectId?: string;
}

interface FormProps {
  moduleLevel: string;
  redirectPath: string;
  funders: ProjectFunderI[] | undefined;
  localities: LocalityI[] | undefined;
  organizationId: string;
  project?: ProjectI;
}

export default function CreateOrEditProject(props: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: funders, isLoading: loadingFunders } = useFunders();
  const { data: localities, isLoading: loadingLocalities } = useLocalitiesQuery(tanzaniaLocalityKey);
  const { data: project, isLoading: isLoadingProject } = useProjectQuery(props?.projectId);


  const canCreate = () => {
    if (!user || !user?.role?.name) return false;
    return canCreateProject(user.role.name);
  };

  const canEdit = () => {
    if (!user || !user?.role?.name || !project) return false;
    return canEditProject(user?.role?.name, project.approval_status);
  };

  if (loadingFunders || loadingLocalities) {
    return (
      <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  if (!props.projectId && canCreate() && user?.organization?.id)
    return (
      <Forms
        {...props}
        funders={funders}
        localities={localities}
        organizationId={user.organization.id}
      />
    );

  if (isLoadingProject || !project) {
    return (
      <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  if (canEdit() && user?.organization?.id)
    return (
      <Forms
        {...props}
        funders={funders}
        localities={localities}
        organizationId={user.organization.id}
        project={project}
      />
    );

  navigate(props.redirectPath, { replace: true });
  return null;
}

function Forms({ moduleLevel, redirectPath = '/land-uses', localities, funders, project, organizationId }: FormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: mutateAsyncCreate, isPending: isPendingCreate } = useCreateProject();
  const { mutateAsync: mutateAsyncUpdate, isPending } = useUpdateProject();

  // Initialize form data with project data if editing, or empty values if creating
  const [formData, setFormData] = useState<CreateProjectDataI>({
    name: project?.name || '',
    organization: organizationId,
    description: project?.description || '',
    registration_date: project?.registration_date || '',
    authorization_date: project?.authorization_date || '',
    budget: project?.budget || '',
    module_level: '',
    funder_ids: project?.funders?.map(f => f.id.toString()) || [],
    locality_ids: project?.localities?.map(l => l.locality__id) || [],
  });

  const [isLocalityModalOpen, setIsLocalityModalOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedLocalities, setSelectedLocalities] = useState<LocalityI[]>([]);
  const [treeData, setTreeData] = useState<LocalityI[]>([]);

  const [pendingNodeId, setPendingNodeId] = useState<string | null>(null);
  const { data: childLocalities, isLoading: isLoadingChildren } = useLocalitiesQuery(pendingNodeId ? parseInt(pendingNodeId) : 0);

  // Initialize selected localities from project data if editing
  useEffect(() => {
    if (project?.localities && localities) {
      const projectLocalities = project.localities.map(pl => {
        const locality = localities.find(l => l.id == pl.locality__id);
        return locality ? locality : { id: pl.locality__id, name: pl.locality__name, level: pl.locality__level };
      }).filter(Boolean) as LocalityI[];
      setSelectedLocalities(projectLocalities);
    }
  }, [project, localities]);

  // Initialize tree data with regional level
  useEffect(() => {
    if (localities) {
      setTreeData(localities);
    }
  }, [localities]);

  useEffect(() => {
    if (pendingNodeId && childLocalities && childLocalities.length > 0) {
      setTreeData(prev => [...prev, ...childLocalities]);
      setPendingNodeId(null);
    }
  }, [childLocalities, pendingNodeId]);

  // Toggle expansion of a node
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);

    if (newExpanded.has(nodeId)) {
      // Collapse
      newExpanded.delete(nodeId);
      setExpandedNodes(newExpanded);
    } else {
      // Expand
      newExpanded.add(nodeId);
      setExpandedNodes(newExpanded);

      const alreadyLoaded = treeData.some(item => item.parent === nodeId);

      if (!alreadyLoaded) {
        setPendingNodeId(nodeId);
      }
    }
  };

  // Handle selection of a locality
  const handleLocalitySelect = (locality: LocalityI) => {
    setSelectedLocalities(prev => {
      const isSelected = prev.some(l => l.id == locality.id);
      if (isSelected) {
        return prev.filter(l => l.id !== locality.id);
      } else {
        return [...prev, locality];
      }
    });
  };

  // Check if a locality is selected
  const isLocalitySelected = (localityId: string) => {
    return selectedLocalities.some(l => l.id == localityId);
  };

  // Check if a locality has children (based on level)
  const hasChildren = (locality: LocalityI) => {
    const level = parseInt(locality.level || '0');
    const targetLevel = parseInt(getTargetLevel());

    // If this locality's level is less than the target level, it might have children
    return level < targetLevel;
  };

  // Get children of a locality from treeData
  const getChildren = (parentId: string) => {
    return treeData.filter(item => item.parent == parentId);
  };

  // Render tree node recursively
  // TODO: Get level from API 
  const renderTreeNode = (node: LocalityI, depth = 0) => {
    const children = getChildren(node.id);
    const isExpanded = expandedNodes.has(node.id);
    const isSelectable = parseInt(node.level || '0') == parseInt(getTargetLevel());
    const nodeHasChildren = hasChildren(node);
    const isLoading = pendingNodeId === node.id && isLoadingChildren;

    return (
      <div key={node.id} className="">
        <div className="flex items-center py-1">
          {nodeHasChildren ? (
            <Button
              type='button'
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-1"
              onClick={() => toggleNode(node.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 mr-1" />
          )}

          {isSelectable ? (
            <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                id={`checkbox-${node.id}`}
                checked={isLocalitySelected(node.id)}
                onCheckedChange={() => handleLocalitySelect(node)}
                disabled={isLoading}
              />
              <Label htmlFor={`checkbox-${node.id}`} className="text-sm font-normal cursor-pointer">
                {node.name}
              </Label>
            </div>
          ) : (
            <div
              className="flex-1 py-1 text-sm font-medium cursor-pointer"
              onClick={() => nodeHasChildren && !isLoading && toggleNode(node.id)}
            >
              {node.name}
            </div>
          )}
        </div>

        {isExpanded && children.length > 0 && (
          <div className="border-l ml-3 pl-2">
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Remove a selected locality
  const removeSelectedLocality = (localityId: string) => {
    setSelectedLocalities(prev => prev.filter(l => l.id !== localityId));
  };

  // Get the target level that should be saved as locality_ids
  const getTargetLevel = (): string => {
    switch (moduleLevel) {
      case LOCALITY_LEVELS.REGION:
        return LOCALITY_LEVELS.REGION;
      case LOCALITY_LEVELS.DISTRICT:
        return LOCALITY_LEVELS.DISTRICT;
      case LOCALITY_LEVELS.WARD:
        return LOCALITY_LEVELS.WARD;
      case LOCALITY_LEVELS.VILLAGE:
        return LOCALITY_LEVELS.VILLAGE;
      default:
        return LOCALITY_LEVELS.NATIONAL;
    }
  };

  const handleInputChange = (key: keyof CreateProjectDataI, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFunderSelect = (funderIds: (string | number)[]) => {
    setFormData(prev => ({
      ...prev,
      funder_ids: funderIds as string[],
    }));
  };

  const isFormValid = (): boolean => {
    const { name, description, registration_date, authorization_date, budget, funder_ids } = formData;

    const basicFieldsValid = !!(name && description && registration_date && authorization_date && budget && funder_ids.length > 0);

    if (!basicFieldsValid) return false;

    // For national level, no localities needed
    if (moduleLevel == LOCALITY_LEVELS.NATIONAL) return true;

    // For other levels, at least one locality must be selected
    return selectedLocalities.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const moduleLevelSlug = MODULE_LEVEL_SLUG[moduleLevel as keyof typeof MODULE_LEVEL_SLUG]
        ?.toLowerCase();

      const payload: CreateProjectDataI = {
        name: formData.name,
        organization: formData.organization,
        description: formData.description,
        registration_date: formData.registration_date,
        authorization_date: formData.authorization_date,
        budget: formData.budget,
        module_level: moduleLevelSlug || '',
        funder_ids: formData.funder_ids,
        locality_ids:
          moduleLevel == LOCALITY_LEVELS.NATIONAL
            ? [`${tanzaniaLocalityKey}`]
            : selectedLocalities.map(locality => locality.id),
      };

      if (!project) {
        await mutateAsyncCreate(payload);
      } else {
        await mutateAsyncUpdate({ id: project.id, data: payload }).then(() =>
          queryClient.invalidateQueries({
            refetchType: "active",
            queryKey: [queryProjectKey],
          }),
        );
      }
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const renderLocalitySelection = () => {
    if (moduleLevel == LOCALITY_LEVELS.NATIONAL) {
      return (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/50 dark:border-blue-800">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-100" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">National Coverage</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">This project will cover the entire nation of Tanzania.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Dialog open={isLocalityModalOpen} onOpenChange={setIsLocalityModalOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Select Localities
            </Button>
          </DialogTrigger>

          <DialogContent aria-describedby='SetlocalityDialog' className="w-full transition-all sm:max-w-[95vw] lg:max-w-3xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Localities</DialogTitle>
            </DialogHeader>

            <div className="flex flex-1 gap-2 md:gap-4 lg:gap-6 overflow-hidden">
              {/* Left panel - Tree view */}
              <div className="w-1/2 border rounded-md p-2 md:p-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }} >
                <h3 className="font-medium mb-2 md:mb-4">Localities List</h3>
                {/* Get Regions of Tanzania initially */}
                {treeData.filter((item) => item.parent == `${tanzaniaLocalityKey}`).map((node) => renderTreeNode(node))}
              </div>

              {/* Right panel - Selected localities */}
              <div className="w-1/2 border rounded-md p-2 md:p-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }} >
                <h3 className="font-medium mb-2 md:mb-4">Selected Localities</h3>
                {selectedLocalities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No localities selected yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedLocalities.map((locality) => (
                      <div
                        key={locality.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <span className="text-sm">{locality.name}</span>
                        <Button
                          type='button'
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeSelectedLocality(locality.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    locality_ids: selectedLocalities.map((locality) => locality.id),
                  }));
                  setIsLocalityModalOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Display selected localities outside the modal */}
        {selectedLocalities.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Selected Localities:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedLocalities.map(locality => (
                <Badge key={locality.id} variant="secondary" className="px-3 py-1">
                  {locality.name}
                  <Button
                    type='button'
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeSelectedLocality(locality.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldInput
              type="text"
              id="name"
              label="Project Name"
              value={formData.name}
              onChange={(val) => handleInputChange('name', val)}
              required
              placeholder="Enter project name"
            />
            <FormFieldInput
              type="textarea"
              id="description"
              label="Description"
              value={formData.description}
              onChange={(val) => handleInputChange('description', val)}
              required
              placeholder="Describe the project"
            />
          </CardContent>
        </Card>

        {/* Timeline Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <FormFieldInput
                type="date"
                id="registration_date"
                label="Registration Date"
                value={formData.registration_date}
                onChange={(val) => handleInputChange('registration_date', val)}
                required
              />
              <FormFieldInput
                type="date"
                id="authorization_date"
                label="Authorization Date"
                value={formData.authorization_date}
                onChange={(val) => handleInputChange('authorization_date', val)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget & Funders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget & Funding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 transition-all">
            <div className="grid md:grid-cols-2 gap-4">
              <FormFieldInput
                type="number"
                id="budget"
                label="Project Budget (TZS)"
                value={formData.budget}
                onChange={(val) => handleInputChange('budget', val)}
                required
                placeholder="Enter budget amount"
              />

              <FormFieldInput
                type="multiselect"
                id="funder-select"
                label="Funder"
                value=""
                options={funders?.map(funder => ({
                  value: funder.id.toString(),
                  label: funder.name
                })) || []}
                onChange={() => { }}
                values={formData.funder_ids}
                onValuesChange={handleFunderSelect}
                placeholder="Select funders"
              />
            </div>
          </CardContent>
        </Card>

        {/* Coverage Area Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Coverage Area ({LOCALITY_LEVEL_NAMES[moduleLevel as keyof typeof LOCALITY_LEVEL_NAMES]} Level)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderLocalitySelection()}
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 -mt-1 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(redirectPath, { replace: true })}
            disabled={isPending || isPendingCreate}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid() || isPending || isPendingCreate}
          >
            {project ? (isPending || isPendingCreate ? 'Updating Project...' : 'Update Project') : (isPending || isPendingCreate ? 'Creating Project...' : 'Create Project')}
          </Button>
        </div>
      </form>
    </div>
  );
}