"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Settings, LogOut, User, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from "@/lib/i18n/client"
import { LanguageSelector } from "@/components/language-selector"

export default function AdminHeader() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [notifications] = useState(5)

  return (
    <header className="border-b bg-background h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <LanguageSelector />

        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="border-primary"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary-foreground" />
          <span className="sr-only">{t("toggle_theme")}</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {notifications}
            </Badge>
          )}
          <span className="sr-only">{t("admin.notifications")}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("admin.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
         
            <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer">
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}