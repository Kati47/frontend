"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { LanguageSelector } from "@/components/language-selector";
import { useTheme } from "next-themes";

export default function ResetPasswordPage() {
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  
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
      setErrorMessage(t('valid_email_required'));
      return false;
    }
    
    // Validate password
    if (newPassword !== confirmPassword) {
      setErrorMessage(t('passwords_do_not_match'));
      return false;
    }

    if (newPassword.length < 8) {
      setErrorMessage(t('password_length_requirement'));
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
        setErrorMessage(t('reset_password_failed'));
        setIsLoading(false);
        return;
      }

      setSuccessMessage(t('reset_password_success'));
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Error during password reset:", error);
      setErrorMessage(t('general_error'));
      setIsLoading(false);
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
      <div className="absolute top-4 right-8 z-20 flex items-center space-x-2">
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
      
      <div className="relative flex justify-center items-center min-h-screen px-4 py-10 sm:px-6">
        {/* Main content container */}
        <div className="relative w-full max-w-md">
          {/* Card with enhanced shadow - light/dark aware */}
          <div className="flex flex-col rounded-2xl shadow-[0_5px_15px_rgba(11,48,147,0.1)] bg-white dark:bg-slate-800 overflow-hidden hover:shadow-[0_15px_20px_rgba(11,48,147,0.15)] transition-shadow duration-300">
            {/* Logo section */}
            <div className="pt-6 pb-4 flex items-center justify-center border-b border-slate-100 dark:border-slate-700">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-[#0b3093] dark:text-[#5a89ff]">Kadéa Design</span>
              </Link>
            </div>
            
            {/* Form section */}
            <div className="p-6 sm:p-8">
              <div className="w-full space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#0b3093] dark:text-[#5a89ff]">{t('reset_password')}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {t('reset_password_description')}
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
                        placeholder={t('email_placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-300 shadow-sm hover:border-[#0b3093] dark:hover:border-[#5a89ff] focus:border-[#0b3093] dark:focus:border-[#5a89ff] focus:ring-1 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <Label 
                        htmlFor="password" 
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block"
                      >
                        {t('new_password')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={handlePasswordChange}
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
                      
                      <div className="flex gap-1 mt-2">
                        <div className={`h-1 flex-1 rounded-full ${
                          passwordStrength === "weak" ? "bg-red-500 dark:bg-red-600" : "bg-slate-200 dark:bg-slate-700"
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full ${
                          passwordStrength === "medium" || passwordStrength === "strong" ? "bg-amber-500 dark:bg-amber-600" : "bg-slate-200 dark:bg-slate-700"
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full ${
                          passwordStrength === "strong" ? "bg-emerald-500 dark:bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                        }`}></div>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {passwordStrength === "weak" && t('password_strength_weak')}
                        {passwordStrength === "medium" && t('password_strength_medium')}
                        {passwordStrength === "strong" && t('password_strength_strong')}
                      </p>
                    </div>
                    
                    <div>
                      <Label 
                        htmlFor="confirm-password" 
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block"
                      >
                        {t('confirm_password')}
                      </Label>
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="block w-full rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-300 shadow-sm hover:border-[#0b3093] dark:hover:border-[#5a89ff] focus:border-[#0b3093] dark:focus:border-[#5a89ff] focus:ring-1 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] transition-all duration-200"
                      />
                    </div>
                    
                    {errorMessage && (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">
                          {errorMessage}
                        </p>
                      </div>
                    )}
                    
                    {successMessage && (
                      <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center">
                          {successMessage}
                        </p>
                      </div>
                    )}
                    
                    {/* Submit button */}
                    <Button
                      type="submit"
                      className="group relative flex w-full justify-center rounded-md bg-[#0b3093] dark:bg-[#5a89ff] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0b3093]/90 dark:hover:bg-[#5a89ff]/90 focus:outline-none focus:ring-2 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] focus:ring-offset-2 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('resetting_password')}
                        </>
                      ) : (
                        t('reset_password_button')
                      )}
                    </Button>
                    
                    {/* Back to login link */}
                    <div className="text-center">
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-5">
                        {t('remembered_password')}{" "}
                        <Link 
                          href="/login" 
                          className="font-medium text-[#0b3093] dark:text-[#5a89ff] hover:text-[#0b3093]/80 dark:hover:text-[#5a89ff]/80 transition"
                        >
                          {t('back_to_login')}
                        </Link>
                      </p>
                    </div>
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