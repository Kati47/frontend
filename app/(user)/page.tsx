"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Heart, Star, ShoppingCart, Share2, BookmarkCheck, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Hard-code the base URL for immediate testing
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1"

// Detailed product interface to match API response
interface Product {
  _id: string;
  title: string;
  price: number;
  desc: string;
  img: string;
  categories: string[];
  size: string;
  color: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isSaved, setIsSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    try {
      return localStorage.getItem("userId") || null
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return null
    }
  }

  // Fetch product details when component mounts
  useEffect(() => {
    const storedUserId = getUserIdFromLocalStorage()
    setUserId(storedUserId)
    
    const fetchProductDetails = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log(`Fetching product details for ID: ${params.id}`)
        
        // Get auth token from localStorage
        const token = localStorage.getItem('token')
        
        // Make API request to get product details
        // Ensure we're using the same base URL as the shop page
        const apiUrl = baseUrl.endsWith('/api/v1') 
          ? `${baseUrl}/products/find/${params.id}` 
          : `${baseUrl}/api/v1/products/find/${params.id}`
        
        console.log("Fetching from URL:", apiUrl)
        
        const res = await fetch(apiUrl, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ""
          }
        })
        
        console.log("Response status:", res.status)
        
        if (!res.ok) {
          if (res.status === 401) {
            // Handle unauthorized error
            throw new Error("Authentication required to view this product")
          } else if (res.status === 404) {
            throw new Error("Product not found")
          } else {
            throw new Error(`Failed to fetch product: ${res.status}`)
          }
        }
        
        const data = await res.json()
        console.log("Product data received:", data)
        
        // Handle response format - product data might be under a 'product' key or directly in the response
        const productData = data.product || data
        
        // Set product data in state
        setProduct(productData)
        
        // Set initial values for selection if available from product
        if (productData.size) {
          setSelectedSize(productData.size.split(',')[0].trim())
        }
        if (productData.color) {
          setSelectedColor(productData.color.split(',')[0].trim())
        }
        
        // Check if product is saved
        if (storedUserId) {
          const savedItems = JSON.parse(localStorage.getItem("savedForLater") || "[]")
          const isSavedItem = savedItems.some((item: any) => item.id === productData._id)
          setIsSaved(isSavedItem)
        }
        
      } catch (error) {
        console.error("Error fetching product details:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch product details")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProductDetails()
  }, [params.id])

  // Add to cart function
  const addToCart = async () => {
    if (!product) return
    
    if (!userId) {
      toast.error("Please log in to add items to cart", {
        action: {
          label: "Login",
          onClick: () => router.push("/login")
        }
      })
      return
    }
    
    if (product.size && !selectedSize) {
      toast.error("Please select a size")
      return
    }
    
    if (product.color && !selectedColor) {
      toast.error("Please select a color")
      return
    }
    
    try {
      setIsAddingToCart(true)
      
      const token = localStorage.getItem("token")
      
      // Check for existing cart first
      const cartResponse = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })
      
      // If cart not found, create one
      if (cartResponse.status === 404) {
        const createCartResponse = await fetch(`${baseUrl}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId,
            products: []
          })
        })
        
        if (!createCartResponse.ok) {
          throw new Error("Failed to create cart")
        }
      }
      
      // Add product to cart
      const addResponse = await fetch(`${baseUrl}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId,
          products: [
            {
              productId: product._id,
              quantity
            }
          ]
        })
      })
      
      if (!addResponse.ok) {
        throw new Error("Failed to add item to cart")
      }
      
      toast.success("Item added to cart", {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart")
        }
      })
      
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add item to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Toggle saved for later status
  const toggleSaveForLater = () => {
    if (!product) return
    
    try {
      setIsTogglingFavorite(true)
      
      // Get current saved items
      const savedItems = JSON.parse(localStorage.getItem("savedForLater") || "[]")
      
      if (isSaved) {
        // Remove from saved items
        const updatedItems = savedItems.filter((item: any) => item.id !== product._id)
        localStorage.setItem("savedForLater", JSON.stringify(updatedItems))
        setIsSaved(false)
        toast.success("Removed from saved items")
      } else {
        // Add to saved items
        const savedItem = {
          id: product._id,
          name: product.title,
          price: product.price,
          image: product.img,
          color: product.color,
          size: product.size,
          description: product.desc,
          inStock: product.inStock,
          savedAt: new Date().toISOString()
        }
        savedItems.push(savedItem)
        localStorage.setItem("savedForLater", JSON.stringify(savedItems))
        setIsSaved(true)
        toast.success("Saved for later", {
          action: {
            label: "View Saved",
            onClick: () => router.push("/saved-for-later")
          }
        })
      }
    } catch (error) {
      console.error("Error updating saved items:", error)
      toast.error("Failed to update saved items")
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  // Increment quantity
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  // Decrement quantity
  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  // Format sizes from comma-separated string
  const formatSizes = (sizeString?: string) => {
    if (!sizeString) return []
    return sizeString.split(",").map((size) => size.trim())
  }

  // Format colors from comma-separated string
  const formatColors = (colorString?: string) => {
    if (!colorString) return []
    return colorString.split(",").map((color) => color.trim())
  }

  // Get color class for display
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      "black": "bg-black",
      "white": "bg-white border border-gray-300",
      "red": "bg-red-500",
      "blue": "bg-blue-500",
      "green": "bg-green-500",
      "yellow": "bg-yellow-400",
      "purple": "bg-purple-500",
      "pink": "bg-pink-400",
      "gray": "bg-gray-500",
      "brown": "bg-amber-800",
      // Add more colors as needed
    }
    
    return colorMap[color.toLowerCase()] || "bg-gray-200"
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-medium mb-2">Loading product details...</h2>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/shop">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
        
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <Package className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-medium mb-2">Error Loading Product</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/shop">Browse Other Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  // No product state
  if (!product) {
    return (
      <div className="container py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/shop">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
        
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Available sizes and colors
  const availableSizes = formatSizes(product.size)
  const availableColors = formatColors(product.color)
  
  // Format product rating
  const rating = product.rating || 4.5
  const reviewCount = product.reviewCount || 20
  
  // Check stock status
  const inStock = product.inStock !== false

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/shop" className="text-muted-foreground hover:text-foreground">
          Shop
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="truncate max-w-[200px]">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={product.img || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : i < rating
                      ? "text-yellow-400 fill-yellow-400 opacity-50"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">({reviewCount} reviews)</span>
            </div>
            
            <Separator orientation="vertical" className="h-5" />
            
            <span className={inStock ? "text-green-600" : "text-red-600"}>
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mt-6">
            <div className="text-3xl font-bold">${product.price.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Free shipping on orders over $50
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {availableSizes.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Select Size</h3>
                <RadioGroup
                  value={selectedSize || ""}
                  onValueChange={setSelectedSize}
                  className="flex flex-wrap gap-2"
                >
                  {availableSizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={size}
                        id={`size-${size}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className="rounded-md border border-muted px-3 py-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {availableColors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Select Color</h3>
                <RadioGroup
                  value={selectedColor || ""}
                  onValueChange={setSelectedColor}
                  className="flex flex-wrap gap-3"
                >
                  {availableColors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={color}
                        id={`color-${color}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`color-${color}`}
                        className="flex items-center space-x-2 rounded-md border border-muted px-3 py-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                      >
                        <div className={`h-5 w-5 rounded-full ${getColorClass(color)}`} />
                        <span>{color}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M5 12h14" />
                  </svg>
                  <span className="sr-only">Decrease</span>
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={incrementQuantity}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <Button 
                className="flex-1" 
                size="lg" 
                onClick={addToCart}
                disabled={!inStock || isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={toggleSaveForLater}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isSaved ? (
                  <BookmarkCheck className="h-5 w-5 fill-primary text-primary" />
                ) : (
                  <BookmarkCheck className="h-5 w-5" />
                )}
                <span className="ml-2 hidden sm:inline">{isSaved ? "Saved" : "Save for Later"}</span>
              </Button>
              <Button variant="outline" size="icon" className="hidden sm:flex">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <div className="prose max-w-none dark:prose-invert">
                <p>
                  {product.desc || "No description available for this product."}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-4">
              <div className="prose max-w-none dark:prose-invert">
                <h4>Shipping</h4>
                <p>
                  Free standard shipping on orders over $50. Expedited shipping options available at checkout.
                </p>
                <p>
                  International shipping available to select countries. Additional taxes and duties may apply.
                </p>
                <h4>Returns</h4>
                <p>
                  We accept returns within 30 days of delivery. Items must be unused and in their original packaging.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}