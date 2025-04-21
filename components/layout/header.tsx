"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { ShoppingCart, Heart, User, Search, Menu, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Categories", path: "/categories" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "Sale", path: "/sale" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                {routes.map((route) => (
                  <SheetClose asChild key={route.path}>
                    <Link
                      href={route.path}
                      className={cn(
                        "flex items-center gap-2 text-lg font-medium",
                        pathname === route.path ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {route.name}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href="/favorites"
                    className={cn(
                      "flex items-center gap-2 text-lg font-medium",
                      pathname === "/favorites" ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Heart className="h-5 w-5" />
                    Favorites
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/orders"
                    className={cn(
                      "flex items-center gap-2 text-lg font-medium",
                      pathname === "/orders" ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Clock className="h-5 w-5" />
                    Order History
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">StyleShop</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.path ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center relative w-full max-w-sm mx-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search products..." className="pl-8 rounded-full bg-muted" />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Link href="/favorites">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                3
              </Badge>
              <span className="sr-only">Favorites</span>
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                2
              </Badge>
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                  <Clock className="h-4 w-4" />
                  Order History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/favorites" className="flex items-center gap-2 cursor-pointer">
                  <Heart className="h-4 w-4" />
                  Favorites
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

