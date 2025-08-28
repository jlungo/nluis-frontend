import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Lock,
  AlertCircle,
  Mail,
  Key,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/store/auth";

export default function MapShopLoginForm() {
  const [error, setError] = useState("");
  const { login, loading } = useAuth()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const { email, password } = Object.fromEntries(formData.entries()) as {
      email: string;
      password: string;
    };

    try {
      await login(email, password)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.detail || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="your.email@example.com"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="flex items-center gap-2"
        >
          <Lock className="h-4 w-4" />
          Password
        </Label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          required
          disabled={loading}
        />
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <Link
          to='/auth/forgot-password'
          className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Key className="h-3 w-3" />
          Forgot your password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            Signin
          </>
        )}
      </Button>

      <div className="flex justify-end">
        <Link
          to='/auth/signup'
          className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <User className="h-3 w-3" />
          Don't have account? Register
        </Link>
      </div>
    </form>
  );
}
