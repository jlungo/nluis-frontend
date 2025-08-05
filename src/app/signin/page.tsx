import { useState } from "react";
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

export default function MapShopLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Registration form state
  const [regData, setRegData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const success = true;

    if (!success) {
      setError("Invalid credentials. Please check your email and password.");
    }

    setIsLoading(false);

    navigate("/portal");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Auto-login after registration
    const success = true;

    if (!success) {
      setError("Registration failed. Please try again.");
    }

    setIsLoading(false);

    navigate("/portal");
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center p-4">
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      disabled={isLoading}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isLoading || !email || !password}
                  >
                    {isLoading ? (
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={regData.firstName}
                        onChange={(e) =>
                          setRegData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="John"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={regData.lastName}
                        onChange={(e) =>
                          setRegData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Doe"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regEmail">Email Address</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      value={regData.email}
                      onChange={(e) =>
                        setRegData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="your.email@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={regData.phone}
                      onChange={(e) =>
                        setRegData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="+255 XXX XXX XXX"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">
                      Organization (Optional)
                    </Label>
                    <Input
                      id="organization"
                      value={regData.organization}
                      onChange={(e) =>
                        setRegData((prev) => ({
                          ...prev,
                          organization: e.target.value,
                        }))
                      }
                      placeholder="Company/Institution name"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Password</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      value={regData.password}
                      onChange={(e) =>
                        setRegData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Create a password"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={regData.confirmPassword}
                      onChange={(e) =>
                        setRegData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={
                      isLoading ||
                      !regData.email ||
                      !regData.password ||
                      !regData.firstName
                    }
                  >
                    {isLoading ? (
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
                // onClick={onGuestContinue}
                variant="outline"
                className="w-full gap-2"
                disabled={isLoading}
              >
                <ShoppingBag className="h-4 w-4" />
                Continue as Guest
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2 text-muted-foreground"
                onClick={onCancel}
                disabled={isLoading}
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
    </div>
  );
}
