"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, ArrowLeft, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Sample order data
const orders = [
  {
    id: "ORD-2023-1234",
    date: "March 15, 2023",
    status: "Delivered",
    total: "$529.97",
    paymentMethod: "Credit Card (•••• 4567)",
    items: [
      {
        id: 1,
        name: "Wireless Headphones",
        price: "$299.99",
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 2,
        name: "Smart Watch Series 5",
        price: "$229.98",
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
  },
  {
    id: "ORD-2023-1198",
    date: "February 28, 2023",
    status: "Delivered",
    total: "$189.99",
    paymentMethod: "PayPal",
    items: [
      {
        id: 3,
        name: "Minimalist Desk Lamp",
        price: "$89.99",
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 4,
        name: "Leather Laptop Sleeve",
        price: "$59.99",
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 5,
        name: "Wireless Charger",
        price: "$39.99",
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
  },
  {
    id: "ORD-2023-1056",
    date: "January 12, 2023",
    status: "Delivered",
    total: "$249.99",
    paymentMethod: "Credit Card (•••• 7890)",
    items: [
      {
        id: 6,
        name: "Ergonomic Office Chair",
        price: "$249.99",
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
  },
  {
    id: "ORD-2022-0987",
    date: "December 5, 2022",
    status: "Canceled",
    total: "$129.99",
    paymentMethod: "Credit Card (•••• 4567)",
    items: [
      {
        id: 7,
        name: "Portable Bluetooth Speaker",
        price: "$129.99",
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
  },
]

export default function OrderHistoryScreen() {
  const [openOrders, setOpenOrders] = useState<string[]>([])

  const toggleOrder = (orderId: string) => {
    setOpenOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="sticky top-0 z-10 bg-background py-4 border-b mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Order History</h1>
        </div>
      </header>

      <div className="space-y-6">
        {orders.map((order) => (
          <Collapsible
            key={order.id}
            open={openOrders.includes(order.id)}
            onOpenChange={() => toggleOrder(order.id)}
            className="border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm"
          >
            <Card className="border-0 shadow-none">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{order.id}</h3>
                      <Badge className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">{order.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {order.items
                    .map((item, index) => (
                      <div key={item.id} className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        {index === 2 && order.items.length > 3 && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <span className="text-sm font-medium">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ))
                    .slice(0, 3)}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      {openOrders.includes(order.id) ? (
                        <>
                          Hide Details
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          View Details
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>
                </div>
              </CardContent>

              <CollapsibleContent>
                <Separator />
                <CardContent className="p-4 pt-4">
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="font-medium">{item.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="p-4 flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Shipping Address</p>
                    <p className="text-sm mt-1">123 Main St, Apt 4B, New York, NY 10001</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                </CardFooter>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Orders</Button>
      </div>
    </div>
  )
}

