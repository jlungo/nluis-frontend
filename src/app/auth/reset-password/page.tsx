import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Key,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import nlupcLogo from "@/assets/nluis.png";
import tanzaniaCoatOfArms from "@/assets/bibi_na_bwana.png";
import { useNavigate } from 'react-router';

interface ResetPasswordProps {
  resetToken?: string;
}

export default function ResetPassword({
  resetToken = ''
}: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validatePassword = (pwd: string) => {
    const errors = [];
    if (pwd.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('one lowercase letter');
    if (!/\d/.test(pwd)) errors.push('one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('one special character');
    return errors;
  };

  const handleResetPassword = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors({
        password: `Password must contain ${passwordErrors.join(', ')}`
      });
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setErrors({
        confirmPassword: 'Passwords do not match'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Password reset completed with token:', resetToken);
      
      setShowSuccess(true);
      toast.success('Password reset successfully!');
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        onPasswordReset();
      }, 3000);
      
    } catch (error) {
      setErrors({
        general: 'Failed to reset password. Please try again.'
      });
      toast.error('Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordReset = () => {
    navigate('/auth/signin', { replace: true })
  }

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
                <CheckCircle className="h-3 w-3 mr-1" />
                Password Updated
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-green-800">Password Reset Complete!</h1>
              <p className="text-base text-muted-foreground">
                Your password has been successfully updated
              </p>
            </div>
          </div>

          {/* Success Card */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="px-8 py-8">
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your password has been changed. You will be redirected to the login page shortly.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-center">
                <Button onClick={onPasswordReset} className="gap-2 h-12">
                  <ArrowRight className="h-4 w-4" />
                  Continue to Login
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
              Ministry of Lands, Housing and Human Settlements Development
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
              <Lock className="h-3 w-3 mr-1" />
              Create New Password
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Set New Password</h1>
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
              Set New Password
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your new password must be secure and different from previous passwords
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({...errors, password: undefined});
                    }}
                    disabled={isLoading}
                    className={`h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({...errors, confirmPassword: undefined});
                    }}
                    disabled={isLoading}
                    className={`h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <Alert>
                <Key className="h-4 w-4" />
                <AlertTitle>Password Requirements</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>At least 8 characters long</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (!@#$%^&*)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleResetPassword} 
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full h-12 gap-2 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    disabled={isLoading}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
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
            After resetting your password, you'll be redirected to the login page to sign in with your new credentials.
          </p>
        </div>
      </div>
  );
}