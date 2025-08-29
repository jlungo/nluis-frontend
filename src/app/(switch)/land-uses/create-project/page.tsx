'use client';

import React, { useState, useEffect } from 'react';
import { usePageStore } from "@/store/pageStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useProjectTypes, useFunders, useLocalities, useCreateProject } from '@/queries/useProjectQuery';

interface LocationSelection {
  region: string;
  district: string;
  ward: string;
  village: string;
}

type FormData = {
  project_type: string;
  name: string;
  description: string;
  reg_date: string;
  auth_date: string;
  budget: string;
  funders: number[];
  locations: LocationSelection[];
};

export default function CreateProjectPage() {
  const { setPage } = usePageStore();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');

  // React Query hooks
  const { data: projectTypesData, isLoading: loadingProjectTypes } = useProjectTypes();
  const { data: funders, isLoading: loadingFunders } = useFunders();
  const { data: localitiesData, isLoading: loadingLocalities } = useLocalities();
  const createProjectMutation = useCreateProject();

  const projectTypes = projectTypesData?.results || [];
  const localities = localitiesData?.results || [];

  const [formData, setFormData] = useState<FormData>({
    project_type: '',
    name: '',
    description: '',
    reg_date: new Date().toISOString().split('T')[0],
    auth_date: '',
    budget: '',
    funders: [],
    locations: [{ region: '', district: '', ward: '', village: '' }]
  });

  const navigateBack = () => window.location.href = '/land-uses';

  // Update page title
  useEffect(() => {
    setPage({
      module: 'land-uses',
      title: 'Create New Project'
    });
  }, [setPage]);

  // Update selected level when project type changes
  useEffect(() => {
    if (selectedProjectType) {
      const projectType = projectTypes.find(pt => pt.id.toString() === selectedProjectType);
      if (projectType) {
        setSelectedLevel(projectType.level_id);

        // Reset locations if level is National
        if (projectType.level_id === 1) {
          setFormData(prev => ({
            ...prev,
            locations: [{ region: '', district: '', ward: '', village: '' }]
          }));
        }
      }
    }
  }, [selectedProjectType, projectTypes]);

  const handleInputChange = (key: keyof Omit<FormData, 'funders' | 'locations'>, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleProjectTypeChange = (value: string) => {
    setSelectedProjectType(value);
    setFormData(prev => ({ ...prev, project_type: value }));
  };

  const handleFunderChange = (funderId: number, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, funders: [...prev.funders, funderId] };
      } else {
        return { ...prev, funders: prev.funders.filter(id => id !== funderId) };
      }
    });
  };

  const handleLocationChange = (index: number, field: keyof LocationSelection, value: string) => {
    setFormData(prev => {
      const newLocations = [...prev.locations];
      newLocations[index] = { ...newLocations[index], [field]: value };

      // Reset dependent fields when a parent field changes
      if (field === 'region') {
        newLocations[index].district = '';
        newLocations[index].ward = '';
        newLocations[index].village = '';
      } else if (field === 'district') {
        newLocations[index].ward = '';
        newLocations[index].village = '';
      } else if (field === 'ward') {
        newLocations[index].village = '';
      }

      return { ...prev, locations: newLocations };
    });
  };

  const addLocationRow = () => {
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, { region: '', district: '', ward: '', village: '' }]
    }));
  };

  const removeLocationRow = (index: number) => {
    if (formData.locations.length > 1) {
      setFormData(prev => ({
        ...prev,
        locations: prev.locations.filter((_, i) => i !== index)
      }));
    }
  };

  const isFormValid = () => {
    // Basic validation
    if (!formData.name || !formData.description || !formData.reg_date ||
      !formData.auth_date || !formData.budget || !formData.project_type ||
      formData.funders.length === 0) {
      return false;
    }

    // Location validation based on level
    if (selectedLevel && selectedLevel > 1) {
      for (const location of formData.locations) {
        if (selectedLevel >= 2 && !location.region) return false;
        if (selectedLevel >= 3 && !location.district) return false;
        if (selectedLevel >= 4 && !location.ward) return false;
        if (selectedLevel >= 5 && !location.village) return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for API
      const submitData = {
        name: formData.name,
        description: formData.description,
        reg_date: formData.reg_date,
        auth_date: formData.auth_date,
        budget: parseFloat(formData.budget),
        project_type: parseInt(formData.project_type),
        funders: formData.funders,
        // For national level, set locations to empty
        localities: selectedLevel === 1 ? [] : formData.locations.map(loc => ({
          region: loc.region ? parseInt(loc.region) : null,
          district: loc.district ? parseInt(loc.district) : null,
          ward: loc.ward ? parseInt(loc.ward) : null,
          village: loc.village ? parseInt(loc.village) : null
        }))
      };

      // Use React Query mutation to create project
      await createProjectMutation.mutateAsync(submitData);

      navigateBack();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // Helper functions to filter localities
  const getRegions = () => localities.filter(l => l.level === 2);
  const getDistricts = (regionId: string) => localities.filter(l => l.level === 3 && l.parent === parseInt(regionId));
  const getWards = (districtId: string) => localities.filter(l => l.level === 4 && l.parent === parseInt(districtId));
  const getVillages = (wardId: string) => localities.filter(l => l.level === 5 && l.parent === parseInt(wardId));

  // Show loading states
  if (loadingProjectTypes || loadingFunders || loadingLocalities) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Project Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Project description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg_date">Registration Date *</Label>
                <Input
                  id="reg_date"
                  type="date"
                  value={formData.reg_date}
                  onChange={(e) => handleInputChange('reg_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="auth_date">Authorization Date *</Label>
                <Input
                  id="auth_date"
                  type="date"
                  value={formData.auth_date}
                  onChange={(e) => handleInputChange('auth_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_type">Project Type *</Label>
                <Select
                  value={formData.project_type}
                  onValueChange={handleProjectTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map(type => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">Budget *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter budget"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="funders">Project Funders *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {funders?.map(funder => (
                  <div key={funder.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`funder-${funder.id}`}
                      checked={formData.funders.includes(funder.id)}
                      onCheckedChange={(checked) =>
                        handleFunderChange(funder.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`funder-${funder.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {funder.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedLevel && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">
                {selectedLevel === 1 ? 'Coverage Area' : 'Select Coverage Areas'}
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLevel === 1 ? (
                <p className="text-muted-foreground">
                  This project will cover the entire nation of Tanzania.
                </p>
              ) : (
                <>
                  {formData.locations.map((location, index) => (
                    <div key={index} className="space-y-4 border p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Location {index + 1}</h3>
                        {formData.locations.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLocationRow(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {selectedLevel >= 2 && (
                          <div>
                            <Label htmlFor={`region-${index}`}>Region *</Label>
                            <Select
                              value={location.region}
                              onValueChange={(value) => handleLocationChange(index, 'region', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent>
                                {getRegions().map(region => (
                                  <SelectItem key={region.id} value={region.id.toString()}>
                                    {region.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {selectedLevel >= 3 && (
                          <div>
                            <Label htmlFor={`district-${index}`}>District *</Label>
                            <Select
                              value={location.district}
                              onValueChange={(value) => handleLocationChange(index, 'district', value)}
                              disabled={!location.region}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select district" />
                              </SelectTrigger>
                              <SelectContent>
                                {getDistricts(location.region).map(district => (
                                  <SelectItem key={district.id} value={district.id.toString()}>
                                    {district.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {selectedLevel >= 4 && (
                          <div>
                            <Label htmlFor={`ward-${index}`}>Ward *</Label>
                            <Select
                              value={location.ward}
                              onValueChange={(value) => handleLocationChange(index, 'ward', value)}
                              disabled={!location.district}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select ward" />
                              </SelectTrigger>
                              <SelectContent>
                                {getWards(location.district).map(ward => (
                                  <SelectItem key={ward.id} value={ward.id.toString()}>
                                    {ward.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {selectedLevel >= 5 && (
                          <div>
                            <Label htmlFor={`village-${index}`}>Village *</Label>
                            <Select
                              value={location.village}
                              onValueChange={(value) => handleLocationChange(index, 'village', value)}
                              disabled={!location.ward}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select village" />
                              </SelectTrigger>
                              <SelectContent>
                                {getVillages(location.ward).map(village => (
                                  <SelectItem key={village.id} value={village.id.toString()}>
                                    {village.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addLocationRow}>
                    Add Another Location
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={navigateBack}
            disabled={createProjectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid() || createProjectMutation.isPending}
          >
            {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}