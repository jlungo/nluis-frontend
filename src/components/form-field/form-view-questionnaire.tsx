import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { useQuestionnairesQuery } from "@/queries/useQuestionnaireQuery";

export type ViewQuestionnaireProps = {
    slug: string;
    position: number;
}

type FormViewQuestionnairesProps = {
    name: string;
    label: string;
    required: boolean;
    disabled?: boolean;
    module: string,
    projectLocalityId?: string,
    isPreview?: boolean;
};

export default function FormViewQuestionnaires({ name, label, required, module, projectLocalityId }: FormViewQuestionnairesProps) {
    const { data: questionnaires } = useQuestionnairesQuery(0, 0, '', module, "", projectLocalityId)

    if (!questionnaires || !questionnaires.results?.length) return

    return (
        <div>
            <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
            <div className="flex flex-col md:flex-row gap-4">

            </div>
        </div>
    );
}