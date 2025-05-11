"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { LanguageSelector } from "@/components/language-selector";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { theme, setTheme } = useTheme(); // Add theme support

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
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-900">
      {/* Background gradient - light/dark aware */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"></div>
      
      {/* Decorative elements with brand color */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#0b3093] filter blur-3xl opacity-5 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#0b3093] filter blur-3xl opacity-5 translate-x-1/3 translate-y-1/2"></div>
      </div>
      
      {/* Header toolbar with Language selector and Theme toggle */}
      <div className="absolute top-4 right-12 z-20 flex items-center space-x-2">
        {/* Theme toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        {/* Language selector */}
        <LanguageSelector />
      </div>
      
      <div className="relative flex justify-center items-center min-h-screen px-4 sm:px-6">
        {/* Main content container */}
        <div className="relative w-full max-w-md">
          {/* Card with enhanced shadow - light/dark aware */}
          <div className="flex flex-col rounded-2xl shadow-[0_5px_15px_rgba(11,48,147,0.1)] bg-white dark:bg-slate-800 overflow-hidden hover:shadow-[0_15px_20px_rgba(11,48,147,0.15)] transition-shadow duration-300">
            {/* Logo section with shadow to separate from form */}
            <div className="pt-8 pb-6 flex justify-center border-b border-slate-100 dark:border-slate-700">
              <div className="rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(11,48,147,0.05)]">
                <Image
                  src="/lloo.jpeg"
                  alt="Kadéa Design Logo"
                  width={180}  // Slightly smaller
                  height={110} // Slightly smaller
                  className="h-20 w-auto" // Slightly smaller
                  priority
                />
              </div>
            </div>
            
            {/* Form section */}
            <div className="p-6 sm:p-8">
              <div className="w-full space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#0b3093] dark:text-[#5a89ff]">{t('welcome_back')}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {t('sign_in_description')}
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <Label 
                        htmlFor="email" 
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block"
                      >
                        {t('email_address')}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-300 shadow-sm hover:border-[#0b3093] dark:hover:border-[#5a89ff] focus:border-[#0b3093] dark:focus:border-[#5a89ff] focus:ring-1 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label 
                          htmlFor="password" 
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          {t('password')}
                        </Label>
                        <Link 
                          href="/forgot-password" 
                          className="text-xs font-medium text-[#0b3093] dark:text-[#5a89ff] hover:text-[#0b3093]/80 dark:hover:text-[#5a89ff]/80 transition"
                        >
                          {t('forgot_password')}
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
                          className="block w-full rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-300 shadow-sm hover:border-[#0b3093] dark:hover:border-[#5a89ff] focus:border-[#0b3093] dark:focus:border-[#5a89ff] focus:ring-1 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] transition-all duration-200"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400" /> : 
                            <Eye className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          }
                          <span className="sr-only">
                            {showPassword ? t('hide_password') : t('show_password')}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Error message */}
                  {errorMessage && (
                    <div className="p-3 rounded-md bg-red-50 dark:bg-red-900 border border-red-100 dark:border-red-700">
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">
                        {errorMessage}
                      </p>
                    </div>
                  )}
                  
                  {/* Submit button - Using brand color */}
                  <Button
                    type="submit"
                    className="group relative flex w-full justify-center rounded-md bg-[#0b3093] dark:bg-[#5a89ff] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0b3093]/90 dark:hover:bg-[#5a89ff]/90 focus:outline-none focus:ring-2 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] focus:ring-offset-2 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('signing_in')}
                      </>
                    ) : (
                      t('sign_in')
                    )}
                  </Button>
                  
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">{t('or_continue_with')}</span>
                    </div>
                  </div>
                  
                  {/* Social login buttons with updated hover colors */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="group flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#0b3093]/30 dark:hover:border-[#5a89ff]/30 transition-all duration-200"
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
                  
                  {/* Sign up link with brand color */}
                  <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-5">
                      {t('dont_have_account')}{" "}
                      <Link 
                        href="/register" 
                        className="font-medium text-[#0b3093] dark:text-[#5a89ff] hover:text-[#0b3093]/80 dark:hover:text-[#5a89ff]/80 transition"
                      >
                        {t('sign_up')}
                      </Link>
                    </p>
                  </div>
                  
                </form>
              </div>
              
            </div>
          </div>
          
          {/* Brand footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Kadéa Design. {t('all_rights_reserved')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}