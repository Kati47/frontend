"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    try {
      const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login failed:", errorText);
        setErrorMessage("Invalid email or password. Please try again.");
        return;
      }

      const data = await response.json();
      const token = data.token;
      
      // JWT tokens consist of three parts: header.payload.signature
      try {
        // Extract the payload (middle part) of the JWT
        const payload = token.split('.')[1];
        // Base64 decode and parse as JSON
        const decoded = JSON.parse(atob(payload));
        
        // Extract userId - based on your middleware, it might be either id or userId
        const userId = decoded.id || decoded.userId;
        
        console.log("Extracted from token:", decoded);
        console.log("Using userId:", userId);
        
        if (!userId) {
          throw new Error("No user ID found in token");
        }
        
        // Store userId and token
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        
        // Verify storage worked
        console.log("Stored in localStorage:", { 
          token: localStorage.getItem("token"),
          userId: localStorage.getItem("userId")
        });

        console.log("Login successful, redirecting...");
        router.push("/shop");
        
      } catch (tokenError) {
        console.error("Failed to process token:", tokenError);
        setErrorMessage("Authentication error. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-amber-50 filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-sky-50 filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/2"></div>
      </div>
      
      <div className="relative flex justify-center items-center min-h-screen px-4 sm:px-6">
        {/* Main content container */}
        <div className="relative w-full max-w-5xl">
          {/* Card with enhanced shadow */}
          <div className="flex flex-col lg:flex-row rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] bg-white overflow-hidden hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)] transition-shadow duration-300">
            {/* Image section */}
            <div className="lg:w-[42%] relative z-10">
              <div className="h-48 sm:h-64 lg:h-full relative rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
                {/* Image container */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src="/picture (1).jpg"
                    alt="Fashion boutique"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transform hover:scale-105 transition-transform duration-2000 ease-out"
                    priority
                    style={{ objectPosition: '25% center' }} 
                  />
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 to-slate-800/60"></div>
                
                {/* Content over image */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 text-white">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-md">
                      StyleShop
                    </h1>
                    <p className="mt-2 text-sm max-w-xs opacity-90 drop-shadow-md">
                      Discover the perfect blend of style and comfort
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <blockquote className="text-xl font-light italic drop-shadow-md">
                      "Elegance is not standing out, but being remembered."
                    </blockquote>
                    <p className="mt-1 font-medium drop-shadow-md">— Giorgio Armani</p>
                  </div>
                </div>
                
                {/* Curved edge - CSS approach */}
                <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-[100px] pointer-events-none">
                  <div 
                    className="absolute inset-0 bg-white" 
                    style={{ 
                      clipPath: "path('M0,0 C60,30 100,50 0,100')",
                      WebkitClipPath: "path('M0,0 C60,30 100,50 0,100')" 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Form section */}
            <div className="lg:w-[58%] p-6 sm:p-8 lg:p-10 flex items-center rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none">
              <div className="w-full max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Sign in to your account to continue your styling journey
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <Label 
                        htmlFor="email" 
                        className="text-sm font-medium text-slate-700 mb-1 block"
                      >
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full rounded-md border-slate-200 bg-white px-3.5 py-2 text-slate-800 shadow-sm hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label 
                          htmlFor="password" 
                          className="text-sm font-medium text-slate-700"
                        >
                          Password
                        </Label>
                        <Link 
                          href="/forgot-password" 
                          className="text-xs font-medium text-sky-600 hover:text-sky-800 transition"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="block w-full rounded-md border-slate-200 bg-white px-3.5 py-2 text-slate-800 shadow-sm hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4 text-slate-500" /> : 
                            <Eye className="h-4 w-4 text-slate-500" />
                          }
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Error message */}
                  {errorMessage && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-100">
                      <p className="text-sm text-red-600 font-medium text-center">
                        {errorMessage}
                      </p>
                    </div>
                  )}
                  
                  {/* Submit button */}
                  <Button
                    type="submit"
                    className="group relative flex w-full justify-center rounded-md bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                  
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-slate-500">or continue with</span>
                    </div>
                  </div>
                  
                  {/* Social login buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="group flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all duration-200"
                    >
                      <svg className="h-5 w-5 mr-2 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"/>
                      </svg>
                      Guest
                    </button>
                    <button
                      type="button"
                      className="group flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all duration-200"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Google
                    </button>
                  </div>
                  
                  {/* Sign up link */}
                  <div className="text-center">
                    <p className="text-slate-600 text-sm mt-5">
                      Don't have an account?{" "}
                      <Link 
                        href="/register" 
                        className="font-medium text-sky-600 hover:text-sky-800 transition"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
