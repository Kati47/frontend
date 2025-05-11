"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ShoppingCart, Heart, Search, Menu, User, LogOut, Clock, Sun, Moon, Globe } from "lucide-react"
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
  const router = useRouter()

  const routes = [
    { name: t("common.shop"), path: "/shop" },
    { name: t("navigation.productComparison"), path: "/compare" },
    { name: t("common.favorites"), path: "/favorites" },
    { name: t("navigation.roomPlanner"), path: "/room-planner" },
    { name: t("navigation.saveForLater"), path: "/saved-for-later" },
    { name: t("order_history"), path: "/orders" },
    { name: t("common.cart"), path: "/cart" },
  ]

  useEffect(() => {
    const userId = localStorage.getItem("userId") || ""
    setIsLoggedIn(!!userId)
  }, [])

  const handleLogout = () => {
    if (window.confirm(t("logout_confirmation") || "Are you sure you want to log out?")) {
      localStorage.removeItem("userId")
      setIsLoggedIn(false)
      if (logout) logout()
      router.push("/login")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          {/* Mobile menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
              <div className="pt-6 pb-4 flex items-center justify-center border-b border-slate-100 dark:border-slate-700">
                <Link href="/" className="text-xl font-bold text-[#0b3093] dark:text-[#5a89ff]">
                  Kadéa Design
                </Link>
              </div>

              {user && (
                <div className="py-4 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar || ""} alt={user.name || "User"} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
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

              <div className="mt-auto border-t py-4">
                {/* Language switcher */}
                <div className="px-4 mb-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {SUPPORTED_LANGUAGES[locale as keyof typeof SUPPORTED_LANGUAGES]?.name}
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

                {isLoggedIn ? (
                  <>
                    <SheetClose asChild>
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted">
                        <Clock className="h-5 w-5" />
                        {t("order_history")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/favorites" className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted">
                        <Heart className="h-5 w-5" />
                        {t("favorites")}
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
                      <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted">
                        {t("login")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/register" className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted">
                        {t("register")}
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-32 h-24 overflow-hidden flex items-center justify-center">
             <div className="pt-6 pb-4 flex items-center justify-center border-b border-slate-100 dark:border-slate-700">
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold text-[#0b3093] dark:text-[#5a89ff]">Kadéa Design</span>
      </Link>
    </div>
            </div>
          </Link>

          {/* Desktop navigation */}
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

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {SUPPORTED_LANGUAGES[locale as keyof typeof SUPPORTED_LANGUAGES]?.name}
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

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
