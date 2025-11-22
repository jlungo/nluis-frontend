import CCROProjects from '@/components/ccro_projects/ProjectsListPage';

export default function Page() {
	// Minimal page that renders the CCRO projects list component.
	return <CCROProjects module="ccro-management" moduleLevel="ccro-projects" pageTitle="CCRO Projects" />;
}
