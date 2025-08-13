import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, User, Lock, AlertCircle, Key } from "lucide-react";
import nlupcLogo from "@/assets/nluis.png";
import tanzaniaCoatOfArms from "@/assets/bibi_na_bwana.png";
import { useNavigate } from "react-router";
import { useAuth } from "@/store/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login, loading, user } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const onCancel = () => {
    navigate('/', { replace: true });
  };

  const onForgotPassword = () => {
    navigate('/auth/forgot-password', { replace: true })
  }

  useEffect(() => {
    if (user) {
      if (user?.modules && Array.isArray(user.modules) && user.modules.length >= 1)
        navigate("/board", { replace: true });
      else
        // TODO Go to a specific moddule
        navigate(`/portal`, { replace: true });
    }
  }, [navigate, user])

  if (user) return null
  return (
    <div className="w-full max-w-md">
      {/* Official Government Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-6">
          <img
            src={nlupcLogo}
            alt="NLUPC Logo"
            className="h-32 w-32 object-contain"
          />
        </div>

        <Badge
          variant="outline"
          className="text-primary border-primary/30 bg-primary/10 px-4 py-2 mb-4"
        >
          <Shield className="h-4 w-4 mr-2" />
          Official Government System
        </Badge>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          NLUIS Login Portal
        </h1>
        <p className="text-muted-foreground">
          National Land Use Information System
          <br />
          Secure Access for Authorized Personnel
        </p>
      </div>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            System Login
          </CardTitle>
          <CardDescription>
            Enter your official credentials to access the NLUIS platform
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Official Email Address
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@nlupc.go.tz"
                required
                disabled={loading}
                className="transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="transition-colors"
              />
            </div>

            {/* Forgot Password Link */}
            {onForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-primary hover:underline flex items-center gap-1 ml-auto"
                  disabled={loading}
                >
                  <Key className="h-3 w-3" />
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Access NLUIS System
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={onCancel}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-6 pt-4 border-t border-border">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <CheckCircle className="h-4 w-4" />
                  Demo Credentials
                </div>
                <div className="text-xs text-blue-600 space-y-1">
                  <div>
                    <strong>Admin:</strong> admin@nlupc.go.tz / admin123
                  </div>
                  <div>
                    <strong>Planner:</strong> planner@nlupc.go.tz / plan123
                  </div>
                  <div>
                    <strong>Officer:</strong> officer@nlupc.go.tz / off123
                  </div>
                </div>
              </div>
            </div> */}
        </CardContent>
      </Card>

      {/* Government Footer */}
      <div className="text-center mt-8 space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <img src={tanzaniaCoatOfArms} alt="Tanzania" className="h-4 w-4" />
          <span>United Republic of Tanzania</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Ministry of Lands, Housing and Human Settlements Development
        </p>
        <p className="text-xs text-muted-foreground">
          © 2025 National Land Use Planning Commission. All rights reserved.
        </p>
      </div>
    </div>
  );
}
