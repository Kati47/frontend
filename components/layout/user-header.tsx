"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ShoppingCart, Heart, Search, Menu, User, LogOut, Clock, Settings, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export default function UserHeader() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

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
              <div className="flex flex-col h-full">
                <div className="py-4 border-b">
                  <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    StyleShop
                  </Link>
                </div>

                {user && (
                  <div className="py-4 border-b">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-1 py-4">
                  {routes.map((route) => (
                    <SheetClose asChild key={route.path}>
                      <Link
                        href={route.path}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md",
                          pathname === route.path
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {route.name}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="border-t py-4 mt-auto">
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Clock className="h-5 w-5" />
                          Order History
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Heart className="h-5 w-5" />
                          Favorites
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Settings className="h-5 w-5" />
                          Settings
                        </Link>
                      </SheetClose>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/register"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          Register
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
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
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

