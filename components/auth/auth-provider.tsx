"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
// import { useRouter, usePathname } from "next/navigation" // Commented out navigation import
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  avatar?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: "user" | "admin") => Promise<void>
  register: (name: string, email: string, password: string, role: "user" | "admin") => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "user@example.com",
    password: "password123", 
    role: "user",
    avatar: "/placeholder.svg?height=32&width=32&text=JD",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123", 
    role: "admin",
    avatar: "/placeholder.svg?height=32&width=32&text=AU",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // const router = useRouter() // Commented out navigation hook
  // const pathname = usePathname() // Commented out navigation hook
  const { toast } = useToast()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // useEffect(() => { 
  //   if (!isLoading) {
  //     const publicRoutes = [
  //       "/login",
  //       "/register",
  //       "/forgot-password",
  //       "/",
  //       "/shop",
  //       "/categories",
  //       "/new-arrivals",
  //       "/sale",
  //     ]

  //     const adminRoutes = ["/admin", "/admin/dashboard", "/admin/products", "/admin/orders", "/admin/users"]
  //     const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  //     if (!user && !publicRoutes.includes(pathname) && pathname !== "/") {
  //       router.push("/login")
  //     }

  //     if (user && user.role === "user" && isAdminRoute) {
  //       toast({
  //         title: "Access Denied",
  //         description: "You don't have permission to access this page.",
  //         variant: "destructive",
  //       })
  //       router.push("/")
  //     }

  //     if (user && (pathname === "/login" || pathname === "/register")) {
  //       if (user.role === "admin") {
  //         router.push("/admin/dashboard")
  //       } else {
  //         router.push("/")
  //       }
  //     }
  //   }
  // }, [isLoading, user, pathname, router, toast])

  const login = async (email: string, password: string, role: "user" | "admin") => {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const foundUser = mockUsers.find((u) => u.email === email && u.password === password && u.role === role)

      if (!foundUser) {
        throw new Error("Invalid credentials")
      }

      const { password: _, ...userWithoutPassword } = foundUser

      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))

      if (role === "admin") {
        // router.push("/admin/dashboard") // Commented out routing
      } else {
        // router.push("/") // Commented out routing
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${foundUser.name}!`,
      })
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: "user" | "admin") => {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (mockUsers.some((u) => u.email === email)) {
        throw new Error("Email already in use")
      }

      const newUser = {
        id: `${mockUsers.length + 1}`,
        name,
        email,
        password,
        role,
        avatar: `/placeholder.svg?height=32&width=32&text=${name.charAt(0)}`,
      }

      mockUsers.push(newUser)

      const { password: _, ...userWithoutPassword } = newUser

      if (role === "admin") {
        toast({
          title: "Registration Pending",
          description: "Admin registration requires approval. You'll be notified once approved.",
        })
        // router.push("/login") // Commented out routing
      } else {
        setUser(userWithoutPassword)
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))

        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully!",
        })

        // router.push("/") // Commented out routing
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    // router.push("/login") // Commented out routing
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
