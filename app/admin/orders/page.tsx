"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/lib/i18n/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  MoreHorizontal,
  RefreshCcw,
  Eye,
  Truck,
  Printer,
  AlertCircle,
  Check
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
 import jsPDF from 'jspdf';
 
// Valid status values for updating
const validStatusValues = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

// Define the backend Order interface to match our model
interface OrderProduct {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  img?: string;
  color?: string;
  size?: string;
}

interface Address {
  street?: string;
  city: string;
  country: string;
  zipCode?: string;
  phone?: string;
}

interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note?: string;
}

interface BackendOrder {
  _id: string;
  orderNumber: string;
  userId: {
    _id: string;
    name?: string;
    email?: string;
  };
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
  paymentDetails?: {
    provider: string;
    status: string;
    captureId?: string;
  };
  address: Address;
  status: string;
  statusHistory: StatusHistoryEntry[];
  trackingNumber?: string;
  shippingCarrier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend Order interface for display
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerInitial: string;
  customerName: string;
  customerEmail: string;
  customerCountry: string;
  items: number;
  total: number;
  status: string;
  payment: string;
  isPaid: boolean;
  rawData: BackendOrder; // Store the original data for detailed views
}

// Define API service functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('token') || '';
    } catch (err) {
      console.error("Error accessing localStorage for token:", err);
      return '';
    }
  }
  return '';
};

/**
 * Fetch orders from API with optional filters
 */
const fetchOrdersFromAPI = async (filters = {}, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    }).toString();
    
    const response = await fetch(`${API_URL}/order?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch orders');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId: string, updateData: any) => {
  try {
    const response = await fetch(`${API_URL}/order/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update order');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Cancel an order
 */
const cancelOrder = async (orderId: string, reason: string) => {
  try {
    const response = await fetch(`${API_URL}/order/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel order');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export default function OrdersManagementPage() {
  const { t } = useTranslation(); // Add translation hook
  
  // State for orders and UI
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [updateOrderDialogOpen, setUpdateOrderDialogOpen] = useState(false);
  const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const itemsPerPage = 10;
  
  // Receipt functionality state variables
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptContent, setReceiptContent] = useState("");
  
  // Translated order statuses
  const orderStatuses = [
    t("admin.orders.statuses.allStatuses"),
    t("admin.orders.statuses.pending"),
    t("admin.orders.statuses.processing"),
    t("admin.orders.statuses.shipped"),
    t("admin.orders.statuses.delivered"),
    t("admin.orders.statuses.cancelled"),
    t("admin.orders.statuses.refunded")
  ]

  // Valid status values for updating (keep original for API calls)
  const validStatusValues = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

  // Translated time filters
  const timeFilters = [
    t("admin.orders.timeFilters.allTime"),
    t("admin.orders.timeFilters.today"),
    t("admin.orders.timeFilters.yesterday"),
    t("admin.orders.timeFilters.lastSevenDays"),
    t("admin.orders.timeFilters.lastThirtyDays"),
    t("admin.orders.timeFilters.lastThreeMonths")
  ]
  
  // Function to convert backend order to frontend order format
  const mapOrderData = (backendOrder: BackendOrder): Order => {
    const customerName = backendOrder.userId?.name || "Unknown User";
    const customerEmail = backendOrder.userId?.email || "Unknown Email";
    
    return {
      id: backendOrder._id,
      orderNumber: backendOrder.orderNumber || backendOrder._id.substring(0, 8),
      date: new Date(backendOrder.createdAt).toLocaleString(),
      customerInitial: customerName.charAt(0).toUpperCase(),
      customerName: customerName,
      customerEmail: customerEmail,
      customerCountry: backendOrder.address?.country || "Unknown",
      items: backendOrder.products.reduce((total, item) => total + item.quantity, 0),
      total: backendOrder.amount,
      status: backendOrder.status,
      payment: backendOrder.isPaid ? "Paid" : "Unpaid",
      isPaid: backendOrder.isPaid,
      rawData: backendOrder
    };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Function to preview order receipt
  const previewOrderReceipt = async (order: Order) => {
    try {
      // Show loading toast
      toast({
        title: "Generating Invoice",
        description: "Please wait while we prepare your invoice...",
        variant: "default",
      });
      
      // For demonstration purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create invoice content
      const invoiceContent = `
INVOICE #${order.orderNumber}

Date: ${order.date}

Customer: ${order.customerName}
${order.customerEmail}
${order.rawData.address.street || ''}
${order.rawData.address.city}, ${order.rawData.address.country} ${order.rawData.address.zipCode || ''}

Products:
${order.rawData.products.map(p => 
  `${p.title} x${p.quantity} - ${formatCurrency(p.price * p.quantity)}`
).join('\n')}

Subtotal: ${formatCurrency(order.rawData.subtotal)}
Shipping: ${formatCurrency(order.rawData.shippingCost)}
Tax: ${formatCurrency(order.rawData.tax)}
${order.rawData.discount > 0 ? `Discount: -${formatCurrency(order.rawData.discount)}\n` : ''}
Total: ${formatCurrency(order.rawData.amount)}

Payment Status: ${order.isPaid ? 'Paid' : 'Unpaid'}
Payment Method: ${order.rawData.paymentMethod}
      `;
      
      // Set current order for the download function to use
      setCurrentOrder(order);
      
      // Set the content for the dialog
      setReceiptContent(invoiceContent);
      
      // Open the receipt dialog
      setReceiptDialogOpen(true);
      
    } catch (err) {
      console.error('Error generating invoice:', err);
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate invoice",
        variant: "destructive",
      });
    }
  };


// Replace the downloadReceipt function with this version
const downloadReceipt = () => {
  try {
    if (!currentOrder) {
      throw new Error("Order information is missing");
    }

    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font size and styles
    doc.setFontSize(18);
    doc.text(`INVOICE #${currentOrder.orderNumber}`, 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Date: ${currentOrder.date}`, 20, 30);
    
    // Customer section
    doc.setFontSize(12);
    doc.text("Customer Details:", 20, 45);
    doc.setFontSize(10);
    doc.text(`${currentOrder.customerName}`, 20, 52);
    doc.text(`${currentOrder.customerEmail}`, 20, 58);
    
    // Address
    let yPos = 64;
    if (currentOrder.rawData.address.street) {
      doc.text(`${currentOrder.rawData.address.street}`, 20, yPos);
      yPos += 6;
    }
    doc.text(`${currentOrder.rawData.address.city}, ${currentOrder.rawData.address.country} ${currentOrder.rawData.address.zipCode || ''}`, 20, yPos);
    
    // Order items header
    yPos += 15;
    doc.setFontSize(12);
    doc.text("Order Items:", 20, yPos);
    yPos += 8;
    
    // Table headers
    doc.setFontSize(10);
    doc.text("Product", 20, yPos);
    doc.text("Qty", 130, yPos);
    doc.text("Price", 150, yPos);
    doc.text("Total", 175, yPos);
    
    // Draw header line
    yPos += 2;
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    // Item rows
    currentOrder.rawData.products.forEach((product) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      let productTitle = product.title;
      // Truncate long titles
      if (productTitle.length > 40) {
        productTitle = productTitle.substring(0, 37) + "...";
      }
      
      doc.text(productTitle, 20, yPos);
      doc.text(product.quantity.toString(), 130, yPos);
      doc.text(formatCurrency(product.price), 150, yPos);
      doc.text(formatCurrency(product.price * product.quantity), 175, yPos);
      
      // Add variant info if available
      if (product.color || product.size) {
        yPos += 5;
        let variantText = '';
        if (product.color) variantText += `Color: ${product.color}`;
        if (product.color && product.size) variantText += ', ';
        if (product.size) variantText += `Size: ${product.size}`;
        
        doc.setFontSize(8);
        doc.text(variantText, 25, yPos);
        doc.setFontSize(10);
      }
      
      yPos += 10;
    });
    
    // Summary section
    yPos += 5;
    doc.line(120, yPos, 190, yPos);
    yPos += 8;
    
    doc.text("Subtotal:", 120, yPos);
    doc.text(formatCurrency(currentOrder.rawData.subtotal), 175, yPos);
    yPos += 6;
    
    doc.text("Shipping:", 120, yPos);
    doc.text(formatCurrency(currentOrder.rawData.shippingCost), 175, yPos);
    yPos += 6;
    
    doc.text("Tax:", 120, yPos);
    doc.text(formatCurrency(currentOrder.rawData.tax), 175, yPos);
    yPos += 6;
    
    if (currentOrder.rawData.discount > 0) {
      doc.text("Discount:", 120, yPos);
      doc.text(`-${formatCurrency(currentOrder.rawData.discount)}`, 175, yPos);
      yPos += 6;
    }
    
    // Total
    doc.line(120, yPos, 190, yPos);
    yPos += 6;
    doc.setFontSize(12);
    doc.text("Total:", 120, yPos);
    doc.text(formatCurrency(currentOrder.rawData.amount), 175, yPos);
    yPos += 12;
    
    // Payment info
    doc.setFontSize(10);
    doc.text(`Payment Status: ${currentOrder.isPaid ? 'Paid' : 'Unpaid'}`, 20, yPos);
    yPos += 6;
    doc.text(`Payment Method: ${currentOrder.rawData.paymentMethod}`, 20, yPos);
    
    // Save the PDF
    doc.save(`invoice-${currentOrder.orderNumber}.pdf`);
    
    // Show success toast
    toast({
      title: "Invoice Downloaded",
      description: `Invoice has been downloaded as PDF.`,
      variant: "default",
    });
  } catch (err) {
    console.error('Error generating PDF:', err);
    toast({
      title: "Download Failed",
      description: err instanceof Error ? err.message : "Failed to download invoice",
      variant: "destructive",
    });
  }
};

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Build filters object
        const filters: Record<string, string> = {};
        
        // Apply status filter
        if (statusFilter !== "All Statuses") {
          filters.status = statusFilter.toLowerCase();
        }
        
        // Apply date filter based on timeFilter
        if (timeFilter !== "All Time") {
          const endDate = new Date();
          let startDate = new Date();
          
          switch (timeFilter) {
            case "Today":
              startDate.setHours(0, 0, 0, 0);
              break;
            case "Yesterday":
              startDate.setDate(startDate.getDate() - 1);
              startDate.setHours(0, 0, 0, 0);
              endDate.setDate(endDate.getDate() - 1);
              endDate.setHours(23, 59, 59, 999);
              break;
            case "Last 7 Days":
              startDate.setDate(startDate.getDate() - 7);
              break;
            case "Last 30 Days":
              startDate.setDate(startDate.getDate() - 30);
              break;
            case "Last 3 Months":
              startDate.setMonth(startDate.getMonth() - 3);
              break;
          }
          
          filters.startDate = startDate.toISOString();
          if (timeFilter === "Yesterday") {
            filters.endDate = endDate.toISOString();
          }
        }
        
        // Check if we have a search query
        if (searchQuery) {
          // You can add a general search parameter if the backend supports it
          filters.search = searchQuery;
        }
        
        const result = await fetchOrdersFromAPI(filters, currentPage, itemsPerPage);
        
        // Map backend orders to frontend format
        const mappedOrders = result.data.map(mapOrderData);
        
        setAllOrders(mappedOrders);
        setTotalOrders(result.total);
        setTotalPages(result.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentPage, statusFilter, timeFilter, searchQuery]);

  // Refresh orders manually
  const refreshOrders = () => {
    setCurrentPage(1);
    // The useEffect will handle the actual refetching
  };
  
  // Handle update status dialog
  const openUpdateStatusDialog = (order: Order) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setStatusNote("");
    if (order.rawData.trackingNumber) {
      setTrackingNumber(order.rawData.trackingNumber);
    } else {
      setTrackingNumber("");
    }
    if (order.rawData.shippingCarrier) {
      setShippingCarrier(order.rawData.shippingCarrier);
    } else {
      setShippingCarrier("");
    }
    setUpdateStatusDialogOpen(true);
  };
  
  // Handle cancel order dialog
  const openCancelOrderDialog = (order: Order) => {
    setCurrentOrder(order);
    setCancellationReason("");
    setCancelOrderDialogOpen(true);
  };

  // Submit status update
  const handleUpdateStatus = async () => {
    if (!currentOrder) return;
    
    setUpdateLoading(true);
    
    try {
      const updateData: any = {
        status: newStatus
      };
      
      // Add status note if provided
      if (statusNote) {
        updateData.statusNote = statusNote;
      }
      
      // Add tracking details if this is a shipped status update
      if (newStatus === "shipped") {
        if (trackingNumber) {
          updateData.trackingNumber = trackingNumber;
        }
        if (shippingCarrier) {
          updateData.shippingCarrier = shippingCarrier;
        }
      }
      
      const result = await updateOrderStatus(currentOrder.id, updateData);
      
      // Update the order in the local state
      const updatedOrder = mapOrderData(result.data);
      setAllOrders(prev => 
        prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
      );
      
      // Show success message with translation
      toast({
        title: t("admin.orders.toasts.orderUpdated"),
        description: t("admin.orders.toasts.statusChanged", { 
          orderNumber: currentOrder.orderNumber, 
          status: t(`admin.orders.statuses.${newStatus}`)
        }),
        variant: "default",
      });
      
      // Close dialog
      setUpdateStatusDialogOpen(false);
    } catch (err) {
      toast({
        title: t("admin.orders.toasts.updateFailed"),
        description: err instanceof Error ? err.message : t("admin.orders.toasts.failedToUpdateStatus"),
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Submit order cancellation
  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    
    if (!cancellationReason.trim()) {
      toast({
        title: t("admin.orders.toasts.validationError"),
        description: t("admin.orders.toasts.provideCancellationReason"),
        variant: "destructive",
      });
      return;
    }
    
    setUpdateLoading(true);
    
    try {
      await cancelOrder(currentOrder.id, cancellationReason);
      
      // Refresh the orders to get updated data
      refreshOrders();
      
      // Show success message with translation
      toast({
        title: t("admin.orders.toasts.orderCancelled"),
        description: t("admin.orders.toasts.orderCancelledSuccess", { orderNumber: currentOrder.orderNumber }),
        variant: "default",
      });
      
      // Close dialog
      setCancelOrderDialogOpen(false);
    } catch (err) {
      toast({
        title: t("admin.orders.toasts.cancellationFailed"),
        description: err instanceof Error ? err.message : t("admin.orders.toasts.failedToCancelOrder"),
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle select all orders
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(allOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Handle single order selection
  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Get status badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "refunded":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.orders.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("admin.orders.description")}</p>
        </div>
        <Button variant="outline" onClick={refreshOrders} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t("admin.orders.refresh")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.orders.searchPlaceholder")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="sr-only">{t("admin.orders.search")}</button>
          </form>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t("admin.orders.status")} />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t("admin.orders.time")} />
            </SelectTrigger>
            <SelectContent>
              {timeFilters.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 flex justify-center items-center min-h-[200px]">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4">{t("admin.orders.loadingOrders")}</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={refreshOrders}
              >
                {t("admin.orders.tryAgain")}
              </Button>
            </div>
          ) : allOrders.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">{t("admin.orders.noOrdersFound")}</p>
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
                          checked={allOrders.length > 0 && selectedOrders.length === allOrders.length}
                        />
                        <label htmlFor="checkbox-all" className="sr-only">{t("admin.orders.selectAll")}</label>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3">{t("admin.orders.tableHeaders.orderNumber")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.orders.tableHeaders.date")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.orders.tableHeaders.customer")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.orders.tableHeaders.items")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.orders.tableHeaders.total")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.orders.tableHeaders.status")}</th>
                    <th scope="col" className="px-4 py-3 text-right">{t("admin.orders.tableHeaders.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                          />
                          <label className="sr-only">{t("admin.orders.checkbox")}</label>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3">{order.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {order.customerInitial}
                          </div>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                            <div className="text-xs text-muted-foreground">{order.customerCountry}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{order.items}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusBadge(order.status)}>
                          {t(`admin.orders.statuses.${order.status}`)}
                        </Badge>
                      </td>
                     
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openUpdateStatusDialog(order)}>
                              <Truck className="h-4 w-4 mr-2" />
                              {t("admin.orders.actions.updateStatus")}
                            </DropdownMenuItem>
                            {order.status !== "cancelled" && order.status !== "refunded" && (
                              <DropdownMenuItem onClick={() => openCancelOrderDialog(order)}>
                                <span className="h-4 w-4 mr-2">❌</span>
                                {t("admin.orders.actions.cancelOrder")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => previewOrderReceipt(order)}>
                              <Printer className="h-4 w-4 mr-2" />
                              {t("admin.orders.actions.printInvoice")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Preview Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("admin.orders.invoice.previewTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.orders.invoice.previewDescription", {orderNumber: currentOrder?.orderNumber})}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border rounded-md p-4 bg-white font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[400px]">
              {receiptContent}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              {t("admin.orders.close")}
            </Button>
            <Button onClick={downloadReceipt}>
              <Printer className="h-4 w-4 mr-2" />
              {t("admin.orders.invoice.download")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {!loading && !error && allOrders.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t("admin.orders.pagination.showing", {
              from: (currentPage - 1) * itemsPerPage + 1,
              to: Math.min(currentPage * itemsPerPage, totalOrders),
              total: totalOrders
            })}
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
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show first page, last page, and pages around current page
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
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      {currentOrder && (
        <Dialog open={updateOrderDialogOpen} onOpenChange={setUpdateOrderDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{currentOrder.orderNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-6">
                {/* Order Status and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{currentOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusBadge(currentOrder.status)}>
                      {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                {/* Customer */}
                <div>
                  <p className="text-sm font-medium mb-2">Customer</p>
                  <div className="flex items-start gap-2 p-3 border rounded-md">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {currentOrder.customerInitial}
                    </div>
                    <div>
                      <p className="font-medium">{currentOrder.customerName}</p>
                      <p className="text-sm">{currentOrder.customerEmail}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentOrder.rawData.address.street && `${currentOrder.rawData.address.street}, `}
                        {currentOrder.rawData.address.city}, {currentOrder.rawData.address.country} 
                        {currentOrder.rawData.address.zipCode && ` ${currentOrder.rawData.address.zipCode}`}
                      </p>
                      {currentOrder.rawData.address.phone && (
                        <p className="text-sm text-muted-foreground">{currentOrder.rawData.address.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Products */}
                <div>
                  <p className="text-sm font-medium mb-2">Products</p>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="px-4 py-2 text-right">Price</th>
                          <th className="px-4 py-2 text-right">Qty</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrder.rawData.products.map((product, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {product.img && (
                                  <img 
                                    src={product.img} 
                                    alt={product.title} 
                                    className="w-10 h-10 object-cover rounded-md"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{product.title}</div>
                                  {(product.color || product.size) && (
                                    <div className="text-xs text-muted-foreground">
                                      {product.color && `Color: ${product.color}`}
                                      {product.color && product.size && ' / '}
                                      {product.size && `Size: ${product.size}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">{formatCurrency(product.price)}</td>
                            <td className="px-4 py-3 text-right">{product.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.price * product.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Rest of your dialog content */}
                {/* ... */}
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {currentOrder.status !== "cancelled" && currentOrder.status !== "refunded" && (
                  <Button variant="destructive" onClick={() => {
                    setUpdateOrderDialogOpen(false);
                    openCancelOrderDialog(currentOrder);
                  }}>
                    Cancel Order
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUpdateOrderDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setUpdateOrderDialogOpen(false);
                  openUpdateStatusDialog(currentOrder);
                }}>
                  Update Status
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Update Status Dialog */}
      {currentOrder && (
        <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Change status for order #{currentOrder.orderNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {validStatusValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statusNote">Status Note (Optional)</Label>
                <Textarea 
                  id="statusNote"
                  placeholder="Add a note about this status change"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
              
              {newStatus === "shipped" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input 
                      id="trackingNumber"
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shippingCarrier">Shipping Carrier</Label>
                    <Input 
                      id="shippingCarrier"
                      placeholder="Enter shipping carrier (e.g., UPS, FedEx)"
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={updateLoading}>
                {updateLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Order Dialog */}
      {currentOrder && (
        <Dialog open={cancelOrderDialogOpen} onOpenChange={setCancelOrderDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel order #{currentOrder.orderNumber}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-800 text-sm">
                <p className="font-medium">Important Note:</p>
                <p>Cancelling this order cannot be undone. If the order is already paid, a refund process will be initiated.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancellationReason" className="font-medium">
                  Cancellation Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea 
                  id="cancellationReason"
                  placeholder="Please provide a reason for cancellation"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                />
              </div>
              
              {currentOrder.isPaid && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 text-sm">
                  <p className="font-medium">Payment Refund:</p>
                  <p>This order has been paid. Cancelling will initiate a refund process through {currentOrder.rawData.paymentMethod}.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelOrderDialogOpen(false)}>
                Keep Order
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelOrder}
                disabled={updateLoading || !cancellationReason.trim()}
              >
                {updateLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Cancel Order"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}