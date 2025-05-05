"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// List of countries - fix for the PayPal country code issue
const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
]

// PayPal icon since it's not included in Lucide
function PaypalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="24"
      width="24"
      {...props}
    >
      <path d="M7.016 19.198h-4.2a.562.562 0 01-.555-.65L5.093 2.76c.05-.305.32-.53.63-.53h8.155c2.399 0 4.17.48 5.247 1.43 1.073.94 1.597 2.23 1.496 3.88-.045.8-.213 1.44-.54 2.04-.306.58-.723 1.08-1.254 1.51-.551.45-1.25.83-2.06 1.13a10.19 10.19 0 01-2.95.46l-.42.01c-.69 0-1.32-.07-1.87-.2-.57-.13-1.07-.32-1.5-.55-.44-.24-.8-.51-1.08-.84-.28-.33-.49-.68-.63-1.06l-.05-.14 1-6.39.01-.7-.1-.05c-.2-.14-.47-.26-.8-.36-.33-.1-.75-.15-1.25-.15H5.592c-.32 0-.61.22-.678.54L2.87 18.105c-.51.303.178.651.488.651h3.658c.32 0 .6-.233.655-.548l.356-2.423.101-.588a.65.65 0 01.888.002zm-.584-11.482c.082-.5.511-.862 1.02-.862h.56c.6 0 1.18.06 1.73.11.55.05 1.16.18 1.67.28.51.1.97.36 1.31.58.43.26.76.57 1.03.99.26.41.45.87.58 1.34.13.47.19.99.19 1.55 0 .63-.11 1.29-.3 1.83a4.55 4.55 0 01-.9 1.61c-.41.48-.9.88-1.5 1.26a6.01 6.01 0 01-1.49.66c-.55.17-1.12.3-1.7.36-.58.07-1.17.1-1.79.1h-.41c-.59 0-1.11-.1-1.55-.35-.45-.25-.75-.68-.83-1.17v-.01l-1.06 6.67h-2.88l2.14-14.99z" />
      <path d="M19.07 7.33c-.26.11-.53.22-.8.31a9.887 9.887 0 01-3.35.24 6.042 6.042 0 01-.28-.03c-.69-.08-1.31-.23-1.87-.45-.57-.22-1.05-.51-1.45-.85-.4-.34-.72-.73-.95-1.16-.23-.43-.38-.89-.46-1.36-.09-.48-.1-.98-.05-1.49.05-.52.17-1.03.36-1.54.19-.5.44-.98.77-1.44A5.1 5.1 0 112.52.16c.52-.32 1.12-.57 1.82-.76.7-.19 1.48-.29 2.32-.29h2.45c.59 0 1.11.08 1.57.23.45.16.84.36 1.15.61.31.25.55.52.72.81.16.29.27.57.31.84.04.28.04.53-.01.76-.04.24-.11.45-.19.63-.09.19-.2.34-.31.46-.11.13-.21.22-.32.29 0 0 .02.01.02.01.28.2.52.45.74.73a3.53 3.53 0 01.7 2.24c-.01.26-.04.49-.08.72a5.014 5.014 0 01-.79 1.97c-.21.3-.44.58-.7.82-.26.24-.55.47-.85.67" />
    </svg>
  );
}

interface PaymentComponentProps {
  total?: number;
  orderId?: string;
  onPaymentComplete?: (data: { success: boolean; transactionId: string; method: string }) => void;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    try {
      const storedUserId = localStorage.getItem("userId") || ""
      return storedUserId
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }
  // Mock parameters instead of real API data
  const urlOrderId = searchParams?.get('orderId') || "ORD-12345-DEMO";
  const urlTotalStr = searchParams?.get('total') || "209.96";
  const urlTotal = urlTotalStr ? parseFloat(urlTotalStr) : 209.96;
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Checkout Payment</h1>
      <PaymentComponent 
        orderId={urlOrderId} 
        total={urlTotal} 
        onPaymentComplete={(data) => {
          console.log("Payment completed:", data);
        }}
      />
    </div>
  );
}

function PaymentComponent({ total: initialTotal = 209.96, orderId: propOrderId = "ORD-12345-DEMO" }: PaymentComponentProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturingPayment, setIsCapturingPayment] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("US");
  
  // Simulate check payment status
  const checkPaymentStatus = () => {
    setIsCheckingStatus(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsCheckingStatus(false);
      toast.info("No payment has been processed for this order yet");
    }, 1500);
  };

  // Simulate payment capture - after PayPal redirect
  const simulatePaymentCapture = () => {
    setIsCapturingPayment(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsCapturingPayment(false);
      setPaymentStatus("COMPLETED");
      toast.success("Payment completed successfully!");
    }, 2000);
  };
  
  // Simulate PayPal payment process
  const processPayPalPayment = () => {
    setIsProcessing(true);
    setError(null);
    
    // Simulate API delay then PayPal redirect
    setTimeout(() => {
      setIsProcessing(false);
      
      // Show toast asking about simulating success or failure
      toast(
        <div className="flex flex-col gap-2">
          <p className="font-medium">Demo: Simulate PayPal result</p>
          <div className="flex gap-2 mt-1">
            <Button 
              size="sm" 
              onClick={() => simulatePaymentCapture()}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Success
            </Button>
            <Button 
              size="sm" 
              onClick={() => setError("Payment was canceled by the user")}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Failure
            </Button>
          </div>
        </div>,
        { duration: 10000 }
      );
    }, 1500);
  };

  // Show payment completed state
  if (paymentStatus === "COMPLETED") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-center text-muted-foreground mb-6">
            Your payment has been processed successfully. We're preparing your order.
          </p>
          <Button asChild>
            <Link href={`/checkout/confirmation?orderId=${propOrderId}&success=true`}>
              View Order Confirmation
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show loading state while fetching order
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            Loading payment information...
          </p>
        </CardContent>
      </Card>
    );
  }

  // If we're capturing a PayPal payment
  if (isCapturingPayment) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            Finalizing your payment with PayPal...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Complete your purchase with PayPal</CardDescription>
        {propOrderId && (
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              Order ID: {propOrderId}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2"
              onClick={checkPaymentStatus}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              <span className="ml-1 text-xs">Check Status</span>
            </Button>
          </div>
        )}
        {initialTotal !== undefined && (
          <p className="text-sm font-medium mt-1">
            Total: ${initialTotal.toFixed(2)}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* PayPal logo and info */}
        <div className="flex flex-col items-center justify-center mb-4 space-y-3">
          <PaypalIcon className="h-12 w-12 text-blue-600" />
          <p className="text-center text-sm text-muted-foreground">
            The fastest and safest way to pay online
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* PayPal explanation */}
        <div className="rounded-md bg-muted p-4 text-sm">
          <p className="mb-2">When you click "Pay with PayPal", you'll be redirected to PayPal to complete your purchase securely.</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>You can pay with your PayPal balance, bank account, or credit card</li>
            <li>Your payment is protected by PayPal's security features</li>
            <li>You'll be returned to our website after completing payment</li>
          </ul>
          
          {/* Country selection for PayPal */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Label htmlFor="paypal-country" className="text-sm font-medium mb-1 block">Billing Country</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger id="paypal-country" className="bg-white">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Your shipping address will be updated with this country code (ISO format).
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700" 
          onClick={processPayPalPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <PaypalIcon className="h-4 w-4 mr-2" />
              Pay with PayPal
            </>
          )}
        </Button>
        
        <div className="w-full flex items-center justify-center text-xs text-muted-foreground">
          <Lock className="h-3 w-3 mr-1" />
          <span>Secure payment processing</span>
        </div>
      </CardFooter>
    </Card>
  );
}