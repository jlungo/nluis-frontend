import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { usePageStore } from "@/store/pageStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Building2,
  Users,
  MapPin,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { organizationService } from "@/services/organizations";
import type { OrganizationType } from "@/types/organizations";

interface FormData {
  organizationName: string;
  organizationType: string;
  organizationDescription: string;
  physicalAddress: string;
  primaryEmail: string;
  focalPersonFirstName: string;
  focalPersonLastName: string;
  focalPersonPhone: string;
  focalPersonEmail: string;
  focalPersonGender: string;
}

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { setPage } = usePageStore();

  const [formData, setFormData] = useState<FormData>({
    organizationName: "",
    organizationType: "",
    organizationDescription: "",
    physicalAddress: "",
    primaryEmail: "",
    focalPersonFirstName: "",
    focalPersonLastName: "",
    focalPersonPhone: "",
    focalPersonEmail: "",
    focalPersonGender: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<OrganizationType[]>([]);

  // Set page metadata
  useEffect(() => {
    setPage({
      module: "organizations",
      title: "Organization Registration",
    });
  }, [setPage]);

  // Load organization types and regions
  useEffect(() => {
    (async () => {
      try {
        // Load organization types from backend
        setOrganizationTypes(await organizationService.getOrganizationTypes());
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    })();
  }, []);

  const navigateBack = () => navigate("/organizations");

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Organization Information
    if (!formData.organizationName.trim())
      newErrors.organizationName = "Organization name is required";
    if (!formData.organizationType)
      newErrors.organizationType = "Organization type is required";
    if (!formData.organizationDescription.trim())
      newErrors.organizationDescription = "Description is required";
    else if (formData.organizationDescription.trim().length < 10)
      newErrors.organizationDescription = "Description must be at least 10 characters";

    // Contact Information
    if (!formData.physicalAddress.trim())
      newErrors.physicalAddress = "Physical address is required";
   
    if (!formData.primaryEmail.trim())
      newErrors.primaryEmail = "Primary email is required";
    else if (!validateEmail(formData.primaryEmail))
      newErrors.primaryEmail = "Please enter a valid email address";

    // Focal Person
    if (!formData.focalPersonFirstName.trim())
      newErrors.focalPersonFirstName = "Focal person first name is required";
    if (!formData.focalPersonLastName.trim())
      newErrors.focalPersonLastName = "Focal person last name is required";
    if (!formData.focalPersonPhone.trim())
      newErrors.focalPersonPhone = "Phone is required";
    if (!formData.focalPersonEmail.trim())
      newErrors.focalPersonEmail = "Focal person email is required";
    else if (!validateEmail(formData.focalPersonEmail))
      newErrors.focalPersonEmail = "Please enter a valid email address";
    if (!formData.focalPersonGender)
      newErrors.focalPersonGender = "Gender is required";

    return newErrors;
  };

  const isFormValid = () =>
    formData.organizationName.trim() &&
    formData.organizationType &&
    formData.organizationDescription.trim() &&
    formData.physicalAddress.trim() &&
    formData.primaryEmail.trim() &&
    validateEmail(formData.primaryEmail) &&
    formData.focalPersonFirstName.trim() &&
    formData.focalPersonLastName.trim() &&
    formData.focalPersonPhone.trim() &&
    formData.focalPersonEmail.trim() &&
    validateEmail(formData.focalPersonEmail) &&
    formData.focalPersonGender;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the organization type object from the selected type
      const selectedType = organizationTypes.find(
        (t) => t.id === formData.organizationType
      );
      if (!selectedType) throw new Error("Invalid organization type selected");

      await organizationService.createOrganization({
        name: formData.organizationName,
        short_name: formData.organizationName,
        type: selectedType.id,
        description: formData.organizationDescription,
        address: formData.physicalAddress,
        email: formData.primaryEmail,
        first_name: formData.focalPersonFirstName,
        last_name: formData.focalPersonLastName,
        phone: formData.focalPersonPhone,
        focal_person_email: formData.focalPersonEmail,
        gender: Number(formData.focalPersonGender),
      });

      toast.success("Organization registered successfully!");
      navigate("/organizations/organizations-list");
    } catch (error) {
      toast.error("Failed to register organization. Please try again.");
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
                      onChange={(e) =>
                        handleInputChange("organizationName", e.target.value)
                      }
                      placeholder="Enter organization name"
                      className={
                        errors.organizationName
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
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
                      onValueChange={(value) =>
                        handleInputChange("organizationType", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.organizationType
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                      >
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
                  <div>
                    <Label htmlFor="organizationDescription">
                      Organization Description *
                    </Label>
                    <Textarea
                      id="organizationDescription"
                      value={formData.organizationDescription}
                      onChange={(e) =>
                        handleInputChange(
                          "organizationDescription",
                          e.target.value
                        )
                      }
                      placeholder="Briefly describe the organization"
                      rows={4}
                      className={
                        errors.organizationDescription
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      required
                    />
                    {errors.organizationDescription && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.organizationDescription}
                      </p>
                    )}
                  </div>
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
                    onChange={(e) =>
                      handleInputChange("physicalAddress", e.target.value)
                    }
                    placeholder="Enter complete physical address including street, building, etc."
                    rows={3}
                    className={
                      errors.physicalAddress
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }
                    required
                  />
                  {errors.physicalAddress && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.physicalAddress}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="primaryEmail">Primary Email Address *</Label>
                  <Input
                    id="primaryEmail"
                    type="email"
                    value={formData.primaryEmail}
                    onChange={(e) =>
                      handleInputChange("primaryEmail", e.target.value)
                    }
                    placeholder="contact@organization.com"
                    className={
                      errors.primaryEmail
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }
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
                    <Label htmlFor="focalPersonFirstName">First Name *</Label>
                    <Input
                      id="focalPersonFirstName"
                      value={formData.focalPersonFirstName}
                      onChange={(e) =>
                        handleInputChange("focalPersonFirstName", e.target.value)
                      }
                      placeholder="Enter first name"
                      className={
                        errors.focalPersonFirstName
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      required
                    />
                    {errors.focalPersonFirstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.focalPersonFirstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="focalPersonLastName">Last Name *</Label>
                    <Input
                      id="focalPersonLastName"
                      value={formData.focalPersonLastName}
                      onChange={(e) =>
                        handleInputChange("focalPersonLastName", e.target.value)
                      }
                      placeholder="Enter last name"
                      className={
                        errors.focalPersonLastName
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      required
                    />
                    {errors.focalPersonLastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.focalPersonLastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="focalPersonPhone">Phone Number *</Label>
                    <Input
                      id="focalPersonPhone"
                      type="tel"
                      value={formData.focalPersonPhone}
                      onChange={(e) =>
                        handleInputChange("focalPersonPhone", e.target.value)
                      }
                      placeholder="+255 7XX XXX XXX"
                      className={
                        errors.focalPersonPhone
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      required
                    />
                    {errors.focalPersonPhone && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.focalPersonPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="focalPersonEmail">Email Address *</Label>
                    <Input
                      id="focalPersonEmail"
                      type="email"
                      value={formData.focalPersonEmail}
                      onChange={(e) =>
                        handleInputChange("focalPersonEmail", e.target.value)
                      }
                      placeholder="person@organization.com"
                      className={
                        errors.focalPersonEmail
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      required
                    />
                    {errors.focalPersonEmail && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.focalPersonEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select
                      value={formData.focalPersonGender}
                      onValueChange={(value) =>
                        handleInputChange("focalPersonGender", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.focalPersonGender
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Male</SelectItem>
                        <SelectItem value="2">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.focalPersonGender && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.focalPersonGender}
                      </p>
                    )}
                  </div>
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
              <Button type="submit" disabled={!isFormValid() || isSubmitting}>
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
