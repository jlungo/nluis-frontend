import CreateOrEdit from '@/components/ccro_projects/CreateOrEditProject';
import { useParams } from 'react-router';

export default function Page() {
	const { project_id } = useParams<{ project_id: string }>();
	return <CreateOrEdit moduleLevel="ccro-projects" projectId={project_id} redirectPath="/ccro-management/ccro-projects" />;
}
