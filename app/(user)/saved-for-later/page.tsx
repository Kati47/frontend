"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookmarkCheck, Grid, List, ShoppingCart, X, ChevronLeft, ChevronRight, Info, AlertTriangle, Check } from "lucide-react"
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

export default function SavedForLaterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [savedItems, setSavedItems] = useState<any[]>([])
  const [viewType, setViewType] = useState("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  const [movingItem, setMovingItem] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const itemsPerPage = 8
  const [cartItems, setCartItems] = useState<string[]>([])

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

  // Fetch cart items to check what's already in cart
  const fetchCartItems = async () => {
    if (!userId) return;
    
    try {
      const token = localStorage.getItem("token") || "";
      const productIds: string[] = [];
      
      // Check cart status for each saved item
      for (const item of savedItems) {
        const isInCart = await checkIfInCart(userId, item.id, token);
        if (isInCart) {
          productIds.push(item.id);
        }
      }
      
      setCartItems(productIds);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItems([]);
    }
  };

  // Load user ID on component mount
  useEffect(() => {
    const storedUserId = getUserIdFromLocalStorage()
    setUserId(storedUserId)

    // Check if user is logged in
    if (!storedUserId) {
      toast.error(t("savedItems.loginRequired"), {
        action: {
          label: t("common.login"),
          onClick: () => router.push("/login")
        }
      })
      setIsLoading(false)
    }
  }, [router, t])

  // Load saved for later items from API
  const loadSavedForLaterItems = async () => {
    if (!userId) return
    
    setIsLoading(true)
    setHasError(false)
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${baseUrl}/products/savedforlater/${userId}?page=${currentPage}&limit=${itemsPerPage}`, 
        {
          headers: {
            "Authorization": token ? `Bearer ${token}` : ""
          }
        }
      )

      if (!response.ok) {
        throw new Error(t("savedItems.fetchError"))
      }

      const data = await response.json()
      console.log("Saved for later data:", data)
      
      // Format saved items for consistent rendering with hardcoded stock status
      const formattedItems = (data.products || []).map((product: any) => ({
        id: product._id,
        name: product.title || product.name || t("product.defaultCategory"),
        price: parseFloat(product.price || 0),
        image: product.img || product.image || "/placeholder.svg",
        color: product.color || "",
        size: product.size || "",
        description: product.desc || "",
        savedAt: product.savedAt || new Date().toISOString(),
        fromCart: product.fromCart || false,
        // Use hardcoded stock status instead of translations
        stock: product.inStock === false ? "Out of Stock" : 
               (product.quantity && product.quantity <= 5) ? "Low Stock" : "In Stock",
        isOnSale: product.salePrice && product.price > product.salePrice,
        salePrice: product.salePrice
      }))
      
      setSavedItems(formattedItems)
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.totalProducts || 0)
      
      // After setting saved items, check which ones are in cart
      await fetchCartItems();
    } catch (error) {
      console.error("Error loading saved items:", error)
      setHasError(true)
      setSavedItems([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load saved items when userId or page changes
  useEffect(() => {
    if (userId) {
      loadSavedForLaterItems()
    }
  }, [userId, currentPage])

  // Remove item from saved items
  const removeSavedItem = async (itemId: string) => {
    if (!userId) return
    
    try {
      // Update state optimistically
      setSavedItems(prev => prev.filter(item => item.id !== itemId))
      
      // Get token for authorization
      const token = localStorage.getItem("token")
      
      // Remove from saved for later in the backend
      const response = await fetch(`${baseUrl}/products/savedforlater/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          productId: itemId
        })
      })
      
      if (!response.ok) {
        throw new Error(t("savedItems.removeError"))
      }
      
      const result = await response.json()
      console.log("Remove saved item result:", result)
      
      toast.success(t("savedItems.itemRemoved"))
      
      // If we removed the last item on the current page, go to the previous page
      if (savedItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        // Otherwise refresh the current page
        loadSavedForLaterItems()
      }
    } catch (error) {
      console.error("Error removing saved item:", error)
      toast.error(t("savedItems.removeError"))
      loadSavedForLaterItems() // Refresh on error
    }
  }

  // Clear all saved items
  const clearAllSavedItems = async () => {
    if (!userId || savedItems.length === 0) return
    
    if (!confirm(t("savedItems.confirmClearAll"))) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      
      // For each saved item, call the toggle endpoint to remove it
      for (const item of savedItems) {
        await fetch(`${baseUrl}/products/savedforlater/toggle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId: userId,
            productId: item.id
          })
        })
      }
      
      // Clear local state
      setSavedItems([])
      setTotalItems(0)
      setCurrentPage(1)
      
      toast.success(t("savedItems.allItemsRemoved"))
    } catch (error) {
      console.error("Error clearing saved items:", error)
      toast.error(t("savedItems.clearError"))
      loadSavedForLaterItems() // Refresh on error
    } finally {
      setIsLoading(false)
    }
  }

  // Move item to cart
  const moveToCart = async (savedItem: any) => {
    if (!userId) {
      toast.error(t("cart.loginRequired"))
      return
    }
    
    try {
      setMovingItem(savedItem.id)
      
      const token = localStorage.getItem("token")
      
      // Check if already in cart
      const isInCart = cartItems.includes(savedItem.id);
      if (isInCart) {
        // Use hardcoded text instead of translation
        toast.info("This item is already in your cart", {
          action: {
            label: t("cart.viewCart"),
            onClick: () => router.push("/cart")
          }
        });
        setMovingItem(null);
        return;
      }
      
      // First remove from saved for later
      const removeResponse = await fetch(`${baseUrl}/products/savedforlater/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          productId: savedItem.id
        })
      })
      
      if (!removeResponse.ok) {
        throw new Error(t("savedItems.removeError"))
      }
      
      // Then add to cart
      const addToCartResponse = await fetch(`${baseUrl}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          products: [
            {
              productId: savedItem.id,
              quantity: 1,
              title: savedItem.name,
              price: savedItem.price,
              img: savedItem.image,
              desc: savedItem.description,
              size: savedItem.size,
              color: savedItem.color
            }
          ]
        })
      })
      
      if (!addToCartResponse.ok) {
        throw new Error(t("cart.addError"))
      }
      
      // Update UI
      setSavedItems(prev => prev.filter(item => item.id !== savedItem.id))
      
      toast.success(t("savedItems.movedToCart"), {
        action: {
          label: t("cart.viewCart"),
          onClick: () => router.push("/cart")
        }
      })
      
      // If we moved the last item on the page and there are more pages, go to previous page
      if (savedItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        // Otherwise refresh the current page
        loadSavedForLaterItems()
      }
    } catch (error: any) {
      console.error("Error moving to cart:", error)
      toast.error(error.message || t("savedItems.moveToCartError"))
      loadSavedForLaterItems() // Refresh on error
    } finally {
      setMovingItem(null)
    }
  }

  // Add all to cart
  const addAllToCart = async () => {
    if (!userId || savedItems.length === 0) {
      return
    }
    
    if (!confirm(t("savedItems.confirmMoveAllToCart"))) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      
      for (const item of savedItems) {
        // Skip items already in cart
        if (cartItems.includes(item.id)) {
          continue;
        }
        
        // First remove from saved for later
        await fetch(`${baseUrl}/products/savedforlater/toggle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId: userId,
            productId: item.id
          })
        })
        
        // Then add to cart
        await fetch(`${baseUrl}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId: userId,
            products: [
              {
                productId: item.id,
                quantity: 1,
                title: item.name,
                price: item.price,
                img: item.image,
                desc: item.description,
                size: item.size,
                color: item.color
              }
            ]
          })
        })
      }
      
      // Clear current page
      setSavedItems([])
      
      toast.success(t("savedItems.itemsMovedToCart"), {
        action: {
          label: t("cart.viewCart"),
          onClick: () => router.push("/cart")
        }
      })
      
      // Refresh data
      setCurrentPage(1)
      loadSavedForLaterItems()
    } catch (error: any) {
      console.error("Error adding all to cart:", error)
      toast.error(error.message || t("savedItems.moveAllToCartError"))
      loadSavedForLaterItems() // Refresh on error
    } finally {
      setIsLoading(false)
    }
  }

  // Updated to use direct string comparison instead of translations
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

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch (error) {
      return t("savedItems.recently")
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("savedItems.loading")}</h2>
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
        <Link href="/cart" className="text-muted-foreground hover:text-foreground">
          {t("cart.title")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{t("savedItems.title")}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("savedItems.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? t("common.item") : t("common.items")} {t("savedItems.itemsDescription")}
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

          {savedItems.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={addAllToCart}
                disabled={isLoading}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t("savedItems.moveAllToCart")}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearAllSavedItems}
                disabled={isLoading}
              >
                {t("savedItems.clearAll")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!userId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="rounded-full bg-muted p-6 mb-4">
              <BookmarkCheck className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">{t("savedItems.pleaseLogin")}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {t("savedItems.loginDescription")}
            </p>
            <Button asChild>
              <Link href="/login">{t("common.login")}</Link>
            </Button>
          </motion.div>
        ) : hasError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6 mb-4">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-medium mb-2">{t("savedItems.loadError")}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {t("savedItems.loadErrorDescription")}
            </p>
            <Button onClick={() => loadSavedForLaterItems()}>
              {t("common.tryAgain")}
            </Button>
          </motion.div>
        ) : savedItems.length === 0 && currentPage === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="rounded-full bg-muted p-6 mb-4">
              <BookmarkCheck className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">{t("savedItems.emptyList")}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {t("savedItems.emptyDescription")}
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/shop">{t("savedItems.browseProducts")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/cart">{t("cart.viewCart")}</Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {t("savedItems.infoMessage")}
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue={viewType} value={viewType} className="w-full">
              <div className="hidden">
                <TabsList>
                  <TabsTrigger value="grid">{t("common.grid")}</TabsTrigger>
                  <TabsTrigger value="list">{t("common.list")}</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {savedItems.map((item) => {
                    const stockStatus = item.stock;
                    const isOnSale = item.isOnSale || 
                                    (item.salePrice && item.price > item.salePrice);
                    const displayPrice = isOnSale && item.salePrice ? 
                                        item.salePrice : item.price;
                    const originalPrice = isOnSale ? item.price : null;
                    const isInCart = cartItems.includes(item.id);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
                          <div className="relative aspect-square">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.title || item.name}
                              fill
                              className="object-cover"
                            />
                            {isOnSale && <Badge className="absolute top-2 left-2">{t("product.sale")}</Badge>}
                            {isInCart && (
                              <Badge className="absolute bottom-2 left-2 bg-green-600 hover:bg-green-700">
                                In Cart
                              </Badge>
                            )}
                            <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-1">
                              <BookmarkCheck className="h-3.5 w-3.5" />
                              <span>{t("savedItems.saved")}</span>
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <Link href={`/product/${item.id}`}>
                              <h3 className="font-medium text-lg line-clamp-1 hover:underline">
                                {item.name || item.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-1">
                              {t("savedItems.savedOn")} {formatDate(item.savedAt)}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-baseline gap-2">
                                {/* Direct price formatting without translation */}
                                <span className="font-semibold">${parseFloat(displayPrice).toFixed(2)}</span>
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
                                onClick={() => moveToCart(item)}
                                disabled={stockStatus === "Out of Stock" || movingItem === item.id || isInCart}
                                variant={isInCart ? "outline" : "default"}
                              >
                                {movingItem === item.id ? (
                                  <>
                                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    Moving...
                                  </>
                                ) : isInCart ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Already in Cart
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Move to Cart
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => removeSavedItem(item.id)}
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
                  {savedItems.map((item) => {
                    const stockStatus = item.stock;
                    const isOnSale = item.isOnSale || 
                                    (item.salePrice && item.price > item.salePrice);
                    const displayPrice = isOnSale && item.salePrice ? 
                                        item.salePrice : item.price;
                    const originalPrice = isOnSale ? item.price : null;
                    const isInCart = cartItems.includes(item.id);

                    return (
                      <motion.div
                        key={item.id}
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
                                src={item.image || "/placeholder.svg"}
                                alt={item.title || item.name}
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
                              <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-1">
                                <BookmarkCheck className="h-3.5 w-3.5" />
                                <span>{t("savedItems.saved")}</span>
                              </Badge>
                            </div>
                            <CardContent className="flex-1 p-4 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Link href={`/product/${item.id}`}>
                                      <h3 className="font-medium text-lg hover:underline">
                                        {item.name || item.title}
                                      </h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground">
                                      {t("savedItems.savedOn")} {formatDate(item.savedAt)}
                                    </p>
                                    {item.fromCart && (
                                      <Badge variant="outline" className="text-xs mt-1">{t("savedItems.movedFromCart")}</Badge>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-baseline gap-2">
                                      {/* Direct price formatting without translation */}
                                      <span className="font-semibold">${parseFloat(displayPrice).toFixed(2)}</span>
                                      {originalPrice && (
                                        <span className="text-sm text-muted-foreground line-through">
                                          ${parseFloat(originalPrice).toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    <span className={cn("text-xs mt-1", getStockColor(stockStatus))}>
                                      {stockStatus}
                                    </span>
                                  </div>
                                </div>
                                
                                {item.color && <p className="text-sm text-muted-foreground mt-2">{t("product.color")}: {item.color}</p>}
                                {item.size && <p className="text-sm text-muted-foreground mt-1">{t("product.size")}: {item.size}</p>}
                                
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button 
                                  className="flex-1" 
                                  size="sm"
                                  onClick={() => moveToCart(item)}
                                  disabled={stockStatus === "Out of Stock" || movingItem === item.id || isInCart}
                                  variant={isInCart ? "outline" : "default"}
                                >
                                  {movingItem === item.id ? (
                                    <>
                                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                      Moving...
                                    </>
                                  ) : isInCart ? (
                                    <>
                                      <Check className="h-4 w-4 mr-2" />
                                      Already in Cart
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Move to Cart
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => removeSavedItem(item.id)}
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