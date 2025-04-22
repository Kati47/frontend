"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Upload,
  Copy,
  Package,
  Clock,
  AlertCircle,
  Loader2,
  X,
  FileText,
  Receipt
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"

// API base URL
const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1';

// Status filters
const statusOptions = [
  "All Statuses",
  "pending",
  "processing",
  "shipped", 
  "delivered",
  "cancelled",
  "refunded"
]

// Order status options (for edit form)
const orderStatusOptions = [
  "pending",
  "processing",
  "shipped", 
  "delivered",
  "cancelled",
  "refunded"
]

export default function OrdersManagementPage() {
  const router = useRouter()
  
  // State variables
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [timeFilter, setTimeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState([])
  
  // Dialog states
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Edit dialog states
  const [orderToEdit, setOrderToEdit] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    status: "",
    statusNote: "",
    trackingNumber: "",
    isPaid: false
  })
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  
  // Delete dialog states
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Receipt download state
  const [isDownloading, setIsDownloading] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState(null)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false)
  const [customerData, setCustomerData] = useState(null)
  
  const itemsPerPage = 8

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
  
  // Function to retrieve the auth token
  const getAuthToken = () => {
    try {
      return localStorage.getItem("token") || ""
    } catch (err) {
      console.error("Error accessing localStorage for token:", err)
      return ""
    }
  }

  // Fetch orders when component mounts or when filters/page changes
  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, timeFilter, searchQuery])

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true)
    setError("")
    
    try {
      // Get auth token
      const token = getAuthToken()
      
      // Construct API url with filters
      let url = `${API_URL}/order?page=${currentPage}&limit=${itemsPerPage}`
      
      // Add search query if present
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`
      }
      
      // Add status filter if not "All Statuses"
      if (statusFilter !== "All Statuses") {
        url += `&status=${statusFilter}`
      }

      // Add date filters
      if (timeFilter === "today") {
        const today = new Date().toISOString().split('T')[0]
        url += `&startDate=${today}&endDate=${today}T23:59:59.999Z`
      } else if (timeFilter === "yesterday") {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        url += `&startDate=${yesterdayStr}&endDate=${yesterdayStr}T23:59:59.999Z`
      } else if (timeFilter === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        url += `&startDate=${weekAgo.toISOString()}`
      } else if (timeFilter === "month") {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        url += `&startDate=${monthAgo.toISOString()}`
      }
      
      // Fetch orders with authentication
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include'
      })
      
      // Handle unauthorized response
      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push('/login?redirect=/admin/orders')
        return
      }
      
      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setOrders(result.data)
        setTotalOrders(result.total)
        setTotalPages(Math.ceil(result.total / itemsPerPage))
        
        // If current page is greater than total pages, set to last page
        if (currentPage > Math.ceil(result.total / itemsPerPage) && result.total > 0) {
          setCurrentPage(Math.ceil(result.total / itemsPerPage))
        }
      } else {
        throw new Error(result.message || 'Failed to fetch orders')
      }
    } catch (err:any) {
      console.error('Error fetching orders:', err)
      setError(err.message || 'Error fetching orders')
      toast({
        title: "Error",
        description: err.message || "Could not load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId, newStatus, note) => {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          statusNote: note || `Status updated to ${newStatus}`
        })
      })
      
      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push('/login?redirect=/admin/orders')
        return
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Order status updated to ${newStatus}`,
          variant: "default",
        })
        
        // Refresh orders list
        fetchOrders()
        return result.data
      } else {
        throw new Error(result.message || 'Failed to update order status')
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      toast({
        title: "Error",
        description: err.message || "Could not update status",
        variant: "destructive",
      })
      return null
    }
  }
  
  // Fetch current user details from localStorage ID
  const fetchCurrentUserDetails = async () => {
    const userId = getUserIdFromLocalStorage()
    return await fetchUserDetails(userId)
  }

  // Improved fetch user details function
  const fetchUserDetails = async (userId) => {
    if (!userId) return null
    
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include'
      })
      
      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push('/login?redirect=/admin/orders')
        return null
      }
      
      if (!response.ok) {
        throw new Error(`Error fetching user details: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        return result.data
      } else {
        throw new Error(result.message || 'Failed to fetch user details')
      }
    } catch (err) {
      console.error('Error fetching user details:', err)
      return null
    }
  }

  // Improved download receipt function with better user data handling
  const downloadReceipt = async (order) => {
    setReceiptOrder(order)
    setIsReceiptDialogOpen(true)
    setCustomerData(null)
    setIsLoadingUserDetails(true)
    
    try {
      // Fetch user details if userId is available
      if (order.userId) {
        let userId = order.userId
        
        // Handle case where userId might be an object with _id
        if (typeof userId === 'object' && userId._id) {
          userId = userId._id
        }
        
        // Only fetch if userId is a string
        if (typeof userId === 'string') {
          console.log("Fetching user details for:", userId)
          const userData = await fetchUserDetails(userId)
          
          if (userData) {
            console.log("User data fetched successfully:", userData)
            setCustomerData(userData)
          } else {
            console.log("No user data returned from API")
          }
        }
      } else {
        console.log("No userId available for this order")
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
    } finally {
      setIsLoadingUserDetails(false)
    }
  }
  
  // Generate and download receipt PDF
  const handleDownloadReceipt = () => {
    setIsDownloading(true)
    
    // Simulate API call for receipt generation and download
    setTimeout(() => {
      // Here you would normally call an API to generate a PDF
      // Instead, we're simulating a download by creating a fake download link
      
      try {
        // Create an element with download attribute (simple text download for demo)
        const element = document.createElement('a')
        const orderNumber = receiptOrder?.orderNumber || receiptOrder?._id || 'unknown'
        const fileName = `receipt-order-${orderNumber}.pdf`
        
        element.setAttribute('href', 'data:application/pdf;charset=utf-8,' + encodeURIComponent('This is a simulated PDF receipt file'))
        element.setAttribute('download', fileName)
        element.style.display = 'none'
        
        // Append to document, click and remove
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        
        toast({
          title: "Receipt Downloaded",
          description: `Order receipt has been downloaded as "${fileName}"`,
          variant: "default",
        })
      } catch (err) {
        console.error('Error downloading receipt:', err)
        toast({
          title: "Download Error",
          description: "Could not download receipt. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDownloading(false)
        setIsReceiptDialogOpen(false)
        setReceiptOrder(null)
        setCustomerData(null)
      }
    }, 1500)
  }

  // Open edit dialog with order data
  const openEditDialog = (order) => {
    setOrderToEdit(order)
    setEditFormData({
      status: order.status || 'pending',
      statusNote: '',
      trackingNumber: order.trackingNumber || '',
      isPaid: order.isPaid || false
    })
    setIsEditDialogOpen(true)
  }
  
  // Handle edit form input changes
  const handleEditFormChange = (field, value) => {
    setEditFormData({
      ...editFormData,
      [field]: value
    })
  }
  
  // Submit order edit
  const handleEditSubmit = async () => {
    if (!orderToEdit) return
    
    setIsEditSubmitting(true)
    
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/order/${orderToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
        body: JSON.stringify(editFormData)
      })
      
      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push('/login?redirect=/admin/orders')
        return
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Order Updated",
          description: `Order ${orderToEdit.orderNumber || orderToEdit._id} has been updated`,
          variant: "default",
        })
        
        // Close dialog and refresh orders
        setIsEditDialogOpen(false)
        setOrderToEdit(null)
        fetchOrders()
      } else {
        throw new Error(result.message || 'Failed to update order')
      }
    } catch (err) {
      console.error('Error updating order:', err)
      toast({
        title: "Error",
        description: err.message || "Could not update order",
        variant: "destructive",
      })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  // Cancel order
  const handleCancelOrder = async () => {
    if (!orderToCancel) return
    
    setIsCancelling(true)
    
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/order/${orderToCancel._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: cancelReason || 'Cancelled by admin'
        })
      })
      
      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push('/login?redirect=/admin/orders')
        return
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Order Cancelled",
          description: `Order ${orderToCancel.orderNumber || orderToCancel._id} has been cancelled`,
          variant: "default",
        })
        
        // Refresh orders list
        fetchOrders()
      } else {
        throw new Error(result.message || 'Failed to cancel order')
      }
    } catch (err) {
      console.error('Error cancelling order:', err)
      toast({
        title: "Error",
        description: err.message || "Could not cancel order",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
      setIsDialogOpen(false)
      setOrderToCancel(null)
      setCancelReason("")
    }
  }

  // Open delete dialog
  const openDeleteDialog = (order) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }

  // Improved delete order function
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return
    
    setIsDeleting(true)
    
    try {
      const token = getAuthToken()
      
      // First, make sure we have a proper order ID
      const orderId = orderToDelete._id
      
      if (!orderId) {
        throw new Error("Invalid order ID")
      }
      
      console.log(`Attempting to delete order: ${orderId}`)
      
      const response = await fetch(`${API_URL}/order/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push('/login?redirect=/admin/orders')
        return
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Order Deleted",
          description: result.message || `Order has been deleted`,
          variant: "default",
        })
        
        // Close dialog and refresh orders
        setIsDeleteDialogOpen(false)
        setOrderToDelete(null)
        fetchOrders()
      } else {
        throw new Error(result.message || 'Failed to delete order')
      }
    } catch (err) {
      console.error('Error deleting order:', err)
      toast({
        title: "Error",
        description: err.message || "Could not delete order",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || ''
    
    switch (statusLower) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "refunded":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  // Get payment status badge color
  const getPaymentStatusBadge = (isPaid) => {
    if (isPaid === true) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    } else {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date)
    } catch (err) {
      console.error("Error formatting date:", err)
      return "Invalid Date"
    }
  }

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(order => order._id))
    } else {
      setSelectedOrders([])
    }
  }

  // Handle single select
  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }

  // Export orders as CSV
  const exportOrdersCSV = () => {
    toast({
      title: "Exporting Orders",
      description: "Orders are being exported to CSV",
      variant: "default",
    })
  }

  // Improved get customer name function
  const getCustomerName = () => {
    if (isLoadingUserDetails) {
      return (
        <span className="flex items-center">
          Loading customer data
          <Loader2 className="h-3 w-3 ml-2 animate-spin" />
        </span>
      )
    }
    
    // If we have customer data from our API call, use it
    if (customerData) {
      // Check if we have a name directly
      if (customerData.name) {
        return customerData.name
      }
      
      // Check if we have firstName/lastName
      if (customerData.firstName || customerData.lastName) {
        return `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim()
      }
    }
    
    // Fall back to order data if customer data is not available
    if (receiptOrder) {
      // Check if we have user information in the order
      if (receiptOrder.address) {
        const addressName = `${receiptOrder.address.firstName || ''} ${receiptOrder.address.lastName || ''}`.trim()
        if (addressName) {
          return addressName
        }
      }
      
      // If userId is an object with name property
      if (receiptOrder.userId && typeof receiptOrder.userId === 'object' && receiptOrder.userId.name) {
        return receiptOrder.userId.name
      }
      
      // If userId is a string, show partial
      if (receiptOrder.userId && typeof receiptOrder.userId === 'string') {
        return `User ID: ${receiptOrder.userId.substring(0, 8)}`
      }
    }
    
    return "Unknown Customer"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage and process customer orders</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchOrders}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportOrdersCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, customer or status..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={timeFilter} 
            onValueChange={(value) => setTimeFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center p-8 text-red-500">
              <AlertCircle className="h-6 w-6 mr-2" />
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col justify-center items-center p-8 text-muted-foreground">
              <Package className="h-10 w-10 mb-4" />
              <p>No orders found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4" 
                onClick={fetchOrders}
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th scope="col" className="p-4">
                      <div className="flex items-center">
                        <input
                          id="checkbox-all"
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300"
                          onChange={handleSelectAll}
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                        />
                        <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3">Order</th>
                    <th scope="col" className="px-4 py-3">Date</th>
                    <th scope="col" className="px-4 py-3">Customer</th>
                    <th scope="col" className="px-4 py-3">Items</th>
                    <th scope="col" className="px-4 py-3">Total</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Payment</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr 
                      key={order._id} 
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => handleSelectOrder(order._id)}
                          />
                          <label className="sr-only">checkbox</label>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{order.orderNumber || order._id}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="flex items-center gap-2 px-4 py-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          <div className="text-sm font-semibold">
                            {order.userId?.name?.substring(0, 1) || "U"}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.userId?.name || "User " + order.userId?.substring(0, 8)}</span>
                          <span className="text-xs text-muted-foreground">{order.address?.country || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{order.products?.length || 0}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(order.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusBadge(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getPaymentStatusBadge(order.isPaid)}>
                          {order.isPaid ? "Paid" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => downloadReceipt(order)}
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(order)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadReceipt(order)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order._id, "processing", "Order marked as processing by admin")}>
                                <Package className="h-4 w-4 mr-2" />
                                Process Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(order)}>
                                <Clock className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setOrderToCancel(order)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel Order
                              </DropdownMenuItem>
                              {["cancelled", "pending"].includes(order.status?.toLowerCase()) && (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog(order)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Order
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show 5 pages max with current page in the middle when possible
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else {
                  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  pageToShow = start + i;
                }
                return (
                  <Button
                    key={pageToShow}
                    variant={currentPage === pageToShow ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setCurrentPage(pageToShow)}
                  >
                    {pageToShow}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Order Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setOrderToCancel(null)
            setCancelReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order {orderToCancel?.orderNumber || orderToCancel?._id}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for cancellation
              </label>
              <Input
                id="reason"
                placeholder="Enter reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setOrderToCancel(null)
                setCancelReason("")
              }}
              disabled={isCancelling}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setOrderToEdit(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Order</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Update order {orderToEdit?.orderNumber || orderToEdit?._id} details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => handleEditFormChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="statusNote" className="text-right">
                Status Note
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="statusNote"
                  placeholder="Add a note about this status change"
                  value={editFormData.statusNote}
                  onChange={(e) => handleEditFormChange('statusNote', e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackingNumber" className="text-right">
                Tracking #
              </Label>
              <div className="col-span-3">
                <Input
                  id="trackingNumber"
                  placeholder="Enter tracking number"
                  value={editFormData.trackingNumber}
                  onChange={(e) => handleEditFormChange('trackingNumber', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isPaid" className="text-right">
                Payment Status
              </Label>
              <div className="col-span-3">
                <Select
                  value={editFormData.isPaid.toString()}
                  onValueChange={(value) => handleEditFormChange('isPaid', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Paid</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isEditSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={isEditSubmitting}
            >
              {isEditSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setOrderToDelete(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete order {orderToDelete?.orderNumber || orderToDelete?._id}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Download Dialog */}
      <Dialog
        open={isReceiptDialogOpen}
        onOpenChange={(open) => {
          setIsReceiptDialogOpen(open)
          if (!open) {
            setReceiptOrder(null)
            setCustomerData(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Download Receipt</DialogTitle>
            <DialogDescription>
              Preview and download receipt for order {receiptOrder?.orderNumber || receiptOrder?._id}
            </DialogDescription>
          </DialogHeader>
          
          {receiptOrder && (
            <div className="py-4 border rounded-md p-4 bg-white">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Order Receipt</h3>
                  <p className="text-sm text-muted-foreground">Order #: {receiptOrder.orderNumber || receiptOrder._id}</p>
                  <p className="text-sm text-muted-foreground">Date: {formatDate(receiptOrder.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Your Store Name</p>
                  <p className="text-sm text-muted-foreground">123 Main Street</p>
                  <p className="text-sm text-muted-foreground">City, State ZIP</p>
                </div>
              </div>
              
              <div className="border-t border-b py-2 mb-2">
                <h4 className="font-medium mb-1">Customer Information</h4>
                <p className="text-sm">Name: {getCustomerName()}</p>
                {receiptOrder.address && (
                  <>
                    <p className="text-sm">Address: {receiptOrder.address.street || ""}</p>
                    <p className="text-sm">{receiptOrder.address.city || ""}, {receiptOrder.address.state || ""} {receiptOrder.address.zip || ""}</p>
                    <p className="text-sm">Country: {receiptOrder.address.country || ""}</p>
                  </>
                )}
                {customerData && customerData.email && (
                  <p className="text-sm">Email: {customerData.email}</p>
                )}
                {customerData && customerData.phone && (
                  <p className="text-sm">Phone: {customerData.phone}</p>
                )}
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Order Items</h4>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left pb-1">Item</th>
                      <th className="text-center pb-1">Qty</th>
                      <th className="text-right pb-1">Price</th>
                      <th className="text-right pb-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptOrder.products?.map((product, index) => (
                      <tr key={index} className="border-b border-dashed">
                        <td className="py-1">{product.name || `Product #${index + 1}`}</td>
                        <td className="py-1 text-center">{product.quantity || 1}</td>
                        <td className="py-1 text-right">{formatCurrency(product.price || 0)}</td>
                        <td className="py-1 text-right">{formatCurrency((product.price || 0) * (product.quantity || 1))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="text-right mb-4">
                <div className="flex justify-between border-b pb-1">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(receiptOrder.amount || 0)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Shipping:</span>
                  <span>{formatCurrency(receiptOrder.shippingFee || 0)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Tax:</span>
                  <span>{formatCurrency(receiptOrder.taxAmount || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency((receiptOrder.amount || 0) + (receiptOrder.shippingFee || 0) + (receiptOrder.taxAmount || 0))}</span>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground mt-6">
                <p>Thank you for your business!</p>
                <p>For any questions, contact support@yourstore.com</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsReceiptDialogOpen(false)}
              disabled={isDownloading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}