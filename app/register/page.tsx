"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { LanguageSelector } from "@/components/language-selector";
import { useTheme } from "next-themes";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

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

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError(t('passwords_do_not_match'));
      return false;
    }

    if (password.length < 8) {
      setPasswordError(t('password_length_requirement'));
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    
    if (!phoneNumber) {
      setPhoneError(t('phone_required'));
      return false;
    }
    
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError(t('invalid_phone'));
      return false;
    }
    
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
      setErrorMessage(t('must_agree_terms'));
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
        setErrorMessage(t('registration_failed'));
        return;
      }

      console.log("Registration successful, redirecting to login page");
      router.push("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage(t('general_error'));
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
            {/* Logo section with shadow to separate from form */}
            <div className="pt-8 pb-6 flex justify-center border-b border-slate-100 dark:border-slate-700">
               {/* Logo section */}
                       <div className="pt-6 pb-4 flex items-center justify-center border-b border-slate-100 dark:border-slate-700">
                         <Link href="/" className="flex items-center">
                           <span className="text-xl font-bold text-[#0b3093] dark:text-[#5a89ff]">Kadéa Design</span>
                         </Link>
                       </div>
            </div>
            
            {/* Form section */}
            <div className="p-6 sm:p-8">
              <div className="w-full space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#0b3093] dark:text-[#5a89ff]">{t('create_account')}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {t('create_account_description')}
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <Label 
                        htmlFor="username" 
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block"
                      >
                        {t('username')}
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder={t('username_placeholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-300 shadow-sm hover:border-[#0b3093] dark:hover:border-[#5a89ff] focus:border-[#0b3093] dark:focus:border-[#5a89ff] focus:ring-1 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] transition-all duration-200"
                      />
                    </div>
                    
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
                        htmlFor="phone" 
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block"
                      >
                        {t('phone_number')}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t('phone_placeholder')}
                        value={phone}
                        onChange={handlePhoneChange}
                        required
                        className="block w-full rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-300 shadow-sm hover:border-[#0b3093] dark:hover:border-[#5a89ff] focus:border-[#0b3093] dark:focus:border-[#5a89ff] focus:ring-1 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] transition-all duration-200"
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {phoneError}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label 
                        htmlFor="password" 
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block"
                      >
                        {t('password')}
                      </Label>
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
                    
                    {passwordError && (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">
                          {passwordError}
                        </p>
                      </div>
                    )}
                    
                    {errorMessage && (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">
                          {errorMessage}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 py-2">
                      <Checkbox 
                        id="terms" 
                        checked={agreeTerms} 
                        onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                        className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-[#0b3093] data-[state=checked]:dark:bg-[#5a89ff]"
                      />
                      <Label 
                        htmlFor="terms" 
                        className="text-sm text-slate-700 dark:text-slate-300 leading-tight"
                      >
                        {t('agree_terms_part1')} <Link href="/terms" className="text-[#0b3093] dark:text-[#5a89ff] hover:underline">{t('terms_of_service')}</Link> {t('and')} <Link href="/privacy" className="text-[#0b3093] dark:text-[#5a89ff] hover:underline">{t('privacy_policy')}</Link>
                      </Label>
                    </div>
                    
                    {/* Submit button */}
                    <Button
                      type="submit"
                      className="group relative flex w-full justify-center rounded-md bg-[#0b3093] dark:bg-[#5a89ff] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0b3093]/90 dark:hover:bg-[#5a89ff]/90 focus:outline-none focus:ring-2 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff] focus:ring-offset-2 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('creating_account')}
                        </>
                      ) : (
                        t('create_account_button')
                      )}
                    </Button>
                    
                    {/* Sign in link */}
                    <div className="text-center">
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-5">
                        {t('already_have_account')}{" "}
                        <Link 
                          href="/login" 
                          className="font-medium text-[#0b3093] dark:text-[#5a89ff] hover:text-[#0b3093]/80 dark:hover:text-[#5a89ff]/80 transition"
                        >
                          {t('sign_in')}
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