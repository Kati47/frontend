import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertTriangle, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import SalesChart from "@/components/dashboard/sales-chart"
import TopProducts from "@/components/dashboard/top-products"
import RecentOrders from "@/components/dashboard/recent-orders"
import InventoryStatus from "@/components/dashboard/inventory-status"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your furniture store.</p>
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
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
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
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                +8.2%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254 items</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                12 low stock
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
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                +5.3%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">new customers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly revenue and order trends for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Your best performing furniture items</CardDescription>
              </CardHeader>
              <CardContent>
                <TopProducts />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Stock levels by category</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryStatus />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Real-time store activity and customer engagement</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Activity timeline visualization coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground">Advanced analytics dashboard coming soon</p>
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

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>Important alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground">Notifications dashboard coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

