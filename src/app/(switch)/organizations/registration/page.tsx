import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usePageStore } from "@/store/pageStore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Building2, Users, MapPin, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { organizationService } from '@/services/organizations';
import { locationService } from '@/services/locations';
import type { OrganizationType } from '@/types/organizations';
import type { Region, District } from '@/types/locations';

interface FormData {
  organizationName: string;
  organizationType: string;
  organizationDescription: string;
  physicalAddress: string;
  district: string;
  region: string;
  primaryEmail: string;
  focalPersonName: string;
  focalPersonJobTitle: string;
  focalPersonEmail: string;
  focusAreas: string[];
}

const focusAreas = [
  { id: 'agricultural', label: 'Agricultural Land Use' },
  { id: 'urban', label: 'Urban Planning' },
  { id: 'environmental', label: 'Environmental Conservation' },
  { id: 'infrastructure', label: 'Infrastructure Development' },
  { id: 'community', label: 'Community Land Rights' },
  { id: 'commercial', label: 'Commercial Development' }
];

// Temporary hardcoded data for testing - will be replaced with backend calls
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
  '1': [ // Dodoma
    { id: '1-1', name: 'Dodoma Urban', region_id: '1' },
    { id: '1-2', name: 'Dodoma Rural', region_id: '1' },
    { id: '1-3', name: 'Kondoa', region_id: '1' },
    { id: '1-4', name: 'Mpwapwa', region_id: '1' }
  ],
  '2': [ // Arusha
    { id: '2-1', name: 'Arusha City', region_id: '2' },
    { id: '2-2', name: 'Arusha Rural', region_id: '2' },
    { id: '2-3', name: 'Karatu', region_id: '2' },
    { id: '2-4', name: 'Ngorongoro', region_id: '2' }
  ],
  '3': [ // Dar es Salaam
    { id: '3-1', name: 'Kinondoni', region_id: '3' },
    { id: '3-2', name: 'Ilala', region_id: '3' },
    { id: '3-3', name: 'Temeke', region_id: '3' },
    { id: '3-4', name: 'Ubungo', region_id: '3' },
    { id: '3-5', name: 'Kigamboni', region_id: '3' }
  ],
  '4': [ // Mwanza
    { id: '4-1', name: 'Mwanza City', region_id: '4' },
    { id: '4-2', name: 'Ilemela', region_id: '4' },
    { id: '4-3', name: 'Nyamagana', region_id: '4' },
    { id: '4-4', name: 'Sengerema', region_id: '4' }
  ],
  '5': [ // Mbeya
    { id: '5-1', name: 'Mbeya City', region_id: '5' },
    { id: '5-2', name: 'Mbeya Rural', region_id: '5' },
    { id: '5-3', name: 'Kyela', region_id: '5' },
    { id: '5-4', name: 'Rungwe', region_id: '5' }
  ],
  '6': [ // Morogoro
    { id: '6-1', name: 'Morogoro Urban', region_id: '6' },
    { id: '6-2', name: 'Morogoro Rural', region_id: '6' },
    { id: '6-3', name: 'Mvomero', region_id: '6' },
    { id: '6-4', name: 'Kilosa', region_id: '6' }
  ],
  '7': [ // Tanga
    { id: '7-1', name: 'Tanga City', region_id: '7' },
    { id: '7-2', name: 'Muheza', region_id: '7' },
    { id: '7-3', name: 'Pangani', region_id: '7' },
    { id: '7-4', name: 'Korogwe', region_id: '7' }
  ],
  '8': [ // Iringa
    { id: '8-1', name: 'Iringa Urban', region_id: '8' },
    { id: '8-2', name: 'Iringa Rural', region_id: '8' },
    { id: '8-3', name: 'Mufindi', region_id: '8' },
    { id: '8-4', name: 'Kilolo', region_id: '8' }
  ],
  '9': [ // Kigoma
    { id: '9-1', name: 'Kigoma Urban', region_id: '9' },
    { id: '9-2', name: 'Kigoma Rural', region_id: '9' },
    { id: '9-3', name: 'Kasulu', region_id: '9' },
    { id: '9-4', name: 'Kibondo', region_id: '9' }
  ],
  '10': [ // Tabora
    { id: '10-1', name: 'Tabora Urban', region_id: '10' },
    { id: '10-2', name: 'Tabora Rural', region_id: '10' },
    { id: '10-3', name: 'Nzega', region_id: '10' },
    { id: '10-4', name: 'Uyui', region_id: '10' }
  ]
};

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { setPage } = usePageStore();
  
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    organizationType: '',
    organizationDescription: '',
    physicalAddress: '',
    district: '',
    region: '',
    primaryEmail: '',
    focalPersonName: '',
    focalPersonJobTitle: '',
    focalPersonEmail: '',
    focusAreas: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<OrganizationType[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Set page metadata
  useEffect(() => {
    setPage({
      module: 'organizations',
      title: 'Organization Registration'
    });
  }, [setPage]);

  // Load organization types and regions
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load organization types from backend
        const types = await organizationService.getOrganizationTypes();
        setOrganizationTypes(types);

        // Use temporary regions for testing
        setRegions(tempRegions);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load organization types');
        
        // Still set regions even if org types fail
        setRegions(tempRegions);
      }
    };

    loadInitialData();
  }, []);

  // Load districts when region changes
  useEffect(() => {
    const loadDistricts = () => {
      if (!formData.region) {
        setDistricts([]);
        return;
      }

      setLoadingDistricts(true);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        try {
          // Use temporary districts data
          const districtsData = tempDistricts[formData.region] || [];
          setDistricts(districtsData);
          
          // Clear district selection if it's not valid for the new region
          if (formData.district && !districtsData.find(d => d.id === formData.district)) {
            setFormData(prev => ({ ...prev, district: '' }));
          }
        } catch (error) {
          console.error('Error loading districts:', error);
          toast.error('Failed to load districts');
          setDistricts([]);
        } finally {
          setLoadingDistricts(false);
        }
      }, 300); // Small delay to show loading state
    };

    loadDistricts();
  }, [formData.region]);

  const navigateBack = () => navigate('/organizations');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFocusAreaChange = (areaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: checked 
        ? [...prev.focusAreas, areaId]
        : prev.focusAreas.filter(id => id !== areaId)
    }));
    // Clear focus areas error when user makes a selection
    if (errors.focusAreas && checked) {
      setErrors(prev => ({ ...prev, focusAreas: '' }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    // Organization Information
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    if (!formData.organizationType) {
      newErrors.organizationType = 'Organization type is required';
    }
    if (!formData.organizationDescription.trim()) {
      newErrors.organizationDescription = 'Description is required';
    } else if (formData.organizationDescription.trim().length < 10) {
      newErrors.organizationDescription = 'Description must be at least 10 characters';
    }

    // Contact Information
    if (!formData.physicalAddress.trim()) {
      newErrors.physicalAddress = 'Physical address is required';
    }
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }
    if (!formData.primaryEmail.trim()) {
      newErrors.primaryEmail = 'Primary email is required';
    } else if (!validateEmail(formData.primaryEmail)) {
      newErrors.primaryEmail = 'Please enter a valid email address';
    }

    // Focal Person
    if (!formData.focalPersonName.trim()) {
      newErrors.focalPersonName = 'Focal person name is required';
    }
    if (!formData.focalPersonJobTitle.trim()) {
      newErrors.focalPersonJobTitle = 'Job title is required';
    }
    if (!formData.focalPersonEmail.trim()) {
      newErrors.focalPersonEmail = 'Focal person email is required';
    } else if (!validateEmail(formData.focalPersonEmail)) {
      newErrors.focalPersonEmail = 'Please enter a valid email address';
    }

    // Focus Areas
    if (formData.focusAreas.length === 0) {
      newErrors.focusAreas = 'Please select at least one focus area';
    }

    return newErrors;
  };

  const isFormValid = () => {
    return formData.organizationName.trim() &&
           formData.organizationType &&
           formData.organizationDescription.trim() &&
           formData.physicalAddress.trim() &&
           formData.district.trim() &&
           formData.region.trim() &&
           formData.primaryEmail.trim() &&
           validateEmail(formData.primaryEmail) &&
           formData.focalPersonName.trim() &&
           formData.focalPersonJobTitle.trim() &&
           formData.focalPersonEmail.trim() &&
           validateEmail(formData.focalPersonEmail) &&
           formData.focusAreas.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get the organization type object from the selected type
      const selectedType = organizationTypes.find(t => t.id === formData.organizationType);
      if (!selectedType) {
        throw new Error('Invalid organization type selected');
      }

      // Get the region and district names
      const selectedRegion = regions.find(r => r.id === formData.region);
      const selectedDistrict = districts.find(d => d.id === formData.district);

      if (!selectedRegion || !selectedDistrict) {
        throw new Error('Invalid region or district selected');
      }

      await organizationService.createOrganization({
        name: formData.organizationName,
        type: selectedType, // Pass the full type object
        description: formData.organizationDescription,
        physical_address: formData.physicalAddress,
        district: selectedDistrict.name, // Send district name
        region: selectedRegion.name, // Send region name
        primary_email: formData.primaryEmail,
        focal_person_name: formData.focalPersonName,
        focal_person_job_title: formData.focalPersonJobTitle,
        focal_person_email: formData.focalPersonEmail,
        focus_areas: formData.focusAreas,
        status: 'pending' // Default status for new organizations
      });
      
      toast.success('Organization registered successfully!');
      navigate('/organizations');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  placeholder="Enter organization name"
                  className={errors.organizationName ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
                {errors.organizationName && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.organizationName}
                  </p>
                )}
              </div>

              <div>
                <Label>Organization Type *</Label>
                <Select 
                  value={formData.organizationType} 
                  onValueChange={(value) => handleInputChange('organizationType', value)}
                >
                  <SelectTrigger className={errors.organizationType ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.organizationType && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.organizationType}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="organizationDescription">Organization Description *</Label>
              <Textarea
                id="organizationDescription"
                value={formData.organizationDescription}
                onChange={(e) => handleInputChange('organizationDescription', e.target.value)}
                placeholder="Describe your organization's mission, activities, and objectives..."
                rows={4}
                className={errors.organizationDescription ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {errors.organizationDescription && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.organizationDescription}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="physicalAddress">Physical Address *</Label>
              <Textarea
                id="physicalAddress"
                value={formData.physicalAddress}
                onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                placeholder="Enter complete physical address including street, building, etc."
                rows={3}
                className={errors.physicalAddress ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {errors.physicalAddress && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.physicalAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Region *</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(value) => handleInputChange('region', value)}
                >
                  <SelectTrigger className={errors.region ? 'border-red-500 focus:border-red-500' : ''}>
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
                {errors.region && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.region}
                  </p>
                )}
              </div>

              <div>
                <Label>District *</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={(value) => handleInputChange('district', value)}
                  disabled={!formData.region || loadingDistricts}
                >
                  <SelectTrigger className={errors.district ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder={
                      !formData.region 
                        ? "Select region first" 
                        : loadingDistricts 
                        ? "Loading districts..." 
                        : "Select district"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.district}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="primaryEmail">Primary Email Address *</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                placeholder="contact@organization.com"
                className={errors.primaryEmail ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {errors.primaryEmail && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.primaryEmail}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Focus Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Areas of Focus
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the land use areas your organization is primarily interested in *
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreas.map((area) => (
                <div key={area.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={area.id}
                    checked={formData.focusAreas.includes(area.id)}
                    onCheckedChange={(checked) => handleFocusAreaChange(area.id, checked as boolean)}
                  />
                  <Label 
                    htmlFor={area.id} 
                    className="text-sm font-medium cursor-pointer hover:text-blue-600"
                  >
                    {area.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.focusAreas && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-4">
                <AlertCircle className="h-4 w-4" />
                {errors.focusAreas}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Focal Person */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Focal Person Details
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Primary contact person for this organization
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="focalPersonName">Full Name *</Label>
                <Input
                  id="focalPersonName"
                  value={formData.focalPersonName}
                  onChange={(e) => handleInputChange('focalPersonName', e.target.value)}
                  placeholder="Enter full name"
                  className={errors.focalPersonName ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
                {errors.focalPersonName && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.focalPersonName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="focalPersonJobTitle">Job Title *</Label>
                <Input
                  id="focalPersonJobTitle"
                  value={formData.focalPersonJobTitle}
                  onChange={(e) => handleInputChange('focalPersonJobTitle', e.target.value)}
                  placeholder="e.g., Land Use Coordinator, Director"
                  className={errors.focalPersonJobTitle ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
                {errors.focalPersonJobTitle && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.focalPersonJobTitle}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="focalPersonEmail">Email Address *</Label>
              <Input
                id="focalPersonEmail"
                type="email"
                value={formData.focalPersonEmail}
                onChange={(e) => handleInputChange('focalPersonEmail', e.target.value)}
                placeholder="person@organization.com"
                className={errors.focalPersonEmail ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {errors.focalPersonEmail && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.focalPersonEmail}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
          </div>
        </div>

        {/* Fixed Form Actions */}
        <div className="flex-shrink-0 border-t bg-background">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-end gap-4">
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Register Organization
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}