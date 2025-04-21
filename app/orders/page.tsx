"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, ChevronUp, ShoppingCart, Search, Package, CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1"

export default function OrderHistoryPage() {
  const router = useRouter()
  const [openOrders, setOpenOrders] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  
  // Function to toggle order details open/closed
  const toggleOrder = (orderId: string) => {
    setOpenOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  // Get user ID from local storage
  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        setUserId(storedUserId)
        console.log("User ID from localStorage:", storedUserId)
      } else {
        console.log("No user ID found in localStorage")
        toast.error("Please log in to view your orders", {
          action: {
            label: "Login",
            onClick: () => router.push("/login")
          }
        })
      }
    } catch (err) {
      console.error("Error accessing localStorage:", err)
    }
  }, [router])

  // Fetch orders when userId is available
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        
        // First attempt to get orders using the userId endpoint
        let response = await fetch(`${baseUrl}/order/find/${userId}`, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : ""
          }
        })

        // If the endpoint returns a single order or 404, try the alternative approach
        if (!response.ok || response.status === 404) {
          console.log("Single order endpoint failed or returned 404, trying findAll with filtering...")
          
          // Fallback: Get all orders and filter by userId
          response = await fetch(`${baseUrl}/order/findAll`, {
            headers: {
              "Authorization": token ? `Bearer ${token}` : ""
            }
          })
          
          if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status}`)
          }
          
          const allOrders = await response.json()
          console.log("All orders fetched, filtering for current user:", allOrders)
          
          // Filter orders for the current user
          const userOrders = Array.isArray(allOrders) 
            ? allOrders.filter(order => order.userId === userId)
            : []
            
          setOrders(userOrders)
          console.log("Filtered user orders:", userOrders)
        } else {
          // If the endpoint returns successfully
          const data = await response.json()
          console.log("Orders data:", data)
          
          // Handle both array and single object responses
          if (Array.isArray(data)) {
            setOrders(data)
          } else if (data && typeof data === 'object') {
            // Check if this is a single order object
            if (data._id || data.id) {
              setOrders([data])
            } else if (data.orders && Array.isArray(data.orders)) {
              setOrders(data.orders)
            } else {
              console.warn("Unexpected response format:", data)
              setOrders([])
            }
          } else {
            console.warn("Unexpected response type:", typeof data)
            setOrders([])
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast.error("Failed to load your orders")
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [userId])

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date)
    } catch (e) {
      console.error("Date formatting error:", e)
      return dateString
    }
  }

  // Format currency function
  const formatCurrency = (amount: number | string) => {
    if (amount === undefined || amount === null) return "$0.00"
    
    // If it's already a string with a dollar sign, return as is
    if (typeof amount === 'string' && amount.startsWith('$')) return amount
    
    // Convert to number and format
    const numericAmount = typeof amount === 'string' 
      ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) 
      : amount
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(numericAmount)
  }

  // Get appropriate CSS class for status badges
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Apply filters to orders
  const filteredOrders = orders.filter((order) => {
    // Search by order number or product names
    const matchesSearch =
      searchQuery === "" ||
      (order.orderNumber || order._id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.products && Array.isArray(order.products) && order.products.some(
        (product: any) => (product.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      ))

    // Filter by status
    const matchesStatus = 
      statusFilter === "all" || 
      order.status?.toLowerCase() === statusFilter.toLowerCase()

    // Filter by date (simplified - actual implementation would parse dates)
    let matchesDate = true
    if (dateFilter !== "all" && order.createdAt) {
      const orderDate = new Date(order.createdAt)
      const now = new Date()
      const daysAgo = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
      
      if (dateFilter === "last30" && daysAgo > 30) matchesDate = false
      else if (dateFilter === "last90" && daysAgo > 90) matchesDate = false
      else if (dateFilter === "last365" && daysAgo > 365) matchesDate = false
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Handle reordering an item
  const handleReorder = async (order: any) => {
    if (!userId) {
      toast.error("Please log in to reorder")
      return
    }

    toast.info("Adding items to your cart...")
    
    try {
      const token = localStorage.getItem("token")
      
      // Extract products from the order
      const products = order.products?.map((product: any) => ({
        productId: product.productId,
        quantity: product.quantity || 1
      }))
      
      if (!products || products.length === 0) {
        toast.error("No products found in this order")
        return
      }
      
      // Add products to cart
      const response = await fetch(`${baseUrl}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          products: products
        })
      })
      
      if (!response.ok) {
        throw new Error("Failed to add items to cart")
      }
      
      toast.success("Items added to your cart", {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart")
        }
      })
      
    } catch (error) {
      console.error("Error reordering:", error)
      toast.error("Failed to add items to cart")
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>Order History</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground mt-1">View and manage your past orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="last30">Last 30 Days</SelectItem>
            <SelectItem value="last90">Last 90 Days</SelectItem>
            <SelectItem value="last365">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">No orders found</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for."
                : "You haven't placed any orders yet. Start shopping to see your orders here."}
            </p>
            <Button asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Collapsible
              key={order._id || order.id}
              open={openOrders.includes(order._id || order.id)}
              onOpenChange={() => toggleOrder(order._id || order.id)}
              className="border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm"
            >
              <Card className="border-0 shadow-none">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{order.orderNumber || order._id}</h3>
                        <Badge className={getStatusColor(order.status)}>{order.status || "Unknown"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(order.amount || order.total || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.paymentMethod || "Online Payment"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {order.products && Array.isArray(order.products) && order.products.slice(0, 3).map((product: any, index: number) => (
                      <div key={`${order._id}-product-${index}`} className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <Image 
                          src={product.img || "/placeholder.svg"} 
                          alt={product.title || "Product"} 
                          fill 
                          className="object-cover" 
                        />
                        {index === 2 && order.products.length > 3 && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <span className="text-sm font-medium">+{order.products.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1">
                        {openOrders.includes(order._id || order.id) ? (
                          <>
                            Hide Details
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            View Details
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReorder(order)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Reorder
                    </Button>
                  </div>
                </CardContent>

                <CollapsibleContent>
                  <Separator />
                  <CardContent className="p-4 pt-4">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="space-y-4">
                      {order.products && Array.isArray(order.products) && order.products.map((product: any, index: number) => (
                        <div key={`${order._id}-product-detail-${index}`} className="flex gap-4">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                            <Image
                              src={product.img || "/placeholder.svg"}
                              alt={product.title || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{product.title || "Product"}</h5>
                            <div className="flex justify-between mt-1">
                              <p className="text-sm text-muted-foreground">
                                Qty: {product.quantity || 1}
                                {product.color && ` • ${product.color}`}
                                {product.size && ` • ${product.size}`}
                              </p>
                              <p className="font-medium">{formatCurrency(product.price || 0)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 bg-muted/30 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Order Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span>{formatCurrency(order.subtotal || 0)}</span>
                        </div>
                        {(order.tax > 0 || order.tax === 0) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax:</span>
                            <span>{formatCurrency(order.tax)}</span>
                          </div>
                        )}
                        {(order.shippingCost !== undefined) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping:</span>
                            <span>{order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost)}</span>
                          </div>
                        )}
                        {(order.discount > 0) && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{formatCurrency(order.amount || order.total || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Shipping Address</p>
                      <p className="text-sm mt-1">
                        {order.address ? (
                          <>
                            {order.address.street || order.address.address1 || ""}<br />
                            {order.address.address2 && `${order.address.address2}<br />`}
                            {order.address.city || ""}{order.address.city && order.address.state ? ", " : ""}
                            {order.address.state || ""} {order.address.zipCode || order.address.zip || ""}<br />
                            {order.address.country || ""}
                          </>
                        ) : (
                          "Address information not available"
                        )}
                      </p>
                    </div>
                    {order.status !== "Canceled" ? (
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="text-sm font-medium mt-1">{order.trackingNumber || "Not available yet"}</p>
                        {order.trackingNumber && (
                          <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                            Track Order
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-sm text-muted-foreground">Cancellation Reason</p>
                        <p className="text-sm mt-1">{order.cancellationReason || "No reason provided"}</p>
                      </div>
                    )}
                  </CardFooter>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  )
}