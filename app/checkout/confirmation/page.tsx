"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ArrowRight, Package, Truck, Calendar, History, Loader2, AlertCircle, DollarSign, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Use the correct API base URL from your environment variables
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartId, setCartId] = useState("")
  const [shippingInfo, setShippingInfo] = useState(null)
  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    total: 0,
    paymentMethod: "PayPal",
    shippingAddress: "",
    estimatedDelivery: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  })
  const [orderCreated, setOrderCreated] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [showCaptureDialog, setShowCaptureDialog] = useState(false)
  const [manualCaptureInProgress, setManualCaptureInProgress] = useState(false)
  
  // References to track PayPal window
  const paypalWindowRef = useRef(null)
  const paymentCheckInterval = useRef(null)
  const processingStartRef = useRef(null)

  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    console.log("🔍 Getting user ID from localStorage")
    try {
      const storedUserId = localStorage.getItem("userId") || ""
      console.log(`✅ User ID retrieved: ${storedUserId ? '✓' : '✗'}`)
      return storedUserId
    } catch (err) {
      console.error("❌ Error accessing localStorage:", err)
      return ""
    }
  }

  // Function to delete cart after successful order
  const deleteCart = async (cartId, orderId) => {
    console.log("🗑️ Deleting cart after successful order...");
    
    try {
      const userId = getUserIdFromLocalStorage();
      const token = localStorage.getItem("token");
      
      if (!cartId) {
        console.log("⚠️ No cart ID provided for deletion");
        return;
      }
      
      const response = await fetch(`${baseUrl}/order/delete-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cartId: cartId,
          userId: userId,
          orderId: orderId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Cart deleted successfully:", data);
      } else {
        console.error("❌ Failed to delete cart:", data);
      }
    } catch (error) {
      console.error("❌ Error deleting cart:", error);
    }
  };

  // Check for query parameters on page load to show toast notifications
  useEffect(() => {
    console.log("🔄 Checking query parameters...")
    
    // Check for success message
    if (searchParams.get('success') === 'true') {
      console.log("🎉 Success parameter detected")
      const message = searchParams.get('message') || 'Payment successful!'
      toast.success(message)
      
      // After showing toast, redirect to orders page
      setTimeout(() => {
        router.push('/orders')
      }, 2000)
    }
    
    // Check for canceled message
    if (searchParams.get('canceled') === 'true') {
      console.log("❌ Canceled parameter detected")
      const message = searchParams.get('message') || 'Payment was canceled'
      toast.error(message)
    }
    
    // Check for toast message from backend
    if (searchParams.get('toastType') && searchParams.get('message')) {
      console.log("💬 Toast parameters detected")
      const toastType = searchParams.get('toastType')
      const message = searchParams.get('message')
      
      console.log(`📢 Toast type: ${toastType}, Message: ${message}`)
      
      if (toastType === 'success') {
        toast.success(message)
      } else if (toastType === 'error') {
        toast.error(message)
      } else if (toastType === 'info') {
        toast.info(message)
      }
    }
    
    // Check if we need to show order details
    const orderIdFromParams = searchParams.get('orderId')
    if (orderIdFromParams) {
      console.log(`🔍 Order ID found in URL: ${orderIdFromParams}`)
      setOrderDetails(prev => ({
        ...prev,
        orderId: orderIdFromParams
      }))
      
      setPaymentStatus('completed')
    }
  }, [searchParams, router])

  // Function to get cart data (read-only)
  const fetchCartData = async () => {
    console.log("📥 Fetching cart data...")
    try {
      setIsLoading(true)
      
      const userId = getUserIdFromLocalStorage()
      const token = localStorage.getItem("token")
      
      console.log(`👤 User ID: ${userId ? '✓' : '✗'}, Token: ${token ? '✓' : '✗'}`)
      
      if (!userId || !token) {
        console.error("❌ Missing user credentials")
        toast.error("Please log in to complete your order")
        router.push("/login")
        return
      }
      
      // Get shipping info from localStorage (would have been set in checkout page)
      const storedShippingInfo = localStorage.getItem("shippingInfo")
      let shippingAddress = ""
      
      console.log(`🏠 Shipping info in localStorage: ${storedShippingInfo ? '✓' : '✗'}`)
      
      if (storedShippingInfo) {
        try {
          const parsedInfo = JSON.parse(storedShippingInfo)
          console.log("✅ Shipping info parsed successfully")
          setShippingInfo(parsedInfo) // Save the full shipping info object
          
          // Format for display
          shippingAddress = `${parsedInfo.street || ""}, ${parsedInfo.city}, ${parsedInfo.state || ""} ${parsedInfo.zipCode}, ${parsedInfo.country}`
          console.log(`📍 Formatted shipping address: ${shippingAddress}`)
        } catch (e) {
          console.error("❌ Error parsing shipping info:", e)
          
          // Create a default shipping info that matches your backend schema
          console.log("⚠️ Using default shipping info")
          const defaultInfo = {
            firstName: "John",
            lastName: "Doe",
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
            phone: "555-123-4567"
          }
          
          setShippingInfo(defaultInfo)
          shippingAddress = `${defaultInfo.street}, ${defaultInfo.city}, ${defaultInfo.state} ${defaultInfo.zipCode}, ${defaultInfo.country}`
          
          // Save it for later use
          localStorage.setItem("shippingInfo", JSON.stringify(defaultInfo))
        }
      } else {
        // Create a default shipping info that matches your backend schema
        console.log("⚠️ No shipping info found, using default")
        const defaultInfo = {
          firstName: "John",
          lastName: "Doe",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
          phone: "555-123-4567"
        }
        
        setShippingInfo(defaultInfo)
        shippingAddress = `${defaultInfo.street}, ${defaultInfo.city}, ${defaultInfo.state} ${defaultInfo.zipCode}, ${defaultInfo.country}`
        
        // Save it for later use
        localStorage.setItem("shippingInfo", JSON.stringify(defaultInfo))
      }
      
      // Fetch cart - read only
      console.log(`📡 Fetching cart data for user: ${userId}`)
      const response = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      console.log(`📥 Cart API response status: ${response.status}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.error("❌ Cart not found (404)")
          toast.error("Your cart is empty")
          router.push("/shop")
          return
        }
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
      
      const cartData = await response.json()
      console.log("📦 Cart data received:", cartData)
      
      // Extract cart items and ID
      let items = []
      let id = ""
      
      if (cartData.cart?.products && Array.isArray(cartData.cart.products)) {
        console.log("🔍 Found products in cart.products")
        items = cartData.cart.products
        id = cartData.cart._id
      } else if (cartData.products && Array.isArray(cartData.products)) {
        console.log("🔍 Found products directly in cart data")
        items = cartData.products
        id = cartData._id
      }
      
      console.log(`📦 Extracted ${items.length} cart items`)
      console.log(`🏷️ Cart ID: ${id}`)
      setCartId(id)
      
      // Format cart items for display only
      console.log("🔄 Formatting cart items for display")
      const formattedItems = items.map(item => {
        const formatted = {
          id: item.productId?._id || item.productId,
          name: item.productId?.title || item.title || "Product",
          price: typeof item.price === 'number' ? item.price : 0,
          quantity: item.quantity || 1,
          image: item.productId?.img || item.img || "/placeholder.svg",
          color: item.color,
          size: item.size
        }
        
        console.log(`📦 Formatted item: ${formatted.name}, price: $${formatted.price}, qty: ${formatted.quantity}`)
        return formatted
      })
      
      setCartItems(formattedItems)
      
      // Calculate total - for display only
      console.log("💰 Calculating order totals")
      const subtotal = items.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0
        const quantity = item.quantity || 1
        return sum + (price * quantity)
      }, 0)
      
      const shipping = subtotal > 100 ? 0 : 9.99
      const tax = subtotal * 0.07 // Use your backend's tax rate (7%)
      const orderTotal = subtotal + shipping + tax
      
      console.log(`💰 Subtotal: $${subtotal.toFixed(2)}`)
      console.log(`💰 Shipping: $${shipping.toFixed(2)}`)
      console.log(`💰 Tax: $${tax.toFixed(2)}`)
      console.log(`💰 Total: $${orderTotal.toFixed(2)}`)
      
      // Update order details - for display only
      setOrderDetails(prev => ({
        ...prev,
        total: orderTotal,
        shippingAddress: shippingAddress
      }))
      
    } catch (error) {
      console.error("❌ Error fetching cart for confirmation:", error)
      toast.error("Failed to load your order details")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Process order with the unified endpoint
  const processOrder = async () => {
    console.log("📝 Processing order with unified endpoint...")
    
    if (orderCreated || isConfirming) {
      console.log("⚠️ Order already created or confirming in progress")
      return
    }
    
    try {
      console.log("🔄 Starting unified order processing")
      setIsConfirming(true)
      
      const userId = getUserIdFromLocalStorage()
      const token = localStorage.getItem("token")
      
      console.log("👤 User data for order:", { 
        userId: userId, 
        hasToken: !!token
      })
      
      if (!userId || !token) {
        console.error("❌ Missing user credentials", { userId, token: !!token })
        toast.error("Please log in to complete your order")
        router.push("/login")
        return
      }
      
      if (!shippingInfo) {
        console.error("❌ Missing shipping information")
        toast.error("Shipping information is required")
        return
      }
      
      // Format shipping details
      console.log("🏠 Formatting shipping details")
      const shippingDetails = {
        firstName: shippingInfo.firstName || shippingInfo.name?.split(' ')[0] || "John",
        lastName: shippingInfo.lastName || shippingInfo.name?.split(' ').slice(1).join(' ') || "Doe",
        street: shippingInfo.street || shippingInfo.address1 || "123 Main St",
        address2: shippingInfo.address2 || "",
        city: shippingInfo.city || "New York",
        state: shippingInfo.state || "NY",
        zipCode: shippingInfo.zipCode || shippingInfo.zip || "10001",
        country: shippingInfo.country || "USA",
        phone: shippingInfo.phone || "555-123-4567"
      }
      
      console.log("🏠 Shipping details:", shippingDetails)
      
      // Current URL for return/cancel URLs
      const currentUrl = window.location.href.split('?')[0]  // Remove any query parameters
      console.log(`🔗 Current URL (base for return URLs): ${currentUrl}`)
      
      // Create payload for unified process-order endpoint
      console.log("📦 Preparing payload for process-order endpoint")
      const payload = {
        userId: userId,
        cartId: cartId, // Include cart ID for later deletion
        paymentMethod: "paypal",
        cartItems: cartItems.map(item => ({
          id: item.id,
          productId: item.id,
          name: item.name,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color || undefined,
          size: item.size || undefined,
          image: item.image,
          img: item.image
        })),
        shippingDetails: shippingDetails,
        returnUrl: currentUrl,
        cancelUrl: currentUrl
      }
      
      console.log("📤 Processing order with payload:", payload)
      
      const response = await fetch(`${baseUrl}/order/process-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      
      console.log(`📥 Response status: ${response.status}`)
      
      if (!response.ok) {
        let errorText = await response.text()
        console.error("❌ Order processing error:", errorText)
        
        let errorMessage = "Failed to process your order"
        try {
          const errorJson = JSON.parse(errorText)
          console.error("❌ Parsed error details:", errorJson)
          errorMessage = errorJson.message || errorJson.error || errorMessage
          
          if (errorJson.toast) {
            toast[errorJson.toast.type || 'error'](errorJson.toast.message || errorMessage)
          } else {
            toast.error(errorMessage)
          }
        } catch (e) {
          console.error("❌ Could not parse error response:", e)
          toast.error(errorText || errorMessage)
        }
        
        throw new Error(errorMessage)
      }
      
      const orderData = await response.json()
      console.log("✅ Order processing response:", orderData)
      
      // Store order information in localStorage
      if (orderData.orderId) {
        console.log(`📝 Storing orderId: ${orderData.orderId}`)
        localStorage.setItem("orderId", orderData.orderId)
      }
      
      if (orderData.paypalOrderId) {
        console.log(`📝 Storing paypalOrderId: ${orderData.paypalOrderId}`)
        localStorage.setItem("paypalOrderId", orderData.paypalOrderId)
      }
      
      // Show toast message if provided
      if (orderData.toast) {
        const toastType = orderData.toast.type || 'info'
        const message = orderData.toast.message || 'Processing your order...'
        
        console.log(`📢 Show toast: type=${toastType}, message=${message}`)
        toast[toastType](message)
      } else {
        toast.info('Redirecting to PayPal for payment...')
      }
      
      setOrderCreated(true)
      
      // CRITICAL: Redirect to PayPal approval URL
      if (orderData.approvalUrl) {
        console.log(`🔄 Redirecting to PayPal approval URL: ${orderData.approvalUrl}`)
        window.location.href = orderData.approvalUrl
      } else {
        console.error("❌ No approval URL in response")
        toast.error("Could not proceed to payment")
      }
      
    } catch (error) {
      console.error("❌ Error processing order:", error)
      toast.error(error.message || "Error processing your order")
    } finally {
      setIsConfirming(false)
    }
  }

  // Add this function to handle manual capture
  const handleManualCapture = async () => {
    console.log('🛠️ Starting manual payment capture...');
    setManualCaptureInProgress(true);
    
    // Show processing toast
    const processingToastId = toast.loading("Processing your payment...");
    
    try {
      const paypalOrderId = localStorage.getItem("paypalOrderId");
      const orderId = localStorage.getItem("orderId");
      
      console.log(`🔍 Using stored payment details:`);
      console.log(`- PayPal Order ID: ${paypalOrderId || 'Not available'}`);
      console.log(`- Order ID: ${orderId || 'Not available'}`);
      
      if (!paypalOrderId) {
        toast.error("No PayPal order ID available for capture", {
          id: processingToastId
        });
        return;
      }
      
      // Build payload for capture
      const payload = {
        paypalOrderId,
      };
      
      if (orderId) payload.orderId = orderId;
      
      console.log('📤 Sending capture request with payload:', payload);
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/order/capture-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`📥 Capture response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Capture error response:', errorText);
        
        let errorMessage = "Failed to complete payment";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('❌ Could not parse error response', e);
        }
        
        toast.error(errorMessage, {
          id: processingToastId,
          duration: 5000
        });
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ Capture successful:', data);
      
      // Update success toast
      toast.success("Payment captured successfully!", {
        id: processingToastId,
        duration: 3000
      });
      
      setPaymentStatus('completed');
      
      // Delete cart after successful payment
      if (cartId) {
        deleteCart(cartId, data.orderId || orderId);
      }
      
      // Clear temp data
      localStorage.removeItem("paypalOrderId");
      
      // Set order ID if returned
      if (data.orderId) {
        localStorage.setItem("lastOrderId", data.orderId);
      }
      
      // Navigate to orders page
      setTimeout(() => {
        router.push("/orders");
      }, 2000);
      
    } catch (error) {
      console.error('❌ Manual capture failed:', error);
      // Toast error is already handled above
    } finally {
      setManualCaptureInProgress(false);
    }
  };

  // Show confirmation toast when returning from PayPal
  useEffect(() => {
    // Check if we have a paypalOrderId in localStorage (returned from PayPal)
    const paypalOrderId = localStorage.getItem("paypalOrderId");
    
    if (paypalOrderId && !paymentStatus.includes('completed')) {
      // Show persistent toast notification to confirm order
      const toastId = toast(
        <div className="flex flex-col gap-2">
          <p className="font-medium">Complete your payment</p>
          <p className="text-sm">Your PayPal payment needs to be confirmed.</p>
          <div className="flex gap-2 mt-1">
            <Button 
              size="sm" 
              onClick={() => {
                toast.dismiss(toastId);
                handleManualCapture();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Confirm Order
            </Button>
          </div>
        </div>,
        {
          duration: Infinity, // Make it persistent
          position: "bottom-center",
        }
      );
      
      // Clean up toast when component unmounts or payment completes
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [paymentStatus]);

  // Add this hook to capture payment when returning from PayPal
  useEffect(() => {
    // Check if we're returning from PayPal with orderId in URL
    const orderIdFromUrl = searchParams.get('orderId')
    const paypalOrderId = localStorage.getItem("paypalOrderId")
    
    if (orderIdFromUrl && paypalOrderId) {
      console.log("🔍 Detected return from PayPal, capturing payment...")
      console.log(`📊 Order ID: ${orderIdFromUrl}, PayPal ID: ${paypalOrderId}`)
      
      // Show loading toast
      const loadingToastId = toast.loading("Finalizing your payment...")
      
      // Call capture endpoint
      const capturePayment = async () => {
        try {
          const token = localStorage.getItem("token")
          const response = await fetch(`${baseUrl}/order/capture-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
              orderId: orderIdFromUrl,
              paypalOrderId: paypalOrderId
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to capture payment")
          }
          
          const data = await response.json()
          console.log("✅ Payment captured successfully:", data)
          
          // Show success toast
          toast.success("Payment completed successfully!", { id: loadingToastId })
          
          // Delete cart after successful payment
          if (cartId) {
            deleteCart(cartId, data.orderId || orderIdFromUrl);
          }
          
          // Clear temporary data
          localStorage.removeItem("paypalOrderId")
          
          // Update order status
          setPaymentStatus('completed')
          
          // Navigate to orders page after a short delay
          setTimeout(() => {
            router.push("/orders")
          }, 2000)
          
        } catch (error) {
          console.error("❌ Error capturing payment:", error)
          toast.error(error.message || "Error finalizing payment", { id: loadingToastId })
        }
      }
      
      capturePayment()
    }
  }, [searchParams, router])
  
  // Load cart data when component mounts
  useEffect(() => {
    console.log("🔄 Initial component mount")
    if (!isProcessingPayment) {
      console.log("📦 Fetching initial cart data")
      fetchCartData()
    } else {
      console.log("⏳ Already processing payment, skipping cart fetch")
    }
  }, [isProcessingPayment])
  
  const navigateToOrderHistory = () => {
    console.log("🔄 Navigating to order history")
    router.push("/orders")
  }

  // Confirmation dialog component
  const CaptureConfirmationDialog = () => (
    <AlertDialog open={showCaptureDialog} onOpenChange={setShowCaptureDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Payment Capture</AlertDialogTitle>
          <AlertDialogDescription>
            This will attempt to manually capture the payment from PayPal. Only use this if your payment was approved but not completed automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleManualCapture} disabled={manualCaptureInProgress}>
            {manualCaptureInProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Capturing...
              </>
            ) : (
              'Yes, Capture Payment'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Create loading/processing UI component for reusability
  const LoadingUI = ({ message }) => (
    <div className="container max-w-4xl py-12">
      <div className="text-center py-12">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-medium mb-2">
          {message || "Loading..."}
        </h2>
      </div>
    </div>
  )

  // If we're explicitly processing payment, show the processing UI
  if (isProcessingPayment) {
    return <LoadingUI message="Processing your payment..." />
  }

  // If still loading data, show loading indicator
  if (isLoading) {
    return <LoadingUI message="Loading your order details..." />  
  }
  
  // Show empty cart message if no items
  if (cartItems.length === 0 && !orderCreated) {
    console.log("⚠️ No items in cart and no order created")
    return (
      <div className="container max-w-4xl py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Empty Cart</AlertTitle>
          <AlertDescription>
            Your cart is empty. Add some products before checking out.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button asChild>
            <Link href="/shop">Shop Now</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Show special message if payment status is specific
  if (paymentStatus === 'completed') {
    console.log("💰 Rendering completed payment UI")
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-medium mb-2">Payment Completed!</h2>
          <p className="text-muted-foreground mb-6">
            Your payment has been processed successfully.
          </p>
          <Button onClick={() => router.push('/orders')}>
            View Your Orders
          </Button>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'failed') {
    console.log("❌ Rendering failed payment UI")
    return (
      <div className="container max-w-4xl py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Failed</AlertTitle>
          <AlertDescription>
            There was an error processing your payment. Please try again or contact support.
          </AlertDescription>
        </Alert>
        
        <div className="text-center mt-6">
          <Button className="mr-4" onClick={() => router.push('/cart')}>
            Return to Cart
          </Button>
          <Button variant="outline" onClick={() => router.push('/shop')}>
            View Orders
          </Button>
        </div>
      </div>
    )
  }

  // Main order confirmation UI
  console.log("📄 Rendering main order confirmation UI")
  return (
    <div className="container max-w-4xl py-12">
      {/* Order History button in top right */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={navigateToOrderHistory}
        >
          <History className="h-4 w-4" />
          Order History
        </Button>
      </div>
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <Package className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Review Your Order
        </h1>
        <p className="text-muted-foreground">
          Please review your order details and proceed to payment.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Order Number</h3>
              <p className="font-medium">
                Pending payment
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
              <p className="font-medium">{orderDetails.date}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
              <p className="font-medium">${orderDetails.total.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
              <p className="font-medium">{orderDetails.paymentMethod}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Order Items</h3>
              <span className="text-sm text-muted-foreground">{cartItems.length} item(s)</span>
            </div>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={item.id || `item-${index}`} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                    <Image 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.name} 
                      fill 
                      className="object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{item.name}</h4>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    {(item.color || item.size) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.color && `Color: ${item.color}`}
                        {item.color && item.size && " / "}
                        {item.size && `Size: ${item.size}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <p className="text-muted-foreground">{orderDetails.shippingAddress}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Estimated Delivery</h3>
              <p className="text-muted-foreground">{orderDetails.estimatedDelivery}</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${(orderDetails.total - (orderDetails.total > 100 ? 0 : 9.99) - (orderDetails.total * 0.07)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{orderDetails.total > 100 ? "Free" : "$9.99"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (7%)</span>
              <span>${(orderDetails.total * 0.07).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-muted/50 p-6 flex flex-col sm:flex-row gap-4">
          <Button 
            className="flex-1 sm:flex-none"
            variant="outline"
            asChild
          >
            <Link href="/cart">Edit Cart</Link>
          </Button>
          
          <Button 
            className="flex-1"
            onClick={processOrder} // <-- UPDATED: Using the new processOrder function
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Complete Payment'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Add confirmation dialog */}
      <CaptureConfirmationDialog />

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" asChild>
          <Link href="/shop">Back to Checkout</Link>
        </Button>
      </div>
    </div>
  )
}