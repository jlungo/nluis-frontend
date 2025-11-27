import { Label } from "../ui/label";
import { Asterisk, ChevronRight } from "lucide-react";
import { useQuestionnairesQuery } from "@/queries/useQuestionnaireQuery";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Link } from "react-router";

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
    projectLocalityId?: string;
    href?: string;
    isPreview?: boolean;
};

export default function FormViewQuestionnaires({ name, label, required, disabled, module, projectLocalityId, href, isPreview }: FormViewQuestionnairesProps) {
    const { data: questionnaires, isLoading, isError } = useQuestionnairesQuery(0, 0, '', module, "", projectLocalityId)

    if (isLoading)
        return (
            <div className="w-full">
                <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                <div className="flex flex-col items-center justify-center gap-1 h-10">
                    <Spinner />
                    <p className="text-muted-foreground text-xs">Loading...</p>
                </div>
            </div>
        )

    if (questionnaires && questionnaires.results?.length === 0)
        return (
            <div className="w-full">
                <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                <div className="w-full flex flex-col items-center justify-center gap-2">
                    <p className="text-center text-muted-foreground text-xs md:text-sm">No questionnaires found!</p>
                </div>
            </div>
        )

    if (isError || (!questionnaires || !questionnaires.results?.length))
        return (
            <div className="w-full">
                <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                <div className="w-full flex flex-col items-center justify-center gap-2">
                    <p className="text-center text-destructive text-xs md:text-sm">An error occured</p>
                </div>
            </div>
        )

    return (
        <div className="w-full">
            <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
            <div className="flex flex-col md:flex-row gap-4">
                {questionnaires.results?.length && questionnaires.results.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
                        {questionnaires.results.map(q =>
                            <div key={q.slug} className="flex gap-2 justify-between p-2 rounded-lg border items-center">
                                <p className="text-sm">{q.name}</p>
                                <Button
                                    key={q.slug}
                                    type="button"
                                    size="sm"
                                    disabled={disabled || isPreview || !href}
                                    aria-label="View Questionnaire"
                                    asChild
                                >
                                    <Link to={href ? `${href}/questionnaire/${q.slug}` : ''}>
                                        <span className="hidden md:inline">View</span>
                                        <ChevronRight />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                ) : <div className="w-full flex flex-col items-center justify-center gap-2">
                    <p className="text-center text-muted-foreground text-xs md:text-sm">No Questionnaires for this project loaclity yet</p>
                </div>}
            </div>
        </div>
    );
}