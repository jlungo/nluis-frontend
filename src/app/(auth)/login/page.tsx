import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/nlus.png';
import { useNavigate } from 'react-router';

export default function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // const success = onLogin(email, password);
            // if (!success) {
            //     setError('Invalid email or password');
            // }
        } catch (err) {
            console.log(err)
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const onCancel = () => {
        navigate(-1)
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="p-0.5 mb-4 w-fit mx-auto rounded-full bg-primary/10">
                        <img src={logo} alt="Tanzania National Land Use Planning Commission" className="h-28 w-28 ml-1.5" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary mb-2">NLUIS Login</h1>
                    <p className="text-gray-600">National Land Use Information System</p>
                </div>

                <Card className="shadow-lg dark:shadow-none border-0 dark:border">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-center text-primary">Access Your Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </Button>
                            </div>
                        </form>
                        {/* <div className="mt-6 text-center">
                            <div className="text-sm bg-primary/20 p-3 rounded-lg">
                                <p className="text-foreground font-medium mb-1">Demo Access</p>
                                <p className="text-muted-foreground">Use any email and password to access the system</p>
                            </div>
                        </div> */}
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} National Land Use Planning Commission, Tanzania
                    </p>
                </div>
            </div>
        </div>
    );
}