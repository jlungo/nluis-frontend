import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Key,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import nlupcLogo from "@/assets/nluis.png";
import tanzaniaCoatOfArms from "@/assets/bibi_na_bwana.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/store/auth';

export default function ResetPassword() {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { verifyPasswordResetToken, completePasswordReset } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      if (!uidb64 || !token) {
        setError('Invalid reset link');
        setIsLoading(false);
        return;
      }

      try {
        await verifyPasswordResetToken(uidb64, token);
        setIsValidToken(true);
      } catch (error: any) {
        setError(error.detail || 'Invalid or expired reset link');
        toast.error(error.detail || 'Invalid or expired reset link');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [uidb64, token, verifyPasswordResetToken]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !uidb64 || !token) return;

    setIsResetting(true);
    try {
      await completePasswordReset(uidb64, token, password);
      toast.success('Password reset successfully!');
      navigate('/auth/signin', { replace: true });
    } catch (error: any) {
      setError(error.detail || 'Failed to reset password. Please try again.');
      toast.error(error.detail || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const onBackToLogin = () => {
    navigate('/auth/signin', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Key className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Verifying Reset Link...</h1>
          <p className="text-base text-muted-foreground">
            Please wait while we verify your password reset link
          </p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 px-3 py-1">
              <Lock className="h-3 w-3 mr-1" />
              Invalid Reset Link
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-red-800">Password Reset Failed</h1>
            <p className="text-base text-muted-foreground">
              {error || 'The password reset link is invalid or has expired.'}
            </p>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="px-8 py-8">
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Reset Link Invalid</AlertTitle>
              <AlertDescription className="text-red-700">
                Please request a new password reset link from the forgot password page.
              </AlertDescription>
            </Alert>

            <Button onClick={onBackToLogin} className="w-full h-12 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center">
              <img src={tanzaniaCoatOfArms} alt="Tanzania" className="h-4 w-4" />
            </div>
            <span>United Republic of Tanzania</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center space-y-6">
        <div className="flex justify-center items-center gap-4 mb-6">
          <img
            src={nlupcLogo}
            alt="NLUPC Logo"
            className="h-32 w-32 object-contain"
          />
        </div>
        
        <div className="flex justify-center">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
            <Key className="h-3 w-3 mr-1" />
            Create New Password
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Set a New Password</h1>
          <p className="text-base text-muted-foreground">
            National Land Use Information System
          </p>
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="text-center pb-6 pt-8">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            Password Reset
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Create a strong new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Reset Link Verified</AlertTitle>
              <AlertDescription>
                You can now create a new password for your account.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isResetting}
                className="w-full h-12 gap-2"
              >
                {isResetting ? (
                  <>
                    <Key className="h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>

              <Button
                onClick={onBackToLogin}
                variant="outline"
                className="w-full h-12 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center">
            <img src={tanzaniaCoatOfArms} alt="Tanzania" className="h-4 w-4" />
          </div>
          <span>United Republic of Tanzania</span>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Ministry of Lands, Housing and Human Settlements Development
        </p>
      </div>
    </div>
  );
}