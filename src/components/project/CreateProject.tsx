import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';
import { useFunders, useLocalities, useCreateProject } from '@/queries/useProjectQuery';
import { FormFieldInput } from '@/components/FormFieldInput';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreateProjectDataI, LocalityI, SelectedLocality } from '@/types/projects';
import { LOCALITY_LEVEL_NAMES, LOCALITY_LEVELS } from '@/types/constants';
import { useUserOrganization } from '@/hooks/use-user-organization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  moduleLevel: string;
  afterCreateRedirectPath: string;
}

export default function CreateProject({ moduleLevel, afterCreateRedirectPath = '/land-uses' }: Props) {
  const userOrganization = useUserOrganization();

  const [formData, setFormData] = useState<CreateProjectDataI>({
    name: '',
    organization: userOrganization || '',
    description: '',
    module_level: '',
    registration_date: new Date().toISOString().split('T')[0],
    authorization_date: '',
    budget: '',
    funder_ids: [],
    locality_ids: [],
  });

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
  const createProjectMutation = useCreateProject();

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

    if (moduleLevel >= LOCALITY_LEVELS.REGION) {
      const region = localities?.find(l =>
        l.level === LOCALITY_LEVELS.REGION &&
        (l.id === locality.id || isAncestor(l.id, locality.id))
      );
      if (region) pathParts.push(region.name);
    }

    if (moduleLevel >= LOCALITY_LEVELS.DISTRICT && locality.level !== LOCALITY_LEVELS.REGION) {
      const district = localities?.find(l =>
        l.level === LOCALITY_LEVELS.DISTRICT &&
        (l.id === locality.id || isAncestor(l.id, locality.id))
      );
      if (district) pathParts.push(district.name);
    }

    if (moduleLevel >= LOCALITY_LEVELS.WARD && locality.level !== LOCALITY_LEVELS.REGION && locality.level !== LOCALITY_LEVELS.DISTRICT) {
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

  const handleFunderSelect = (funderIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      funder_ids: funderIds,
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
      localities: [...prev.locality_ids, locality.id]
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
      localities: prev.locality_ids.filter(id => id !== localityId)
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

      await createProjectMutation.mutateAsync(payload);
      window.location.href = afterCreateRedirectPath;
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  if (loadingFunders || loadingLocalities) {
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
          {/* {moduleLevel >= LOCALITY_LEVELS.ZONAL && (
            <div>
              <Label htmlFor='select-zone'>Select Zone</Label>
              <Select
                name={'select-zone'}
                value={currentSelection.zonal}
                onValueChange={(value) => handleSelectionChange('zonal', value)}
              >
                <SelectTrigger id='select-zone' className='w-full'>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='test'>Test</SelectItem>
                  {getLocalitiesByLevel(LOCALITY_LEVELS.ZONAL).map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )} */}

          {moduleLevel >= LOCALITY_LEVELS.REGION &&
            <div>
              <Label htmlFor='select-region'>Select Region</Label>
              <Select
                name={'select-region'}
                value={currentSelection.region}
                onValueChange={(value) => handleSelectionChange('region', value)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='test'>Test</SelectItem>
                  {getLocalitiesByLevel(LOCALITY_LEVELS.REGION).map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }

          {moduleLevel >= LOCALITY_LEVELS.DISTRICT && currentSelection.region && (
            <div>
              <Label htmlFor='select-district'>Select District</Label>
              <Select
                name={'select-district'}
                value={currentSelection.district}
                onValueChange={(value) => handleSelectionChange('district', value)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='test'>Test</SelectItem>
                  {getLocalitiesByLevel(LOCALITY_LEVELS.DISTRICT).map(district => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {moduleLevel >= LOCALITY_LEVELS.WARD && currentSelection.district && (
            <div>
              <Label htmlFor='select-ward'>Select Ward</Label>
              <Select
                name={'select-ward'}
                value={currentSelection.ward}
                onValueChange={(value) => handleSelectionChange('ward', value)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='test'>Test</SelectItem>
                  {getLocalitiesByLevel(LOCALITY_LEVELS.WARD).map(ward => (
                    <SelectItem key={ward.id} value={ward.id}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              // (moduleLevel === LOCALITY_LEVELS.VILLAGE && !currentSelection.village)
            }
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {LOCALITY_LEVEL_NAMES[moduleLevel as keyof typeof LOCALITY_LEVEL_NAMES]}
          </Button>
        </div>

        {selectedLocalities.length > 0 && (
          <div className="space-y-2">
            <Label>Selected {LOCALITY_LEVEL_NAMES[moduleLevel as keyof typeof LOCALITY_LEVEL_NAMES]}s ({selectedLocalities.length})</Label>
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
      {/* <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 font-medium">
          This project will be added to your organization: <span className="font-bold">{userOrganization || 'Loading...'}</span>
        </p>
        <p className="text-blue-600 text-sm mt-1">
          The organization is automatically set based on your logged-in account.
        </p>
      </div> */}

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
            <div className="grid md:grid-cols-2 gap-4">
              <FormFieldInput
                type="number"
                id="budget"
                label="Project Budget (TZS)"
                value={formData.budget}
                onChange={(val) => handleInputChange('budget', val)}
                required
              />

              <FormFieldInput
                type="select"
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
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => (window.location.href = afterCreateRedirectPath)}
            disabled={createProjectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid() || createProjectMutation.isPending}
          >
            {createProjectMutation.isPending ? 'Creating Project...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}