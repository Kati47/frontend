"use client"

import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"

const topProducts = [
  {
    id: 1,
    name: "Modern Leather Sofa",
    category: "Sofas",
    sales: 125,
    revenue: 62500,
    stock: 18,
    image: "/placeholder.svg?height=40&width=40&text=Sofa",
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    category: "Chairs",
    sales: 98,
    revenue: 19600,
    stock: 32,
    image: "/placeholder.svg?height=40&width=40&text=Chair",
  },
  {
    id: 3,
    name: "Solid Oak Dining Table",
    category: "Tables",
    sales: 87,
    revenue: 43500,
    stock: 12,
    image: "/placeholder.svg?height=40&width=40&text=Table",
  },
  {
    id: 4,
    name: "Queen Size Bed Frame",
    category: "Beds",
    sales: 76,
    revenue: 38000,
    stock: 15,
    image: "/placeholder.svg?height=40&width=40&text=Bed",
  },
  {
    id: 5,
    name: "Minimalist Coffee Table",
    category: "Tables",
    sales: 65,
    revenue: 19500,
    stock: 24,
    image: "/placeholder.svg?height=40&width=40&text=Table",
  },
]

// Data for pie chart
const pieData = [
  { name: "Sofas", value: 125, color: "#3b82f6" },
  { name: "Chairs", value: 98, color: "#0ea5e9" },
  { name: "Tables", value: 152, color: "#2563eb" },
  { name: "Beds", value: 76, color: "#1d4ed8" },
  { name: "Storage", value: 45, color: "#1e40af" },
]

export default function TopProducts() {
  const maxSales = Math.max(...topProducts.map((product) => product.sales))
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <h4 className="text-sm font-medium">Sales by Category</h4>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "hsl(217.2 32.6% 17.5%)" : "white",
                    borderColor: isDark ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)",
                    color: isDark ? "hsl(210 40% 98%)" : "hsl(222.2 47.4% 11.2%)",
                  }}
                  formatter={(value: number) => [`${value} units`, "Sales"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <h4 className="text-sm font-medium mb-4">Top Selling Products</h4>
      <div className="space-y-4">
        {topProducts.map((product) => (
          <div key={product.id} className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-md overflow-hidden border flex-shrink-0">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="truncate">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <p className="text-sm font-medium">${product.revenue.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={(product.sales / maxSales) * 100} className="h-2" />
                <span className="text-xs font-medium w-10 text-right">{product.sales}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

