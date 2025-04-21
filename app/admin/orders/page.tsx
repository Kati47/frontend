"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  ArrowUpDown,
  Eye,
  Upload,
  Copy
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock products data
const products = [
  {
    id: "PROD001",
    name: "Premium Leather Sofa",
    sku: "FURN-SOFA-001",
    price: 1299.99,
    category: "Furniture",
    stock: 12,
    status: "Active",
    featured: true,
    image: "/placeholder.png"
  },
  {
    id: "PROD002",
    name: "Modern Coffee Table",
    sku: "FURN-TABLE-002",
    price: 349.99,
    category: "Furniture",
    stock: 25,
    status: "Active",
    featured: false,
    image: "/placeholder.png"
  },
  {
    id: "PROD003",
    name: "Ergonomic Office Chair",
    sku: "FURN-CHAIR-003",
    price: 499.99,
    category: "Furniture",
    stock: 8,
    status: "Active",
    featured: true,
    image: "/placeholder.png"
  },
  {
    id: "PROD004",
    name: "Queen Size Bed Frame",
    sku: "FURN-BED-004",
    price: 899.99,
    category: "Furniture",
    stock: 5,
    status: "Active",
    featured: true,
    image: "/placeholder.png"
  },
  {
    id: "PROD005",
    name: "Velvet Accent Chair",
    sku: "FURN-CHAIR-005",
    price: 449.99,
    category: "Furniture",
    stock: 0,
    status: "Out of Stock",
    featured: false,
    image: "/placeholder.png"
  },
  {
    id: "PROD006",
    name: "Minimalist Dining Table",
    sku: "FURN-TABLE-006",
    price: 749.99,
    category: "Furniture",
    stock: 15,
    status: "Active",
    featured: false,
    image: "/placeholder.png"
  },
  {
    id: "PROD007",
    name: "Wooden Bookshelf",
    sku: "FURN-SHELF-007",
    price: 299.99,
    category: "Furniture",
    stock: 18,
    status: "Active",
    featured: false,
    image: "/placeholder.png"
  },
  {
    id: "PROD008",
    name: "Sectional Corner Sofa",
    sku: "FURN-SOFA-008",
    price: 1899.99,
    category: "Furniture",
    stock: 3,
    status: "Low Stock",
    featured: true,
    image: "/placeholder.png"
  },
  {
    id: "PROD009",
    name: "Adjustable Standing Desk",
    sku: "FURN-DESK-009",
    price: 699.99,
    category: "Furniture",
    stock: 10,
    status: "Active",
    featured: false,
    image: "/placeholder.png"
  },
  {
    id: "PROD010",
    name: "King Size Memory Foam Mattress",
    sku: "BED-MATT-010",
    price: 1199.99,
    category: "Bedding",
    stock: 7,
    status: "Active",
    featured: true,
    image: "/placeholder.png"
  }
]

// Categories for filter
const categories = [
  "All Categories",
  "Furniture",
  "Bedding",
  "Decor",
  "Lighting",
  "Kitchen",
  "Bathroom"
]

export default function ProductsManagementPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const itemsPerPage = 8
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    }
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
      setSelectedProducts(filteredProducts.map(product => product.id))
    } else {
      setSelectedProducts([])
    }
  }

  // Handle single select
  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      categoryFilter === "All Categories" || product.category === categoryFilter
    
    if (statusFilter === "all") {
      return matchesSearch && matchesCategory
    } else if (statusFilter === "featured") {
      return matchesSearch && matchesCategory && product.featured
    } else if (statusFilter === "inactive") {
      return matchesSearch && matchesCategory && product.status === "Inactive"
    } else if (statusFilter === "out-of-stock") {
      return matchesSearch && matchesCategory && 
        (product.status === "Out of Stock" || product.stock <= 0)
    } else if (statusFilter === "low-stock") {
      return matchesSearch && matchesCategory && product.status === "Low Stock"
    }
    
    return matchesSearch && matchesCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 self-end md:self-auto">
          <Button variant="outline" size="sm" disabled={selectedProducts.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Export Selected
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
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
                            checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                          />
                          <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">Product</th>
                      <th scope="col" className="px-4 py-3">SKU</th>
                      <th scope="col" className="px-4 py-3">Category</th>
                      <th scope="col" className="px-4 py-3">Price</th>
                      <th scope="col" className="px-4 py-3">Stock</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => (
                      <tr 
                        key={product.id} 
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/admin/products/${product.id}`)}
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                            />
                            <label className="sr-only">checkbox</label>
                          </div>
                        </td>
                        <td className="flex items-center gap-2 px-4 py-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            <Image
                              src={product.image || "/placeholder.png"}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover"
                              priority
                            />
                          </div>
                          <span className="font-medium">{product.name}</span>
                          {product.featured && (
                            <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
                              Featured
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{product.sku}</td>
                        <td className="px-4 py-3">{product.category}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3">{product.stock}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusBadge(product.status)}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
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
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {product.featured ? (
                                    <>Remove from Featured</>
                                  ) : (
                                    <>Mark as Featured</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
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

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
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
        <TabsContent value="featured">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Featured products filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="out-of-stock">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Out of stock products filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Archived products filtered view</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}