import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth, type RegisterDataState } from "@/store/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { genderTypes } from "@/types/constants";

export default function MapShopLoginForm() {
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { signup, loading, user } = useAuth()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // Manually assign user_type = 4 (Stakeholder) as Default
    const data: RegisterDataState = {
      ...rawData,
      user_type: 4, // Stakeholder
    } as RegisterDataState;

    try {
      await signup(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.detail || "Something went wrong");
    }
  };

  useEffect(() => {
    if (user) navigate(`/portal`, { replace: true });
  }, [navigate, user])

  if (user) return null
  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Enter First Name"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Enter Last Name"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="regEmail">Email Address</Label>
        <Input
          id="regEmail"
          type="email"
          name="email"
          placeholder="your.email@example.com"
          required
          disabled={loading}
        />
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+255 XXX XXX XXX"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select required disabled={loading} name="gender">
            <SelectTrigger id="gender" className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(genderTypes).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">
          Company (Optional)
        </Label>
        <Input
          id="company"
          name="company"
          placeholder="Company/Organization/Institution name"
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        className="w-full gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            Create Account
          </>
        )}
      </Button>

      <div className="flex justify-end">
        <Link
          to='/auth/signin'
          className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <User className="h-3 w-3" />
          Already have an account? Signin
        </Link>
      </div>
    </form>
  );
}
