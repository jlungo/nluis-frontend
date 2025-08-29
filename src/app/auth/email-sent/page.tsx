import { useState } from 'react';
import {
  Mail,
  CheckCircle,
  Send,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from "react-router";
import tanzaniaCoatOfArms from "@/assets/bibi_na_bwana.png";
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/store/auth';

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, tempEmail, tempId, requestEmailReset } = useAuth();

  const handleResendReset = async () => {
    setIsLoading(true);
    try {
      if (!tempEmail || !tempId) {
        navigate('/auth/signin', { replace: true })
        return
      }
      await requestEmailReset(tempId);
      toast.success('Email resent!');
    } catch (error: any) {
      toast.error(error.detail || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onBackToLogin = () => {
    navigate('/auth/signin', { replace: true });
  };

  if (!tempEmail || !tempId) {
    navigate('/auth/signin', { replace: false })
    return null
  }

  if (user) return null
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
            Verification Email Sent
          </Badge>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-green-800 dark:text-green-700">Verify Your Account!</h1>
          <p className="text-base text-muted-foreground">
            We've sent account activation instructions to your email address
          </p>
        </div>
      </div>

      {/* Success Card */}
      <Card className="shadow-lg border-0 py-0 md:py-0">
        <CardContent>
          <Alert className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 mb-6">
            <Mail className="h-4 w-4 text-green-600 dark:text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-600">Check Your Email</AlertTitle>
            <AlertDescription className="text-green-700">
              Click the link in the email we sent to <span className="font-medium">{tempEmail}</span> to verify account.
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