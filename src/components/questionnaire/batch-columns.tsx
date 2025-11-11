import type { QuestionnaireDataBatchI } from "@/queries/useQuestionnaireDataBatchQuery";
import type { ColumnDef } from "@tanstack/react-table";

export const BatchColumns: ColumnDef<QuestionnaireDataBatchI, unknown>[] = [
    {
        accessorKey: 'id',
        header: 'Batch Id',
        cell: ({ row }: { row: { original: QuestionnaireDataBatchI } }) => (
            <div className="text-sm">{row.original.id}</div>
        ),
    },
    {
        accessorKey: 'batch',
        header: 'Batch Number',
        cell: ({ row }: { row: { original: QuestionnaireDataBatchI } }) => (
            <div className="text-sm">{row.original.batch}</div>
        ),
    }
];
