"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1"

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
  // Fix: Get searchParams using the hook
  const searchParams = useSearchParams();
  
  // Fix: Read URL parameters explicitly 
  const urlOrderId = searchParams?.get('orderId') || undefined;
  
  // Fix: Parse the total properly, ensuring it's a number
  const urlTotalStr = searchParams?.get('total');
  const urlTotal = urlTotalStr ? parseFloat(urlTotalStr) : undefined;
  
  console.log("PaymentPage explicit URL params:", { 
    urlOrderId, 
    urlTotal,
    rawTotal: urlTotalStr 
  });
  
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

function PaymentComponent({ total: initialTotal, orderId: propOrderId, onPaymentComplete }: PaymentComponentProps) {
  // Log initial props for debugging
  console.log("🔄 PaymentComponent received props:", { 
    initialTotal, 
    propOrderId,
    hasTotal: initialTotal !== undefined,
    hasOrderId: propOrderId !== undefined
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturingPayment, setIsCapturingPayment] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Backup: Read URL parameters directly in the component as fallback
  const urlOrderId = searchParams?.get('orderId');
  const urlTotalStr = searchParams?.get('total');
  const urlTotal = urlTotalStr ? parseFloat(urlTotalStr) : undefined;
  
  // Initialize with props OR URL parameters as fallback
  const [orderId, setOrderId] = useState<string | undefined>(
    propOrderId || urlOrderId || undefined
  );
  const [total, setTotal] = useState<number | undefined>(
    initialTotal !== undefined ? initialTotal : urlTotal
  );
  
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [countryCode, setCountryCode] = useState("US");
  
  // Reference to track initialization
  const initialized = useRef(false);
  const orderFetched = useRef(false);

  // Initialization - read first from URL parameters, then localStorage
  useEffect(() => {
    if (initialized.current) return;
    
    console.log("🔄 Initializing PaymentComponent");
    console.log("URL parameters available:", { urlOrderId, urlTotal });
    
    const init = async () => {
      try {
        // First use URL parameters (already set in state)
        let hasUpdates = false;
        
        // Fallback to localStorage if needed
        if (!orderId) {
          const storedOrderId = localStorage.getItem('currentOrderId');
          if (storedOrderId) {
            console.log(`📋 Using order ID from localStorage: ${storedOrderId}`);
            setOrderId(storedOrderId);
            hasUpdates = true;
          }
        }
        
        if (total === undefined) {
          const storedTotal = localStorage.getItem('currentOrderTotal');
          if (storedTotal && !isNaN(parseFloat(storedTotal))) {
            const parsedTotal = parseFloat(storedTotal);
            console.log(`💰 Using total from localStorage: ${parsedTotal}`);
            setTotal(parsedTotal);
            hasUpdates = true;
          }
        }
        
        // If we had either orderId or total from the start, save them to localStorage
        if (orderId) {
          localStorage.setItem('currentOrderId', orderId);
        }
        
        if (total !== undefined) {
          localStorage.setItem('currentOrderTotal', total.toString());
        }
        
        initialized.current = true;
        
        // If we have orderId but no updates needed, still set isLoading to false
        if (orderId && !hasUpdates && orderDetails) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        setIsLoading(false);
      }
    };
    
    init();
  }, [urlOrderId, urlTotal, orderId, total, orderDetails]);

  // Fetch order details when orderId becomes available
  useEffect(() => {
    const fetchOrder = async () => {
      // Only fetch if we have an orderId and haven't fetched this order yet
      if (!orderId || orderFetched.current) {
        if (!orderId) {
          console.log("No order ID available to fetch details");
        } else {
          console.log("Order already fetched, skipping fetch");
        }
        setIsLoading(false);
        return;
      }
      
      console.log(`🔄 Fetching details for order: ${orderId}`);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Authentication required");
        }
        
        const response = await fetch(`${baseUrl}/order/${orderId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Order ${orderId} not found`);
          }
          throw new Error("Failed to fetch order details");
        }
        
        const orderData = await response.json();
        console.log("✅ Order details fetched:", orderData);
        
        setOrderDetails(orderData);
        
        // Update total if not already set
        if (orderData.amount && (total === undefined)) {
          console.log(`Setting total from order data: ${orderData.amount}`);
          setTotal(orderData.amount);
          localStorage.setItem('currentOrderTotal', orderData.amount.toString());
        }
        
        // Check payment status
        if (orderData.isPaid) {
          console.log("⚠️ This order is already paid");
          setPaymentStatus("COMPLETED");
        } else if (orderData.paymentDetails?.status) {
          console.log(`🔄 Payment status from order: ${orderData.paymentDetails.status}`);
          setPaymentStatus(orderData.paymentDetails.status);
        }
        
        // Check if PayPal order ID exists
        if (orderData.paymentDetails?.paypalOrderId) {
          console.log(`Found PayPal order ID: ${orderData.paymentDetails.paypalOrderId}`);
          setPaypalOrderId(orderData.paymentDetails.paypalOrderId);
        }
        
        // Update country code if available
        if (orderData.address?.country) {
          const countryCode = convertToISOCountryCode(orderData.address.country);
          console.log(`Setting country code from order: ${countryCode}`);
          setCountryCode(countryCode);
        }
        
        orderFetched.current = true;
      } catch (error: any) {
        console.error("❌ Error fetching order details:", error);
        setError(error.message || "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, total]);

  // Capture payment if PayPal return params are present
  useEffect(() => {
    if (!searchParams) return;
    
    const token = searchParams.get('token'); // PayPal order ID/token
    const payerId = searchParams.get('PayerID'); // PayPal payer ID
    const success = searchParams.get('success');
    
    if ((success === 'true' || payerId) && token && orderId && !isCapturingPayment) {
      console.log(`Capturing payment for PayPal token: ${token}, orderId: ${orderId}`);
      capturePaypalPayment(token, orderId);
    }
  }, [searchParams, orderId, isCapturingPayment]);
  
  // Fallback to find order if no order ID is provided
  useEffect(() => {
    const findOrder = async () => {
      // Only run if we don't have an order ID and we're not loading and not already fetched
      if (orderId || isLoading || !initialized.current) {
        return;
      }

      console.log("🔍 No order ID found, attempting to find latest pending order");
      setIsLoading(true);
      
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (!userId || !token) {
          throw new Error("Authentication required");
        }
        
        // Fetch latest pending order for this user
        console.log(`🔄 Fetching orders for user: ${userId}`);
        const response = await fetch(`${baseUrl}/order/find/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        
        const orders = await response.json();
        console.log(`✅ Fetched ${orders.length} orders for user`);
        
        // Find the most recent pending order
        const pendingOrders = orders.filter((order: any) => 
          order.status === "pending" && !order.isPaid
        );
        
        console.log(`Found ${pendingOrders.length} pending unpaid orders`);
        
        if (pendingOrders.length > 0) {
          // Sort by date descending (newest first)
          pendingOrders.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // Use the newest pending order
          const latestOrder = pendingOrders[0];
          console.log("✅ Using latest pending order:", latestOrder._id);
          setOrderId(latestOrder._id);
          setOrderDetails(latestOrder);
          
          // Set the total
          if (latestOrder.amount) {
            console.log(`Setting total from latest order: ${latestOrder.amount}`);
            setTotal(latestOrder.amount);
            localStorage.setItem('currentOrderTotal', latestOrder.amount.toString());
          }
          
          // Store in localStorage for future use
          localStorage.setItem('currentOrderId', latestOrder._id);
          orderFetched.current = true;
        } else {
          throw new Error("No pending orders found");
        }
      } catch (error: any) {
        console.error("❌ Error fetching order ID:", error);
        setError("Could not find a pending order. Please return to checkout.");
      } finally {
        setIsLoading(false);
      }
    };
    
    findOrder();
  }, [orderId, isLoading]);

  // Helper function to convert any country format to ISO 3166-1 alpha-2
  const convertToISOCountryCode = (country: string): string => {
    if (!country) return "US";
    
    // If already a 2-letter code, check if valid
    if (country.length === 2) {
      const upperCountry = country.toUpperCase();
      const exists = countries.some(c => c.code === upperCountry);
      if (exists) {
        return upperCountry;
      }
    }
    
    // Common country mappings
    const countryMap: Record<string, string> = {
      "USA": "US",
      "UNITED STATES": "US",
      "UNITED STATES OF AMERICA": "US",
      "CANADA": "CA",
      "MEXICO": "MX",
      "UK": "GB",
      "UNITED KINGDOM": "GB",
      "GREAT BRITAIN": "GB",
      "AUSTRALIA": "AU",
      "GERMANY": "DE",
      "FRANCE": "FR",
      "ITALY": "IT",
      "SPAIN": "ES",
      "JAPAN": "JP",
      "CHINA": "CN",
      "BRAZIL": "BR"
    };
    
    // Try to match the country name/code
    const upperCountry = country.toUpperCase();
    if (countryMap[upperCountry]) {
      return countryMap[upperCountry];
    }
    
    // Try to find a matching country name
    const foundCountry = countries.find(c => 
      c.name.toUpperCase() === upperCountry
    );
    
    if (foundCountry) {
      return foundCountry.code;
    }
    
    return "US";
  };
  
  // Check payment status
  const checkPaymentStatus = async () => {
    if (!orderId) {
      console.error("❌ No order ID available to check status");
      return;
    }
    
    setIsCheckingStatus(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch(`${baseUrl}/paypal/payment-status/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch payment status");
      }
      
      const statusData = await response.json();
      console.log("Payment status data:", statusData);
      
      if (statusData.isPaid) {
        setPaymentStatus("COMPLETED");
        
        toast.success("Payment has been completed successfully!");
        
        // Notify parent component
        if (onPaymentComplete) {
          onPaymentComplete({
            success: true,
            transactionId: statusData.paypalTransactionId || `PP-${Date.now()}`,
            method: "PayPal"
          });
        }
        
        // Redirect to confirmation page after delay
        setTimeout(() => {
          router.push(`/checkout/confirmation?orderId=${orderId}&success=true`);
        }, 1500);
      } else {
        setPaymentStatus(statusData.paymentStatus || null);
        
        // If payment wasn't found, show a message
        if (!statusData.paymentStatus || statusData.paymentStatus === "NOT_STARTED") {
          toast.info("No payment has been processed for this order yet");
        } else {
          toast.info(`Payment status: ${statusData.paymentStatus}`);
        }
      }
      
    } catch (error: any) {
      console.error("❌ Error checking payment status:", error);
      toast.error("Could not verify payment status");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Capture PayPal Payment
  const capturePaypalPayment = async (paypalOrderId: string, orderIdToUse: string) => {
    console.log(`🔄 Capturing PayPal payment for PayPal order: ${paypalOrderId}`);
    console.log(`Using order ID: ${orderIdToUse}`);
    
    setIsCapturingPayment(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication required");
      
      // Capture payment with PayPal
      const response = await fetch(`${baseUrl}/paypal/capture-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          paypalOrderId,
          orderId: orderIdToUse
        })
      });
      
      // Handle common PayPal errors better
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Capture response error:", errorData);
        
        // Special handling for ORDER_NOT_APPROVED
        if (errorData.errorCode === "ORDER_NOT_APPROVED" || 
            (errorData.message && errorData.message.includes("not been approved"))) {
          throw new Error("This payment has not been approved yet. Please complete the PayPal checkout first.");
        }
        
        throw new Error(errorData.message || "Failed to capture payment");
      }
      
      const captureData = await response.json();
      console.log("✅ Payment captured successfully:", captureData);
      
      // Clear the stored order ID as it's now paid
      localStorage.removeItem('currentOrderId');
      
      setPaymentStatus("COMPLETED");
      
      toast.success("Payment completed successfully!");
      
      // Notify parent component that payment is complete
      if (onPaymentComplete) {
        onPaymentComplete({
          success: true,
          transactionId: captureData.captureId || `PP-${Date.now()}`,
          method: "PayPal"
        });
      }
      
      // Redirect to confirmation page
      router.push(`/checkout/confirmation?orderId=${orderIdToUse}&success=true`);
      
    } catch (error: any) {
      console.error("❌ Error capturing PayPal payment:", error);
      
      setError(error.message || "Failed to capture payment. Please try again.");
      toast.error(error.message || "Failed to capture payment");
      
      // If error is due to order not being approved, we need to redirect to PayPal again
      if (error.message.includes("ORDER_NOT_APPROVED") || error.message.includes("not been approved")) {
        toast.error("Payment not approved. Redirecting to PayPal...", {
          duration: 3000
        });
        
        // Wait a moment and try processing payment again
        setTimeout(() => {
          processPayPalPayment();
        }, 3000);
      }
      
    } finally {
      setIsCapturingPayment(false);
    }
  };
  
  // Process PayPal payment - redirects to PayPal
  const processPayPalPayment = async () => {
    console.log("🔄 Processing PayPal payment");
    
    if (!orderId) {
      console.log("❌ Cannot process PayPal payment: Order ID is missing");
      toast.error("Order ID is required for PayPal payment");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Make sure we have a token and orderId
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Cannot process PayPal payment: Token is missing");
        throw new Error("Authentication required");
      }
      
      // Create the return URLs with proper order ID
      const baseReturnURL = `${window.location.origin}/checkout/payment`;
      // Add orderId and total as parameters to ensure they're passed back
      const successUrl = `${baseReturnURL}?orderId=${orderId}&success=true` + 
                         (total ? `&total=${total}` : '');
      const cancelUrl = `${baseReturnURL}?orderId=${orderId}&success=false` +
                         (total ? `&total=${total}` : '');
      
      console.log("PayPal callback URLs:", { successUrl, cancelUrl });
      
      // Call PayPal create-order endpoint
      console.log(`🔄 Creating PayPal order for order ID: ${orderId}`);
      const response = await fetch(`${baseUrl}/paypal/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          returnUrl: successUrl,
          cancelUrl: cancelUrl,
          countryCode
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ PayPal create-order API error:", errorData);
        throw new Error(errorData.message || "Failed to initialize PayPal payment");
      }
      
      const paypalData = await response.json();
      console.log("✅ PayPal order created:", paypalData);
      
      // Store the PayPal order ID for later
      setPaypalOrderId(paypalData.paypalOrderId);
      
      // Store data in localStorage for recovery if needed
      localStorage.setItem('currentOrderId', orderId);
      if (total) {
        localStorage.setItem('currentOrderTotal', total.toString());
      }
      
      if (paypalData.amount) {
        localStorage.setItem('currentOrderTotal', paypalData.amount.toString());
        if (!total) {
          setTotal(paypalData.amount);
        }
      }
      
      // If we have an approval URL, redirect to PayPal
      if (paypalData.approvalUrl) {
        console.log(`🔄 Redirecting to PayPal: ${paypalData.approvalUrl}`);
        window.location.href = paypalData.approvalUrl;
      } else {
        throw new Error("PayPal approval URL not found");
      }
      
    } catch (error: any) {
      console.error("❌ Error initializing PayPal payment:", error);
      setError(error.message || "Failed to initialize PayPal payment");
      toast.error(error.message || "Failed to initialize PayPal payment");
      setIsProcessing(false);
    }
  };

  // Debug information
  console.log("🔄 PaymentComponent state:", { 
    orderId, 
    total, 
    paymentStatus,
    isProcessing,
    isLoading,
    isCapturingPayment
  });

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
            <Link href={`/checkout/confirmation?orderId=${orderId}&success=true`}>
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

  // Show error if no order ID could be found
  if (!orderId && !isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Order Not Found</AlertTitle>
            <AlertDescription>
              No pending order was found. Please return to checkout and try again.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-4">
            <Button asChild>
              <Link href="/checkout">Return to Checkout</Link>
            </Button>
          </div>
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
        {orderId && (
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              Order ID: {orderId}
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
        {total !== undefined && (
          <p className="text-sm font-medium mt-1">
            Total: ${total.toFixed(2)}
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
          disabled={isProcessing || !orderId}
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