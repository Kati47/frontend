"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sun, Moon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { LanguageSelector } from "@/components/language-selector";
import { useTheme } from "next-themes";

export default function VerifyOTPPage() {
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]); // 4 digits
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes countdown
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get the email from session storage
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (!storedEmail) {
      // If no email is found, redirect to forgot password page
      router.push("/forgot-password");
      return;
    }
    setEmail(storedEmail);

    // Initialize input refs for 4 digits
    inputRefs.current = Array(4).fill(null);

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus to next input if the current one is filled
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OTP resend failed:", errorText);
        setErrorMessage(t('resend_otp_failed'));
        return;
      }

      // Reset the timer
      setTimeLeft(120);
    } catch (error) {
      console.error("Error resending OTP:", error);
      setErrorMessage(t('general_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const otpString = otp.join("");
    if (otpString.length !== 4) {
      setErrorMessage(t('enter_complete_otp'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OTP verification failed:", errorText);
        setErrorMessage(t('invalid_otp'));
        setIsLoading(false);
        return;
      }

      // Store verification token if returned
      const data = await response.json();
      if (data.token) {
        sessionStorage.setItem("resetToken", data.token);
      }

      // Redirect to reset password page
      router.push("/reset-password");
    } catch (error) {
      console.error("Error during OTP verification:", error);
      setErrorMessage(t('general_error'));
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Function to handle pasting OTP from clipboard
  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Check if pasted content is all digits
    if (/^\d+$/.test(pastedData)) {
      // Get up to 4 digits from pasted content
      const digits = pastedData.slice(0, 4).split("");
      
      // Create new OTP array
      const newOtp = [...otp];
      
      // Fill in as many inputs as we have digits, starting from the current position
      for (let i = 0; i < digits.length && index + i < 4; i++) {
        newOtp[index + i] = digits[i];
      }
      
      setOtp(newOtp);
      
      // Focus on the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((digit, i) => i >= index && !digit);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 4) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[3]?.focus(); // Focus on the last input if all filled
      }
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
      
      <div className="relative flex justify-center items-center min-h-screen px-4 sm:px-6">
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
                  <h2 className="text-2xl font-bold text-[#0b3093] dark:text-[#5a89ff]">{t('verify_otp')}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {t('verify_otp_description').replace('{email}', email)}
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    {/* OTP Input Fields */}
                    <div className="flex justify-center space-x-3 my-6">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el; }}
                          className="w-14 h-14 text-center text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-[#0b3093] dark:hover:border-[#5a89ff] focus:border-[#0b3093] dark:focus:border-[#5a89ff] focus:ring-1 focus:ring-[#0b3093] dark:focus:ring-[#5a89ff]"
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={(e) => handlePaste(e, index)}
                          autoFocus={index === 0}
                          required
                        />
                      ))}
                    </div>
                    
                    {errorMessage && (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">
                          {errorMessage}
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
                          {t('verifying')}
                        </>
                      ) : (
                        t('verify_otp_button')
                      )}
                    </Button>
                    
                    {/* Resend code section */}
                    <div className="text-center mt-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('didnt_receive_code')}{" "}
                        {timeLeft > 0 ? (
                          <span>{t('resend_in')} {formatTime(timeLeft)}</span>
                        ) : (
                          <Button 
                            type="button" 
                            variant="link" 
                            className="p-0 h-auto text-[#0b3093] dark:text-[#5a89ff] hover:text-[#0b3093]/80 dark:hover:text-[#5a89ff]/80" 
                            onClick={handleResendOTP}
                            disabled={isLoading}
                          >
                            {t('resend_otp')}
                          </Button>
                        )}
                      </p>
                    </div>
                    
                    {/* Different email link */}
                    <div className="text-center">
                      <Link 
                        href="/forgot-password" 
                        className="text-sm font-medium text-[#0b3093] dark:text-[#5a89ff] hover:text-[#0b3093]/80 dark:hover:text-[#5a89ff]/80 transition"
                      >
                        {t('use_different_email')}
                      </Link>
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