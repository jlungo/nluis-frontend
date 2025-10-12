import { MultiSelect } from "@/components/multiselect";
import { useUsersList } from "@/queries/useUsersQuery";
import { Asterisk, Trash2, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Specializations } from "@/types/constants";
import { useAuth } from "@/store/auth";
import { columns } from "./columns";
import { DataTable } from "@/components/DataTable";

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

const FormMembers: React.FC<FormMembersProps> = ({ label, value, setValue, required, disabled, placeholder, fullWidth }) => {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
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
        if (account && value && setValue) setValue([...value, account])
        else if (account && (!value || value?.length === 0) && setValue) setValue([account])
        setTimeout(() => {
            setAccount(null)
            setOpen(false)
        }, 0)
    }

    const handleDeleteMember = useCallback((id: string) => {
        if (value && Array.isArray(value) && setValue) {
            const newData = value.filter(item => item.id !== id)
            setValue(newData)
        }
    }, [setValue, value])

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-sm md:text-base flex items-center gap-2 font-semibold">{label} {required ? <Asterisk className="text-destructive h-3 w-3 mb-1" /> : null}</p>
                    <p className="text-muted-foreground text-xs md:text-sm">{placeholder}</p>
                </div>

                {!disabled && <Dialog open={open} onOpenChange={setOpen}>
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
                                data={users ? users.items.filter(user => !value?.some(acc => acc.id === user.id)).map(user => ({
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
                                isSingle
                            />
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="title">Title {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                            <Input
                                id="title"
                                placeholder="Add member title"
                                disabled={!account || disabled}
                                value={account && account?.title ? account.title : undefined}
                                onChange={(e) => setAccount(prev => prev ? { ...prev, title: e.target.value } : null)}
                            />
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="specialization">Specialization {required ? <Asterisk className="text-destructive h-3 w-3" /> : null}</Label>
                            <Select
                                name="specialization"
                                disabled={disabled || !account}
                                value={account && account?.specialization ? `${account.specialization}` : undefined}
                                onValueChange={(e) => setAccount(prev => prev ? { ...prev, specialization: Number(e) } : null)}
                            >
                                <SelectTrigger className={"bg-accent w-full"}>
                                    <SelectValue placeholder={"Select specialization area"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(Specializations).map(([key, value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddMember}
                            className="w-full"
                            disabled={disabled || !account || account.specialization === null || account.title === null}
                        >
                            Add Member
                        </Button>
                    </DialogContent>
                </Dialog>}
            </div>

            <DataTable
                columns={columns}
                data={value || []}
                shadowed={false}
                enableGlobalFilter={false}
                showPagination={false}
                emptyText="No member(s) added"
                rowActions={!disabled ? (row) => <Button type="button" variant="ghost" onClick={() => handleDeleteMember(row.id)}><Trash2 /></Button> : undefined}
            />
        </div>
    )
}

FormMembers.displayName = "FormMembers";

export default FormMembers;