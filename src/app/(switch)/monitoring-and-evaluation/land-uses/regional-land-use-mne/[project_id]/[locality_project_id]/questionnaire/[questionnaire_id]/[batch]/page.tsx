import { useParams } from "react-router";
import ViewQuestionnaire from "@/components/questionnaire/ViewQuestionnaire";

export default function Page() {
    const { project_id, locality_project_id, questionnaire_id, batch } = useParams<{ locality_project_id: string; project_id: string; questionnaire_id: string; batch: string }>();

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

    if (!batch)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No Batch number!</p>
        </div>

    return (
        <ViewQuestionnaire
            pageTitle={"Regional Land Use monitoring-and-evaluation Project Questionnaire"}
            projectId={project_id}
            projectLocalityId={locality_project_id}
            topLevelModule={"monitoring-and-evaluation"}
            module={"land-uses"}
            moduleLevel={"regional-land-use-mne"}
            questionnaireId={questionnaire_id}
            batch={batch}
        />
    )
}
