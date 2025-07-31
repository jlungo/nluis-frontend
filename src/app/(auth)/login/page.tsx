import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/react.svg';
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
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <img
                        src={logo}
                        alt="Tanzania National Land Use Planning Commission"
                        className="w-20 h-20 object-contain mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold text-primary mb-2">NLUIS Login</h1>
                    <p className="text-gray-600">National Land Use Information System</p>
                </div>

                <Card className="shadow-lg border-0">
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
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </Button>
                            </div>
                        </form>
                        {/* <div className="mt-6 text-center">
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <p className="font-medium mb-1">Demo Access</p>
                                <p>Use any email and password to access the system</p>
                            </div>
                        </div> */}
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        &copy; 2024 National Land Use Planning Commission, Tanzania
                    </p>
                </div>
            </div>
        </div>
    );
}