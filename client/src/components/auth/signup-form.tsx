import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, UserPlus, Gamepad2, Smartphone, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export default function SignupForm({ onSwitchToLogin, onClose }: SignupFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string }) => {
      return await apiRequest("POST", "/api/auth/signup", userData);
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/auth/user"], data.user || data);
      toast({
        title: "Welcome to GameWin! 🎮",
        description: "Your account has been created successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
  };

  const passwordStrength = formData.password.length >= 6 ? "strong" : formData.password.length >= 3 ? "medium" : "weak";

  return (
    <Card className="premium-glass border-border w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple to-blue flex items-center justify-center">
          <Gamepad2 className="text-white text-2xl" />
        </div>
        <CardTitle className="text-2xl font-bold">Join GameWin</CardTitle>
        <CardDescription className="text-muted-foreground">
          Create your account and start winning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="bg-secondary border-border text-white mobile-optimized"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-secondary border-border text-white mobile-optimized"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="bg-secondary border-border text-white pr-10 mobile-optimized"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary mobile-optimized"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.password && (
              <div className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  passwordStrength === "strong" ? "bg-success" : 
                  passwordStrength === "medium" ? "bg-warning" : "bg-danger"
                }`}></div>
                <span className={
                  passwordStrength === "strong" ? "text-success" : 
                  passwordStrength === "medium" ? "text-warning" : "text-danger"
                }>
                  {passwordStrength === "strong" ? "Strong password" : 
                   passwordStrength === "medium" ? "Medium strength" : "Weak password"}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="bg-secondary border-border text-white pr-10 mobile-optimized"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary mobile-optimized"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className="flex items-center space-x-2 text-xs">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <Check className="h-3 w-3 text-success" />
                    <span className="text-success">Passwords match</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-danger"></div>
                    <span className="text-danger">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full gaming-button h-12 text-base font-bold"
          >
            {signupMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 border-border hover:bg-secondary mobile-optimized"
          disabled
        >
          <Smartphone className="mr-2 h-5 w-5" />
          <span className="font-medium">Phone Number (Coming Soon)</span>
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-blue font-medium underline mobile-optimized"
            >
              Sign in here
            </button>
          </p>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our{" "}
          <button className="text-primary hover:text-blue underline mobile-optimized">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="text-primary hover:text-blue underline mobile-optimized">
            Privacy Policy
          </button>
        </div>
      </CardContent>
    </Card>
  );
}