import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { organizationService } from '@/services/organizations';
import { locationService } from '@/services/locations';
import type { OrganizationI, OrganizationType } from '@/types/organizations';
import type { Region, District } from '@/types/locations';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Building2,
  MapPin,
  Mail,
  User,
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface FormData {
  organizationName: string;
  organizationType: string;
  organizationDescription: string;
  physicalAddress: string;
  district: string;
  region: string;
  primaryEmail: string;
  phoneNumber: string;
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

export default function EditOrganization() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<OrganizationI | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    organizationType: '',
    organizationDescription: '',
    physicalAddress: '',
    district: '',
    region: '',
    primaryEmail: '',
    phoneNumber: '',
    focalPersonName: '',
    focalPersonJobTitle: '',
    focalPersonEmail: '',
    focusAreas: []
  });

  // Dropdown data
  const [organizationTypes, setOrganizationTypes] = useState<OrganizationType[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error('Organization ID is required');
        navigate('/organizations/directory');
        return;
      }

      try {
        setLoading(true);

        // Load organization data and dropdown options
        const orgData = await organizationService.getOrganization(id);
        const typesData = await organizationService.getOrganizationTypes();

        // Try to load regions and districts, but handle gracefully if APIs don't exist
        let regionsData: Region[] = [];
        let districtsData: District[] = [];

        try {
          regionsData = await locationService.getRegions();
        } catch {
          console.warn('Regions API not available, using empty array');
        }

        try {
          districtsData = await locationService.getDistricts();
        } catch {
          console.warn('Districts API not available, using empty array');
        }

        console.log('Loaded organization for editing:', orgData);
        setOrganization(orgData);
        setOrganizationTypes(typesData);
        setRegions(regionsData);
        setDistricts(districtsData);

        // Populate form with existing data
        setFormData({
          organizationName: orgData.name || '',
          organizationType: '',
          organizationDescription: orgData.description || '',
          physicalAddress: orgData.address || '',
          district: '',
          region: '',
          primaryEmail: orgData.primary_email || '',
          phoneNumber: '', // phone_number doesn't exist on Organization type
          focalPersonName: orgData.first_name + "" + orgData.last_name || '',
          focalPersonJobTitle: '',
          focalPersonEmail: orgData.focal_person_email || '',
          focusAreas: []
        });

        // Filter districts based on current region (only if districts API works)
        // if (orgData.region && districtsData.length > 0) {
        //   const filtered = districtsData.filter(d => d.region_id === orgData.region);
        //   setFilteredDistricts(filtered);
        // }

      } catch (error) {
        console.error('Error loading organization data:', error);
        toast.error('Failed to load organization data');
        navigate('/organizations/directory');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  // Handle region change
  const handleRegionChange = (regionName: string) => {
    setFormData(prev => ({ ...prev, region: regionName, district: '' }));
    const filtered = districts.filter(d => d.region_id === regionName);
    setFilteredDistricts(filtered);
  };

  // Handle focus area toggle
  const handleFocusAreaToggle = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(areaId)
        ? prev.focusAreas.filter(id => id !== areaId)
        : [...prev.focusAreas, areaId]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Basic validation
    if (!formData.organizationName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    if (!formData.primaryEmail.trim()) {
      toast.error('Primary email is required');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        name: formData.organizationName.trim(),
        type_id: formData.organizationType ? parseInt(formData.organizationType) : undefined,
        description: formData.organizationDescription.trim() || undefined,
        physical_address: formData.physicalAddress.trim() || undefined,
        district: formData.district || undefined,
        region: formData.region || undefined,
        primary_email: formData.primaryEmail.trim(),
        phone_number: formData.phoneNumber.trim() || undefined,
        focal_person_name: formData.focalPersonName.trim() || undefined,
        focal_person_job_title: formData.focalPersonJobTitle.trim() || undefined,
        focal_person_email: formData.focalPersonEmail.trim() || undefined,
        focus_areas: formData.focusAreas.length > 0 ? formData.focusAreas : undefined
      };

      console.log('Updating organization with data:', updateData);

      await organizationService.updateOrganization(id, updateData);

      toast.success('Organization updated successfully!');
      navigate(`/organizations/${id}`);

    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
        <p className="text-muted-foreground mb-4">The organization you're trying to edit doesn't exist.</p>
        <Button onClick={() => navigate('/organizations/directory')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizations/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Organization</h1>
            <p className="text-muted-foreground">{organization.name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="organizationType">Organization Type</Label>
                <Select
                  value={formData.organizationType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, organizationType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="organizationDescription">Description</Label>
                <Textarea
                  id="organizationDescription"
                  value={formData.organizationDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationDescription: e.target.value }))}
                  placeholder="Describe the organization's purpose and activities"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primaryEmail">Primary Email *</Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryEmail: e.target.value }))}
                  placeholder="organization@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+256 XXX XXX XXX"
                />
              </div>

              <div>
                <Label htmlFor="physicalAddress">Physical Address</Label>
                <Textarea
                  id="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, physicalAddress: e.target.value }))}
                  placeholder="Enter the organization's physical address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={handleRegionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.name}>
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                  disabled={!formData.region}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.region ? "Select district" : "Select region first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDistricts.map((district) => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Focal Person Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Focal Person Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="focalPersonName">Focal Person Name</Label>
                <Input
                  id="focalPersonName"
                  value={formData.focalPersonName}
                  onChange={(e) => setFormData(prev => ({ ...prev, focalPersonName: e.target.value }))}
                  placeholder="Enter focal person's full name"
                />
              </div>

              <div>
                <Label htmlFor="focalPersonJobTitle">Job Title</Label>
                <Input
                  id="focalPersonJobTitle"
                  value={formData.focalPersonJobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, focalPersonJobTitle: e.target.value }))}
                  placeholder="e.g., Executive Director, Manager"
                />
              </div>

              <div>
                <Label htmlFor="focalPersonEmail">Focal Person Email</Label>
                <Input
                  id="focalPersonEmail"
                  type="email"
                  value={formData.focalPersonEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, focalPersonEmail: e.target.value }))}
                  placeholder="focal.person@example.com"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Focus Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {focusAreas.map((area) => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={area.id}
                    checked={formData.focusAreas.includes(area.id)}
                    onCheckedChange={() => handleFocusAreaToggle(area.id)}
                  />
                  <Label htmlFor={area.id} className="text-sm font-normal">
                    {area.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/organizations/${id}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Updating...' : 'Update Organization'}
          </Button>
        </div>
      </form>
    </div>
  );
}