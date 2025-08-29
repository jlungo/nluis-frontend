import { useState } from 'react';
import {
  Mail,
  CheckCircle,
  Send,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from "react-router";
import nlupcLogo from "@/assets/nluis.png";
import tanzaniaCoatOfArms from "@/assets/bibi_na_bwana.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, requestPasswordReset } = useAuth();

  const handleRequestReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setShowSuccess(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      setError(error.detail || 'Failed to send reset email. Please try again.');
      toast.error(error.detail || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendReset = async () => {
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      toast.success('Password reset email resent!');
    } catch (error: any) {
      setError(error.detail || 'Failed to resend reset email. Please try again.');
      toast.error(error.detail || 'Failed to resend reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const onBackToLogin = () => {
    navigate('/auth/signin', { replace: true });
  };

  if (showSuccess && !user) {
    return (
      <div className="max-w-md w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-950 text-green-800 border-green-200 dark:border-green-800 px-3 py-1">
              <Mail className="h-3 w-3 mr-1" />
              Reset Email Sent
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-green-800 dark:text-green-700">Password Reset Requested!</h1>
            <p className="text-base text-muted-foreground">
              We've sent password reset instructions to your email address
            </p>
          </div>
        </div>

        {/* Success Card */}
        <Card className="shadow-lg border-0 bg-white py-0 md:py-0">
          <CardContent>
            <Alert className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 mb-6">
              <Mail className="h-4 w-4 text-green-600 dark:text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-600">Check Your Email</AlertTitle>
              <AlertDescription className="text-green-700">
                Click the reset password link in the email we sent to <span className="font-medium">{email}</span> to create a new password.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button onClick={onBackToLogin} className="w-full h-12 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>

              <Button
                variant="outline"
                onClick={handleResendReset}
                disabled={isLoading}
                className="w-full h-12 gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Resend Reset Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center">
              <img src={tanzaniaCoatOfArms} alt="Tanzania" className="h-4 w-4" />
            </div>
            <span>United Republic of Tanzania</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  if (user) return null
  return (
    <div className="max-w-md w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center items-center gap-4 mb-6">
          <img
            src={nlupcLogo}
            alt="NLUPC Logo"
            className="h-32 w-32 object-contain"
          />
        </div>

        <div className="flex justify-center">
          <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-950 text-blue-800 border-blue-300 dark:border-blue-800 px-3 py-1">
            <Key className="h-3 w-3 mr-1" />
            Password Recovery
          </Badge>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Reset Your Password</h1>
          <p className="text-base text-muted-foreground">
            National Land Use Information System
          </p>
        </div>
      </div>

      {/* Reset Form Card */}
      <Card className="shadow-lg border-0 py-0 md:py-0">
        <CardHeader className="text-center py-6">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            Password Reset Request
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            We'll send reset instructions to your registered email address
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Official Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@nlupc.go.tz"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>

            {/* Info Alert */}
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>How This Works</AlertTitle>
              <AlertDescription>
                We'll send a secure link to your email address. Click the link to create a new password for your account.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRequestReset}
                disabled={isLoading || !email}
                className="w-full h-12 gap-2 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending Reset Email...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Reset Instructions
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/auth/signin"
                  className={cn(buttonVariants({ variant: 'ghost' }), "text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto transition-colors")}
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
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

        <p className="text-xs text-muted-foreground">
          © 2025 National Land Use Planning Commission. All rights reserved.
        </p>

        <p className="text-xs text-muted-foreground">
          Remember your password? <Link to="/auth/signin" className="font-semibold text-base md:text-lg text-primary hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}