"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n/client"
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
  Copy,
  Percent,
  DollarSign,
  Truck,
  Tag,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// Promo types
const promoTypes = [
  "All Types",
  "percentage",
  "fixed_amount",
  "free_shipping",
  "buy_x_get_y"
]

// Promo type display names
const promoTypeDisplayNames = {
  "percentage": "Percentage",
  "fixed_amount": "Fixed Amount",
  "free_shipping": "Free Shipping",
  "buy_x_get_y": "Buy X Get Y"
}

// Promo interface
interface PromoCode {
  _id?: string;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  userUsageLimit: number;
  currentUsage: number;
  isActive: boolean;
  description?: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  firstTimeOnly?: boolean;
}

// Default new promo code template
const defaultNewPromo: PromoCode = {
  code: "",
  type: "percentage",
  value: 0,
  minOrderValue: 0,
  maxDiscount: null,
  startDate: new Date().toISOString(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
  usageLimit: 100,
  userUsageLimit: 1,
  currentUsage: 0,
  isActive: true,
  description: "",
  applicableProducts: [],
  applicableCategories: [],
  excludedProducts: [],
  excludedCategories: [],
  firstTimeOnly: false
}

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function PromoCodesManagementPage() {
  const { t } = useTranslation();
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPromoCodes, setTotalPromoCodes] = useState(0)
  const [selectedPromos, setSelectedPromos] = useState<string[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newPromoDialogOpen, setNewPromoDialogOpen] = useState(false)
  const [currentPromo, setCurrentPromo] = useState<PromoCode | null>(null)
  const [newPromo, setNewPromo] = useState<PromoCode>(defaultNewPromo)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Fetch promo codes from API
  const fetchPromoCodes = async () => {
    setLoading(true)
    setError("")
    
    try {
      const token = getAuthToken();
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (searchQuery) {
        params.append('code', searchQuery);
      }
      
      if (typeFilter !== "All Types") {
        params.append('type', typeFilter);
      }
      
      const response = await fetch(`${API_URL}/promo?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("admin.promo.errors.failedToLoad"));
      }
      
      const data = await response.json();
      setPromoCodes(data.promoCodes || []);
      setTotalPages(data.totalPages || 1);
      setTotalPromoCodes(data.totalPromoCodes || 0);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      setError(error instanceof Error ? error.message : t("admin.promo.errors.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  // Create a new promo code
  const createPromoCode = async (promoData: PromoCode) => {
    setIsSubmitting(true);
    
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_URL}/promo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("admin.promo.errors.failedToCreate"));
      }
      
      const data = await response.json();
      toast({
        title: t("admin.promo.toasts.success.title"),
        description: t("admin.promo.toasts.success.promoCreated"),
      });
      
      // Refresh the list
      fetchPromoCodes();
      return data;
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast({
        title: t("admin.promo.toasts.error.title"),
        description: error instanceof Error ? error.message : t("admin.promo.errors.failedToCreate"),
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing promo code
  const updatePromoCode = async (id: string, promoData: Partial<PromoCode>) => {
    setIsSubmitting(true);
    
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_URL}/promo/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("admin.promo.errors.failedToUpdate"));
      }
      
      const data = await response.json();
      toast({
        title: t("admin.promo.toasts.success.title"),
        description: t("admin.promo.toasts.success.promoUpdated"),
      });
      
      // Refresh the list
      fetchPromoCodes();
      return data;
    } catch (error) {
      console.error('Error updating promo code:', error);
      toast({
        title: t("admin.promo.toasts.error.title"),
        description: error instanceof Error ? error.message : t("admin.promo.errors.failedToUpdate"),
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a promo code
  const deletePromoCode = async (id: string) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_URL}/promo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("admin.promo.errors.failedToDelete"));
      }
      
      toast({
        title: t("admin.promo.toasts.success.title"),
        description: t("admin.promo.toasts.success.promoDeleted"),
      });
      
      // Refresh the list
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast({
        title: t("admin.promo.toasts.error.title"),
        description: error instanceof Error ? error.message : t("admin.promo.errors.failedToDelete"),
        variant: "destructive"
      });
    }
  };

  // Load promo codes on initial load and when filters change
  useEffect(() => {
    fetchPromoCodes();
  }, [currentPage, typeFilter]);

  // Open edit dialog
  const openEditDialog = (promo: PromoCode) => {
    setCurrentPromo({...promo})
    setEditDialogOpen(true)
  }

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPromo || !currentPromo._id) return
    
    try {
      await updatePromoCode(currentPromo._id, currentPromo);
      setEditDialogOpen(false);
    } catch (error) {
      // Error is handled in updatePromoCode
    }
  }

  // Handle new promo form submit
  const handleNewPromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!newPromo.code || newPromo.value < 0) {
      toast({
        title: t("admin.promo.toasts.error.validationError"),
        description: t("admin.promo.toasts.error.requiredFields"),
        variant: "destructive"
      })
      return
    }
    
    try {
      await createPromoCode(newPromo);
      setNewPromoDialogOpen(false);
      setNewPromo(defaultNewPromo);
    } catch (error) {
      // Error is handled in createPromoCode
    }
  }

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
    fetchPromoCodes();
  }

  // Generate a random code
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Get discount type icon
  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4 mr-1" />
      case "fixed_amount":
        return <DollarSign className="h-4 w-4 mr-1" />
      case "free_shipping":
        return <Truck className="h-4 w-4 mr-1" />
      case "buy_x_get_y":
        return <Tag className="h-4 w-4 mr-1" />
      default:
        return <Tag className="h-4 w-4 mr-1" />
    }
  }

  // Get status badge info
  const getStatusBadge = (promo: PromoCode) => {
    const now = new Date()
    const startDate = new Date(promo.startDate)
    const endDate = new Date(promo.endDate)
    
    if (!promo.isActive) {
      return {
        status: t("admin.promo.status.inactive"),
        class: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      }
    } else if (now < startDate) {
      return {
        status: t("admin.promo.status.scheduled"),
        class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      }
    } else if (now > endDate) {
      return {
        status: t("admin.promo.status.expired"),
        class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }
    } else if (promo.currentUsage >= promo.usageLimit) {
      return {
        status: t("admin.promo.status.exhausted"),
        class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      }
    } else {
      return {
        status: t("admin.promo.status.active"),
        class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      }
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Format discount value
  const formatDiscountValue = (promo: PromoCode) => {
    switch (promo.type) {
      case "percentage":
        return `${promo.value}%`
      case "fixed_amount":
        return `$${promo.value}`
      case "free_shipping":
        return t("admin.promo.discounts.freeShipping")
      case "buy_x_get_y":
        return t("admin.promo.discounts.buyXGetFree", { value: promo.value })
      default:
        return `${promo.value}`
    }
  }

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPromos(promoCodes.map(promo => promo._id || ''))
    } else {
      setSelectedPromos([])
    }
  }

  // Handle single select
  const handleSelectPromo = (promoId: string) => {
    if (selectedPromos.includes(promoId)) {
      setSelectedPromos(selectedPromos.filter(id => id !== promoId))
    } else {
      setSelectedPromos([...selectedPromos, promoId])
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedPromos.length === 0) return;
    
    const confirmDelete = window.confirm(t("admin.promo.confirmDeleteMultiple", { count: selectedPromos.length }));
    
    if (confirmDelete) {
      try {
        const token = getAuthToken();
        
        // Delete promos one by one
        for (const id of selectedPromos) {
          await fetch(`${API_URL}/promo/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
        
        toast({
          title: t("admin.promo.toasts.success.title"),
          description: t("admin.promo.toasts.success.promosDeleted", { count: selectedPromos.length }),
        });
        
        setSelectedPromos([]);
        fetchPromoCodes();
      } catch (error) {
        console.error('Error deleting promo codes:', error);
        toast({
          title: t("admin.promo.toasts.error.title"),
          description: t("admin.promo.errors.bulkDeleteFailed"),
          variant: "destructive"
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.promo.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("admin.promo.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewPromoDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.promo.addPromoCode")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.promo.searchPlaceholder")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="sr-only">{t("common.search")}</button>
          </form>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t("admin.promo.discountType")} />
            </SelectTrigger>
            <SelectContent>
              {promoTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "All Types" 
                    ? t("admin.promo.filters.allTypes") 
                    : t(`admin.promo.discountTypes.${type.replace('_', '')}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
      
        </div>
        
        {selectedPromos.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("admin.promo.deleteSelected", { count: selectedPromos.length })}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            {loading ? (
              <div className="p-6 flex justify-center">
                <p>{t("admin.promo.loading")}</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={fetchPromoCodes}
                >
                  {t("common.tryAgain")}
                </Button>
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">{t("admin.promo.noPromosFound")}</p>
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
                          checked={selectedPromos.length === promoCodes.length && promoCodes.length > 0}
                        />
                        <label htmlFor="checkbox-all" className="sr-only">{t("common.checkbox")}</label>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3">{t("admin.promo.tableHeaders.code")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.promo.tableHeaders.discount")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.promo.tableHeaders.minOrder")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.promo.tableHeaders.usage")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.promo.tableHeaders.validUntil")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.promo.tableHeaders.status")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.promo.tableHeaders.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map((promo) => {
                    const statusBadge = getStatusBadge(promo)
                    
                    return (
                      <tr 
                        key={promo._id} 
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300"
                              checked={selectedPromos.includes(promo._id || '')}
                              onChange={() => promo._id && handleSelectPromo(promo._id)}
                            />
                            <label className="sr-only">{t("common.checkbox")}</label>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{promo.code}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {getDiscountTypeIcon(promo.type)}
                            {formatDiscountValue(promo)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {promo.minOrderValue > 0 ? `$${promo.minOrderValue}` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {t("admin.promo.usageCount", { current: promo.currentUsage, limit: promo.usageLimit })}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(promo.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${statusBadge.class}`}>
                            {statusBadge.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(promo)}
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
                                <DropdownMenuLabel>{t("admin.promo.actions.label")}</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    navigator.clipboard.writeText(promo.code)
                                    toast({
                                      title: t("admin.promo.toasts.success.copied"),
                                      description: t("admin.promo.toasts.success.codeCopied"),
                                    })
                                  }}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {t("admin.promo.actions.copyCode")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => promo._id && deletePromoCode(promo._id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("admin.promo.actions.delete")}
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && !error && promoCodes.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t("admin.promo.pagination.showing", {
              from: (currentPage - 1) * itemsPerPage + 1,
              to: Math.min(currentPage * itemsPerPage, totalPromoCodes),
              total: totalPromoCodes
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
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show first page, last page, and pages around current page
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  pageToShow = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i;
                } else {
                  pageToShow = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageToShow}
                    variant={currentPage === pageToShow ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setCurrentPage(pageToShow)}
                  >
                    {pageToShow}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Promo Code Dialog */}
      {currentPromo && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("admin.promo.dialogs.edit.title")}</DialogTitle>
              <DialogDescription>
                {t("admin.promo.dialogs.edit.description")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="promo-code" className="text-right">
                    {t("admin.promo.fields.code")}
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="promo-code"
                      value={currentPromo.code}
                      onChange={(e) => setCurrentPromo({...currentPromo, code: e.target.value.toUpperCase()})}
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCurrentPromo({...currentPromo, code: generateRandomCode()})}
                      title={t("admin.promo.actions.generateRandom")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discount-type" className="text-right">
                    {t("admin.promo.fields.discountType")}
                  </Label>
                  <Select 
                    value={currentPromo.type} 
                    onValueChange={(value) => setCurrentPromo({...currentPromo, type: value})}
                  >
                    <SelectTrigger id="discount-type" className="col-span-3">
                      <SelectValue placeholder={t("admin.promo.placeholders.selectDiscountType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t("admin.promo.discountTypes.percentage")}</SelectItem>
                      <SelectItem value="fixed_amount">{t("admin.promo.discountTypes.fixedamount")}</SelectItem>
                      <SelectItem value="free_shipping">{t("admin.promo.discountTypes.freeshipping")}</SelectItem>
                      <SelectItem value="buy_x_get_y">{t("admin.promo.discountTypes.buyxgety")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {currentPromo.type !== "free_shipping" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="discount-value" className="text-right">
                      {currentPromo.type === "percentage" 
                        ? t("admin.promo.fields.percentage") 
                        : currentPromo.type === "buy_x_get_y" 
                          ? t("admin.promo.fields.buyXQuantity") 
                          : t("admin.promo.fields.amount")}
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="discount-value"
                        type="number"
                        min="0"
                        value={currentPromo.value}
                        onChange={(e) => setCurrentPromo({...currentPromo, value: parseFloat(e.target.value)})}
                        className={currentPromo.type === "fixed_amount" ? "pl-7" : ""}
                      />
                      {currentPromo.type === "percentage" && (
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          %
                        </div>
                      )}
                      {currentPromo.type === "fixed_amount" && (
                        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                          $
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentPromo.type === "percentage" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="max-discount" className="text-right">
                      {t("admin.promo.fields.maxDiscount")}
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="max-discount"
                        type="number"
                        min="0"
                        value={currentPromo.maxDiscount || ""}
                        onChange={(e) => setCurrentPromo({
                          ...currentPromo, 
                          maxDiscount: e.target.value === "" ? null : parseFloat(e.target.value)
                        })}
                        className="pl-7"
                        placeholder={t("admin.promo.placeholders.noLimit")}
                      />
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                        $
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="min-order" className="text-right">
                    {t("admin.promo.fields.minOrderValue")}
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="min-order"
                      type="number"
                      min="0"
                      value={currentPromo.minOrderValue}
                      onChange={(e) => setCurrentPromo({...currentPromo, minOrderValue: parseFloat(e.target.value)})}
                      className="pl-7"
                    />
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                      $
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="max-uses-total" className="text-right">
                    {t("admin.promo.fields.maxTotalUses")}
                  </Label>
                  <Input
                    id="max-uses-total"
                    type="number"
                    min="1"
                    value={currentPromo.usageLimit}
                    onChange={(e) => setCurrentPromo({...currentPromo, usageLimit: parseInt(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="max-uses-customer" className="text-right">
                    {t("admin.promo.fields.maxUsesPerCustomer")}
                  </Label>
                  <Input
                    id="max-uses-customer"
                    type="number"
                    min="1"
                    value={currentPromo.userUsageLimit}
                    onChange={(e) => setCurrentPromo({...currentPromo, userUsageLimit: parseInt(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start-date" className="text-right">
                    {t("admin.promo.fields.startDate")}
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={new Date(currentPromo.startDate).toISOString().split('T')[0]}
                    onChange={(e) => setCurrentPromo({...currentPromo, startDate: new Date(e.target.value).toISOString()})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end-date" className="text-right">
                    {t("admin.promo.fields.endDate")}
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={new Date(currentPromo.endDate).toISOString().split('T')[0]}
                    onChange={(e) => setCurrentPromo({...currentPromo, endDate: new Date(e.target.value).toISOString()})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label htmlFor="promo-active">{t("admin.promo.fields.status")}</Label>
                  </div>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Checkbox 
                      id="promo-active"
                      checked={currentPromo.isActive} 
                      onCheckedChange={(checked) => 
                        setCurrentPromo({...currentPromo, isActive: checked === true})
                      } 
                    />
                    <Label htmlFor="promo-active">{t("admin.promo.fields.active")}</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label htmlFor="first-time-only">{t("admin.promo.fields.firstTimeOnly")}</Label>
                  </div>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Checkbox 
                      id="first-time-only"
                      checked={currentPromo.firstTimeOnly || false} 
                      onCheckedChange={(checked) => 
                        setCurrentPromo({...currentPromo, firstTimeOnly: checked === true})
                      } 
                    />
                    <Label htmlFor="first-time-only">{t("admin.promo.fields.firstPurchaseOnly")}</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="promo-description" className="text-right pt-2">
                    {t("admin.promo.fields.description")}
                  </Label>
                  <Textarea
                    id="promo-description"
                    value={currentPromo.description || ""}
                    onChange={(e) => setCurrentPromo({...currentPromo, description: e.target.value})}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("admin.promo.dialogs.edit.saving") : t("admin.promo.dialogs.edit.saveChanges")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* New Promo Code Dialog */}
      <Dialog open={newPromoDialogOpen} onOpenChange={setNewPromoDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("admin.promo.dialogs.add.title")}</DialogTitle>
            <DialogDescription>
              {t("admin.promo.dialogs.add.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewPromoSubmit}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-promo-code" className="text-right">
                  {t("admin.promo.fields.code")} *
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="new-promo-code"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                    className="flex-grow"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setNewPromo({...newPromo, code: generateRandomCode()})}
                    title={t("admin.promo.actions.generateRandom")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-discount-type" className="text-right">
                  {t("admin.promo.fields.discountType")} *
                </Label>
                <Select 
                  value={newPromo.type} 
                  onValueChange={(value) => setNewPromo({...newPromo, type: value})}
                >
                  <SelectTrigger id="new-discount-type" className="col-span-3">
                    <SelectValue placeholder={t("admin.promo.placeholders.selectDiscountType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">{t("admin.promo.discountTypes.percentage")}</SelectItem>
                    <SelectItem value="fixed_amount">{t("admin.promo.discountTypes.fixedamount")}</SelectItem>
                    <SelectItem value="free_shipping">{t("admin.promo.discountTypes.freeshipping")}</SelectItem>
                    <SelectItem value="buy_x_get_y">{t("admin.promo.discountTypes.buyxgety")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newPromo.type !== "free_shipping" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-discount-value" className="text-right">
                    {newPromo.type === "percentage" 
                      ? t("admin.promo.fields.percentage") 
                      : newPromo.type === "buy_x_get_y" 
                        ? t("admin.promo.fields.buyXQuantity") 
                        : t("admin.promo.fields.amount")} *
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="new-discount-value"
                      type="number"
                      min="0"
                      value={newPromo.value}
                      onChange={(e) => setNewPromo({...newPromo, value: parseFloat(e.target.value)})}
                      className={newPromo.type === "fixed_amount" ? "pl-7" : ""}
                      required
                    />
                    {newPromo.type === "percentage" && (
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        %
                      </div>
                    )}
                    {newPromo.type === "fixed_amount" && (
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                        $
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {newPromo.type === "percentage" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-max-discount" className="text-right">
                    {t("admin.promo.fields.maxDiscount")}
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="new-max-discount"
                      type="number"
                      min="0"
                      value={newPromo.maxDiscount || ""}
                      onChange={(e) => setNewPromo({
                        ...newPromo, 
                        maxDiscount: e.target.value === "" ? null : parseFloat(e.target.value)
                      })}
                      className="pl-7"
                      placeholder={t("admin.promo.placeholders.noLimit")}
                    />
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                      $
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-min-order" className="text-right">
                  {t("admin.promo.fields.minOrderValue")}
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="new-min-order"
                    type="number"
                    min="0"
                    value={newPromo.minOrderValue}
                    onChange={(e) => setNewPromo({...newPromo, minOrderValue: parseFloat(e.target.value)})}
                    className="pl-7"
                  />
                  <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                    $
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-max-uses-total" className="text-right">
                  {t("admin.promo.fields.maxTotalUses")} *
                </Label>
                <Input
                  id="new-max-uses-total"
                  type="number"
                  min="1"
                  value={newPromo.usageLimit}
                  onChange={(e) => setNewPromo({...newPromo, usageLimit: parseInt(e.target.value)})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-max-uses-customer" className="text-right">
                  {t("admin.promo.fields.maxUsesPerCustomer")} *
                </Label>
                <Input
                  id="new-max-uses-customer"
                  type="number"
                  min="1"
                  value={newPromo.userUsageLimit}
                  onChange={(e) => setNewPromo({...newPromo, userUsageLimit: parseInt(e.target.value)})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-start-date" className="text-right">
                  {t("admin.promo.fields.startDate")} *
                </Label>
                <Input
                  id="new-start-date"
                  type="date"
                  value={new Date(newPromo.startDate).toISOString().split('T')[0]}
                  onChange={(e) => setNewPromo({...newPromo, startDate: new Date(e.target.value).toISOString()})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-end-date" className="text-right">
                  {t("admin.promo.fields.endDate")} *
                </Label>
                <Input
                  id="new-end-date"
                  type="date"
                  value={new Date(newPromo.endDate).toISOString().split('T')[0]}
                  onChange={(e) => setNewPromo({...newPromo, endDate: new Date(e.target.value).toISOString()})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label htmlFor="new-promo-active">{t("admin.promo.fields.status")}</Label>
                </div>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox 
                    id="new-promo-active"
                    checked={newPromo.isActive} 
                    onCheckedChange={(checked) => 
                      setNewPromo({...newPromo, isActive: checked === true})
                    } 
                  />
                  <Label htmlFor="new-promo-active">{t("admin.promo.fields.active")}</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label htmlFor="new-first-time-only">{t("admin.promo.fields.firstTimeOnly")}</Label>
                </div>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox 
                    id="new-first-time-only"
                    checked={newPromo.firstTimeOnly || false} 
                    onCheckedChange={(checked) => 
                      setNewPromo({...newPromo, firstTimeOnly: checked === true})
                    } 
                  />
                  <Label htmlFor="new-first-time-only">{t("admin.promo.fields.firstPurchaseOnly")}</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="new-promo-description" className="text-right pt-2">
                  {t("admin.promo.fields.description")}
                </Label>
                <Textarea
                  id="new-promo-description"
                  value={newPromo.description || ""}
                  onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  placeholder={t("admin.promo.placeholders.promoDescription")}
                />
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setNewPromoDialogOpen(false)} 
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting || !newPromo.code}>
                {isSubmitting ? t("admin.promo.dialogs.add.creating") : t("admin.promo.dialogs.add.createPromoCode")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}