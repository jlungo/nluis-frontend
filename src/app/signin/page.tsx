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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  Mail,
} from "lucide-react";
import nlupcLogo from "@/assets/nluis.png";
import tanzaniaCoatOfArms from "@/assets/bibi_na_bwana.png";
import { useNavigate } from "react-router";
import { useAuth, type RegisterDataState } from "@/store/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { genderTypes } from "@/types/constants";

export default function MapShopLoginForm() {
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { signup, login, loading, user } = useAuth()

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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as unknown as RegisterDataState;

    try {
      await signup(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.detail || "Something went wrong");
    }
  };

  const onCancel = () => {
    navigate('/mapshop', { replace: true })
  };

  const onGuestContinue = () => {
    navigate('/mapshop', { replace: true })
  }

  useEffect(() => {
    if (user) navigate(`/portal`, { replace: true });
  }, [navigate, user])

  if (user) return null
  return (
    <div className="w-full max-w-lg">
      {/* Official MapShop Header */}
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
          <ShoppingBag className="h-4 w-4 mr-2" />
          Tanzania MapShop Portal
        </Badge>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Customer Access Portal
        </h1>
        <p className="text-muted-foreground">
          Access your account to purchase official land use maps
          <br />
          or continue as guest to browse our catalog
        </p>
      </div>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            MapShop Access
          </CardTitle>
          <CardDescription>
            Login to your buyer account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="login" className="rounded-full cursor-pointer">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-full cursor-pointer">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-6">
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
                      Login to MapShop
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Credentials for Buyers */}
              {/* <div className="mt-6 pt-4 border-t border-border">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                      <CheckCircle className="h-4 w-4" />
                      Demo Buyer Accounts
                    </div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>
                        <strong>Individual Buyer:</strong> john.buyer@gmail.com
                        / buyer123
                      </div>
                      <div>
                        <strong>Company Buyer:</strong>{" "}
                        procurement@company.co.tz / company123
                      </div>
                      <div>
                        <strong>NGO Buyer:</strong> maps@ngo.org / ngo123
                      </div>
                      <div>
                        <strong>Academic Buyer:</strong>{" "}
                        research@university.ac.tz / uni123
                      </div>
                    </div>
                  </div>
                </div> */}
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter First Name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter Last Name"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regEmail">Email Address</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+255 XXX XXX XXX"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select required disabled={loading} name="gender">
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(genderTypes).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company (Optional)
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Company/Organization/Institution name"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regPassword">Password</Label>
                  <Input
                    id="regPassword"
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Create MapShop Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="space-y-3 mt-6 pt-4 border-t border-border">
            <Button
              onClick={onGuestContinue}
              variant="outline"
              className="w-full gap-2"
              disabled={loading}
            >
              <ShoppingBag className="h-4 w-4" />
              Continue as Guest
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full gap-2 text-muted-foreground"
              onClick={onCancel}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to MapShop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benefits of Creating Account */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-medium text-center">
          Benefits of Creating an Account
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-700 rounded-lg p-3 text-center">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mx-auto mb-1" />
            <div className="text-green-700 font-medium">Purchase History</div>
            <div className="text-green-600">Track all your map purchases</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-center">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-500 mx-auto mb-1" />
            <div className="text-blue-700 font-medium">Re-download Maps</div>
            <div className="text-blue-600">
              Access previously purchased files
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-700 rounded-lg p-3 text-center">
            <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-500 mx-auto mb-1" />
            <div className="text-purple-700 font-medium">Faster Checkout</div>
            <div className="text-purple-600">
              Save payment and billing info
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 text-center">
            <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-500 mx-auto mb-1" />
            <div className="text-orange-700 font-medium">Order Tracking</div>
            <div className="text-orange-600">Monitor hardcopy deliveries</div>
          </div>
        </div>
      </div>

      {/* Government Footer */}
      <div className="text-center mt-8 space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <img src={tanzaniaCoatOfArms} alt="Tanzania" className="h-4 w-4" />
          <span>Official Government MapShop</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Ministry of Lands, Housing and Human Settlements Development
        </p>
      </div>
    </div>
  );
}
