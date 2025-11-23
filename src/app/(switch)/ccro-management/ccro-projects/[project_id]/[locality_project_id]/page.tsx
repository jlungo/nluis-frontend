import { useParams } from 'react-router';

export default function Page() {
	// Placeholder for locality project detail page
	const { locality_project_id } = useParams<{ locality_project_id: string }>();
	return <div>Locality Project {locality_project_id}</div>;
}
