"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingCart, Users, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import SideNavigation from "./side-navigation"

export default function MobileNavigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingCart,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Menu",
      href: "#",
      icon: Menu,
      sheet: true,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-10">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          if (item.sheet) {
            return (
              <Sheet key={item.name} open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs mt-1">{item.name}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px]">
                  <SideNavigation />
                </SheetContent>
              </Sheet>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full relative",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 h-1 w-12 bg-primary rounded-b-md"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

