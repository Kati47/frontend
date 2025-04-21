"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  CreditCard,
  Tag,
  Truck,
  Star,
  Bell,
  BarChart3,
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight,
  Layers,
  Moon,
  Sun,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"

type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  children?: { name: string; href: string }[]
}

export default function SideNavigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [openGroups, setOpenGroups] = useState<string[]>([])

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
      children: [
        { name: "All Products", href: "/products" },
        { name: "Add Product", href: "/products/add" },
        { name: "Bulk Upload", href: "/products/bulk-upload" },
      ],
    },
    {
      name: "Categories",
      href: "/categories",
      icon: Layers,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingCart,
      children: [
        { name: "All Orders", href: "/orders" },
        { name: "Returns & Refunds", href: "/orders/returns" },
      ],
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      children: [
        { name: "All Customers", href: "/customers" },
        { name: "Support", href: "/customers/support" },
      ],
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Warehouse,
      children: [
        { name: "Stock Overview", href: "/inventory" },
        { name: "Low Stock Alerts", href: "/inventory/low-stock" },
        { name: "Suppliers", href: "/inventory/suppliers" },
      ],
    },
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
      children: [
        { name: "Payment History", href: "/payments" },
        { name: "Pending Payments", href: "/payments/pending" },
      ],
    },
    {
      name: "Offers & Discounts",
      href: "/offers",
      icon: Tag,
    },
    {
      name: "Shipping",
      href: "/shipping",
      icon: Truck,
      children: [
        { name: "Shipping Zones", href: "/shipping" },
        { name: "Courier Integration", href: "/shipping/couriers" },
        { name: "Delivery Tracking", href: "/shipping/tracking" },
      ],
    },
    {
      name: "Reviews",
      href: "/reviews",
      icon: Star,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
    {
      name: "Staff & Roles",
      href: "/staff",
      icon: UserCog,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.children && item.children.some((child) => pathname === child.href)) return true
    return false
  }

  return (
    <div className="w-64 border-r h-screen sticky top-0 flex flex-col bg-background">
      <div className="p-4 border-b flex items-center">
        <h1 className="font-bold text-xl">Furniture Admin</h1>
      </div>

      <ScrollArea className="flex-1">
        <nav className="py-2">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const active = isActive(item)
              const isOpen = openGroups.includes(item.name)

              return (
                <li key={item.name} className="relative">
                  {active && !item.children && (
                    <motion.div
                      layoutId="activeNavItem"
                      className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-md"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleGroup(item.name)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-md",
                          active
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>

                      {isOpen && (
                        <ul className="mt-1 ml-9 space-y-1 border-l pl-2">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href

                            return (
                              <li key={child.href} className="relative">
                                {childActive && (
                                  <motion.div
                                    layoutId="activeNavItem"
                                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-md"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  />
                                )}
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "block px-3 py-2 rounded-md relative",
                                    childActive
                                      ? "text-primary font-medium"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                  )}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md relative",
                        active
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </ScrollArea>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <p>Admin Panel v1.0</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </div>
  )
}

