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
import { useTranslation } from "@/lib/i18n/client"

export default function OrderHistoryPage() {
  const { t } = useTranslation()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 

  const router = useRouter()
  const [openOrders, setOpenOrders] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Function to toggle order details open/closed
  const toggleOrder = (orderId: string) => {
    setOpenOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }
  
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
  
  // Function to retrieve the auth token from localStorage
  const getAuthToken = () => {
    try {
      return localStorage.getItem("token") || ""
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }
  
  // Fetch orders from the API
  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    
    const userId = getUserIdFromLocalStorage()
    const token = getAuthToken()
    
    if (!userId) {
      setError("User ID not found. Please log in again.")
      setIsLoading(false)
      return
    }
    
    if (!token) {
      setError("Authentication token not found. Please log in again.")
      setIsLoading(false)
      return
    }
    
    try {
      // Determine date filter parameters
      let startDate = undefined
      if (dateFilter !== "all") {
        const now = new Date()
        if (dateFilter === "last30") {
          startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0]
        } else if (dateFilter === "last90") {
          startDate = new Date(now.setDate(now.getDate() - 90)).toISOString().split('T')[0]
        } else if (dateFilter === "last365") {
          startDate = new Date(now.setDate(now.getDate() - 365)).toISOString().split('T')[0]
        }
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      })
      
      if (statusFilter !== "all") {
        queryParams.append("status", statusFilter)
      }
      
      if (startDate) {
        queryParams.append("startDate", startDate)
      }
      
      // Make the API request
      const response = await fetch(`${baseUrl}/order/user/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data)
        setTotalPages(data.pages || 1)
      } else {
        throw new Error(data.message || "Failed to fetch orders")
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "Failed to load your orders. Please try again.")
      toast.error(t("orders.couldNotLoad"))
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch orders when component mounts or filters change
  useEffect(() => {
    fetchOrders()
  }, [statusFilter, dateFilter, page])

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
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Apply search filter to orders
  const filteredOrders = orders.filter((order) => {
    // Search by order number or product names
    return searchQuery === "" ||
      (order.orderNumber || order._id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.products && Array.isArray(order.products) && order.products.some(
        (product: any) => (product.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      ))
  })

  // Handle reordering an item (mocked)
  const handleReorder = async (order: any) => {
    toast.info(t("orders.addingToCart"));
    
    // Simulate a delay for reordering
    setTimeout(() => {
      toast.success(t("orders.itemsAddedToCart"), {
        action: {
          label: t("cart.viewCart"),
          onClick: () => router.push("/cart")
        }
      });
    }, 800);
  }
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Show loading state
  if (isLoading && page === 1) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">{t("orders.title")}</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>{t("orders.loading")}</p>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (error && !isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">{t("orders.title")}</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-red-100 p-6 mb-4">
            <Package className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("orders.couldNotLoad")}</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">{error}</p>
          <Button onClick={() => fetchOrders()}>{t("common.tryAgain")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          {t("common.home")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{t("orders.title")}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("orders.description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("orders.searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value)
          setPage(1) // Reset to first page when changing filter
        }}>
          <SelectTrigger>
            <SelectValue placeholder={t("orders.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders.allStatuses")}</SelectItem>
            <SelectItem value="delivered">{t("orders.statuses.delivered")}</SelectItem>
            <SelectItem value="shipped">{t("orders.statuses.shipped")}</SelectItem>
            <SelectItem value="processing">{t("orders.statuses.processing")}</SelectItem>
            <SelectItem value="pending">{t("orders.statuses.pending")}</SelectItem>
            <SelectItem value="cancelled">{t("orders.statuses.cancelled")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={(value) => {
          setDateFilter(value)
          setPage(1) // Reset to first page when changing filter
        }}>
          <SelectTrigger>
            <SelectValue placeholder={t("orders.filterByDate")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders.allTime")}</SelectItem>
            <SelectItem value="last30">{t("orders.last30Days")}</SelectItem>
            <SelectItem value="last90">{t("orders.last90Days")}</SelectItem>
            <SelectItem value="last365">{t("orders.lastYear")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show loading indicator when changing page */}
      {isLoading && page > 1 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">{t("orders.noOrdersFound")}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                ? t("orders.adjustFilters")
                : t("orders.noOrdersYet")}
            </p>
            <Button asChild>
              <Link href="/shop">{t("orders.startShopping")}</Link>
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
                        <Badge className={getStatusColor(order.status)}>
                          {t(`orders.statuses.${order.status?.toLowerCase() || 'pending'}`)}
                        </Badge>
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
                        {order.paymentMethod || t("orders.onlinePayment")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {order.products && Array.isArray(order.products) && order.products.slice(0, 3).map((product: any, index: number) => (
                      <div key={`${order._id}-product-${index}`} className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <Image 
                          src={product.img || "/placeholder.svg"} 
                          alt={product.title || t("product.defaultCategory")} 
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
                            {t("orders.hideDetails")}
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            {t("orders.viewDetails")}
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
                      {t("orders.reorder")}
                    </Button>
                  </div>
                </CardContent>

                <CollapsibleContent>
                  <Separator />
                  <CardContent className="p-4 pt-4">
                    <h4 className="font-medium mb-3">{t("orders.orderItems")}</h4>
                    <div className="space-y-4">
                      {order.products && Array.isArray(order.products) && order.products.map((product: any, index: number) => (
                        <div key={`${order._id}-product-detail-${index}`} className="flex gap-4">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                            <Image
                              src={product.img || "/placeholder.svg"}
                              alt={product.title || t("product.defaultCategory")}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{product.title || t("product.defaultCategory")}</h5>
                            <div className="flex justify-between mt-1">
                              <p className="text-sm text-muted-foreground">
                                {t("orders.quantity")}: {product.quantity || 1}
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
                      <h4 className="font-medium mb-2">{t("orders.orderSummary")}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("orders.subtotal")}:</span>
                          <span>{formatCurrency(order.subtotal || 0)}</span>
                        </div>
                        {(order.tax > 0 || order.tax === 0) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("orders.tax")}:</span>
                            <span>{formatCurrency(order.tax)}</span>
                          </div>
                        )}
                        {(order.shippingCost !== undefined) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("orders.shipping")}:</span>
                            <span>{order.shippingCost === 0 ? t("orders.free") : formatCurrency(order.shippingCost)}</span>
                          </div>
                        )}
                        {(order.discount > 0) && (
                          <div className="flex justify-between text-green-600">
                            <span>{t("orders.discount")}:</span>
                            <span>-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>{t("orders.total")}:</span>
                          <span>{formatCurrency(order.amount || order.total || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("orders.shippingAddress")}</p>
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
                          t("orders.addressNotAvailable")
                        )}
                      </p>
                    </div>
                    {order.status !== "canceled" && order.status !== "cancelled" ? (
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-sm text-muted-foreground">{t("orders.trackingNumber")}</p>
                        <p className="text-sm font-medium mt-1">{order.trackingNumber || t("orders.trackingNotAvailable")}</p>
                        {order.trackingNumber && (
                          <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                            {t("orders.trackOrder")}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-sm text-muted-foreground">{t("orders.cancellationReason")}</p>
                        <p className="text-sm mt-1">{order.cancellationReason || t("orders.noReasonProvided")}</p>
                      </div>
                    )}
                  </CardFooter>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button 
            variant="outline" 
            size="sm"
            disabled={page === 1 || isLoading}
            onClick={() => handlePageChange(page - 1)}
          >
            {t("orders.previous")}
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                disabled={isLoading}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={page === totalPages || isLoading}
            onClick={() => handlePageChange(page + 1)}
          >
            {t("orders.next")}
          </Button>
        </div>
      )}
    </div>
  )
}