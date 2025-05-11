"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useTranslation } from "@/lib/i18n/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts"
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Star,
  ShoppingCart
} from "lucide-react"

// API URL constant
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Interface definitions
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  orders: number;
  totalSpent: number;
  avatar: string;
}

interface DashboardStats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  products: number;
  lowStockCount: number;
  users: number;
  usersChange: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  countInStock: number;
  category: string;
  rating: number;
  numReviews: number;
  createdAt: string;
}

interface ProductStockData {
  name: string;
  count: number;
}

interface RevenueChartData {
  date: string;
  revenue: number;
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Get authentication token
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

// Fetch products from API
const fetchProducts = async () => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats
    const productsArray = Array.isArray(data) ? data : 
                        (data.products ? data.products : []);
    
    console.log(`Found ${productsArray.length} products`);
    return productsArray;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch orders data
const fetchOrders = async () => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/order`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Process inventory status data
const processProductStockData = (products) => {
  // Simply return count of products in stock, low stock, and out of stock
  return [
    { name: 'In Stock', count: products.filter(p => p.countInStock > 10).length },
    { name: 'Low Stock', count: products.filter(p => p.countInStock > 0 && p.countInStock <= 10).length },
    { name: 'Out of Stock', count: products.filter(p => p.countInStock === 0).length }
  ];
};

// Process revenue data from orders
const processRevenueData = (orders, timeRange) => {
  const dateFormat = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: timeRange === 'month' || timeRange === 'week' ? 'numeric' : undefined,
    year: timeRange === 'year' ? 'numeric' : undefined
  });

  // Group by date
  const groupedByDate = orders.reduce((acc, order) => {
    if (!order.createdAt || !order.amount) return acc;
    
    const date = new Date(order.createdAt);
    if (isNaN(date.getTime())) return acc;
    
    const formattedDate = dateFormat.format(date);
    
    if (!acc[formattedDate]) {
      acc[formattedDate] = 0;
    }
    acc[formattedDate] += parseFloat(order.amount) || 0;
    return acc;
  }, {});

  // Convert to chart data format and sort by date
  return Object.keys(groupedByDate)
    .map(date => ({
      date,
      revenue: groupedByDate[date]
    }))
    .sort((a, b) => {
      // Simple string comparison works for month names in 'MMM' format
      return a.date.localeCompare(b.date);
    });
};

// Calculate dashboard statistics from data
const calculateDashboardStats = (orders, products, users) => {
  // Calculate revenue and orders
  const currentMonthDate = new Date();
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  
  // Filter orders by current and last month
  const currentMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate.getMonth() === currentMonthDate.getMonth() && 
           orderDate.getFullYear() === currentMonthDate.getFullYear();
  });
  
  const lastMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate.getMonth() === lastMonthDate.getMonth() && 
           orderDate.getFullYear() === lastMonthDate.getFullYear();
  });
  
  // Calculate totals
  const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);
  const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);
  
  // Calculate percentage changes
  const revenueChange = lastMonthRevenue === 0 ? 100 : 
    Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
  
  const ordersChange = lastMonthOrders.length === 0 ? 100 :
    Math.round(((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100);
  
  // Count low stock products
  const lowStockProducts = products.filter(product => 
    product.countInStock !== undefined && product.countInStock < 10
  );
  
  // Calculate user growth
  const currentMonthUsers = users.filter(user => {
    const createdAt = new Date(user.createdAt || user.dateCreated);
    if (!createdAt || isNaN(createdAt.getTime())) return false;
    return createdAt.getMonth() === currentMonthDate.getMonth() && 
           createdAt.getFullYear() === currentMonthDate.getFullYear();
  });
  
  const lastMonthUsers = users.filter(user => {
    const createdAt = new Date(user.createdAt || user.dateCreated);
    if (!createdAt || isNaN(createdAt.getTime())) return false;
    return createdAt.getMonth() === lastMonthDate.getMonth() && 
           createdAt.getFullYear() === lastMonthDate.getFullYear();
  });
  
  const usersChange = lastMonthUsers.length === 0 ? 100 :
    Math.round(((currentMonthUsers.length - lastMonthUsers.length) / lastMonthUsers.length) * 100);
  
  return {
    revenue: currentMonthRevenue,
    revenueChange: revenueChange,
    orders: orders.length,
    ordersChange: ordersChange,
    products: products.length,
    lowStockCount: lowStockProducts.length,
    users: users.length,
    usersChange: usersChange
  };
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productStockData, setProductStockData] = useState<ProductStockData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    revenueChange: 0,
    orders: 0,
    ordersChange: 0,
    products: 0,
    lowStockCount: 0,
    users: 0,
    usersChange: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Loading dashboard data...");
        
        // Fetch users data
        const usersResponse = await fetch(`${API_URL}/users/usersTotal`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
        }

        const usersData = await usersResponse.json();
        console.log(`Fetched ${usersData.length} users`);
        
        // Transform users data
        const transformedUsers: User[] = usersData.map((user: any) => ({
          ...user,
          _id: user._id || user.id,
          role: user.isAdmin ? "Admin" : "Customer",
          orders: user.orders || 0,
          totalSpent: user.totalSpent || 0,
          avatar: user.avatar || `/avatars/avatar-${Math.floor(Math.random() * 10) + 1}.png`
        }));
        
        setUsers(transformedUsers);
        
        // Fetch products data
        const productsData = await fetchProducts();
        console.log(`Fetched ${productsData.length} products`);
        setProducts(productsData);
        
        // Process products data for charts - shows product inventory status
        const stockData = processProductStockData(productsData);
        setProductStockData(stockData);
        
        // Fetch orders data
        const ordersData = await fetchOrders();
        console.log(`Fetched ${ordersData.length} orders`);
        
        // Process revenue data
        const processedRevenueData = processRevenueData(ordersData, timeRange);
        setRevenueData(processedRevenueData);
        
        // Calculate dashboard statistics
        const calculatedStats = calculateDashboardStats(ordersData, productsData, transformedUsers);
        setStats(calculatedStats);

      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        toast({ 
          title: "Error", 
          description: "Failed to load dashboard data", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("dashboard.welcome")}, {user?.name}! {t("dashboard.overview_intro")}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.revenue")}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="flex items-center mt-1">
                  <Badge className={`flex items-center ${stats.revenueChange >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}%
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">{t("dashboard.from_last_month")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.orders")}</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orders.toLocaleString()}</div>
                <div className="flex items-center mt-1">
                  <Badge className={`flex items-center ${stats.ordersChange >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange}%
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">{t("dashboard.from_last_month")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.products")}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.toLocaleString()}</div>
                <div className="flex items-center mt-1">
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                    {stats.lowStockCount} {t("dashboard.low_stock")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.users")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length.toLocaleString()}</div>
                <div className="flex items-center mt-1">
                  <Badge className={`flex items-center ${stats.usersChange >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    {stats.usersChange >= 0 ? '+' : ''}{stats.usersChange}%
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">{t("dashboard.new_users")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t("dashboard.overview")}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("dashboard.time_range")}</span>
                <select
                  className="text-sm border rounded-md px-2 py-1 bg-background"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="day">{t("dashboard.today")}</option>
                  <option value="week">{t("dashboard.this_week")}</option>
                  <option value="month">{t("dashboard.this_month")}</option>
                  <option value="year">{t("dashboard.this_year")}</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.revenue_overview")}</CardTitle>
                  <CardDescription>{t("dashboard.revenue_overview_desc")}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, t("dashboard.revenue")]} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        name={t("dashboard.revenue")}
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.product_inventory")}</CardTitle>
                  <CardDescription>{t("dashboard.product_inventory_desc", { count: stats.products })}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: t("dashboard.total_products"), count: stats.products },
                      { name: t("dashboard.low_stock_label"), count: stats.lowStockCount }, 
                      { name: t("dashboard.in_stock"), count: stats.products - stats.lowStockCount }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name={t("dashboard.products")}
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      >
                        <Cell fill="#8884d8" />
                        <Cell fill="#facc15" />
                        <Cell fill="#4ade80" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}