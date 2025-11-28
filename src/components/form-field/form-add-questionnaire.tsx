import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { useQuestionnairesQuery } from "@/queries/useQuestionnaireQuery";
import { Spinner } from "../ui/spinner";

export type AddQuestionnaireProps = {
    slug: string;
    position: number;
}

type FormAddQuestionnairesProps = {
    name: string;
    label: string;
    required: boolean;
    disabled?: boolean;
    module: string,
    values: AddQuestionnaireProps[]
    onValueChange?: (values: AddQuestionnaireProps[]) => void;
    isPreview?: boolean;
};

export default function FormAddQuestionnaires({ name, label, required, module, values, onValueChange }: FormAddQuestionnairesProps) {
    const { data: questionnaires, isLoading, isError } = useQuestionnairesQuery(0, 0, '', module, "")

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


    const selectedQuestionnaires = questionnaires.results.filter(q =>
        values.some(v => v.slug === q.slug)
    );

    return (
        <div className="w-full">
            <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="p-3 rounded-lg border w-full md:w-1/2">
                    {questionnaires.results.length > 0 ?
                        questionnaires.results.map(q => (
                            <div key={q.slug} className="flex gap-2 items-center">
                                <Checkbox
                                    id={q.slug}
                                    name={q.slug}
                                    checked={values.some(value => value.slug === q.slug)}
                                    onCheckedChange={val => {
                                        if (!onValueChange) return;
                                        if (val === true)
                                            onValueChange([
                                                ...values,
                                                {
                                                    slug: q.slug,
                                                    position: values.length + 1,
                                                },
                                            ]);
                                        else {
                                            const filtered = values
                                                .filter(value => value.slug !== q.slug)
                                                .map((value, index) => ({
                                                    ...value,
                                                    position: index + 1,
                                                }));
                                            onValueChange(filtered)
                                        }
                                    }}
                                />
                                <Label htmlFor={q.slug} className="mt-2 cursor-pointer">{q.name}</Label>
                            </div>
                        )) : <p className="pt-2 text-center text-xs lg:text-sm text-muted-foreground">No questionnaires found</p>}
                </div>
                <div className="p-3 rounded-lg border w-full md:w-1/2">
                    {values.length > 0 ?
                        selectedQuestionnaires
                            .sort((a, b) => {
                                const posA =
                                    values.find(v => v.slug === a.slug)?.position ?? 0;
                                const posB =
                                    values.find(v => v.slug === b.slug)?.position ?? 0;
                                return posA - posB;
                            }).map(q => {
                                const position = values.find(v => v.slug === q.slug)?.position ?? 0
                                return (
                                    <div key={q.slug} className="flex gap-4 items-center">
                                        <div className="rounded-full bg-accent w-7 h-7 text-center flex flex-col items-center justify-center whitespace-nowrap">
                                            <p className="text-xs">{position}</p>
                                        </div>
                                        <p>{q.name}</p>
                                    </div>
                                )
                            })
                        : <p className="pt-2 text-center text-xs lg:text-sm text-muted-foreground">No value selected</p>}
                </div>
            </div>
        </div>
    );
}