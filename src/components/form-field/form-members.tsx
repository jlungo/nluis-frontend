import { MultiSelect } from "../multiselect";
import { useUsersList } from "@/queries/useUsersQuery";
import { Asterisk, Trash2, UserPlus } from "lucide-react";
import { Label } from "../ui/label";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Specializations } from "@/types/constants";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useAuth } from "@/store/auth";

export interface MembersI {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
    title: string | null;
    specialization: number | null;
}

type FormMembersProps = {
    label: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
    value?: MembersI[];
    placeholder?: string;
    setValue?: (value: MembersI[]) => void;
    fullWidth?: boolean
};

const FormMembers: React.FC<FormMembersProps> = ({ label, required, disabled, placeholder, fullWidth }) => {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const [accounts, setAccounts] = useState<MembersI[]>([])
    const [account, setAccount] = useState<MembersI | null>(null)

    const { user } = useAuth()

    const { data: users, isLoading } = useUsersList({
        page: 1,
        page_size: 10,
        keyword: search,
        // role: filters.role ? filters.role : undefined,
        organization: user?.organization?.id,
        is_verified: "1",
    });

    const handleAddMember = () => {
        setAccounts(prev => {
            if (account) return [...prev, account]
            else return [...prev]
        })
        setTimeout(() => {
            setAccount(null)
            setOpen(false)
        }, 0)
    }

    const handleDeleteMember = useCallback((id: string) => {
        setAccounts((prev) => {
            return prev.filter(item => item.id !== id)
        })
    }, [setAccounts])

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-sm md:text-base flex items-center gap-2 font-semibold">{label} {required ? <Asterisk className="text-destructive h-3 w-3 mb-1" /> : null}</p>
                    <p className="text-muted-foreground text-xs md:text-sm">{placeholder}</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" size="sm" disabled={disabled}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </DialogTrigger>

                    <DialogContent aria-describedby='add-members'>
                        <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Add member with details and role.
                        </DialogDescription>
                        <div className="w-full space-y-2">
                            <Label htmlFor="account">User Account {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                            <MultiSelect
                                title={label}
                                data={users ? users.items.filter(user => !accounts.some(acc => acc.id === user.id)).map(user => ({
                                    label: `${user.first_name} ${user.last_name} (${user.email})`,
                                    value: user.id,
                                })) : []}
                                selected={account ? [account.id] : []}
                                setSelected={e => {
                                    if (e.length === 0) setAccount(null)
                                    else {
                                        const acc = users?.items.find(user => user.id === e[0])
                                        if (!acc) return
                                        setAccount({
                                            id: acc.id,
                                            email: acc.email,
                                            first_name: acc.first_name,
                                            last_name: acc.last_name,
                                            role: acc?.role,
                                            title: null,
                                            specialization: null
                                        })
                                    }
                                }}
                                isLoading={isLoading}
                                search={search}
                                setSearch={setSearch}
                                mutedColor={!fullWidth}
                                portal={false}
                            />
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="title">Title {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                            <Input
                                id="title"
                                placeholder="Add member title"
                                disabled={!account || disabled}
                                value={account && account?.title ? account.title : undefined}
                                onChange={(e) => setAccount(prev => {
                                    if (!prev) return null
                                    prev.title = e.target.value
                                    return prev
                                })}
                            />
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="specialization">Specialization {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                            <Select
                                name="specialization"
                                disabled={disabled || !account}
                                value={account && account?.specialization ? `${account.specialization}` : undefined}
                                onValueChange={(e) => setAccount(prev => {
                                    if (!prev) return null
                                    prev.specialization = Number(e)
                                    return prev
                                })}
                            >
                                <SelectTrigger className={"bg-accent w-full"}>
                                    <SelectValue placeholder={"Select specialization area"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(Specializations).map(([key, value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddMember} disabled={disabled || !account} type="button" className="w-full">
                            Add Member
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                columns={columns}
                data={accounts}
                shadowed={false}
                enableGlobalFilter={false}
                showPagination={false}
                emptyText="No member(s) added"
                rowActions={(row) => <Button type="button" variant="ghost" onClick={() => handleDeleteMember(row.id)}><Trash2 /></Button>}
            />
        </div>
    )
}

FormMembers.displayName = "FormMembers";

export default FormMembers;

export const columns: ColumnDef<MembersI, unknown>[] = [
    {
        id: "first_name",
        accessorKey: "first_name",
        header: () => <div className="flex items-center gap-2">First Name</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.first_name}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "last_name",
        accessorKey: "last_name",
        header: () => <div className="flex items-center gap-2">Last Name</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.last_name}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "email",
        accessorKey: "email",
        header: () => <div className="flex items-center gap-2">Email</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.email}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "role",
        accessorKey: "role",
        header: () => <div className="flex items-center gap-2">Role</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.role}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "title",
        accessorKey: "title",
        header: () => <div className="flex items-center gap-2">Title/Role</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.title}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "specialization",
        accessorKey: "specialization",
        header: () => <div className="flex items-center gap-2">Specialization Area</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.specialization ? Specializations[row.original.specialization] : ''}
            </div>
        ),
        enableSorting: true,
    },
];
