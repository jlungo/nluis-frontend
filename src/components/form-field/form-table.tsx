import type { SelectOptionProps } from "@/queries/useWorkflowQuery";
import type { SelectOptionProps as QOptionsProps } from "@/queries/useQuestionnaireQuery";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Label } from "../ui/label";
import { Asterisk, Eye, Pen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export interface TableRowI {
    position: number;
    column: {
        position: number;
        label: string;
    }[]
}

type SelectIOptionI = SelectOptionProps | QOptionsProps

interface FormTableProps {
    name: string;
    label: string;
    required: boolean;
    placeholder?: string;
    selectOptions: SelectIOptionI[]
    values?: TableRowI[];
    setValues: (values: TableRowI[]) => void;
    disabled?: boolean;
    className?: string;
    isPreview?: boolean
}

const FormTable = (props: FormTableProps) => {
    const { name, label, required, selectOptions, values = [], setValues, disabled, isPreview } = props
    const [isViewer, setIsViewer] = useState(values && values.length > 0 && Array.isArray(values) && disabled)

    const handleInputChange = (rowPosition: number, columnPosition: number, newValue: string) => {
        setValues(
            values.map((row) =>
                row.position === rowPosition
                    ? {
                        ...row,
                        column: row.column.map((col) =>
                            col.position === columnPosition
                                ? { ...col, label: newValue }
                                : col
                        )
                    }
                    : row
            )
        );
    };

    const addRow = () => {
        setValues([
            ...values,
            {
                position: values.length + 1,
                column: selectOptions.sort((a, b) => a.position - b.position).map(option => ({
                    position: option.position,
                    label: ""
                }))
            }
        ])
    }

    const deleteRow = (position: number) => {
        setValues(values.filter(value => value.position !== position).map((value, index) => ({ ...value, position: index + 1 })))
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center">
                <Label htmlFor={name}>{label} {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                <div className="w-fir flex items-center justify-between gap-1 pb-2">
                    {!disabled && (
                        <>
                            {!isViewer &&
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addRow}
                                >
                                    <Plus />
                                    Add Row
                                </Button>}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsViewer(prev => !prev)}
                            >
                                {isViewer ?
                                    <>
                                        <Pen />
                                        Edit
                                    </>
                                    :
                                    <>
                                        <Eye />
                                        View
                                    </>
                                }
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <div className={`overflow-hidden rounded-xl border ${isPreview ? "bg-accent dark:bg-input/30" : "bg-muted/80 dark:bg-input/20"}`}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            {selectOptions.sort((a, b) => a.position - b.position).map(option => (
                                <TableHead key={option.value}>
                                    {option.text_label}
                                </TableHead>
                            ))}
                            {!isViewer && <TableCell className="text-center font-semibold">Actions</TableCell>}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-black/70 dark:text-white/60">
                        {values.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={selectOptions.length + 2} className="text-center py-6">
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                        {values.map((row) => (
                            <TableRow key={row.position}>
                                <TableCell>{row.position}</TableCell>
                                {row.column.map((item) => (
                                    <TableCell key={item.position}>
                                        {isViewer
                                            ? item.label
                                            : <Input
                                                value={item.label}
                                                disabled={disabled}
                                                onChange={e => handleInputChange(row.position, item.position, e.target.value)}
                                                className="text-foreground bg-background dark:bg-background"
                                            />
                                        }
                                    </TableCell>
                                ))}
                                {!isViewer && (
                                    <TableCell className="flex gap-2 justify-end">
                                        <AlertDialog>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                type='button'
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive dark:text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>Delete Row {row.position}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Row</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete row {row.position}?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteRow(row.position)}
                                                        className="bg-destructive text-white hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

FormTable.displayName = "FormTable";

export default FormTable;