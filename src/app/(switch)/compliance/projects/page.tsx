import ProjectsListPage from '@/components/compliance_projects/ProjectsListPage';
import { LOCALITY_LEVELS } from '@/types/constants';

export default function Page() {
	// Renders the compliance projects list component
	return (
		<ProjectsListPage
			module="compliance"
			moduleLevel={LOCALITY_LEVELS.COMPLIANCE}
			pageTitle="Compliance Projects"
		/>
	);
}
