import type { ColumnDef } from "@tanstack/react-table";
import type { QuestionnaireProps } from "@/queries/useQuestionnaireQuery";
import { questionnaireCategoryTypes } from "@/types/constants";

function countAllForms(questionnaire: QuestionnaireProps): number {
  return questionnaire.sections.reduce(
    (formCount, section) => formCount + section.forms.length,
    0
  );
}

function countAllFields(questionnaire: QuestionnaireProps): number {
  return questionnaire.sections.reduce((fieldCount, section) => {
    return (
      fieldCount +
      section.forms.reduce((formFieldCount, form) => {
        return formFieldCount + form.form_fields.length;
      }, 0)
    );
  }, 0);
}

export const Columns: ColumnDef<QuestionnaireProps, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: { row: { original: QuestionnaireProps } }) => (
      <div className="text-sm">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }: { row: { original: QuestionnaireProps } }) => (
      <div className="text-sm max-w-xs md:max-w-sm">{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }: { row: { original: QuestionnaireProps } }) => (
      <div className="text-sm">{questionnaireCategoryTypes[row.original.category]}</div>
    ),
  },
  {
    accessorKey: 'module_name',
    header: 'Module',
    cell: ({ row }: { row: { original: QuestionnaireProps } }) => (
      <div className="text-sm">{row.original.module_name}</div>
    ),
  },
  {
    accessorKey: 'sections_count',
    header: 'Sections Count',
    cell: ({ row }: { row: { original: QuestionnaireProps } }) => (
      <div className="text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 dark:text-blue-400 dark:bg-blue-950 text-sm font-medium rounded">
          {row.original.sections_count}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'sections',
    header: 'Forms Count',
    cell: ({ row }: { row: { original: QuestionnaireProps } }) => (
      <div className="text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 dark:text-blue-400 dark:bg-blue-950 text-sm font-medium rounded">
          {countAllForms(row.original)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'is_active',
    header: 'Fields Count',
    cell: ({ row }: { row: { original: QuestionnaireProps } }) => (
      <div className="text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 dark:text-blue-400 dark:bg-blue-950 text-sm font-medium rounded">
          {countAllFields(row.original)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'version',
    header: 'Version',
    cell: ({ row }: { row: { original: QuestionnaireProps } }) => (
      <div className="text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 dark:text-blue-400 dark:bg-blue-950 text-sm font-medium rounded">
          {row.original.version}
        </span>
      </div>
    ),
  },
];