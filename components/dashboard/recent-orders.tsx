"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

const recentOrders = [
  {
    id: "ORD-7352",
    customer: "Emma Johnson",
    email: "emma.j@example.com",
    date: "2023-11-28",
    total: "$1,249.99",
    status: "Processing",
    items: 3,
    avatar: "EJ",
  },
  {
    id: "ORD-7351",
    customer: "Michael Chen",
    email: "michael.c@example.com",
    date: "2023-11-28",
    total: "$849.50",
    status: "Pending",
    items: 2,
    avatar: "MC",
  },
  {
    id: "ORD-7350",
    customer: "Sophia Williams",
    email: "sophia.w@example.com",
    date: "2023-11-27",
    total: "$2,199.99",
    status: "Shipped",
    items: 4,
    avatar: "SW",
  },
  {
    id: "ORD-7349",
    customer: "James Miller",
    email: "james.m@example.com",
    date: "2023-11-27",
    total: "$599.99",
    status: "Delivered",
    items: 1,
    avatar: "JM",
  },
  {
    id: "ORD-7348",
    customer: "Olivia Davis",
    email: "olivia.d@example.com",
    date: "2023-11-26",
    total: "$1,799.98",
    status: "Processing",
    items: 3,
    avatar: "OD",
  },
]

export default function RecentOrders() {
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
    <div className="space-y-4">
      {recentOrders.map((order) => (
        <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${order.avatar}`} />
                <AvatarFallback>{order.avatar}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.customer}</p>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </div>
                  <p className="font-medium">{order.total}</p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">{order.items} items</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                    <Link href={`/orders/${order.id}`}>
                      <span>View</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-center pt-2">
        <Button variant="outline" asChild>
          <Link href="/orders">
            View all orders
            <ArrowUpRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

