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
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n/client";

// API URL should be in your .env file
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
 const { t } = useTranslation(); 
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
        // Some default values for the frontend
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
        // Frontend properties
        orders: userData.orders || 0,
        totalSpent: userData.totalSpent || 0
      }
    } catch (err) {
      console.error("Error fetching user:", err)
      toast.error("Failed to load user details")
      return null
    }
  }

  // Create a new user
  const createUser = async (userData: NewUser) => {
    try {
      console.log('Sending request to:', `${API_URL}/users/add`);
      console.log('Request data:', { 
        ...userData, 
        password: userData.password ? '******' : undefined 
      });
      
      const response = await fetch(`${API_URL}/users/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,  // Backend expects password and will hash it
          phone: userData.phone,
          isAdmin: userData.isAdmin
        })
      })

      // Handle non-JSON responses (like HTML error pages)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Received non-JSON response:', text);
        throw new Error('Server returned invalid response format. Check server logs.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create user: ${response.statusText}`);
      }

      return await response.json();
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
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.customers.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("admin.customers.description")}</p>
        </div>
        <Button onClick={() => setNewUserDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.customers.addUser")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.customers.searchPlaceholder")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t("admin.customers.filterByRole")} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {t(`admin.customers.roles.${role.toLowerCase().replace(/\s+/g, "")}`)}
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
                <span className="ml-2 text-muted-foreground">{t("admin.customers.loadingUsers")}</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchUsers}>
                  {t("common.tryAgain")}
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
                        <label htmlFor="checkbox-all" className="sr-only">{t("common.checkbox")}</label>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3">{t("admin.customers.tableHeaders.user")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.customers.tableHeaders.role")}</th>
                    <th scope="col" className="px-4 py-3 text-right">{t("admin.customers.tableHeaders.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr className="border-b">
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <p className="text-muted-foreground">{t("admin.customers.noUsersFound")}</p>
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
                              <label className="sr-only">{t("common.checkbox")}</label>
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
                              {t(`admin.customers.roles.${user.isAdmin ? "admin" : "customer"}`)}
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
                                  <DropdownMenuLabel>{t("admin.customers.actions")}</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    {t("admin.customers.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => openDeleteDialog(user)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t("admin.customers.delete")}
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
            {t("admin.customers.pagination.showing", { 
              from: startIndex + 1, 
              to: Math.min(endIndex, filteredUsers.length), 
              total: filteredUsers.length 
            })}
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
            <DialogTitle>{t("admin.customers.dialogs.add.title")}</DialogTitle>
            <DialogDescription>
              {t("admin.customers.dialogs.add.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("admin.customers.fields.name")}</Label>
              <Input 
                id="name"
                placeholder={t("admin.customers.placeholders.name")} 
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("admin.customers.fields.email")}</Label>
              <Input 
                id="email"
                type="email"
                placeholder={t("admin.customers.placeholders.email")}
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t("admin.customers.fields.phone")}</Label>
              <Input 
                id="phone"
                type="tel"
                placeholder={t("admin.customers.placeholders.phone")}
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t("admin.customers.fields.password")}</Label>
              <Input 
                id="password"
                type="password"
                placeholder={t("admin.customers.placeholders.password")}
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">{t("admin.customers.fields.role")}</Label>
              <Select 
                value={newUser.isAdmin ? "Admin" : "Customer"}
                onValueChange={(value) => setNewUser({...newUser, isAdmin: value === "Admin"})}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t("admin.customers.placeholders.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">{t("admin.customers.roles.customer")}</SelectItem>
                  <SelectItem value="Admin">{t("admin.customers.roles.admin")}</SelectItem>
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
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleAddUser} 
              disabled={isSubmitting || !newUser.name || !newUser.email || !newUser.phone || !newUser.password}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                  {t("admin.customers.dialogs.add.creating")}
                </>
              ) : t("admin.customers.dialogs.add.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {currentUser && (
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("admin.customers.dialogs.edit.title")}</DialogTitle>
              <DialogDescription>
                {t("admin.customers.dialogs.edit.description")}
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
                    {t("admin.customers.dialogs.edit.changeAvatar")}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    {t("admin.customers.dialogs.edit.removeAvatar")}
                  </Button>
                </div>
              </div>

              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">{t("admin.customers.fields.name")}</Label>
                  <Input 
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">{t("admin.customers.fields.email")}</Label>
                  <Input 
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">{t("admin.customers.fields.phone")}</Label>
                <Input 
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-role">{t("admin.customers.fields.role")}</Label>
                <Select 
                  value={editForm.isAdmin ? "Admin" : "Customer"}
                  onValueChange={(value) => setEditForm({...editForm, isAdmin: value === "Admin"})}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder={t("admin.customers.placeholders.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">{t("admin.customers.roles.customer")}</SelectItem>
                    <SelectItem value="Admin">{t("admin.customers.roles.admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditUserDialogOpen(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleUpdateUser}
                disabled={isSubmitting || !editForm.name || !editForm.email || !editForm.phone}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                    {t("admin.customers.dialogs.edit.saving")}
                  </>
                ) : t("admin.customers.dialogs.edit.save")}
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
              <DialogTitle>{t("admin.customers.dialogs.delete.title")}</DialogTitle>
              <DialogDescription>
                {t("admin.customers.dialogs.delete.description")}
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
                  ? t("admin.customers.dialogs.delete.adminWarning")
                  : t("admin.customers.dialogs.delete.customerWarning")
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
                    {t("admin.customers.dialogs.delete.confirmText")}
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
                {t("common.cancel")}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isSubmitting || !deleteConfirmed}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                    {t("admin.customers.dialogs.delete.deleting")}
                  </>
                ) : t("admin.customers.dialogs.delete.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}