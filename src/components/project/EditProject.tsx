import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';
import { useFunders, useLocalities, useProjectsQuery, useUpdateProject } from '@/queries/useProjectQuery';
import { FormFieldInput } from '@/components/FormFieldInput';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreateProjectDataI, LocalityI, ProjectI } from '@/types/projects';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useUserOrganization } from '@/hooks/use-user-organization';

interface Props {
  projectId: string;
  moduleLevel: string;
  afterUpdateRedirectPath: string;
}

type SelectedLocality = {
  id: string;
  name: string;
  path: string;
};

const LEVEL_NAMES = {
  [LOCALITY_LEVELS.NATIONAL]: "National",
  [LOCALITY_LEVELS.ZONAL]: "Zonal",
  [LOCALITY_LEVELS.REGION]: "Regional",
  [LOCALITY_LEVELS.DISTRICT]: "District",
  [LOCALITY_LEVELS.WARD]: "Ward",
  [LOCALITY_LEVELS.VILLAGE]: "Village",
} as const;

export default function EditProject({ projectId, moduleLevel, afterUpdateRedirectPath = '/land-uses' }: Props) {
  const userOrganization = useUserOrganization();
  
  // Fetch project data
  const { data: projectData, isLoading: loadingProject } = useProjectsQuery({ project_id: projectId });
  const project = projectData?.results as ProjectI | undefined;

  const [formData, setFormData] = useState<CreateProjectDataI>({
    name: '',
    organization: userOrganization || '',
    description: '',
    module_level: moduleLevel,
    registration_date: new Date().toISOString().split('T')[0],
    authorization_date: '',
    budget: '',
    funder_ids: [],
    locality_ids: [],
  });

  // Update formData when project data is available
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        organization: project.organization || userOrganization || '',
        description: project.description || '',
        module_level: moduleLevel,
        registration_date: project.registration_date || new Date().toISOString().split('T')[0],
        authorization_date: project.authorization_date || '',
        budget: project.budget || '',
        funder_ids: project.funders?.map(f => f.id.toString()) || [],
        locality_ids: project.localities?.map(l => l.id) || [],
      });
      
      // Set selected localities
      if (project.localities && project.localities.length > 0) {
        const localitiesWithPath = project.localities.map(locality => ({
          id: locality.id,
          name: locality.name,
          path: buildLocalityPath(locality),
        }));
        setSelectedLocalities(localitiesWithPath);
      }
    }
  }, [project, userOrganization, moduleLevel]);

  // Update formData when userOrganization is available
  useEffect(() => {
    if (userOrganization) {
      setFormData(prev => ({
        ...prev,
        organization: userOrganization
      }));
    }
  }, [userOrganization]);

  // Locality selection state
  const [selectedLocalities, setSelectedLocalities] = useState<SelectedLocality[]>([]);
  const [currentSelection, setCurrentSelection] = useState({
    zonal: '',
    region: '',
    district: '',
    ward: '',
  });

  const { data: funders, isLoading: loadingFunders } = useFunders();
  const { data: localities, isLoading: loadingLocalities } = useLocalities();
  const updateProjectMutation = useUpdateProject();

  // Helper functions for locality filtering
  const getLocalitiesByLevel = (level: string) => 
    localities?.filter(l => l.level === level) || [];

  const getChildLocalities = (level: string, parentId: string) =>
    localities?.filter(l => l.level === level && l.parent === parentId) || [];

  const buildLocalityPath = (locality: LocalityI): string => {
    const pathParts: string[] = [];
    
    if (moduleLevel >= LOCALITY_LEVELS.ZONAL) {
      const zonal = localities?.find(l => 
        l.level === LOCALITY_LEVELS.ZONAL && 
        (l.id === locality.id || isAncestor(l.id, locality.id))
      );
      if (zonal) pathParts.push(zonal.name);
    }

    if (moduleLevel >= LOCALITY_LEVELS.REGION && locality.level !== LOCALITY_LEVELS.ZONAL) {
      const region = localities?.find(l => 
        l.level === LOCALITY_LEVELS.REGION && 
        (l.id === locality.id || isAncestor(l.id, locality.id))
      );
      if (region) pathParts.push(region.name);
    }

    if (moduleLevel >= LOCALITY_LEVELS.DISTRICT && locality.level !== LOCALITY_LEVELS.ZONAL && locality.level !== LOCALITY_LEVELS.REGION) {
      const district = localities?.find(l => 
        l.level === LOCALITY_LEVELS.DISTRICT && 
        (l.id === locality.id || isAncestor(l.id, locality.id))
      );
      if (district) pathParts.push(district.name);
    }

    if (moduleLevel >= LOCALITY_LEVELS.WARD && locality.level !== LOCALITY_LEVELS.ZONAL && locality.level !== LOCALITY_LEVELS.REGION && locality.level !== LOCALITY_LEVELS.DISTRICT) {
      const ward = localities?.find(l => 
        l.level === LOCALITY_LEVELS.WARD && 
        (l.id === locality.id || isAncestor(l.id, locality.id))
      );
      if (ward) pathParts.push(ward.name);
    }

    pathParts.push(locality.name);
    return pathParts.join(' → ');
  };

  const isAncestor = (ancestorId: string, descendantId: string): boolean => {
    let current = localities?.find(l => l.id === descendantId);
    while (current?.parent) {
      if (current.parent === ancestorId) return true;
      current = localities?.find(l => l.id === current?.parent);
    }
    return false;
  };

  // Handlers
  const handleInputChange = (key: keyof CreateProjectDataI, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFunderSelect = (funderId: string) => {
    setFormData(prev => ({
      ...prev,
      funder_ids: prev.funder_ids.includes(funderId) 
        ? prev.funder_ids.filter(f => f !== funderId)
        : [...prev.funder_ids, funderId]
    }));
  };

  const handleSelectionChange = (level: keyof typeof currentSelection, value: string) => {
    setCurrentSelection(prev => {
      const newSelection = { ...prev };
      
      // Reset child selections when parent changes
      if (level === 'zonal') {
        newSelection.region = '';
        newSelection.district = '';
        newSelection.ward = '';
      } else if (level === 'region') {
        newSelection.district = '';
        newSelection.ward = '';
      } else if (level === 'district') {
        newSelection.ward = '';
      }
      
      newSelection[level] = value;
      return newSelection;
    });
  };

  const addLocality = () => {
    let targetLevel = '';
    let targetId = '';

    // Determine the target level and ID based on moduleLevel
    switch (moduleLevel) {
      case LOCALITY_LEVELS.ZONAL:
        targetLevel = LOCALITY_LEVELS.ZONAL;
        targetId = currentSelection.zonal;
        break;
      case LOCALITY_LEVELS.REGION:
        targetLevel = LOCALITY_LEVELS.REGION;
        targetId = currentSelection.region;
        break;
      case LOCALITY_LEVELS.DISTRICT:
        targetLevel = LOCALITY_LEVELS.DISTRICT;
        targetId = currentSelection.district;
        break;
      case LOCALITY_LEVELS.WARD:
        targetLevel = LOCALITY_LEVELS.WARD;
        targetId = currentSelection.ward;
        break;
      case LOCALITY_LEVELS.VILLAGE:
        targetLevel = LOCALITY_LEVELS.VILLAGE;
        // For village, we need to get villages under the selected ward
        const availableVillages = getChildLocalities(LOCALITY_LEVELS.VILLAGE, currentSelection.ward);
        if (availableVillages.length > 0) {
          // TODO: Show info dialog here, no village found
          return;
        }
        break;
    }

    if (!targetId || selectedLocalities.find(loc => loc.id === targetId)) return;

    const locality = localities?.find(l => l.id === targetId && l.level === targetLevel);
    if (!locality) return;

    const newLocality: SelectedLocality = {
      id: locality.id,
      name: locality.name,
      path: buildLocalityPath(locality),
    };

    setSelectedLocalities(prev => [...prev, newLocality]);
    setFormData(prev => ({
      ...prev,
      locality_ids: [...prev.locality_ids, locality.id]
    }));

    // Reset selections
    setCurrentSelection({
      zonal: '',
      region: '',
      district: '',
      ward: '',
    });
  };

  const removeLocality = (localityId: string) => {
    setSelectedLocalities(prev => prev.filter(loc => loc.id !== localityId));
    setFormData(prev => ({
      ...prev,
      locality_ids: prev.locality_ids.filter(id => id !== localityId)
    }));
  };

  const isFormValid = (): boolean => {
    const { name, description, registration_date, authorization_date, budget, funder_ids } = formData;

    const basicFieldsValid = !!(name && description && registration_date && authorization_date && budget && funder_ids.length > 0);

    if (!basicFieldsValid) return false;
    
    // For national level, no localities needed
    if (moduleLevel === LOCALITY_LEVELS.NATIONAL) return true;
    
    // For other levels, at least one locality must be selected
    return formData.locality_ids.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: CreateProjectDataI = {
        name: formData.name,
        organization: formData.organization,
        description: formData.description,
        registration_date: formData.registration_date,
        authorization_date: formData.authorization_date,
        budget: formData.budget,
        module_level: moduleLevel,
        funder_ids: formData.funder_ids,
        locality_ids: moduleLevel === LOCALITY_LEVELS.NATIONAL ? [] : formData.locality_ids,
      };

      await updateProjectMutation.mutateAsync({ id: projectId, data: payload });
      window.location.href = afterUpdateRedirectPath;
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  if (loadingFunders || loadingLocalities || loadingProject) {
    return (
      <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  const renderLocalitySelection = () => {
    if (moduleLevel === LOCALITY_LEVELS.NATIONAL) {
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {moduleLevel >= LOCALITY_LEVELS.ZONAL && (
            <FormFieldInput
              type="select"
              id="zonal-select"
              label="Zone"
              value={currentSelection.zonal}
              options={getLocalitiesByLevel(LOCALITY_LEVELS.ZONAL).map(zone => ({
                value: zone.id,
                label: zone.name
              }))}
              onChange={(value) => handleSelectionChange('zonal', value)}
            />
          )}

          {moduleLevel >= LOCALITY_LEVELS.REGION && currentSelection.zonal && (
            <FormFieldInput
              type="select"
              id="region-select"
              label="Region"
              value={currentSelection.region}
              options={getChildLocalities(LOCALITY_LEVELS.REGION, currentSelection.zonal).map(region => ({
                value: region.id,
                label: region.name
              }))}
              onChange={(value) => handleSelectionChange('region', value)}
            />
          )}

          {moduleLevel >= LOCALITY_LEVELS.DISTRICT && currentSelection.region && (
            <FormFieldInput
              type="select"
              id="district-select"
              label="District"
              value={currentSelection.district}
              options={getChildLocalities(LOCALITY_LEVELS.DISTRICT, currentSelection.region).map(district => ({
                value: district.id,
                label: district.name
              }))}
              onChange={(value) => handleSelectionChange('district', value)}
            />
          )}

          {moduleLevel >= LOCALITY_LEVELS.WARD && currentSelection.district && (
            <FormFieldInput
              type="select"
              id="ward-select"
              label="Ward"
              value={currentSelection.ward}
              options={getChildLocalities(LOCALITY_LEVELS.WARD, currentSelection.district).map(ward => ({
                value: ward.id,
                label: ward.name
              }))}
              onChange={(value) => handleSelectionChange('ward', value)}
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            type="button" 
            onClick={addLocality} 
            disabled={
              (moduleLevel === LOCALITY_LEVELS.ZONAL && !currentSelection.zonal) ||
              (moduleLevel === LOCALITY_LEVELS.REGION && !currentSelection.region) ||
              (moduleLevel === LOCALITY_LEVELS.DISTRICT && !currentSelection.district) ||
              (moduleLevel === LOCALITY_LEVELS.WARD && !currentSelection.ward)
            }
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {LEVEL_NAMES[moduleLevel as keyof typeof LEVEL_NAMES]}
          </Button>
        </div>

        {selectedLocalities.length > 0 && (
          <div className="space-y-2">
            <Label>Selected {LEVEL_NAMES[moduleLevel as keyof typeof LEVEL_NAMES]}s ({selectedLocalities.length})</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-gray-50">
              {selectedLocalities.map(locality => (
                <Badge key={locality.id} variant="secondary" className="gap-1">
                  <span className="text-xs">{locality.path}</span>
                  <button
                    type="button"
                    onClick={() => removeLocality(locality.id)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
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
            />
            <FormFieldInput 
              type="textarea" 
              id="description" 
              label="Description" 
              value={formData.description} 
              onChange={(val) => handleInputChange('description', val)} 
              required 
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
          <CardContent className="space-y-4">
            <FormFieldInput 
              type="number" 
              id="budget" 
              label="Project Budget (TZS)" 
              value={formData.budget} 
              onChange={(val) => handleInputChange('budget', val)} 
              required 
            />
            
            <div className="space-y-3">
              <FormFieldInput
                type="select"
                id="funder-select"
                label="Select Funder"
                value=""
                options={funders?.map(funder => ({
                  value: funder.id.toString(),
                  label: funder.name
                })) || []}
                onChange={handleFunderSelect}
              />

              {formData.funder_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-900 max-h-32 overflow-y-auto">
                  {formData.funder_ids.map(funderId => {
                    const funder = funders?.find(f => f.id.toString() === funderId);
                    return funder ? (
                      <Badge key={funderId} variant="secondary" className="gap-1">
                        {funder.name}
                        <button
                          type="button"
                          onClick={() => handleFunderSelect(funderId)}
                          className="ml-1 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coverage Area Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Coverage Area ({LEVEL_NAMES[moduleLevel as keyof typeof LEVEL_NAMES]} Level)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderLocalitySelection()}
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => (window.location.href = afterUpdateRedirectPath)} 
            disabled={updateProjectMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid() || updateProjectMutation.isPending}
          >
            {updateProjectMutation.isPending ? 'Updating Project...' : 'Update Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
