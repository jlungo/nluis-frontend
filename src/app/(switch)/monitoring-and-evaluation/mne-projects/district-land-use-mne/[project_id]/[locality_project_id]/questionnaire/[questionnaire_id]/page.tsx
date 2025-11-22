import { useParams } from "react-router";
import Batches from "@/components/questionnaire/batches";

export default function Page() {
  const { project_id, locality_project_id, questionnaire_id } = useParams<{ locality_project_id: string; project_id: string; questionnaire_id: string; }>();

  if (!project_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No Project Id!</p>
    </div>

  if (!locality_project_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No Locality Project Id!</p>
    </div>

  if (!questionnaire_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No Questionnaire slug!</p>
    </div>

  return (
    <Batches
      pageTitle={"District Land Use Compliance Project Questionnaire"}
      projectId={project_id}
      projectLocalityId={locality_project_id}
      topLevelModule={"compliance"}
      module={"land-uses"}
      moduleLevel={"district-land-use-compliance"}
      questionnaireId={questionnaire_id}
    />
  )
}
