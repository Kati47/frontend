"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL 

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  }, [name, email, phone, password, confirmPassword, agreeTerms]);

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validatePhone = (phoneNumber: string) => {
    // Basic phone validation - allows international formats
    // This regex allows formats like: +1234567890, 123-456-7890, (123) 456-7890, etc.
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
      return false;
    }
    
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers, spaces, parentheses, dashes, and plus sign
    const sanitized = value.replace(/[^\d\s()+\-]/g, '');
    setPhone(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setPasswordError("");
    setPhoneError("");

    const isPasswordValid = validatePassword();
    const isPhoneValid = validatePhone(phone);

    if (!isPasswordValid || !isPhoneValid) {
      console.warn("Validation failed");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("You must agree to the terms and conditions");
      console.warn("User did not agree to terms");
      return;
    }

    try {
      console.log("Sending registration request to:", `${NEXT_PUBLIC_BASE_URL}/register`);
      const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Registration failed:", errorText);
        setErrorMessage("Registration failed. Please check your input and try again.");
        return;
      }

      console.log("Registration successful, redirecting to login page");
      router.push("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("An error occurred. Please try again.");
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
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="johndoe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

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
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+1 (123) 456-7890" 
                  value={phone} 
                  onChange={handlePhoneChange} 
                  required 
                />
                {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
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
                  </Button>
                </div>
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

              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms} 
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)} 
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}