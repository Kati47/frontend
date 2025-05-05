"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
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
import { ShoppingCart, Heart, Search, Menu, User, LogOut, Clock, Settings, Sun, Moon, Globe } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation, SUPPORTED_LANGUAGES } from "@/lib/i18n/client"

export default function UserHeader() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { t, locale, changeLocale } = useTranslation()
  const [imgSrc, setImgSrc] = useState("/lloo.jpeg")
  const [logoSrc, setLogoSrc] = useState("/logo.png")

  const routes = [
    { name: t("home"), path: "/" },
    { name: t("shop"), path: "/shop" },
    { name: t("categories"), path: "/categories" },
    { name: t("new_arrivals"), path: "/new-arrivals" },
    { name: t("sale"), path: "/sale" },
  ]
  
  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    try {
      const storedUserId = localStorage.getItem("userId") || ""
      return storedUserId
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }

  // Check if user is logged in based on localStorage
  useEffect(() => {
    const userId = getUserIdFromLocalStorage()
    setIsLoggedIn(!!userId) // Convert to boolean
  }, [])

  // Handle logout by clearing localStorage
  const handleLogout = () => {
    try {
      localStorage.removeItem("userId")
      setIsLoggedIn(false)
      // Call your auth provider's logout if needed
      if (logout) logout()
    } catch (err) {
      console.error("Error logging out:", err)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("toggle_menu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                {/* Logo section with reduced size and improved scaling */}
                <div className="pt-8 pb-6 flex justify-center border-b border-slate-100 dark:border-slate-700">
                  <div className="rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(11,48,147,0.05)] w-auto h-auto flex items-center justify-center">
                    {/* Simplified img tag with better size control */}
                    <img
                      src={imgSrc}
                      alt="Kadéa Design Logo"
                      style={{ 
                        maxWidth: '120px',  
                        maxHeight: '60px',
                        objectFit: 'contain'
                      }}
                      onError={() => setImgSrc("/fallback-logo.png")}
                    />
                  </div>
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
                  <div className="px-4 mb-4 flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{SUPPORTED_LANGUAGES[locale as keyof typeof SUPPORTED_LANGUAGES]?.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
                          <DropdownMenuItem 
                            key={code} 
                            onClick={() => changeLocale(code)}
                            className={locale === code ? "bg-muted font-medium" : ""}
                          >
                            <span className="mr-2">{flag}</span>
                            <span>{name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Use isLoggedIn state instead of user */}
                  {isLoggedIn ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Clock className="h-5 w-5" />
                          {t("order_history")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Heart className="h-5 w-5" />
                          {t("favorites")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Settings className="h-5 w-5" />
                          {t("settings")}
                        </Link>
                      </SheetClose>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                      >
                        <LogOut className="h-5 w-5" />
                        {t("logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          {t("login")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/register"
                          className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          {t("register")}
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Main navbar logo with smaller dimensions */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
              <img
                src={logoSrc}
                alt="Logo"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                onError={() => setLogoSrc("/fallback-logo.png")}
              />
            </div>
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

       
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{SUPPORTED_LANGUAGES[locale as keyof typeof SUPPORTED_LANGUAGES]?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
                <DropdownMenuItem 
                  key={code} 
                  onClick={() => changeLocale(code)}
                  className={locale === code ? "bg-muted font-medium" : ""}
                >
                  <span className="mr-2">{flag}</span>
                  <span>{name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t("toggle_theme")}</span>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">{t("search")}</span>
          </Button>

          <Link href="/favorites">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                3
              </Badge>
              <span className="sr-only">{t("favorites")}</span>
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                2
              </Badge>
              <span className="sr-only">{t("cart")}</span>
            </Button>
          </Link>

          {/* Check for isLoggedIn instead of user */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    {user && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback>{user ? user.name.charAt(0) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("my_account")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                    <Clock className="h-4 w-4" />
                    {t("order_history")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="h-4 w-4" />
                    {t("favorites")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}