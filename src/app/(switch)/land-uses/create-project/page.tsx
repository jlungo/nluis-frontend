'use client';

import React, { useState, useEffect } from 'react';
import { usePageStore } from "@/store/pageStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface VillageInfo {
  village_name: string;
  village_code: string;
  district: string;
  region: string;
  ward: string;
  population: number;
  shapefile?: string;
}

type FormData = {
  project_type: string;
  project_name: string;
  project_description: string;
  registration_date: string;
  authorization_date: string;
  status: string;
  funders: string[];
  village_info: VillageInfo;
};

export default function CreateProjectPage() {
  const { setPage } = usePageStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Project types from backend
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  // Location data from backend
  const [locations, setLocations] = useState({
    regions: [] as Array<{ id: string; name: string }>,
    districts: [] as Array<{ id: string; region_id: string; name: string }>,
    wards: [] as Array<{ id: string; district_id: string; name: string }>,
    villages: [] as Array<{ id: string; ward_id: string; name: string; code: string; population: number }>
  });

  const [formData, setFormData] = useState<FormData>({
    project_type: 'Village',
    project_name: '',
    project_description: '',
    registration_date: new Date().toISOString().split('T')[0],
    authorization_date: '',
    status: 'Pending',
    funders: [],
    village_info: {
      village_name: '',
      village_code: '',
      district: '',
      region: '',
      ward: '',
      population: 0,
      shapefile: ''
    }
  });

  const navigateBack = () => window.location.href = '/land-uses';

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project types
        const typesResponse = await fetch(`${import.meta.env.VITE_API_URL}/projects/types/`);
        const types = await typesResponse.json();
        setProjectTypes(types);

        // Fetch locations data
        const locationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/locations/`);
        const locationData = await locationsResponse.json();
        setLocations(locationData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Update page title
  useEffect(() => {
    setPage({
      module: 'land-uses',
      title: 'Create New Village Land Use Plan'
    });
  }, [setPage]);

  // Handle village selection
  const handleVillageSelect = (villageId: string) => {
    const village = locations.villages.find(v => v.id === villageId);
    if (village) {
      setFormData(prev => ({
        ...prev,
        village_info: {
          ...prev.village_info,
          village_name: village.name,
          village_code: village.code,
          population: village.population
        }
      }));
    }
  };

  const handleInputChange = (key: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return formData.project_name && 
           formData.project_description && 
           formData.registration_date && 
           formData.authorization_date && 
           formData.funders.length > 0 &&
           formData.village_info.village_name &&
           formData.village_info.village_code &&
           formData.village_info.district &&
           formData.village_info.region &&
           formData.village_info.ward;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement API call to create project
      // await createProject(formData);
      navigateBack();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Project Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project_name">Project Name *</Label>
              <Input
                id="project_name"
                placeholder="Enter project name"
                value={formData.project_name}
                onChange={(e) => handleInputChange('project_name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="project_description">Description *</Label>
              <Textarea
                id="project_description"
                placeholder="Project description"
                value={formData.project_description}
                onChange={(e) => handleInputChange('project_description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registration_date">Registration Date *</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) => handleInputChange('registration_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="authorization_date">Authorization Date *</Label>
                <Input
                  id="authorization_date"
                  type="date"
                  value={formData.authorization_date}
                  onChange={(e) => handleInputChange('authorization_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_type">Project Type *</Label>
                <Select
                  value={formData.project_type}
                  onValueChange={(value) => handleInputChange('project_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value="Pending" disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="funders">Project Funders *</Label>
              <Input
                id="funders"
                placeholder="Enter funders (comma-separated)"
                value={formData.funders.join(', ')}
                onChange={(e) => {
                  const funders = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                  handleInputChange('funders', funders);
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="funders">Project Funders</Label>
              <Input
                id="funders"
                value={formData.funders.join(', ')}
                onChange={(e) => handleInputChange('funders', e.target.value.split(',').map(str => str.trim()))}
                placeholder="Enter funders (comma-separated)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Village Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="region">Region *</Label>
                <Select
                  value={formData.village_info.region}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      village_info: {
                        ...prev.village_info,
                        region: value,
                        district: '',
                        ward: '',
                        village_name: '',
                        village_code: ''
                      }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.regions.map(region => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district">District *</Label>
                <Select
                  value={formData.village_info.district}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      village_info: {
                        ...prev.village_info,
                        district: value,
                        ward: '',
                        village_name: '',
                        village_code: ''
                      }
                    }));
                  }}
                  disabled={!formData.village_info.region}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.districts
                      .filter(d => d.region_id === formData.village_info.region)
                      .map(district => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ward">Ward *</Label>
                <Select
                  value={formData.village_info.ward}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      village_info: {
                        ...prev.village_info,
                        ward: value,
                        village_name: '',
                        village_code: ''
                      }
                    }));
                  }}
                  disabled={!formData.village_info.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.wards
                      .filter(w => w.district_id === formData.village_info.district)
                      .map(ward => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="village">Village *</Label>
              <Select
                value={formData.village_info.village_name}
                onValueChange={handleVillageSelect}
                disabled={!formData.village_info.ward}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select village" />
                </SelectTrigger>
                <SelectContent>
                  {locations.villages
                    .filter(v => v.ward_id === formData.village_info.ward)
                    .map(village => (
                      <SelectItem key={village.id} value={village.id}>
                        {village.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="village_code">Village Code</Label>
              <Input
                id="village_code"
                value={formData.village_info.village_code}
                disabled
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="population">Population</Label>
              <Input
                id="population"
                type="number"
                placeholder="Enter village population"
                value={formData.village_info.population || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    village_info: {
                      ...prev.village_info,
                      population: parseInt(e.target.value) || 0
                    }
                  }));
                }}
              />
            </div>

            <div>
              <Label htmlFor="shapefile">Shapefile (.zip) *</Label>
              <Input
                id="shapefile"
                type="file"
                accept=".zip"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFormData(prev => ({
                      ...prev,
                      village_info: {
                        ...prev.village_info,
                        shapefile: e.target.files![0].name
                      }
                    }));
                  }
                }}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={navigateBack}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
