// src/components/users/UserCreateDialog.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Send, UserPlus } from "lucide-react";
import { genderTypes, userTypes } from "@/types/constants";
import { toast } from "sonner";
import { CreateUserPayloadI } from "@/types/users";
import { useCreateUserMutation } from "@/queries/useUsersQuery";
import { OrganizationI } from "@/types/organizations";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  roles: { id: string; name: string }[];
  onSuccess?: () => void;
  organizations: OrganizationI[];
};

export default function UserCreateDialog({ open, onOpenChange, roles, onSuccess, organizations }: Props) {
  const [form, setForm] = useState<CreateUserPayloadI>({
    first_name: "", last_name: "", email: "", phone: "", roleId: "", organization: "", gender: 0, user_type: 0,
  });
  const [err, setErr] = useState<string | null>(null);
  const createUser = useCreateUserMutation();

  const submit = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.roleId || !form.gender || !form.organization) {
      setErr("Please fill in all required fields"); return;
    }
    setErr(null);
    createUser.mutate(form, {
      onSuccess: () => {
        toast.success("User created and invitation email sent!");
        onSuccess?.();
        onOpenChange(false);
        setForm({ first_name: "", last_name: "", email: "", phone: "", roleId: "", organization: "", gender: 0, user_type: 0 });
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (e: any) => {
        const msg = e?.response?.data?.detail || e?.response?.data?.email?.[0] || e?.response?.data?.phone?.[0] || "Failed to create user.";
        setErr(msg);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Create New User</DialogTitle>
          <DialogDescription>The user will receive an email invitation.</DialogDescription>
        </DialogHeader>

        {err && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{err}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>First Name *</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Enter first name" /></div>
          <div className="space-y-2"><Label>Last Name *</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Enter last name" /></div>
          <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter email" /></div>
          <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Enter Phone Number" /></div>
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
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
            <Label>Organization *</Label>
            <Select value={form.organization} onValueChange={(v) => setForm({ ...form, organization: v })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select organization" /></SelectTrigger>
              <SelectContent>{organizations.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createUser.isPending}>Cancel</Button>
          <Button onClick={submit} className="gap-2" disabled={createUser.isPending}>
            {createUser.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating…</>) : (<><Send className="h-4 w-4" />Create & Send Invitation</>)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
