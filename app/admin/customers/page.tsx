"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Eye,
  Upload,
  Copy,
  Mail,
  Lock,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Mock users data
const users = [
  {
    id: "USER001",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Customer",
    status: "Active",
    verified: true,
    joinedDate: "2023-01-15",
    lastLogin: "2023-11-28T09:23:42",
    avatar: "/avatars/avatar-1.png",
    orders: 12,
    totalSpent: 1458.99
  },
  {
    id: "USER002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Customer",
    status: "Active",
    verified: true,
    joinedDate: "2023-02-21",
    lastLogin: "2023-11-25T16:45:12",
    avatar: "/avatars/avatar-2.png",
    orders: 5,
    totalSpent: 732.50
  },
  {
    id: "USER003",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    role: "Admin",
    status: "Active",
    verified: true,
    joinedDate: "2022-11-05",
    lastLogin: "2023-11-27T14:15:33",
    avatar: "/avatars/avatar-3.png",
    orders: 0,
    totalSpent: 0
  },
  {
    id: "USER004",
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "Customer",
    status: "Inactive",
    verified: true,
    joinedDate: "2023-03-18",
    lastLogin: "2023-08-02T10:11:22",
    avatar: "/avatars/avatar-4.png",
    orders: 3,
    totalSpent: 259.97
  },
  {
    id: "USER005",
    name: "Michael Wilson",
    email: "michael.w@example.com",
    role: "Customer",
    status: "Suspended",
    verified: true,
    joinedDate: "2023-04-29",
    lastLogin: "2023-10-15T17:05:41",
    avatar: "/avatars/avatar-5.png",
    orders: 8,
    totalSpent: 1045.23
  },
  {
    id: "USER006",
    name: "Sarah Thompson",
    email: "sarah.t@example.com",
    role: "Staff",
    status: "Active",
    verified: true,
    joinedDate: "2023-01-30",
    lastLogin: "2023-11-28T11:33:29",
    avatar: "/avatars/avatar-6.png",
    orders: 0,
    totalSpent: 0
  },
  {
    id: "USER007",
    name: "David Rodriguez",
    email: "david.r@example.com",
    role: "Customer",
    status: "Active",
    verified: false,
    joinedDate: "2023-11-20",
    lastLogin: null,
    avatar: "/avatars/avatar-7.png",
    orders: 0,
    totalSpent: 0
  },
  {
    id: "USER008",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    role: "Customer",
    status: "Active",
    verified: true,
    joinedDate: "2023-05-14",
    lastLogin: "2023-11-26T20:15:09",
    avatar: "/avatars/avatar-8.png",
    orders: 6,
    totalSpent: 823.75
  },
  {
    id: "USER009",
    name: "Thomas White",
    email: "thomas.w@example.com",
    role: "Customer",
    status: "Inactive",
    verified: true,
    joinedDate: "2023-02-09",
    lastLogin: "2023-07-22T12:45:51",
    avatar: "/avatars/avatar-9.png",
    orders: 2,
    totalSpent: 149.98
  },
  {
    id: "USER010",
    name: "Jennifer Martinez",
    email: "jennifer.m@example.com",
    role: "Customer",
    status: "Active",
    verified: true,
    joinedDate: "2023-03-27",
    lastLogin: "2023-11-27T19:21:14",
    avatar: "/avatars/avatar-10.png",
    orders: 9,
    totalSpent: 1287.35
  }
]

// Roles for filter
const roles = [
  "All Roles",
  "Customer",
  "Admin",
  "Staff"
]

// User statuses
const statuses = [
  { value: "all", label: "All Users" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "unverified", label: "Unverified" }
]

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  joinedDate: string;
  lastLogin: string | null;
  avatar: string;
  orders: number;
  totalSpent: number;
}

// New user form interface
interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

// Default new user
const defaultNewUser: NewUser = {
  name: "",
  email: "",
  password: "",
  role: "Customer",
  status: "Active"
}

export default function UsersManagementPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<NewUser>(defaultNewUser)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const itemsPerPage = 8
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return {
          class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: <UserCheck className="h-3 w-3 mr-1" />
        }
      case "Inactive":
        return {
          class: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <UserX className="h-3 w-3 mr-1" />
        }
      case "Suspended":
        return {
          class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: <ShieldAlert className="h-3 w-3 mr-1" />
        }
      default:
        return {
          class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: <User className="h-3 w-3 mr-1" />
        }
    }
  }

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return {
          class: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          icon: <Shield className="h-3 w-3 mr-1" />
        }
      case "Staff":
        return {
          class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: <ShieldCheck className="h-3 w-3 mr-1" />
        }
      case "Customer":
        return {
          class: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <User className="h-3 w-3 mr-1" />
        }
      default:
        return {
          class: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <User className="h-3 w-3 mr-1" />
        }
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  // Format datetime
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never"
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  // Handle single select
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  // Handle add new user
  const handleAddUser = () => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success("User added successfully")
      setNewUserDialogOpen(false)
      setNewUser(defaultNewUser)
      setIsSubmitting(false)
    }, 1000)
  }

  // Handle edit user
  const handleUpdateUser = () => {
    if (!currentUser) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success("User updated successfully")
      setEditUserDialogOpen(false)
      setIsSubmitting(false)
    }, 1000)
  }

  // Handle delete user
  const handleDeleteUser = () => {
    if (!currentUser) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success("User deleted successfully")
      setDeleteUserDialogOpen(false)
      setCurrentUser(null)
      setIsSubmitting(false)
      
      // Remove from selected users if present
      if (selectedUsers.includes(currentUser.id)) {
        setSelectedUsers(selectedUsers.filter(id => id !== currentUser.id))
      }
    }, 1000)
  }

  // Handle bulk actions on selected users
  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return
    
    // Simulate API call
    setTimeout(() => {
      switch (action) {
        case "activate":
          toast.success(`${selectedUsers.length} users activated`)
          break
        case "deactivate":
          toast.success(`${selectedUsers.length} users deactivated`)
          break
        case "delete":
          toast.success(`${selectedUsers.length} users deleted`)
          setSelectedUsers([])
          break
      }
    }, 1000)
  }

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setCurrentUser(user)
    setEditUserDialogOpen(true)
  }
  
  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setCurrentUser(user)
    setDeleteUserDialogOpen(true)
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = 
      roleFilter === "All Roles" || user.role === roleFilter
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.status === "Active") ||
      (statusFilter === "inactive" && user.status === "Inactive") ||
      (statusFilter === "suspended" && user.status === "Suspended") ||
      (statusFilter === "unverified" && !user.verified)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-2">Manage your users and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setNewUserDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 self-end md:self-auto">
          {selectedUsers.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions ({selectedUsers.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600" 
                  onClick={() => handleBulkAction("delete")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm" disabled={selectedUsers.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Export Selected
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="admins">Admins &amp; Staff</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th scope="col" className="p-4">
                        <div className="flex items-center">
                          <input
                            id="checkbox-all"
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300"
                            onChange={handleSelectAll}
                            checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                          />
                          <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">User</th>
                      <th scope="col" className="px-4 py-3">Role</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">Joined Date</th>
                      <th scope="col" className="px-4 py-3">Last Login</th>
                      <th scope="col" className="px-4 py-3">Orders</th>
                      <th scope="col" className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => {
                      const statusBadge = getStatusBadge(user.status)
                      const roleBadge = getRoleBadge(user.role)
                      
                      return (
                        <tr 
                          key={user.id} 
                          className="border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleSelectUser(user.id)}
                              />
                              <label className="sr-only">checkbox</label>
                            </div>
                          </td>
                          <td className="flex items-center gap-3 px-4 py-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                              <Image 
                                src={user.avatar || "/placeholder-avatar.png"} 
                                alt={user.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 object-cover rounded-full"
                                priority
                              />
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                            {!user.verified && (
                              <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
                                Unverified
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`flex w-fit items-center ${roleBadge.class}`}>
                              {roleBadge.icon}
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`flex w-fit items-center ${statusBadge.class}`}>
                              {statusBadge.icon}
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(user.joinedDate)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {user.lastLogin ? formatDateTime(user.lastLogin) : "Never"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{user.orders}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(user.totalSpent)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditDialog(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    {user.status === "Active" ? (
                                      <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => openDeleteDialog(user)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Other tab contents would be similar with filtered data */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Customer users filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Admin & Staff users filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suspended" className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Suspended users filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add New User Dialog */}
      <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive an email to set up their password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                placeholder="John Doe" 
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password (optional)</Label>
              <Input 
                id="password"
                type="password"
                placeholder="Leave empty to send setup email"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                If left empty, an email will be sent to the user to set up their password.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={newUser.role}
                onValueChange={(value) => setNewUser({...newUser, role: value})}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="send-email" 
                defaultChecked 
              />
              <Label htmlFor="send-email">Send welcome email</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewUserDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser} 
              disabled={isSubmitting || !newUser.name || !newUser.email}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                  Creating...
                </>
              ) : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {currentUser && (
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details and account settings
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                  <Image 
                    src={currentUser.avatar || "/placeholder-avatar.png"} 
                    alt={currentUser.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <Button variant="outline" size="sm" className="mb-2">
                    Change Avatar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    Remove Avatar
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input 
                    id="edit-name"
                    defaultValue={currentUser.name}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email"
                    type="email"
                    defaultValue={currentUser.email}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select defaultValue={currentUser.role}>
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue={currentUser.status}>
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Security Settings</h3>
                <Button variant="outline" size="sm" className="mb-2">
                  <Lock className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch 
                    id="force-password-change" 
                  />
                  <Label htmlFor="force-password-change">Force password change on next login</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditUserDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Dialog */}
      {currentUser && (
        <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete this user account.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 border rounded-md">
                <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                  <Image 
                    src={currentUser.avatar || "/placeholder-avatar.png"} 
                    alt={currentUser.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 object-cover rounded-full"
                  />
                </div>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {currentUser.role === "Customer" 
                  ? "This will also delete all associated orders, reviews, and other customer data."
                  : "This will revoke all access and permissions for this user."
                }
              </p>
              
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="confirm-delete" />
                  <label
                    htmlFor="confirm-delete"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I confirm that I want to delete this user
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteUserDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                    Deleting...
                  </>
                ) : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}