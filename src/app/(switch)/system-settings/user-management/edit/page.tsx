// src/components/users/UserEditDialog.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Edit, Loader2 } from "lucide-react";
import type { UserI } from "@/types/users";
import { useUpdateUserMutation } from "@/queries/useUsersQuery";
import type { OrganizationI } from "@/types/organizations";
import type { LocalityI } from "@/types/projects";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { genderTypes, userTypes } from "@/types/constants";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserI | null;
  roles: { id: string; name: string }[];
  regions: LocalityI[];
  organizations: OrganizationI[];
};

export default function UserEditDialog({ open, onOpenChange, user, roles, organizations }: Props) {
  const [form, setForm] = useState<UserI | any>({
    id: user?.id,
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role_id || "",
    gender: user?.gender || 1,
    user_type: user?.user_type || 1,
    organization: user?.organization,
  });
  const { mutateAsync, isPending } = useUpdateUserMutation();

  useEffect(() => {
    setForm({
      id: user?.id,
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role_id || "",
      gender: user?.gender || 1,
      user_type: user?.user_type || 1,
      organization: user?.organization,
    })
  }, [user])

  if (!form) return null;

  const save = () => {
    try {
      toast.promise(mutateAsync(form, { onSuccess: () => onOpenChange(false) }), {
        loading: "Updating user...",
        success: 'User updated successfully',
        error: (e: AxiosError) => {
          const detail =
            e?.response?.data &&
              typeof e.response.data === "object" &&
              "detail" in e.response.data
              ? (e.response.data as { detail?: string }).detail
              : undefined;
          return `${detail || "An error occured, check your values!"}`;
        }
      })
    } catch (error) {
      console.log(error)
      toast.error("Failed to create workflow!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5" /> Edit User Account</DialogTitle>
          <DialogDescription>Update user account information and permissions.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>First Name *</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Enter first name" /></div>
          <div className="space-y-2"><Label>Last Name *</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Enter last name" /></div>
          <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter email" /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Enter Phone Number" /></div>
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={String(form.role)} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {roles.length ? roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>) : <SelectItem value="no-roles" disabled>No roles</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender *</Label>
            <Select value={String(form.gender)} onValueChange={(v) => setForm({ ...form, gender: parseInt(v) })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>{Object.entries(genderTypes).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>User Type *</Label>
            <Select value={String(form.user_type)} onValueChange={(v) => setForm({ ...form, user_type: parseInt(v) })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select user type" /></SelectTrigger>
              <SelectContent>{Object.entries(userTypes).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Select value={form.organization ?? ""} onValueChange={(v) => setForm({ ...form, organization: v })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select organization" /></SelectTrigger>
              <SelectContent>{organizations.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={save} className="gap-2" disabled={isPending}>
            {isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Updating…</>) : (<><CheckCircle className="h-4 w-4" />Save Changes</>)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
