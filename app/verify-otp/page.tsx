"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function VerifyOTPPage() {
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]); // Updated to 4 digits
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
    if (value && index < 3) { // Updated for 4 digits (0-3)
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
      const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OTP resend failed:", errorText);
        setErrorMessage("Failed to resend OTP. Please try again.");
        return;
      }

      // Reset the timer
      setTimeLeft(120);
    } catch (error) {
      console.error("Error resending OTP:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const otpString = otp.join("");
    if (otpString.length !== 4) { // Updated to check for 4 digits
      setErrorMessage("Please enter all 4 digits of the OTP");
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
        setErrorMessage("Invalid or expired OTP. Please try again.");
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
      setErrorMessage("An error occurred. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">StyleShop</h1>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verify OTP</CardTitle>
            <CardDescription className="text-center">
              Please enter the 4-digit OTP sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center space-x-3 my-6">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    className="w-14 h-14 text-center text-lg"
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

              {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  {timeLeft > 0 ? (
                    <span>Resend in {formatTime(timeLeft)}</span>
                  ) : (
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-primary" 
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                  )}
                </p>
              </div>
              
              <div className="text-center text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Use a different email
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}