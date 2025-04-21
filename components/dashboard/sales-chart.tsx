"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

const data = [
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

export default function SalesChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const textColor = isDark ? "hsl(210 40% 98%)" : "hsl(222.2 47.4% 11.2%)"
  const gridColor = isDark ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <Card className="p-1">
        <CardContent className="p-0">
          <div className="p-4">
            <h4 className="text-sm font-medium">Revenue Trend</h4>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "hsl(217.2 32.6% 17.5%)" : "white",
                    borderColor: gridColor,
                    color: textColor,
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(210, 100%, 50%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(210, 100%, 50%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="p-1">
        <CardContent className="p-0">
          <div className="p-4">
            <h4 className="text-sm font-medium">Monthly Orders</h4>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "hsl(217.2 32.6% 17.5%)" : "white",
                    borderColor: gridColor,
                    color: textColor,
                  }}
                  formatter={(value: number) => [value, "Orders"]}
                />
                <Bar dataKey="orders" fill="hsl(210, 100%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

