import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, DollarSign, FileText } from 'lucide-react';
import { useFunders, useCreateProject, queryProjectKey, useUpdateProject, useProjectQuery } from '@/queries/useProjectQuery';
import { FormFieldInput } from '@/components/FormFieldInput';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreateProjectDataI, LocalityI, ProjectFunderI, ProjectI } from '@/types/projects';
import { LOCALITY_LEVEL_NAMES, LOCALITY_LEVELS, MODULE_LEVEL_SLUG } from '@/types/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigate } from 'react-router';
import { canCreateProject, canEditProject } from './permissions';
import { useAuth } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalitiesQuery } from '@/queries/useLocalityQuery';

interface Props {
  moduleLevel: string;
  redirectPath: string;
  projectId?: string
}

interface FormProps {
  moduleLevel: string;
  redirectPath: string;
  funders: ProjectFunderI[] | undefined
  localities: LocalityI[] | undefined
  organizationId: string
  project?: ProjectI
}

export default function CreateOrEditProject(props: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: funders, isLoading: loadingFunders } = useFunders();
  const { data: localities, isLoading: loadingLocalities } = useLocalitiesQuery();
  const { data: project, isLoading: isLoadingProject } = useProjectQuery(props?.projectId);

  const canCreate = () => {
    if (!user || !user?.role?.name) return
    return canCreateProject(user.role.name)
  }

  const canEdit = () => {
    if (!user || !user?.role?.name || !project) return false
    return canEditProject(user?.role?.name, project.approval_status)
  }

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
    )

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
    )

  navigate(props.redirectPath, { replace: true })
  return null
}

function Forms({ moduleLevel, redirectPath = '/land-uses', localities, funders, project, organizationId }: FormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutateAsync: mutateAsyncCreate, isPending: isPendingCreate } = useCreateProject();
  const { mutateAsync: mutateAsyncUpdate, isPending } = useUpdateProject();

  // Locality selection state
  const [currentSelection, setCurrentSelection] = useState({
    regions: [] as string[],
    districts: [] as string[],
    wards: [] as string[],
    villages: [] as string[],
    selectedRegion: '',
    selectedDistrict: '',
    selectedWard: '',
  });

  const [formData, setFormData] = useState<CreateProjectDataI>({
    name: project ? project.name : '',
    organization: organizationId || '',
    description: project ? project.description || '' : '',
    module_level: project ? project.name : '',
    registration_date: project ? project.registration_date : new Date().toISOString().split('T')[0],
    authorization_date: project ? project.authorization_date : '',
    budget: project ? project.budget : '',
    funder_ids: project?.funders ? project.funders.map(funder => funder.id) : [],
    locality_ids: project?.localities ? project.localities.map(locality => locality.id) : [],
  });

  useEffect(() => {
    if (!project) return
    const targetLevel = getTargetLevel();

    if (targetLevel === LOCALITY_LEVELS.REGION) {
      setCurrentSelection(prev => ({
        ...prev,
        regions: project.localities ? project.localities.map(locality => locality.locality__id) : []
      }))
    } else if (targetLevel === LOCALITY_LEVELS.DISTRICT) {
      setCurrentSelection(prev => ({
        ...prev,
        districts: project.localities ? project.localities.map(locality => locality.locality__id) : []
      }))
    } else if (targetLevel === LOCALITY_LEVELS.WARD) {
      setCurrentSelection(prev => ({
        ...prev,
        wards: project.localities ? project.localities.map(locality => locality.locality__id) : []
      }))
    } else if (targetLevel === LOCALITY_LEVELS.VILLAGE) {
      setCurrentSelection(prev => ({
        ...prev,
        villages: project.localities ? project.localities.map(locality => locality.locality__id) : []
      }))
    }
  }, [])

  useEffect(() => {
    // Update locality_ids based on current selection
    const targetLevel = getTargetLevel();
    let selectedLocalityIds: string[] = [];

    if (targetLevel === LOCALITY_LEVELS.REGION) {
      selectedLocalityIds = currentSelection.regions;
    } else if (targetLevel === LOCALITY_LEVELS.DISTRICT) {
      selectedLocalityIds = currentSelection.districts;
    } else if (targetLevel === LOCALITY_LEVELS.WARD) {
      selectedLocalityIds = currentSelection.wards;
    } else if (targetLevel === LOCALITY_LEVELS.VILLAGE) {
      selectedLocalityIds = currentSelection.villages;
    }

    setFormData(prev => ({
      ...prev,
      locality_ids: selectedLocalityIds
    }));
  }, [currentSelection.regions, currentSelection.districts, currentSelection.wards, currentSelection.villages, moduleLevel]);

  // Helper functions for locality filtering
  const getLocalitiesByLevel = (level: string) => {
    return localities?.filter(l => l.level == level) || [];
  };

  const getChildLocalities = (level: string, parentId: string) =>
    localities?.filter(l => l.level == level && l.parent == parentId) || [];

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
        return '';
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

  // Handle single selection (for non-target levels)
  const handleSingleSelection = (level: 'selectedRegion' | 'selectedDistrict' | 'selectedWard', value: string) => {
    setCurrentSelection(prev => {
      const newSelection = { ...prev };

      // Reset child selections when parent changes
      if (level === 'selectedRegion') {
        newSelection.districts = [];
        newSelection.wards = [];
        newSelection.villages = [];
        newSelection.selectedDistrict = '';
        newSelection.selectedWard = '';
      } else if (level === 'selectedDistrict') {
        newSelection.wards = [];
        newSelection.villages = [];
        newSelection.selectedWard = '';
      } else if (level === 'selectedWard') {
        newSelection.villages = [];
      }

      newSelection[level] = value;
      return newSelection;
    });
  };

  // Update the handleMultiSelection function to properly handle multiselect
  const handleMultiSelection = (level: 'regions' | 'districts' | 'wards' | 'villages', values: (string | number)[]) => {
    setCurrentSelection(prev => ({
      ...prev,
      [level]: values
    }));
  };

  const isFormValid = (): boolean => {
    const { name, description, registration_date, authorization_date, budget, funder_ids } = formData;

    const basicFieldsValid = !!(name && description && registration_date && authorization_date && budget && funder_ids.length > 0);

    if (!basicFieldsValid) return false;

    // For national level, no localities needed
    if (moduleLevel == LOCALITY_LEVELS.NATIONAL) return true;

    // For other levels, at least one locality must be selected
    return formData.locality_ids.length > 0;
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
        module_level: moduleLevelSlug,
        funder_ids: formData.funder_ids,
        locality_ids:
          moduleLevel === LOCALITY_LEVELS.NATIONAL ? ["92"] : formData.locality_ids, // Locality ID of Tanzania is 92
      };

      if (!project) await mutateAsyncCreate(payload);
      else
        await mutateAsyncUpdate({ id: project.id, data: payload }).then(() =>
          queryClient.invalidateQueries({
            refetchType: "active",
            queryKey: [queryProjectKey],
          }),
        )
      navigate(redirectPath, { replace: true })
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

    const targetLevel = getTargetLevel();

    return (
      <div className="space-y-4">
        {/* Selection Controls */}
        <div className="border p-4 md:p-6 rounded-lg space-y-4">
          <h4 className="font-medium text-base text-gray-700 dark:text-gray-300">
            Select localities to add to your project
          </h4>

          <div className="grid gap-4">
            {/* Region Selection */}
            {moduleLevel >= LOCALITY_LEVELS.REGION && (
              <div className="space-y-2">
                {targetLevel === LOCALITY_LEVELS.REGION ? (
                  <FormFieldInput
                    type="multiselect"
                    id="regions-multi"
                    label="Select Regions"
                    values={currentSelection.regions} // Pass current values
                    options={getLocalitiesByLevel(LOCALITY_LEVELS.REGION).map(region => ({
                      value: region.id,
                      label: region.name
                    }))}
                    onChange={() => { }}
                    onValuesChange={(values) => handleMultiSelection('regions', values)}
                    placeholder="Select regions"
                  />
                ) : (
                  <div>
                    <Label htmlFor='select-region'>Select Region</Label>
                    <Select
                      value={currentSelection.selectedRegion}
                      onValueChange={(value: string) => handleSingleSelection('selectedRegion', value)}
                    >
                      <SelectTrigger id='select-region' className='w-full'>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {getLocalitiesByLevel(LOCALITY_LEVELS.REGION).map(region => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* District Selection */}
            {moduleLevel >= LOCALITY_LEVELS.DISTRICT && currentSelection.selectedRegion && (
              <div className="space-y-2">
                {targetLevel === LOCALITY_LEVELS.DISTRICT ? (
                  <FormFieldInput
                    type="multiselect"
                    id="districts-multi"
                    label="Select Districts"
                    values={currentSelection.districts}
                    options={getChildLocalities(LOCALITY_LEVELS.DISTRICT, currentSelection.selectedRegion).map(district => ({
                      value: district.id,
                      label: district.name
                    }))}
                    onChange={() => { }}
                    onValuesChange={(values) => handleMultiSelection('districts', values)}
                    placeholder="Select districts"
                  />
                ) : (
                  <div>
                    <Label htmlFor='select-district'>Select District</Label>
                    <Select
                      value={currentSelection.selectedDistrict}
                      onValueChange={(value: string) => handleSingleSelection('selectedDistrict', value)}
                    >
                      <SelectTrigger id='select-district' className='w-full'>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {getChildLocalities(LOCALITY_LEVELS.DISTRICT, currentSelection.selectedRegion).map(district => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Ward Selection */}
            {moduleLevel >= LOCALITY_LEVELS.WARD && currentSelection.selectedDistrict && (
              <div className="space-y-2">
                {targetLevel === LOCALITY_LEVELS.WARD ? (
                  <FormFieldInput
                    type="multiselect"
                    id="wards-multi"
                    label="Select Wards"
                    value=""
                    values={currentSelection.wards}
                    options={getChildLocalities(LOCALITY_LEVELS.WARD, currentSelection.selectedDistrict).map(ward => ({
                      value: ward.id,
                      label: ward.name
                    }))}
                    onChange={() => { }}
                    onValuesChange={(values) => handleMultiSelection('wards', values)}
                    placeholder="Select wards"
                  />
                ) : (
                  <div>
                    <Label htmlFor='select-ward'>Select Ward</Label>
                    <Select
                      value={currentSelection.selectedWard}
                      onValueChange={(value: string) => handleSingleSelection('selectedWard', value)}
                    >
                      <SelectTrigger id='select-ward' className='w-full'>
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {getChildLocalities(LOCALITY_LEVELS.WARD, currentSelection.selectedDistrict).map(ward => (
                          <SelectItem key={ward.id} value={ward.id}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Village Selection */}
            {moduleLevel >= LOCALITY_LEVELS.VILLAGE && currentSelection.selectedWard && (
              <div className="space-y-2">
                <FormFieldInput
                  type="multiselect"
                  id="villages-multi"
                  label="Select Villages"
                  values={currentSelection.villages}
                  options={getChildLocalities(LOCALITY_LEVELS.VILLAGE, currentSelection.selectedWard).map(village => ({
                    value: village.id,
                    label: village.name
                  }))}
                  onChange={() => { }}
                  onValuesChange={(values) => handleMultiSelection('villages', values)}
                  placeholder="Select villages"
                />
              </div>
            )}
          </div>
        </div>
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
                  value: funder.id,
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
            {project ? isPending || isPendingCreate ? 'Updating Project...' : 'Update Project' : isPending || isPendingCreate ? 'Creating Project...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}