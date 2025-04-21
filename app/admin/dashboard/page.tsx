"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "recharts"
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from "lucide-react"

// Mock data for charts
const salesData = [
  { month: "Jan", revenue: 18500, orders: 120 },
  { month: "Feb", revenue: 21500, orders: 132 },
  { month: "Mar", revenue: 19250, orders: 125 },
  { month: "Apr", revenue: 22800, orders: 140 },
  { month: "May", revenue: 26500, orders: 158 },
  { month: "Jun", revenue: 24300, orders: 145 },
  { month: "Jul", revenue: 28600, orders: 170 },
  { month: "Aug", revenue: 31200, orders: 185 },
  { month: "Sep", revenue: 29800, orders: 178 },
  { month: "Oct", revenue: 27500, orders: 165 },
  { month: "Nov", revenue: 32500, orders: 195 },
  { month: "Dec", revenue: 35000, orders: 210 },
]

const categoryData = [
  { name: "Bags", value: 40, color: "#3b82f6" },
  { name: "Wallets", value: 25, color: "#0ea5e9" },
  { name: "Accessories", value: 20, color: "#2563eb" },
  { name: "Belts", value: 10, color: "#1d4ed8" },
  { name: "Others", value: 5, color: "#1e40af" },
]

// Mock recent orders
const recentOrders = [
  {
    id: "ORD-7352",
    customer: "Emma Johnson",
    date: "2023-11-28",
    total: "$1,249.99",
    status: "Processing",
  },
  {
    id: "ORD-7351",
    customer: "Michael Chen",
    date: "2023-11-28",
    total: "$849.50",
    status: "Pending",
  },
  {
    id: "ORD-7350",
    customer: "Sophia Williams",
    date: "2023-11-27",
    total: "$2,199.99",
    status: "Shipped",
  },
  {
    id: "ORD-7349",
    customer: "James Miller",
    date: "2023-11-27",
    total: "$599.99",
    status: "Delivered",
  },
]

// Mock low stock products
const lowStockProducts = [
  {
    id: "P001",
    name: "Premium Leather Crossbody Bag",
    stock: 3,
    threshold: 5,
  },
  {
    id: "P006",
    name: "Velvet Accent Chair",
    stock: 2,
    threshold: 5,
  },
  {
    id: "P009",
    name: "Sectional Corner Sofa",
    stock: 4,
    threshold: 5,
  },
]

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("week")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "Processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name}! Here's an overview of your store.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245,679.32</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                +12.5%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                +8.2%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />3 low stock
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,856</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                +5.3%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">new customers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time Range:</span>
            <select
              className="text-sm border rounded-md px-2 py-1 bg-background"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders Overview</CardTitle>
                <CardDescription>Monthly orders for the current year</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-muted-foreground">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.date}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-medium">{order.total}</div>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Distribution of sales by product category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Products that are running low on inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {product.id}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-red-500 font-medium">{product.stock}</span> / {product.threshold}
                      </div>
                      <Button size="sm">Restock</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>In-depth analysis of your store performance</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground">Detailed analytics dashboard coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download business reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground">Reports dashboard coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

