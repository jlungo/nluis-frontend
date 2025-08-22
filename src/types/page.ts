// TODO: Always ensure that the Page type is kept in sync with the actual pages in the application.
// This type is used to define the available pages in the application, ensuring type safety and consistency

export type Page =
  // Modules
  | "dashboard"
  | "land-uses"
  | "ccro-management"
  | "compliance"
  | "management-evaluation"
  | "mapshop-management"
  | "reports"
  | "organizations"
  | "user-management"
  | "system-settings"
  | "billing"
  | "document-management"
  | "equipment-management"

  // Dashboard pages

  // Land Uses pages
  | "land-uses-overview"
  | "national-land-use"
  | "zonal-land-use"
  | "regional-land-use"
  | "district-land-use"
  | "village-land-use"

  // CCRO Management pages
  | "overview"
  | "land-formalization"
  | "reports"

  // Compliance pages
  | "overview"
  | "reports"

  // Management & Evaluation pages
  | "overview"
  | "reports"

  // MapShop Management pages

  // Reports pages

  // User Management pages
  | "users-dashboard"

  // System Settings pages
  | "form-management"
  | "forms-dashboard"
  | "form-builder"
  | "module-levels"
  | "level-sections"

  // Audit Trail pages

  // Organizations pages

  // Form Management
  | "forms"
  | "builder"
  | "responses"

  // Village Land Use forms
  | "village-creation-form"
  | "village-plan-form"
  | "village-process-23-steps"
  | "village-process-23-steps-updated"
  // CCRO forms
  | "ccro-registration-form"
  | "ccro-process"
  | "ccro-documentation-form"
  | "ccro-documentation-viewer"
  // Management & Evaluation forms
  | "me-registration-form"
  | "me-process"
  | "management-evaluation-form"
  // Compliance forms
  | "compliance-registration-form"
  | "compliance-process"
  | "compliance-form"
  // Organizations forms
  | "organization-registration-form"
  // MapShop Management forms and pages
  | "map-listing-form"
  | "sales-management"
  | "order-management"
  | "customer-management"
  | "map-inventory"
  | "billing-payments"
  | "mapshop-reports"
  // Other forms
  | "regional-plan-form"
  | "district-plan-form"
  | "national-plan-form";
