import type { ColumnDef } from "@tanstack/react-table";
import type { WorkflowProps } from "@/queries/useWorkflowQuery";
import { workflowCategoryTypes } from "@/types/constants";

function countAllForms(workflow: WorkflowProps): number {
  return workflow.sections.reduce(
    (formCount, section) => formCount + section.forms.length,
    0
  );
}

function countAllFields(workflow: WorkflowProps): number {
  return workflow.sections.reduce((fieldCount, section) => {
    return (
      fieldCount +
      section.forms.reduce((formFieldCount, form) => {
        return formFieldCount + form.form_fields.length;
      }, 0)
    );
  }, 0);
}

export const Columns: ColumnDef<WorkflowProps, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
      <div className="text-sm">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
      <div className="text-sm max-w-sm break-words overflow-hidden text-ellipsis line-clamp-2">{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
      <div className="text-sm">{workflowCategoryTypes[row.original.category]}</div>
    ),
  },
  {
    accessorKey: 'module_name',
    header: 'Module',
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
      <div className="text-sm">{row.original.module_name}</div>
    ),
  },
  {
    accessorKey: 'module_level_name',
    header: 'Module Level',
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
      <div className="text-sm">{row.original.module_level_name}</div>
    ),
  },
  {
    accessorKey: 'sections_count',
    header: 'Sections Count',
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
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
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
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
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
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
    cell: ({ row }: { row: { original: WorkflowProps } }) => (
      <div className="text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 dark:text-blue-400 dark:bg-blue-950 text-sm font-medium rounded">
          {row.original.version}
        </span>
      </div>
    ),
  },
];