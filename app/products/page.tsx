import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, ArrowUpDown, MoreHorizontal, Edit, Trash, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample product data
const products = [
  {
    id: "P001",
    name: "Modern Leather Sofa",
    category: "Sofas",
    price: 1299.99,
    stock: 18,
    status: "In Stock",
    image: "/placeholder.svg?height=40&width=40&text=Sofa",
  },
  {
    id: "P002",
    name: "Ergonomic Office Chair",
    category: "Chairs",
    price: 249.99,
    stock: 32,
    status: "In Stock",
    image: "/placeholder.svg?height=40&width=40&text=Chair",
  },
  {
    id: "P003",
    name: "Solid Oak Dining Table",
    category: "Tables",
    price: 899.99,
    stock: 12,
    status: "In Stock",
    image: "/placeholder.svg?height=40&width=40&text=Table",
  },
  {
    id: "P004",
    name: "Queen Size Bed Frame",
    category: "Beds",
    price: 799.99,
    stock: 15,
    status: "In Stock",
    image: "/placeholder.svg?height=40&width=40&text=Bed",
  },
  {
    id: "P005",
    name: "Minimalist Coffee Table",
    category: "Tables",
    price: 349.99,
    stock: 24,
    status: "In Stock",
    image: "/placeholder.svg?height=40&width=40&text=Table",
  },
  {
    id: "P006",
    name: "Velvet Accent Chair",
    category: "Chairs",
    price: 399.99,
    stock: 8,
    status: "Low Stock",
    image: "/placeholder.svg?height=40&width=40&text=Chair",
  },
  {
    id: "P007",
    name: "King Size Memory Foam Mattress",
    category: "Mattresses",
    price: 1099.99,
    stock: 0,
    status: "Out of Stock",
    image: "/placeholder.svg?height=40&width=40&text=Mattress",
  },
  {
    id: "P008",
    name: "Wooden Bookshelf",
    category: "Storage",
    price: 599.99,
    stock: 19,
    status: "In Stock",
    image: "/placeholder.svg?height=40&width=40&text=Shelf",
  },
  {
    id: "P009",
    name: "Sectional Corner Sofa",
    category: "Sofas",
    price: 1899.99,
    stock: 5,
    status: "Low Stock",
    image: "/placeholder.svg?height=40&width=40&text=Sofa",
  },
  {
    id: "P010",
    name: "Glass Dining Table",
    category: "Tables",
    price: 749.99,
    stock: 0,
    status: "Out of Stock",
    image: "/placeholder.svg?height=40&width=40&text=Table",
  },
]

export default function ProductsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your furniture inventory and product listings</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/products/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products/bulk-upload">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-10" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sofas">Sofas</SelectItem>
              <SelectItem value="chairs">Chairs</SelectItem>
              <SelectItem value="tables">Tables</SelectItem>
              <SelectItem value="beds">Beds</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>
                <div className="flex items-center gap-1 cursor-pointer">
                  Product
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1 cursor-pointer">
                  Price
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1 cursor-pointer">
                  Stock
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/products/${product.id}`} className="hover:underline">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${product.id}`}>View details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products/edit/${product.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <strong>1</strong> to <strong>10</strong> of <strong>42</strong> products
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

