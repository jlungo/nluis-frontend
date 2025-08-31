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

  // Organizations pages

  // User Management pages

  // System Settings pages
  | "system-settings"
  | "Form Management"
  | "Locality Management"
  | "User Management"
  | "Organization Management"
  | "Land Use Management";

// Billing pages

// Document Management pages

// Equipment Management pages
