import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { usePageStore } from "@/store/pageStore";
import { projectService } from '@/services/projects';
import { organizationService } from '@/services/organizations';
import type { Project, ProjectType, UpdateProjectRequest } from '@/types/projects';
import type { Organization } from '@/types/organizations';
import type { Region, District } from '@/types/locations';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Edit, Building2, MapPin, Calendar, DollarSign } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  type_id: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: string;
  progress_percentage: string;
  region: string;
  district: string;
  ward: string;
  village: string;
}

// Temporary regions data (same as in other forms)
const tempRegions = [
  { id: '1', name: 'Dodoma' },
  { id: '2', name: 'Arusha' },
  { id: '3', name: 'Dar es Salaam' },
  { id: '4', name: 'Mwanza' },
  { id: '5', name: 'Mbeya' },
  { id: '6', name: 'Morogoro' },
  { id: '7', name: 'Tanga' },
  { id: '8', name: 'Iringa' },
  { id: '9', name: 'Kigoma' },
  { id: '10', name: 'Tabora' }
];

const tempDistricts = {
  '1': [
    { id: '1-1', name: 'Dodoma Urban', region_id: '1' },
    { id: '1-2', name: 'Dodoma Rural', region_id: '1' },
    { id: '1-3', name: 'Kondoa', region_id: '1' },
    { id: '1-4', name: 'Mpwapwa', region_id: '1' }
  ],
  '2': [
    { id: '2-1', name: 'Arusha City', region_id: '2' },
    { id: '2-2', name: 'Arusha Rural', region_id: '2' },
    { id: '2-3', name: 'Karatu', region_id: '2' },
    { id: '2-4', name: 'Ngorongoro', region_id: '2' }
  ],
  '3': [
    { id: '3-1', name: 'Kinondoni', region_id: '3' },
    { id: '3-2', name: 'Ilala', region_id: '3' },
    { id: '3-3', name: 'Temeke', region_id: '3' },
    { id: '3-4', name: 'Ubungo', region_id: '3' },
    { id: '3-5', name: 'Kigamboni', region_id: '3' }
  ]
};

export default function EditProjectPage() {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const { setPage } = usePageStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type_id: '',
    status: '',
    start_date: '',
    end_date: '',
    budget: '',
    progress_percentage: '',
    region: '',
    district: '',
    ward: '',
    village: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set page metadata
  useEffect(() => {
    setPage({
      module: 'organizations',
      title: 'Edit Project',
      isFormPage: true
    });
  }, [setPage]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!id || !projectId) {
        toast.error('Project ID is required');
        navigate('/organizations/directory');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading project and form data...');
        
        // Load project details
        const projectData = await projectService.getProject(projectId);
        console.log('Project loaded:', projectData);
        setProject(projectData);

        // Load organization details
        const orgData = await organizationService.getOrganization(id);
        console.log('Organization loaded:', orgData);
        setOrganization(orgData);

        // Load project types
        const types = await projectService.getProjectTypes();
        console.log('Project types loaded:', types);
        setProjectTypes(types);

        // Use temporary regions for testing
        setRegions(tempRegions);

        // Find region and district IDs from names
        const regionId = tempRegions.find(r => r.name === projectData.location?.region)?.id || '';
        let districtId = '';
        
        if (regionId && projectData.location?.district) {
          const regionDistricts = tempDistricts[regionId] || [];
          districtId = regionDistricts.find(d => d.name === projectData.location?.district)?.id || '';
          setDistricts(regionDistricts);
        }

        // Populate form with project data
        setFormData({
          name: projectData.name || '',
          description: projectData.description || '',
          type_id: projectData.type.id || '',
          status: projectData.status || '',
          start_date: projectData.start_date || '',
          end_date: projectData.end_date || '',
          budget: projectData.budget?.toString() || '',
          progress_percentage: projectData.progress_percentage?.toString() || '',
          region: regionId,
          district: districtId,
          ward: projectData.location?.ward || '',
          village: projectData.location?.village || ''
        });

      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load project data');
        navigate(`/organizations/${id}/projects`);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, projectId, navigate]);

  // Load districts when region changes
  useEffect(() => {
    const loadDistricts = () => {
      if (!formData.region) {
        setDistricts([]);
        return;
      }

      setLoadingDistricts(true);
      
      setTimeout(() => {
        try {
          const districtsData = tempDistricts[formData.region] || [];
          setDistricts(districtsData);
          
          // Clear district selection if it's not valid for the new region
          if (formData.district && !districtsData.find(d => d.id === formData.district)) {
            setFormData(prev => ({ ...prev, district: '', ward: '', village: '' }));
          }
        } catch (error) {
          console.error('Error loading districts:', error);
          toast.error('Failed to load districts');
          setDistricts([]);
        } finally {
          setLoadingDistricts(false);
        }
      }, 300);
    };

    loadDistricts();
  }, [formData.region]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.type_id) {
      newErrors.type_id = 'Project type is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }

    if (formData.progress_percentage) {
      const progress = Number(formData.progress_percentage);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        newErrors.progress_percentage = 'Progress must be a number between 0 and 100';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !projectId || !project || !organization) {
      toast.error('Project information is missing');
      return;
    }

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedRegion = regions.find(r => r.id === formData.region);
      const selectedDistrict = districts.find(d => d.id === formData.district);

      const updateData: UpdateProjectRequest = {
        name: formData.name,
        description: formData.description || undefined,
        type_id: formData.type_id,
        status: formData.status as Project['status'],
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        progress_percentage: formData.progress_percentage ? Number(formData.progress_percentage) : undefined,
        location: {
          region: selectedRegion?.name,
          district: selectedDistrict?.name,
          ward: formData.ward || undefined,
          village: formData.village || undefined,
        }
      };

      console.log('Updating project:', updateData);
      const updatedProject = await projectService.updateProject(projectId, updateData);
      console.log('Project updated:', updatedProject);
      
      toast.success('Project updated successfully!');
      navigate(`/organizations/${id}/projects/${projectId}`);
    } catch (error) {
      console.error('Project update error:', error);
      toast.error('Failed to update project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project || !organization) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate(`/organizations/${id}/projects`)}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/organizations/${id}/projects/${projectId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Project</h1>
                <p className="text-muted-foreground">{project.name} - {organization.name}</p>
              </div>
            </div>

            {/* Organization Context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Organization Context
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                  <p className="text-foreground font-medium">{organization.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <p className="text-foreground">{organization.type?.name || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-foreground">{organization.district}, {organization.region}</p>
                </div>
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter project name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="type_id">Project Type *</Label>
                    <Select value={formData.type_id} onValueChange={(value) => handleInputChange('type_id', value)}>
                      <SelectTrigger className={errors.type_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type_id && <p className="text-sm text-red-500 mt-1">{errors.type_id}</p>}
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="progress_percentage">Progress (%)</Label>
                    <Input
                      id="progress_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress_percentage}
                      onChange={(e) => handleInputChange('progress_percentage', e.target.value)}
                      placeholder="0"
                      className={errors.progress_percentage ? 'border-red-500' : ''}
                    />
                    {errors.progress_percentage && <p className="text-sm text-red-500 mt-1">{errors.progress_percentage}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the project objectives, scope, and expected outcomes..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Timeline and Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Timeline and Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className={errors.start_date ? 'border-red-500' : ''}
                    />
                    {errors.start_date && <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>}
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className={errors.end_date ? 'border-red-500' : ''}
                    />
                    {errors.end_date && <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>}
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget (TZS)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      placeholder="0"
                      className={errors.budget ? 'border-red-500' : ''}
                    />
                    {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Project Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Select 
                      value={formData.district} 
                      onValueChange={(value) => handleInputChange('district', value)}
                      disabled={!formData.region || loadingDistricts}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select district"} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ward">Ward (Optional)</Label>
                    <Input
                      id="ward"
                      value={formData.ward}
                      onChange={(e) => handleInputChange('ward', e.target.value)}
                      placeholder="Enter ward name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="village">Village (Optional)</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      placeholder="Enter village name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-none border-t bg-background p-6">
          <div className="max-w-4xl mx-auto flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/organizations/${id}/projects/${projectId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}