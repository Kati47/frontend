"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
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
import { Label } from "@/components/ui/label"
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
  Eye,
  MoreHorizontal,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"

// Order type definitions
interface OrderProduct {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  img?: string;
  color?: string;
  size?: string;
}

interface OrderAddress {
  street: string;
  city: string;
  country: string;
  zipCode: string;
  phone?: string;
}

interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

interface PaymentDetails {
  provider: string;
  paypalOrderId?: string;
  status?: string;
  captureId?: string;
  capturedAt?: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  products: OrderProduct[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  amount: number;
  currency: string;
  isPaid: boolean;
  paidAt?: string;
  paymentMethod: string;
  paymentDetails?: PaymentDetails;
  address: OrderAddress;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  trackingNumber?: string;
  shippingCarrier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  };
}

// COMPLETELY FIXED API URL CONFIGURATION
// This matches exactly how your backend expects requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Client-side only functions to prevent hydration errors
const getAuthTokenFromStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || null;
  }
  return null;
};

// Function to retrieve the user ID from localStorage
const getUserIdFromLocalStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem("userId") || ""
      console.log("Retrieved userId from localStorage:", storedUserId);
      return storedUserId
    }
    return "";
  } catch (err) {
    console.error("Error accessing localStorage:", err)
    return ""
  }
};

// Authentication service
const authService = {
  // Login function
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log("Login attempt with email:", credentials.email);
    try {
      // FIXED: Login path matches your backend route exactly
      const loginUrl = `${API_URL}/api/v1/login`;
      console.log("Sending login request to:", loginUrl);
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important to include cookies
        body: JSON.stringify(credentials)
      });
      
      console.log("Login response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login error response:", errorData);
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log("Login successful, received data:", { ...data, token: data.token ? "TOKEN_EXISTS" : "NO_TOKEN" });
      
      // Store token in localStorage for easy access
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user?._id || '');
        console.log("Stored token and userId in localStorage");
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Get current token
  getToken() {
    return getAuthTokenFromStorage();
  },
  
  // Check if user is authenticated - client-side only
  isAuthenticated() {
    return !!getAuthTokenFromStorage();
  },
  
  // Logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      console.log("Cleared auth data from localStorage");
    }
  }
};

// Order service with authenticated requests
const orderService = {
  // Fetch orders with pagination and filtering
  async getOrders(page = 1, limit = 10, status?: OrderStatus): Promise<{ orders: Order[], totalPages: number, currentPage: number }> {
    console.log(`Fetching orders: page=${page}, limit=${limit}, status=${status || 'all'}`);
    try {
      const token = authService.getToken();
      console.log("Auth token for orders request:", token ? "TOKEN_EXISTS" : "NO_TOKEN");
      
      if (!token) {
        console.error("No authentication token found");
        throw new Error('No authentication token found');
      }
      
      const userId = getUserIdFromLocalStorage();
      console.log("User ID for orders request:", userId);
      
      // FIXED: URL matches your backend exactly
      let url = `${API_URL}/api/v1/order?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      
      console.log("Sending orders request to:", url);
      console.log("Request headers:", {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      console.log("Orders response status:", response.status);
      console.log("Response status text:", response.statusText);
      
      if (response.status === 401) {
        console.error("Unauthorized: Authentication token rejected");
        // Token might be expired or invalid
        authService.logout(); // Clear invalid tokens
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        console.error(`Error response from orders API: ${response.status} ${response.statusText}`);
        throw new Error(`Error fetching orders: ${response.statusText}`);
      }
      
      // Try to get response text first for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed orders data:", data);
      } catch (e) {
        console.error("Failed to parse orders response as JSON:", e);
        throw new Error("Invalid JSON response from server");
      }
      
      // Handle different response structures
      const orders = data.orders || data.data || [];
      const pagination = data.pagination || {};
      
      return {
        orders: orders, 
        totalPages: pagination.totalPages || data.totalPages || 1,
        currentPage: pagination.currentPage || data.currentPage || page
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get a single order by ID
  async getOrderById(orderId: string): Promise<Order> {
    console.log(`Fetching order details for ID: ${orderId}`);
    try {
      const token = authService.getToken();
      console.log("Auth token for order details request:", token ? "TOKEN_EXISTS" : "NO_TOKEN");
      
      if (!token) {
        console.error("No authentication token found");
        throw new Error('No authentication token found');
      }
      
      // FIXED: URL matches your backend exactly
      const url = `${API_URL}/api/v1/order/${orderId}`;
      console.log("Sending order details request to:", url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      console.log("Order details response status:", response.status);
      
      if (!response.ok) {
        console.error(`Error response from order details API: ${response.status} ${response.statusText}`);
        throw new Error(`Error fetching order: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Order details data:", data);
      return data.order || data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  // Update an order
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    console.log(`Updating order: ${orderId}`, updates);
    try {
      const token = authService.getToken();
      console.log("Auth token for order update request:", token ? "TOKEN_EXISTS" : "NO_TOKEN");
      
      if (!token) {
        console.error("No authentication token found");
        throw new Error('No authentication token found');
      }
      
      // FIXED: URL matches your backend exactly
      const url = `${API_URL}/api/v1/order/${orderId}`;
      console.log("Sending order update request to:", url);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      
      console.log("Order update response status:", response.status);
      
      if (!response.ok) {
        console.error(`Error response from order update API: ${response.status} ${response.statusText}`);
        throw new Error(`Error updating order: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Order update response data:", data);
      return data.order || data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  },

  // Cancel an order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    console.log(`Cancelling order: ${orderId}`, { reason });
    try {
      const token = authService.getToken();
      console.log("Auth token for order cancel request:", token ? "TOKEN_EXISTS" : "NO_TOKEN");
      
      if (!token) {
        console.error("No authentication token found");
        throw new Error('No authentication token found');
      }
      
      // FIXED: URL matches your backend exactly
      const url = `${API_URL}/api/v1/order/${orderId}/cancel`;
      console.log("Sending order cancel request to:", url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });
      
      console.log("Order cancel response status:", response.status);
      
      if (!response.ok) {
        console.error(`Error response from order cancel API: ${response.status} ${response.statusText}`);
        throw new Error(`Error cancelling order: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Order cancel response data:", data);
      return data.order || data;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }
};

export default function OrdersManagementPage() {
  const router = useRouter();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("processing");
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  
  // Auth-related state with client-side only initial values
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: "",
    password: ""
  });
  const [loginLoading, setLoginLoading] = useState(false);
  
  const itemsPerPage = 8;

  // Initialize auth state after mount (client-side only)
  useEffect(() => {
    console.log("Component mounted, checking authentication");
    const isAuth = authService.isAuthenticated();
    console.log("Authentication check result:", isAuth);
    setIsAuthenticated(isAuth);
    
    // If not authenticated, show login dialog
    if (!isAuth) {
      console.log("Not authenticated, showing login dialog");
      setIsLoginDialogOpen(true);
    }
  }, []);

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    console.log("fetchOrders function called");
    
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping orders fetch");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching orders: page=${currentPage}, filter=${statusFilter}`);
      const statusParam = statusFilter !== "all" ? statusFilter as OrderStatus : undefined;
      const result = await orderService.getOrders(currentPage, itemsPerPage, statusParam);
      
      console.log("Orders fetch result:", result);
      setOrders(result.orders || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Error in fetchOrders:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch orders";
      setError(errorMessage);
      
      // Check if this is an authentication error
      if (errorMessage.includes('authentication') || 
          errorMessage.includes('token') || 
          errorMessage.includes('log in') ||
          errorMessage.includes('expired')) {
        console.log("Authentication error detected, showing login dialog");
        setIsAuthenticated(false);
        setIsLoginDialogOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, isAuthenticated]);
  
  // Fetch orders when authenticated or when page/filter changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Authentication state or filters changed, fetching orders");
      fetchOrders();
    }
  }, [isAuthenticated, currentPage, statusFilter, fetchOrders]);
  
  // Login handler
  const handleLogin = async () => {
    console.log("Login handler called with:", loginCredentials.email);
    setLoginLoading(true);
    try {
      await authService.login(loginCredentials);
      console.log("Login successful");
      setIsAuthenticated(true);
      setIsLoginDialogOpen(false);
      toast.success("Login successful");
      // Orders will be fetched by the useEffect that watches isAuthenticated
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };
  
  // Logout handler
  const handleLogout = () => {
    console.log("Logout handler called");
    authService.logout();
    setIsAuthenticated(false);
    setOrders([]);
    setError("You have been logged out");
    setIsLoginDialogOpen(true);
    toast.success("Logged out successfully");
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return { 
          color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: <CheckCircle className="h-4 w-4 mr-1" />
        }
      case "shipped":
        return { 
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: <Truck className="h-4 w-4 mr-1" /> 
        }
      case "processing":
        return { 
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          icon: <Clock className="h-4 w-4 mr-1" />
        }
      case "pending":
        return { 
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: <AlertTriangle className="h-4 w-4 mr-1" />
        }
      case "cancelled":
      case "canceled":
        return { 
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: <XCircle className="h-4 w-4 mr-1" />
        }
      case "refunded":
        return { 
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
          icon: <XCircle className="h-4 w-4 mr-1" />
        }
      default:
        return { 
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: null
        }
    }
  }

  // Format date - client-side only to prevent hydration mismatch
  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') return dateString; // For SSR
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Format currency - client-side only to prevent hydration mismatch
  const formatCurrency = (amount: number) => {
    if (typeof window === 'undefined') return `$${amount}`; // For SSR
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(order => order._id))
    } else {
      setSelectedOrders([])
    }
  }

  // Handle single select
  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }

  // View order details
  const handleViewOrder = (orderId: string) => {
    console.log("Navigating to order details:", orderId);
    router.push(`/admin/orders/${orderId}`)
  }

  // Open status update dialog
  const handleOpenUpdateDialog = async (order: Order) => {
    console.log("Opening status update dialog for order:", order._id);
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusNote("")
    setIsUpdateDialogOpen(true)
  }

  // Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    
    console.log(`Updating status of order ${selectedOrder._id} to: ${newStatus}`);
    try {
      const updatedOrder = await orderService.updateOrder(selectedOrder._id, {
        status: newStatus,
        statusHistory: [
          ...selectedOrder.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: statusNote || `Status updated to ${newStatus}`
          }
        ]
      });
      
      console.log("Order status updated successfully:", updatedOrder);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
      
      toast.success(`Order ${selectedOrder.orderNumber} status updated to ${newStatus}`);
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      toast.error(errorMessage);
      
      if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
        setIsAuthenticated(false);
        setIsLoginDialogOpen(true);
      }
    }
  }

  // Open cancel dialog
  const handleOpenCancelDialog = (order: Order) => {
    console.log("Opening cancel dialog for order:", order._id);
    setSelectedOrder(order)
    setCancelReason("")
    setIsCancelDialogOpen(true)
  }

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    console.log(`Cancelling order: ${selectedOrder._id}`);
    try {
      const updatedOrder = await orderService.cancelOrder(selectedOrder._id, cancelReason);
      
      console.log("Order cancelled successfully:", updatedOrder);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
      
      toast.success(`Order ${selectedOrder.orderNumber} has been cancelled`);
      setIsCancelDialogOpen(false);
    } catch (error) {
      console.error("Failed to cancel order:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      toast.error(errorMessage);
      
      if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
        setIsAuthenticated(false);
        setIsLoginDialogOpen(true);
      }
    }
  }

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.address?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.address?.country || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Client-side only button rendering to prevent hydration mismatch
  const renderHeaderButtons = () => {
    if (typeof window === 'undefined') {
      // Return placeholder during SSR
      return <div className="w-[150px]"></div>;
    }
    
    return isAuthenticated ? (
      <>
        <Button onClick={() => router.push('/admin/orders/create')}>Create Order</Button>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </>
    ) : (
      <Button onClick={() => setIsLoginDialogOpen(true)}>Login</Button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage and process customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          {renderHeaderButtons()}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 self-end md:self-auto">
          <Button variant="outline" size="sm" disabled={selectedOrders.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Export Selected
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            More Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="unprocessed">Unprocessed</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading orders...</p>
                </div>
              </CardContent>
            </Card>
          ) : error && !isLoginDialogOpen ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-red-100 text-red-600 p-3">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Error Loading Orders</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">{error}</p>
                
                {error.includes('authentication') || error.includes('log in') ? (
                  <Button 
                    className="mt-4" 
                    onClick={() => setIsLoginDialogOpen(true)}
                  >
                    Login
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={fetchOrders}
                  >
                    Try Again
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-muted p-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No orders found</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  {searchQuery ? 
                    "No orders match your search query. Try adjusting your filters." : 
                    "There are no orders available. Orders will appear here when customers make purchases."}
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
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
                              checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                            />
                            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3">Order</th>
                        <th scope="col" className="px-4 py-3">Customer</th>
                        <th scope="col" className="px-4 py-3">Date</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3">Total</th>
                        <th scope="col" className="px-4 py-3">Payment</th>
                        <th scope="col" className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const statusBadge = getStatusBadge(order.status);
                        
                        return (
                          <tr 
                            key={order._id} 
                            className="border-b hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
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
                            <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                            <td className="px-4 py-3">
                              <div>{`${order.address?.street || 'N/A'}`}</div>
                              <div className="text-xs text-muted-foreground">{order.address?.city}, {order.address?.country}</div>
                            </td>
                            <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                            <td className="px-4 py-3">
                              <Badge className={`flex w-fit items-center gap-1 ${statusBadge.color}`}>
                                {statusBadge.icon}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-medium">{formatCurrency(order.amount)}</td>
                            <td className="px-4 py-3">
                              {order.isPaid ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Paid
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Pending
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewOrder(order._id);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewOrder(order._id);
                                    }}>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenUpdateDialog(order);
                                    }}>
                                      Update Status
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenCancelDialog(order);
                                      }}
                                      disabled={['cancelled', 'delivered', 'refunded'].includes(order.status)}
                                    >
                                      Cancel Order
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {!loading && !error && filteredOrders.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show 5 pages max, centered around current page
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Other tab contents */}
        <TabsContent value="recent">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Recent orders filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unprocessed">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Unprocessed orders filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fulfilled">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Fulfilled orders filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="returns">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Returns filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={(open) => {
        // Only allow closing if authenticated
        if (!open && !isAuthenticated) return;
        setIsLoginDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to access the order management system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="Enter your email"
                value={loginCredentials.email}
                onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Enter your password"
                value={loginCredentials.password}
                onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>
            
            {/* Debug info - FIXED with correct URLs */}
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <p>API URL: {API_URL}/api/v1/login</p>
              <p>API Order Endpoint: {API_URL}/api/v1/order</p>
              <p>Authentication: {isAuthenticated ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : 'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Change the status for order #${selectedOrder.orderNumber}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus === "shipped" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input 
                    id="tracking" 
                    placeholder="Enter tracking number" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrier">Shipping Carrier</Label>
                  <Input 
                    id="carrier" 
                    placeholder="Enter shipping carrier" 
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="note">Status Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note about this status change"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedOrder && (
                <>
                  Are you sure you want to cancel order #{selectedOrder.orderNumber}? 
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancelReason">Reason for Cancellation</Label>
            <Textarea
              id="cancelReason"
              className="mt-2"
              placeholder="Please provide a reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleCancelOrder}
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}