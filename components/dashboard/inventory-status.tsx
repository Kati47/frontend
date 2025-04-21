"use client"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useTheme } from "next-themes"

const inventoryData = [
  {
    category: "Sofas & Couches",
    total: 124,
    inStock: 98,
    lowStock: 5,
    outOfStock: 21,
  },
  {
    category: "Chairs",
    total: 215,
    inStock: 187,
    lowStock: 3,
    outOfStock: 25,
  },
  {
    category: "Tables",
    total: 156,
    inStock: 132,
    lowStock: 2,
    outOfStock: 22,
  },
  {
    category: "Beds & Mattresses",
    total: 89,
    inStock: 67,
    lowStock: 1,
    outOfStock: 21,
  },
  {
    category: "Storage & Organization",
    total: 178,
    inStock: 145,
    lowStock: 0,
    outOfStock: 33,
  },
]

// Transform data for stacked bar chart
const chartData = inventoryData.map((item) => ({
  name: item.category.split(" ")[0], // Just take the first word for brevity
  "In Stock": item.inStock,
  "Low Stock": item.lowStock,
  "Out of Stock": item.outOfStock,
}))

export default function InventoryStatus() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const textColor = isDark ? "hsl(210 40% 98%)" : "hsl(222.2 47.4% 11.2%)"
  const gridColor = isDark ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)"

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <h4 className="text-sm font-medium">Inventory by Category</h4>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "hsl(217.2 32.6% 17.5%)" : "white",
                    borderColor: gridColor,
                    color: textColor,
                  }}
                />
                <Legend />
                <Bar dataKey="In Stock" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Low Stock" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Out of Stock" stackId="a" fill="#1d4ed8" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <h4 className="text-sm font-medium mb-4">Stock Status Details</h4>
      <div className="space-y-4">
        {inventoryData.map((category, index) => {
          const inStockPercentage = (category.inStock / category.total) * 100
          const lowStockPercentage = (category.lowStock / category.total) * 100
          const outOfStockPercentage = (category.outOfStock / category.total) * 100

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">{category.category}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {category.inStock} of {category.total}
                  </span>
                  {category.lowStock > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {category.lowStock} low
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                <div className="bg-blue-500 h-full" style={{ width: `${inStockPercentage}%` }} />
                <div className="bg-blue-300 h-full" style={{ width: `${lowStockPercentage}%` }} />
                <div className="bg-blue-700 h-full" style={{ width: `${outOfStockPercentage}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>In Stock</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-300" />
          <span>Low Stock</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-700" />
          <span>Out of Stock</span>
        </div>
      </div>
    </div>
  )
}

