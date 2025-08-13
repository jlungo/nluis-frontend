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
import { useNavigate } from "react-router";
import nlupcLogo from "@/assets/nluis.png";
import tanzaniaCoatOfArms from "@/assets/bibi_na_bwana.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Badge } from '@/components/ui/badge';

interface ForgotPasswordProps {
  onResetRequested: (email: string) => void;
}

export default function ForgotPassword({
  onResetRequested
}: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      // Simulate API call to request password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Password reset requested for:', email);
      
      setShowSuccess(true);
      toast.success('Password reset email sent!');
      
      // Call parent handler
      onResetRequested(email);
      
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendReset = () => {
    console.log('Resending password reset email to:', email);
    toast.success('Password reset email resent!');
  };

  const onBackToLogin = () => {
    navigate('/auth/signin', { replace: true })
  };

  if (showSuccess) {
    return (
        <div className="max-w-md w-full space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto flex items-center justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                <Mail className="h-3 w-3 mr-1" />
                Reset Email Sent
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-green-800">Password Reset Requested!</h1>
              <p className="text-base text-muted-foreground">
                We've sent password reset instructions to your email address
              </p>
            </div>
          </div>

          {/* Success Card */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="px-8 py-8">
              <Alert className="border-green-200 bg-green-50 mb-6">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Check Your Email</AlertTitle>
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
                  className="w-full h-12 gap-2"
                >
                  <Send className="h-4 w-4" />
                  Resend Reset Email
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
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
              <Key className="h-3 w-3 mr-1" />
              Password Recovery
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Reset Your Password</h1>
            <p className="text-base text-muted-foreground">
              National Land Use Information System
            </p>
            <p className="text-sm text-muted-foreground">
              Tanzania National Land Use Planning Commission
            </p>
          </div>
        </div>

        {/* Reset Form Card */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-6 pt-8">
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
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    disabled={isLoading}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Login
                  </button>
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
            Remember your password? <button onClick={onBackToLogin} className="text-primary hover:underline">Sign in here</button>
          </p>
        </div>
      </div>
  );
}