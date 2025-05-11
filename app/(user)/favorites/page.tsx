"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link" 
import { Heart, Grid, List, ShoppingCart, X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n/client"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1"

export default function FavoritesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [products, setProducts] = useState<any[]>([])
  const [viewType, setViewType] = useState("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [userId, setUserId] = useState<string>("")
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null) // Track which product is being added
  const itemsPerPage = 8 // We'll use backend pagination

  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    try {
      const storedUserId = localStorage.getItem("userId") || ""
      return storedUserId
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }
  
  // This working function checks if a product is in the cart
  async function checkIfInCart(userId: string, productId: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        return false; // No cart found or error
      }
      
      const cartData = await response.json();
      
      // Handle different API response formats
      let products = [];
      if (cartData.products && Array.isArray(cartData.products)) {
        products = cartData.products;
      } else if (cartData.cart && cartData.cart.products && Array.isArray(cartData.cart.products)) {
        products = cartData.cart.products;
      }
      
      // Check if product exists in cart
      return products.some((item: { productId: string | { _id: string } }) => 
        item.productId === productId ||
        (typeof item.productId === 'object' && item.productId?._id === productId)
      );
    } catch (error) {
      console.error("Error checking if product is in cart:", error);
      return false;
    }
  }

  // Load user ID on component mount
  useEffect(() => {
    const storedUserId = getUserIdFromLocalStorage()
    setUserId(storedUserId)

    // Check if user is logged in
    if (!storedUserId) {
      toast.error(t("favorite.loginRequired"), {
        action: {
          label: t("common.login"),
          onClick: () => router.push("/login")
        }
      })
      setIsLoading(false)
    }
  }, [router, t])

  // Normalize product data to ensure we have consistent stock status
  const normalizeProducts = async (products: any[], userId: string, token: string) => {
    // Use Promise.all to handle multiple async operations in parallel
    const normalizedProductPromises = products.map(async (product) => {
      // Create a new object with the existing product data
      const normalizedProduct = { ...product };
      
      // Ensure quantity is a number
      if (normalizedProduct.quantity === undefined) {
        normalizedProduct.quantity = 10; // Default quantity if not provided
      } else if (typeof normalizedProduct.quantity === 'string') {
        normalizedProduct.quantity = parseInt(normalizedProduct.quantity, 10);
      }
      
      // Ensure inStock is a boolean based on quantity
      if (normalizedProduct.inStock === undefined) {
        normalizedProduct.inStock = normalizedProduct.quantity > 0;
      }
      
      // Check if this product is in cart by calling the working function
      normalizedProduct.isInCart = await checkIfInCart(userId, product._id, token);
      
      return normalizedProduct;
    });
    
    // Wait for all product checks to complete
    return Promise.all(normalizedProductPromises);
  }

  // Fetch user's favorite products
  const fetchFavorites = async (page = 1) => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setFetchError(null)
    
    try {
      const token = localStorage.getItem("token")
      
      // The URL should match your backend route exactly - with "products" (plural)
      const url = `${baseUrl}/products/favorites/${userId}?page=${page}&limit=${itemsPerPage}`
      
      console.log("Fetching favorites from:", url)
      
      const response = await fetch(url, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })

      console.log("Response status:", response.status)
      
      // If the response isn't ok, get the detailed error message
      if (!response.ok) {
        const errorData = await response.text()
        console.error("Error response:", errorData)
        throw new Error(`${t("favorite.fetchError")}: ${response.status}`)
      }

      const data = await response.json()
      console.log("Favorites data:", data)
      
      // Normalize the products to ensure consistent stock status
      // Pass userId and token to check cart status
      const normalizedProducts = await normalizeProducts(
        data.products || [], 
        userId, 
        token || ""
      )
      
      setProducts(normalizedProducts)
      setTotalPages(data.totalPages || 1)
      setCurrentPage(data.currentPage || 1)
    } catch (error: any) {
      console.error("Error fetching favorites:", error)
      setFetchError(error.message)
      toast.error(t("favorite.loadError"), {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load user's favorites when userId is available
  useEffect(() => {
    if (userId) {
      fetchFavorites(currentPage)
    }
  }, [userId])

  // Handle page change
  useEffect(() => {
    if (userId && !isLoading) {
      fetchFavorites(currentPage)
    }
  }, [currentPage])

  const toggleFavorite = async (productId: string) => {
    if (!userId) {
      toast.error(t("favorite.loginToManage"))
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${baseUrl}/products/favorite/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          productId: productId
        })
      })

      if (!response.ok) {
        throw new Error(t("favorite.updateError"))
      }

      const data = await response.json()
      
      // Remove product from local state to provide immediate feedback
      setProducts(products.filter(product => product._id !== productId))
      
      toast.success(t("favorite.itemRemoved"))
      
      // If removing this product makes the page empty and there are previous pages, go back
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else if (products.length === 1) {
        // This was the last item on the only page - just fetch to refresh state
        fetchFavorites(1)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error(t("favorite.updateError"))
    }
  }

  const addToCart = async (productId: string) => {
    if (!userId) {
      toast.error(t("auth.loginRequiredCart"))
      return
    }
    
    // Find the product in the current state
    const product = products.find(p => p._id === productId);
    
    // If already in cart, just navigate to cart
    if (product && product.isInCart) {
      router.push("/cart")
      return
    }

    setIsAddingToCart(productId)

    try {
      const token = localStorage.getItem("token")
      
      // First, check if user has a cart
      console.log(`Checking if user ${userId} has a cart...`)
      const cartResponse = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })
      
      let cartId
      
      if (cartResponse.status === 404) {
        // Create a new cart if one doesn't exist
        console.log("No cart found, creating a new one...")
        const createCartResponse = await fetch(`${baseUrl}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId: userId,
            products: [] // Start with an empty products array
          })
        })
        
        if (!createCartResponse.ok) {
          const errorData = await createCartResponse.text()
          console.error("Error creating cart:", errorData)
          throw new Error(t("cart.createError"))
        }
        
        const newCart = await createCartResponse.json()
        console.log("New cart created:", newCart)
        cartId = newCart.cart?._id || newCart._id
      } else if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        console.log("Existing cart found:", cartData)
        cartId = cartData.cart?._id || cartData._id
      } else {
        const errorData = await cartResponse.text()
        console.error("Error checking cart:", errorData)
        throw new Error(t("cart.checkError"))
      }
      
      // Add product to cart
      if (cartId) {
        console.log(`Adding product ${productId} to cart ${cartId}...`)
        
        // Get the product details from our normalized products
        const productToAdd = products.find(p => p._id === productId)
        
        if (!productToAdd) {
          throw new Error(t("favorite.productNotFound"))
        }
        
        // Format according to the cart/add endpoint expectations
        const addResponse = await fetch(`${baseUrl}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId: userId,
            products: [
              {
                productId: productId,
                quantity: 1,
                // Include full product details to ensure they're in the cart
                title: productToAdd.title || productToAdd.name,
                price: productToAdd.price,
                img: productToAdd.img,
                desc: productToAdd.desc,
                size: productToAdd.size,
                color: productToAdd.color
              }
            ]
          })
        })
        
        if (!addResponse.ok) {
          const errorData = await addResponse.text()
          console.error("Error adding to cart:", errorData)
          throw new Error(t("cart.addError"))
        }
        
        const result = await addResponse.json()
        console.log("Add to cart result:", result)
        
        // Update the product's isInCart status in the state
        setProducts(products.map(p => 
          p._id === productId ? { ...p, isInCart: true } : p
        ))
        
        toast.success(t("cart.itemAdded"), {
          action: {
            label: t("cart.viewCart"),
            onClick: () => router.push("/cart")
          }
        })
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      toast.error(error.message || t("cart.addError"))
    } finally {
      setIsAddingToCart(null)
    }
  }

  const clearAllFavorites = async () => {
    if (!userId || products.length === 0) return
    
    if (!confirm(t("favorite.confirmClearAll"))) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      const promises = products.map(product => 
        fetch(`${baseUrl}/products/favorite/toggle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId: userId,
            productId: product._id
          })
        })
      )
      
      await Promise.all(promises)
      
      setProducts([])
      toast.success(t("favorite.allItemsRemoved"))
    } catch (error) {
      console.error("Error clearing favorite:", error)
      toast.error(t("favorite.clearError"))
    } finally {
      setIsLoading(false)
    }
  }

  interface Product {
    _id: string;
    title?: string;
    name?: string;
    price: number;
    salePrice?: number;
    inStock: boolean;
    quantity?: number;
    img?: string;
    desc?: string;
    categories?: string[];
    onSale?: boolean;
    isInCart?: boolean;
    favoritedBy?: { userId: string; addedAt: string }[];
  }

  // Updated getStockStatus function that uses hardcoded values instead of translations
  const getStockStatus = (product: Product) => {
    // Case 1: Product explicitly marked as out of stock in the database
    if (product.inStock === false) {
      return "Out of Stock";
    }
    
    // Case 2: Product has a quantity of 0
    if (product.quantity === 0) {
      return "Out of Stock";
    }
    
    // Case 3: Product has a low quantity (1-5 items)
    if (typeof product.quantity === 'number' && product.quantity > 0 && product.quantity <= 5) {
      return "Low Stock";
    }
    
    // Default: In Stock
    return "In Stock";
  }

  const getStockColor = (stock: string) => {
    switch (stock) {
      case "In Stock":
        return "text-green-600 dark:text-green-400"
      case "Low Stock":
        return "text-amber-600 dark:text-amber-400"
      case "Out of Stock":
        return "text-red-600 dark:text-red-400"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("favorite.loading")}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          {t("common.home")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{t("favorites")}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("favorite.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {products.length} {products.length === 1 ? t("common.item") : t("common.items")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Tabs defaultValue={viewType} value={viewType} onValueChange={setViewType} className="w-auto">
            <TabsList className="grid w-[120px] grid-cols-2">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:inline-block">{t("common.grid")}</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:inline-block">{t("common.list")}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {products.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearAllFavorites}
              disabled={isLoading}
            >
              {t("favorite.clearAll")}
            </Button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{t("common.error")}: {fetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => fetchFavorites(currentPage)}
          >
            {t("common.tryAgain")}
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!userId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="rounded-full bg-muted p-6 mb-4">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">{t("favorite.pleaseLogin")}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {t("favorite.loginDescription")}
            </p>
            <Button asChild>
              <Link href="/login">{t("common.login")}</Link>
            </Button>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="rounded-full bg-muted p-6 mb-4">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">{t("favorite.emptyList")}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {t("favorite.emptyDescription")}
            </p>
            <Button asChild>
              <Link href="/shop">{t("common.continueShopping")}</Link>
            </Button>
          </motion.div>
        ) : (
          <>
            <Tabs defaultValue={viewType} value={viewType} className="w-full">
              <div className="hidden">
                <TabsList>
                  <TabsTrigger value="grid">{t("common.grid")}</TabsTrigger>
                  <TabsTrigger value="list">{t("common.list")}</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const isOnSale = product.onSale || 
                                    (product.salePrice && product.price > product.salePrice);
                    const displayPrice = isOnSale && product.salePrice ? 
                                        product.salePrice : product.price;
                    const originalPrice = isOnSale ? product.price : null;
                    const isInCart = product.isInCart;

                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
                          <div className="relative aspect-square">
                            <Image
                              src={product.img || "/placeholder.svg"}
                              alt={product.title || product.name}
                              fill
                              className="object-cover"
                            />
                            {isOnSale && <Badge className="absolute top-2 left-2">{t("product.sale")}</Badge>}
                            {isInCart && (
                              <Badge className="absolute bottom-2 left-2 bg-green-600 hover:bg-green-700">
                                In Cart
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90"
                              onClick={() => toggleFavorite(product._id)}
                            >
                              <Heart className="h-5 w-5 fill-primary text-primary" />
                            </Button>
                          </div>
                          <CardContent className="p-4">
                            <Link href={`/product/${product._id}`}>
                              <h3 className="font-medium text-lg line-clamp-1 hover:underline">
                                {product.title || product.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-2">
                              {product.categories?.[0] || t("product.defaultCategory")}
                            </p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold">
                                  ${parseFloat(displayPrice).toFixed(2)}
                                </span>
                                {originalPrice && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    ${parseFloat(originalPrice).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <span className={cn("text-xs", getStockColor(stockStatus))}>
                                {stockStatus}
                              </span>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button 
                                className="flex-1" 
                                size="sm"
                                onClick={() => addToCart(product._id)}
                                disabled={stockStatus === "Out of Stock" || isAddingToCart === product._id}
                                variant={isInCart ? "default" : "secondary"}
                              >
                                {isAddingToCart === product._id ? (
                                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                                ) : isInCart ? (
                                  <Check className="h-4 w-4 mr-2" />
                                ) : (
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                )}
                                {isInCart ? "View in Cart" : "Add to Cart"}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => toggleFavorite(product._id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <div className="space-y-4">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const isOnSale = product.onSale || 
                                    (product.salePrice && product.price > product.salePrice);
                    const displayPrice = isOnSale && product.salePrice ? 
                                        product.salePrice : product.price;
                    const originalPrice = isOnSale ? product.price : null;
                    const dateAdded = product.favoritedBy?.find((f: { userId: string; addedAt: string }) => f.userId === userId)?.addedAt;
                    const formattedDate = dateAdded ? 
                      new Date(dateAdded).toLocaleDateString() : 
                      t("favorite.recently");
                    const isInCart = product.isInCart;

                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                          <div className="flex flex-col sm:flex-row">
                            <div className="relative w-full sm:w-48 h-48">
                              <Image
                                src={product.img || "/placeholder.svg"}
                                alt={product.title || product.name}
                                fill
                                className="object-cover"
                              />
                              {isOnSale && (
                                <Badge className="absolute top-2 left-2">{t("product.sale")}</Badge>
                              )}
                              {isInCart && (
                                <Badge className="absolute bottom-2 left-2 bg-green-600 hover:bg-green-700">
                                  In Cart
                                </Badge>
                              )}
                            </div>
                            <CardContent className="flex-1 p-4 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Link href={`/product/${product._id}`}>
                                      <h3 className="font-medium text-lg hover:underline">
                                        {product.title || product.name}
                                      </h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground">
                                      {product.categories?.[0] || t("product.defaultCategory")}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => toggleFavorite(product._id)}
                                  >
                                    <Heart className="h-5 w-5 fill-primary text-primary" />
                                  </Button>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                  <span className="font-semibold">
                                    ${parseFloat(displayPrice).toFixed(2)}
                                  </span>
                                  {originalPrice && (
                                    <span className="text-sm text-muted-foreground line-through">
                                      ${parseFloat(originalPrice).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className={cn("text-sm", getStockColor(stockStatus))}>
                                    {stockStatus}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {t("favorite.dateAdded", { date: formattedDate })}
                                  </span>
                                </div>
                                {product.desc && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {product.desc}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button 
                                  className="flex-1" 
                                  size="sm"
                                  onClick={() => addToCart(product._id)}
                                  disabled={stockStatus === "Out of Stock" || isAddingToCart === product._id}
                                  variant={isInCart ? "default" : "secondary"}
                                >
                                  {isAddingToCart === product._id ? (
                                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                                  ) : isInCart ? (
                                    <Check className="h-4 w-4 mr-2" />
                                  ) : (
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                  )}
                                  {isInCart ? "Already in Cart" : "Move to Cart"}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => toggleFavorite(product._id)}
                                >
                                  {t("common.remove")}
                                </Button>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}