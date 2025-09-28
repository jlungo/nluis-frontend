import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, AlertCircle, Key, Lock } from 'lucide-react';
import tanzaniaCoatOfArms from '@/assets/bibi_na_bwana.png';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth, type VerifyEmailResponse } from '@/store/auth';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, verifyEmailTokenToken } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid verification link');
        setIsLoading(false);
        return;
      }

      try {
        const response: VerifyEmailResponse = await verifyEmailTokenToken(token);

        if (response?.uid64 && response?.token) {
          setIsValidToken(true);
          toast.success('Email verified successfully. Redirecting to password setup...');

          setTimeout(() => {
            navigate(`/auth/reset-password/${response.uid64}/${response.token}`, { replace: true });
          }, 1500);
        } else {
          throw new Error('Verification response is missing expected data.');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const detail = error?.detail || 'Invalid or expired verification link';
        setError(detail);
        toast.error(detail);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token, navigate, verifyEmailTokenToken]);

  const onBackToLogin = () => {
    navigate('/auth/signin', { replace: true });
  };

  if (isLoading && !user) {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
              <Key className="h-8 w-8 text-blue-600 dark:text-blue-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Verifying Reset Link...</h1>
          <p className="text-base text-muted-foreground">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    );
  }

  if (!isValidToken && !user) {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
          </div>

          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-500 border-red-200 dark:border-red-900 px-3 py-1">
              <Lock className="h-3 w-3 mr-1" />
              Invalid Email Verification Link
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-red-800">Email Verification Failed</h1>
            <p className="text-base text-muted-foreground">
              {error || 'The verification link is invalid or has expired.'}
            </p>
          </div>
        </div>

        <Card>
          <CardContent>
            <Alert className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 mb-6">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
              <AlertTitle className="text-red-800 dark:text-red-700">Verification Failed</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-800">
                Please request a new password reset link or contact system administrator.
              </AlertDescription>
            </Alert>

            <Button onClick={onBackToLogin} className="w-full gap-2">
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

  return null;
}
