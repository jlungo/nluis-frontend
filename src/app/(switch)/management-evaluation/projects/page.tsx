import { ProjectsListPage } from '@/components/project';
import { LOCALITY_LEVELS } from '@/types/constants';

export default function Page() {
	// Renders the M&E projects list component
	return (
		<ProjectsListPage
			module="management-evaluation"
			moduleLevel={LOCALITY_LEVELS.MNE}
			pageTitle="Monitoring & Evaluation Projects"
		/>
	);
}
