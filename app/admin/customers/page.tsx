"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent
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
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Lock,
  Shield,
  User as UserIcon,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// API Base URL - should be in your .env file
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Simplified roles for filter
const roles = [
  "All Roles",
  "Customer",
  "Admin"
]

// User interface updated to match backend
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  street?: string;
  apartment?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  joinedDate?: string;
  lastLogin?: string | null;
  avatar?: string;
  // These are frontend-only properties we'll add later
  role?: string;
  orders?: number;
  totalSpent?: number;
}

// New user form interface
interface NewUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  isAdmin: boolean;
}

// Default new user
const defaultNewUser: NewUser = {
  name: "",
  email: "",
  password: "",
  phone: "",
  isAdmin: false
}

export default function UsersManagementPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<NewUser>(defaultNewUser)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    isAdmin: false
  })
  const itemsPerPage = 8

  // Function to retrieve the auth token
  const getAuthToken = () => {
    try {
      return localStorage.getItem("token") || ""
    } catch (err) {
      console.error("Error accessing localStorage for token:", err)
      return ""
    }
  }

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Fetch users from the API
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/users/usersTotal`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform backend data to match our frontend model
      const transformedUsers: User[] = data.map((user: any) => ({
        ...user,
        _id: user._id || user.id,
        role: user.isAdmin ? "Admin" : "Customer",
        // Add some default values for the frontend
        orders: user.orders || 0,
        totalSpent: user.totalSpent || 0,
        avatar: user.avatar || `/avatars/avatar-${Math.floor(Math.random() * 10) + 1}.png`
      }))
      
      setUsers(transformedUsers)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  // Get user by ID
  const getUserById = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`)
      }

      const userData = await response.json()
      return {
        ...userData,
        role: userData.isAdmin ? "Admin" : "Customer",
        // Add frontend properties
        orders: userData.orders || 0,
        totalSpent: userData.totalSpent || 0
      }
    } catch (err) {
      console.error("Error fetching user:", err)
      toast.error("Failed to load user details")
      return null
    }
  }

  // Add a new user
  const createUser = async (userData: NewUser) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          passwordHash: userData.password, // The backend expects passwordHash
          phone: userData.phone,
          isAdmin: userData.isAdmin
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to create user: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      console.error("Error creating user:", err)
      throw err
    }
  }

  // Update a user
  const updateUser = async (userId: string, userData: { name: string, email: string, phone: string }) => {
    try {
      const response = await fetch(`${API_URL}/users/edit/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to update user: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      console.error("Error updating user:", err)
      throw err
    }
  }

  // Delete a user
  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to delete user: ${response.statusText}`)
      }

      return true
    } catch (err) {
      console.error("Error deleting user:", err)
      throw err
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
      case "Customer":
      default:
        return {
          class: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <UserIcon className="h-3 w-3 mr-1" />
        }
    }
  }

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user._id))
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
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.password) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Convert role to isAdmin flag
      const userData = {
        ...newUser,
        isAdmin: newUser.isAdmin === true
      }
      
      await createUser(userData)
      toast.success("User added successfully")
      setNewUserDialogOpen(false)
      setNewUser(defaultNewUser)
      
      // Refresh the users list
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog with user data
  const openEditDialog = async (user: User) => {
    setCurrentUser(user)
    
    // Fetch fresh user data to ensure we have the latest
    try {
      const userData = await getUserById(user._id)
      if (userData) {
        setCurrentUser(userData)
        // Set edit form values
        setEditForm({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          isAdmin: userData.isAdmin
        })
      }
    } catch (error) {
      console.error("Error loading user details", error)
    }
    
    setEditUserDialogOpen(true)
  }
  
  // Handle edit user
  const handleUpdateUser = async () => {
    if (!currentUser) return
    
    setIsSubmitting(true)
    
    try {
      const userData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      }
      
      await updateUser(currentUser._id, userData)
      toast.success("User updated successfully")
      setEditUserDialogOpen(false)
      
      // Refresh the users list
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setCurrentUser(user)
    setDeleteConfirmed(false)
    setDeleteUserDialogOpen(true)
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!currentUser || !deleteConfirmed) return
    
    setIsSubmitting(true)
    
    try {
      await deleteUser(currentUser._id)
      toast.success("User deleted successfully")
      setDeleteUserDialogOpen(false)
      setCurrentUser(null)
      
      // Remove from selected users if present
      if (selectedUsers.includes(currentUser._id)) {
        setSelectedUsers(selectedUsers.filter(id => id !== currentUser._id))
      }
      
      // Refresh the users list
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user._id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = 
      roleFilter === "All Roles" || 
      (roleFilter === "Admin" && user.isAdmin) ||
      (roleFilter === "Customer" && !user.isAdmin)
    
    return matchesSearch && matchesRole
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
        <Button onClick={() => setNewUserDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
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
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchUsers}>
                  Try Again
                </Button>
              </div>
            ) : (
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
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr className="border-b">
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <p className="text-muted-foreground">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => {
                      const roleBadge = getRoleBadge(user.isAdmin ? "Admin" : "Customer")
                      
                      return (
                        <tr 
                          key={user._id} 
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300"
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleSelectUser(user._id)}
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
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`flex w-fit items-center ${roleBadge.class}`}>
                              {roleBadge.icon}
                              {user.isAdmin ? "Admin" : "Customer"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end">
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
                                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
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
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && !error && filteredUsers.length > 0 && (
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
      )}

      {/* Add New User Dialog */}
      <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account.
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
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={newUser.isAdmin ? "Admin" : "Customer"}
                onValueChange={(value) => setNewUser({...newUser, isAdmin: value === "Admin"})}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={isSubmitting || !newUser.name || !newUser.email || !newUser.phone || !newUser.password}
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
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input 
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editForm.isAdmin ? "Admin" : "Customer"}
                  onValueChange={(value) => setEditForm({...editForm, isAdmin: value === "Admin"})}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={isSubmitting || !editForm.name || !editForm.email || !editForm.phone}
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
                {currentUser.isAdmin
                  ? "This will revoke all access and permissions for this user."
                  : "This will also delete all associated orders, reviews, and other customer data."
                }
              </p>
              
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="confirm-delete" 
                    checked={deleteConfirmed}
                    onCheckedChange={(checked) => setDeleteConfirmed(checked === true)}
                  />
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
                disabled={isSubmitting || !deleteConfirmed}
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