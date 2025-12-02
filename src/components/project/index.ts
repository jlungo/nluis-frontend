// Main project component
export { default as CreateOrEditProject } from './CreateOrEditProject';

// Specialized project components (re-exported from their own folders)
// Note: CreateComplianceProject and CreateMNEProject are not separate modules yet
// export { CreateComplianceProject } from '../compliance-project';
// export { CreateMNEProject } from '../mne-project';

// Project utilities and helpers
export { default as Dashboard } from './Dashboard';
export { default as ViewProjectPage } from './ViewProjectPage';
export { default as ProjectsListPage } from './ProjectsListPage';
export { default as ProjectLocalitiesApproval } from './ProjectLocalitiesApproval';

// Status badges
export { ProjectStatusBadge } from './project-status-badge';

// Permissions
export * from './permissions';

// Utilities
export * from './utils';
