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

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserI | null;
  roles: { id: string; name: string }[];
  regions: LocalityI[];
  organizations: OrganizationI[];
};

export default function UserEditDialog({ open, onOpenChange, user, roles, regions, organizations }: Props) {
  const [form, setForm] = useState<UserI | null>(user);
  const updateUser = useUpdateUserMutation();

  useEffect(() => setForm(user), [user]);

  if (!form) return null;

  const save = () => updateUser.mutate(form, { onSuccess: () => onOpenChange(false) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5" /> Edit User Account</DialogTitle>
          <DialogDescription>Update user account information and permissions.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>First Name *</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Last Name *</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={form.role ?? ""} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Select value={form.organization ?? ""} onValueChange={(v) => setForm({ ...form, organization: v })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select organization" /></SelectTrigger>
              <SelectContent>{organizations.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location/Region</Label>
            <Select value={form.location ?? ""} onValueChange={(v) => setForm({ ...form, location: v })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateUser.isPending}>Cancel</Button>
          <Button onClick={save} className="gap-2" disabled={updateUser.isPending}>
            {updateUser.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Updating…</>) : (<><CheckCircle className="h-4 w-4" />Save Changes</>)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
