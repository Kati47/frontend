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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Copy,
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
import { useTranslation } from "@/lib/i18n/client"

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Furniture categories
const furnitureCategories = [
  "All Categories",
  "Sofas",
  "Chairs",
  "Tables",
  "Beds",
  "Desks",
  "Wardrobes",
  "Bookshelves",
  "Cabinets",
  "Ottomans",
  "Dining Sets",
  "Dressers"
]

// Product interface to match backend
interface Product {
  _id?: string;
  title: string;
  desc: string;
  img: string;
  size: string;
  color: string;
  price: number;
  categories: string[];
  model3d?: string;
  quantity?: number;
  inStock?: boolean;
  lowStockThreshold?: number;
}

// Default new product template
const defaultNewProduct: Product = {
  title: "",
  desc: "",
  img: "",
  size: "",
  color: "",
  price: 0,
  categories: [""],
  model3d: "",
  quantity: 0,
  inStock: true,
  lowStockThreshold: 5
}

export default function ProductsManagementPage() {
  const router = useRouter()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newProductDialogOpen, setNewProductDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Product>(defaultNewProduct)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Fetch all products from API
  useEffect(() => {
    fetchAllProducts()
  }, [])

  const fetchAllProducts = async () => {
    try {
      setLoading(true)
      
      const token = getAuthToken()
      
      // Fetch all products without pagination
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Check the structure of the response and extract products array
      const productsArray = Array.isArray(data) ? data : 
                          (data.products ? data.products : [])
      
      console.log("Fetched products:", productsArray)
      setAllProducts(productsArray)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products")
      setLoading(false)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      })
    }
  }
  
  // Delete product
  const deleteProduct = async (productId: string) => {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/products/delete/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      // Update local state instead of refetching
      setAllProducts(prevProducts => prevProducts.filter(p => p._id !== productId))
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting product:", err)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      })
    }
  }
  
  // Update product
  const updateProduct = async (productId: string, updateData: Product) => {
    try {
      setIsSubmitting(true)
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/products/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const updatedProduct = await response.json()
      
      // Update product in local state
      setAllProducts(prevProducts => 
        prevProducts.map(p => p._id === productId ? updatedProduct : p)
      )
      
      setEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (err) {
      console.error("Error updating product:", err)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Create new product
  const createProduct = async (productData: Product) => {
    try {
      setIsSubmitting(true)
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/products/addProduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData),
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const newProductData = await response.json()
      
      // Add new product to local state
      setAllProducts(prevProducts => [...prevProducts, newProductData])
      
      setNewProductDialogOpen(false)
      setNewProduct(defaultNewProduct)
      toast({
        title: "Success",
        description: "Product created successfully",
      })
    } catch (err) {
      console.error("Error creating product:", err)
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setCurrentProduct({...product})
    setEditDialogOpen(true)
  }

  // Handle edit form submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProduct || !currentProduct._id) return
    
    updateProduct(currentProduct._id, currentProduct)
  }

  // Handle new product form submit
  const handleNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!newProduct.title || newProduct.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
    
    createProduct(newProduct)
  }

  // Get status badge color based on product data
  const getStatusBadge = (product: Product) => {
    if (!product.inStock || product.quantity === 0) {
      return {
        status: "Out of Stock",
        class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }
    } else if (product.quantity && product.lowStockThreshold && product.quantity <= product.lowStockThreshold) {
      return {
        status: "Low Stock",
        class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      }
    } else {
      return {
        status: "Active",
        class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      }
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Filter products based on search and category
  const filteredProducts = allProducts.filter(product => {
    // First check if it passes the search filter
    const matchesSearch = searchQuery === "" || 
      (product.title?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    // Then check if it passes the category filter
    const matchesCategory = categoryFilter === "All Categories" || 
      (product.categories?.includes(categoryFilter));
    
    // Initialize categories if empty
    if (!product.categories || product.categories.length === 0) {
      product.categories = ["Uncategorized"];
    }
    
    return matchesSearch && matchesCategory;
  });

  // Get products for the current tab
  const getProductsForTab = (tab: string) => {
    if (tab === "out-of-stock") {
      return filteredProducts.filter(p => !p.inStock || p.quantity === 0);
    }
    return filteredProducts;
  }

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>, products: Product[]) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(product => product._id || '').filter(id => id));
    } else {
      setSelectedProducts([]);
    }
  }

  // Handle single select
  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  }

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  }

  // Pagination
  const currentTab = "all"; // Default tab
  const productsForCurrentTab = getProductsForTab(currentTab);
  const totalPages = Math.ceil(productsForCurrentTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = productsForCurrentTab.slice(startIndex, endIndex);

  // Get out of stock products for tab
  const outOfStockProducts = getProductsForTab("out-of-stock");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.products.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("admin.products.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewProductDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.products.addProduct")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.products.searchPlaceholder")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="sr-only">{t("admin.products.search")}</button>
          </form>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder={t("admin.products.category")} />
            </SelectTrigger>
            <SelectContent>
              {furnitureCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {t(`admin.products.categories.${category.toLowerCase().replace(/\s+/g, "")}`, { defaultValue: category })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t("admin.products.tabs.all")}</TabsTrigger>
          <TabsTrigger value="out-of-stock">
            {t("admin.products.tabs.outOfStock", { count: outOfStockProducts.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 flex justify-center">
                <p>{t("admin.products.loading")}</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center text-red-500">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={fetchAllProducts}
                >
                  {t("common.tryAgain")}
                </Button>
              </CardContent>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">{t("admin.products.noProductsFound")}</p>
              </CardContent>
            </Card>
          ) : (
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
                              onChange={(e) => handleSelectAll(e, currentProducts)}
                              checked={currentProducts.length > 0 && selectedProducts.length === currentProducts.length}
                            />
                            <label htmlFor="checkbox-all" className="sr-only">{t("common.checkbox")}</label>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3">{t("admin.products.tableHeaders.product")}</th>
                        <th scope="col" className="px-4 py-3">{t("admin.products.tableHeaders.id")}</th>
                        <th scope="col" className="px-4 py-3">{t("admin.products.tableHeaders.category")}</th>
                        <th scope="col" className="px-4 py-3">{t("admin.products.tableHeaders.price")}</th>
                        <th scope="col" className="px-4 py-3">{t("admin.products.tableHeaders.color")}</th>
                        <th scope="col" className="px-4 py-3">{t("admin.products.tableHeaders.size")}</th>
                        <th scope="col" className="px-4 py-3">{t("admin.products.tableHeaders.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.map((product) => (
                        <tr 
                          key={product._id} 
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300"
                                checked={selectedProducts.includes(product._id || '')}
                                onChange={() => product._id && handleSelectProduct(product._id)}
                              />
                              <label className="sr-only">{t("common.checkbox")}</label>
                            </div>
                          </td>
                          <td className="flex items-center gap-2 px-4 py-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                              <Image
                                src={product.img || "/placeholder.png"}
                                alt={product.title}
                                width={40}
                                height={40}
                                className="object-cover"
                                priority
                              />
                            </div>
                            <span className="font-medium">{product.title}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {product._id ? product._id.substring(0, 8) + '...' : 'N/A'}
                          </td>
                          <td className="px-4 py-3">{product.categories ? product.categories.join(', ') : 'N/A'}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                          <td className="px-4 py-3">{product.color || 'N/A'}</td>
                          <td className="px-4 py-3">{product.size || 'N/A'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditDialog(product)}
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
                                  <DropdownMenuLabel>{t("admin.products.actions.label")}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    // Logic to duplicate product
                                    const { _id, ...productWithoutId } = product;
                                    createProduct({
                                      ...productWithoutId,
                                      title: `${t("admin.products.actions.copyPrefix")} ${product.title}`
                                    })
                                  }}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    {t("admin.products.actions.duplicate")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => product._id && deleteProduct(product._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t("admin.products.actions.delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t("admin.products.pagination.showing", {
                  from: startIndex + 1,
                  to: Math.min(endIndex, filteredProducts.length),
                  total: filteredProducts.length
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
        </TabsContent>
        
        <TabsContent value="out-of-stock">
          {loading ? (
            <Card>
              <CardContent className="p-6 flex justify-center">
                <p>Loading products...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50">
                      <tr>
                        <th scope="col" className="p-4">
                          <div className="flex items-center">
                            <input
                              id="checkbox-all-oos"
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300"
                              onChange={(e) => handleSelectAll(e, outOfStockProducts)}
                              checked={outOfStockProducts.length > 0 && 
                                outOfStockProducts.every(p => p._id && selectedProducts.includes(p._id))}
                            />
                            <label htmlFor="checkbox-all-oos" className="sr-only">checkbox</label>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3">Product</th>
                        <th scope="col" className="px-4 py-3">ID</th>
                        <th scope="col" className="px-4 py-3">Category</th>
                        <th scope="col" className="px-4 py-3">Price</th>
                        <th scope="col" className="px-4 py-3">Color</th>
                        <th scope="col" className="px-4 py-3">Size</th>
                        <th scope="col" className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outOfStockProducts.map((product) => (
                        <tr 
                          key={product._id} 
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300"
                                checked={selectedProducts.includes(product._id || '')}
                                onChange={() => product._id && handleSelectProduct(product._id)}
                              />
                              <label className="sr-only">checkbox</label>
                            </div>
                          </td>
                          <td className="flex items-center gap-2 px-4 py-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                              <Image
                                src={product.img || "/placeholder.png"}
                                alt={product.title}
                                width={40}
                                height={40}
                                className="object-cover"
                                priority
                              />
                            </div>
                            <span className="font-medium">{product.title}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {product._id ? product._id.substring(0, 8) + '...' : 'N/A'}
                          </td>
                          <td className="px-4 py-3">{product.categories ? product.categories.join(', ') : 'N/A'}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                          <td className="px-4 py-3">{product.color || 'N/A'}</td>
                          <td className="px-4 py-3">{product.size || 'N/A'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditDialog(product)}
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
                                  <DropdownMenuItem onClick={() => {
                                    // Logic to duplicate product
                                    const { _id, ...productWithoutId } = product;
                                    createProduct({
                                      ...productWithoutId,
                                      title: `Copy of ${product.title}`
                                    })
                                  }}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => product._id && deleteProduct(product._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      {currentProduct && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("admin.products.dialogs.edit.title")}</DialogTitle>
              <DialogDescription>
                {t("admin.products.dialogs.edit.description")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product-title" className="text-right">
                    {t("admin.products.fields.title")}
                  </Label>
                  <Input
                    id="product-title"
                    value={currentProduct.title || ""}
                    onChange={(e) => setCurrentProduct({...currentProduct, title: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product-price" className="text-right">
                    {t("admin.products.fields.price")}
                  </Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={String(currentProduct.price || 0)}
                    onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
                {/* Other fields follow same pattern */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product-color" className="text-right">
                    {t("admin.products.fields.color")}
                  </Label>
                  <Input
                    id="product-color"
                    value={currentProduct.color || ""}
                    onChange={(e) => setCurrentProduct({...currentProduct, color: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                {/* Continue with other fields */}

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <Label>{t("admin.products.fields.status")}</Label>
                  </div>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Checkbox 
                      id="product-instock"
                      checked={currentProduct.inStock} 
                      onCheckedChange={(checked) => 
                        setCurrentProduct({...currentProduct, inStock: checked === true})
                      } 
                    />
                    <Label htmlFor="product-instock">{t("admin.products.fields.inStock")}</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("admin.products.dialogs.edit.saving") : t("admin.products.dialogs.edit.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* New Product Dialog */}
      <Dialog open={newProductDialogOpen} onOpenChange={setNewProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("admin.products.dialogs.add.title")}</DialogTitle>
            <DialogDescription>
              {t("admin.products.dialogs.add.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewProductSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-product-title" className="text-right">
                  {t("admin.products.fields.title")} *
                </Label>
                <Input
                  id="new-product-title"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              {/* Other fields follow same pattern */}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setNewProductDialogOpen(false)} 
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("admin.products.dialogs.add.creating") : t("admin.products.dialogs.add.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}