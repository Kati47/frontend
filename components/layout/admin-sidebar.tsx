"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Tag,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
} from "lucide-react"

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<string[]>([])

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
     
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      name: "Promo Codes",
      href: "/admin/promo",
      icon: Tag,
    },
    {
      name: "Reviews",
      href: "/admin/reviews",
      icon: BarChart3,
      
    },
    
    
  ]

  const isActive = (item: any) => {
    if (pathname === item.href) return true
    if (item.children && item.children.some((child: any) => pathname === child.href)) return true
    return false
  }

  return (
    <div className="w-64 border-r h-screen sticky top-0 flex flex-col bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/admin/dashboard" className="font-bold text-xl">
          Admin Panel
        </Link>
      </div>

      <div className="p-4 border-b">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="py-2">
          <ul className="space-y-1 px-2">
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Home className="h-4 w-4" />
                <span>View Store</span>
              </Link>
            </li>

            <li className="pt-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Main
              </div>
            </li>

            {navItems.map((item) => {
              const active = isActive(item)
              const isOpen = openGroups.includes(item.name)

              return (
                <li key={item.name} className="relative">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleGroup(item.name)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>

                      {isOpen && (
                        <ul className="mt-1 ml-9 space-y-1 border-l pl-2">
                          {item.children.map((child: any) => {
                            const childActive = pathname === child.href

                            return (
                              <li key={child.href} className="relative">
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "block px-3 py-2 text-sm rounded-md relative",
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
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

