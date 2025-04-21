"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | "">("");
  
  const checkPasswordStrength = (password: string) => {
    if (!password) return "";
    if (password.length < 8) return "weak";
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length;
    
    if (strength <= 2) return "weak";
    if (strength === 3) return "medium";
    return "strong";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const validateForm = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    
    // Validate password
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return false;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Password reset failed:", errorText);
        setErrorMessage("Failed to reset password. Please try again later.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Password reset successful!");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Error during password reset:", error);
      setErrorMessage("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">StyleShop</h1>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email and create a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                
                <div className="flex gap-1 mt-1">
                  <div className={`h-1 flex-1 rounded-full ${
                    passwordStrength === "weak" ? "bg-destructive" : "bg-muted"
                  }`}></div>
                  <div className={`h-1 flex-1 rounded-full ${
                    passwordStrength === "medium" || passwordStrength === "strong" ? "bg-amber-500" : "bg-muted"
                  }`}></div>
                  <div className={`h-1 flex-1 rounded-full ${
                    passwordStrength === "strong" ? "bg-emerald-500" : "bg-muted"
                  }`}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {passwordStrength === "weak" && "Weak - Use at least 8 characters with uppercase, lowercase, numbers and symbols"}
                  {passwordStrength === "medium" && "Medium - Add more variety for a stronger password"}
                  {passwordStrength === "strong" && "Strong password"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
              {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}