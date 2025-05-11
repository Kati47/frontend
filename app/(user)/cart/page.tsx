"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronDown, ChevronUp, Gift, Percent,
  Tag, Clock, Bookmark, BookmarkCheck, ArrowUpDown, ShoppingCart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTranslation } from "@/lib/i18n/client"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1"

export default function CartPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartId, setCartId] = useState<string>("")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDetails, setPromoDetails] = useState<any>(null)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCartNotFound, setIsCartNotFound] = useState(false)
  const [productDetailsCache, setProductDetailsCache] = useState<Record<string, any>>({})
  const [loadingItemDetails, setLoadingItemDetails] = useState(false)
  const [availablePromoCodes, setAvailablePromoCodes] = useState<any[]>([])
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false)

  // Save for Later states
  const [savedForLaterItems, setSavedForLaterItems] = useState<any[]>([])
  const [loadingSavedItems, setLoadingSavedItems] = useState(false)
  const [movingItem, setMovingItem] = useState<string | null>(null)
  const [savedForLaterOpen, setSavedForLaterOpen] = useState(true)
  const [savedForLaterTotal, setSavedForLaterTotal] = useState(0)

  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    try {
      const storedUserId = localStorage.getItem("userId") || ""
      console.log("User ID from localStorage:", storedUserId)
      return storedUserId
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }

  // Load user ID on component mount
  useEffect(() => {
    const storedUserId = getUserIdFromLocalStorage()
    setUserId(storedUserId)

    // Check if user is logged in
    if (!storedUserId) {
      toast.error(t("cart.errors.loginRequired"), {
        action: {
          label: t("common.login"),
          onClick: () => router.push("/login")
        }
      })
    }
  }, [router, t])

  // Fetch saved for later items
  const fetchSavedForLaterItems = async () => {
    if (!userId) return

    setLoadingSavedItems(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${baseUrl}/products/savedforlater/${userId}`,
        {
          headers: {
            "Authorization": token ? `Bearer ${token}` : ""
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch saved items")
      }

      const data = await response.json()
      console.log("Saved for later data:", data)

      // Format saved items similar to cart items for consistent rendering
      const formattedItems = (data.products || []).map((product: any) => ({
        id: product._id,
        name: product.title || product.name || "Product",
        price: parseFloat(product.price || 0),
        image: product.img || product.image || "/placeholder.svg",
        color: product.color || "",
        size: product.size || "",
        description: product.desc || "",
        savedAt: product.savedAt || new Date().toISOString(),
        fromCart: product.fromCart || false
      }))

      setSavedForLaterItems(formattedItems)
      setSavedForLaterTotal(data.totalProducts || 0)
    } catch (error) {
      console.error("Error fetching saved for later items:", error)
    } finally {
      setLoadingSavedItems(false)
    }
  }

  // Fetch available promo codes
  const fetchAvailablePromoCodes = async () => {
    setLoadingPromoCodes(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${baseUrl}/promo?isActive=true&includeExpired=false&limit=10`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch promo codes")
      }

      const data = await response.json()
      console.log("Available promo codes:", data)

      if (data.promoCodes && Array.isArray(data.promoCodes)) {
        setAvailablePromoCodes(data.promoCodes)
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error)
    } finally {
      setLoadingPromoCodes(false)
    }
  }

  // Function to fetch product details for items with minimal data
  const fetchProductDetails = async (productId: string) => {
    // Check cache first
    if (productDetailsCache[productId]) {
      return productDetailsCache[productId]
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${baseUrl}/products/find/${productId}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })

      if (!response.ok) {
        console.error(`Failed to fetch product ${productId} details: ${response.status}`)
        return null
      }

      const data = await response.json()
      console.log(`Retrieved product ${productId} details:`, data)

      // Extract product info based on response structure
      const productInfo = data.product || data

      // Cache the result for future use
      const newCache = { ...productDetailsCache }
      newCache[productId] = productInfo
      setProductDetailsCache(newCache)

      return productInfo
    } catch (error) {
      console.error(`Error fetching product ${productId} details:`, error)
      return null
    }
  }

  // Function to fetch cart items
  const fetchCartItems = async (userId: string) => {
    if (!userId) {
      console.warn("No user ID found, skipping cart fetch.")
      setIsCartNotFound(true)
      setIsLoading(false)
      return
    }

    try {
      console.log(`Fetching cart items for user ID: ${userId}`)

      // Get token for authorization
      const token = localStorage.getItem("token")

      const response = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("Response body:", errorText)

        if (response.status === 404 || errorText.includes("Cart not found")) {
          console.log("Cart not found - This is normal for new users")
          setIsCartNotFound(true)
          setCartItems([])
        } else {
          console.error("Error fetching cart:", errorText)
          toast.error("Failed to load your cart")
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      console.log("Cart data received:", data)

      // Store cart ID for later operations
      if (data.cart?._id) {
        setCartId(data.cart._id)
      } else if (data._id) {
        setCartId(data._id)
      }

      // Check if a promo code is already applied to the cart
      if (data?.cart?.promoCode || data?.promoCode) {
        const promoInfo = data?.cart?.promoCode || data?.promoCode
        if (promoInfo) {
          setPromoApplied(true)
          setPromoDetails(promoInfo)
          setPromoCode(promoInfo.code || "")
          console.log("Cart has promo code applied:", promoInfo)
        }
      } else {
        // Reset promo state if no promo on cart
        setPromoApplied(false)
        setPromoDetails(null)
        setPromoCode("")
      }

      // Handle different possible API response structures
      let extractedItems: any[] = []

      // Case 1: { cart: { products: [...] } }
      if (data?.cart?.products && Array.isArray(data.cart.products)) {
        extractedItems = data.cart.products
        console.log("Found products in cart.products:", extractedItems.length)
      }
      // Case 2: { products: [...] }
      else if (data?.products && Array.isArray(data.products)) {
        extractedItems = data.products
        console.log("Found products in data.products:", extractedItems.length)
      }
      // Case 3: { cartItems: [...] }
      else if (data?.cartItems && Array.isArray(data.cartItems)) {
        extractedItems = data.cartItems
        console.log("Found products in cartItems:", extractedItems.length)
      }
      // Case 4: Response is an array directly
      else if (Array.isArray(data)) {
        extractedItems = data
        console.log("Response is an array directly:", extractedItems.length)
      }

      if (extractedItems.length > 0) {
        console.log("Cart items raw data:", extractedItems)

        // Identify items that need product details
        const itemsNeedingDetails = extractedItems.filter(item =>
          item.productId && (!item.title || item.price === undefined)
        )

        if (itemsNeedingDetails.length > 0) {
          setLoadingItemDetails(true)
          console.log(`Need to fetch details for ${itemsNeedingDetails.length} products`)
        }

        // Create initial formatted items with the data we have
        const initialFormattedItems = extractedItems.map(item => {
          // For items with nested product object
          if (item.product) {
            return {
              id: item.productId || item.product._id,
              name: item.product.title || item.product.name || "Product",
              price: parseFloat(item.product.price || 0),
              quantity: item.quantity || 1,
              image: item.product.img || item.product.image || "/placeholder.svg",
              color: item.product.color || "",
              size: item.product.size || "",
              description: item.product.desc || ""
            }
          }

          // For items with complete data
          if (item.title && item.price !== undefined) {
            return {
              id: item.productId || item._id,
              name: item.title || item.name || "Product",
              price: parseFloat(item.price || 0),
              quantity: item.quantity || 1,
              image: item.img || item.image || "/placeholder.svg",
              color: item.color || "",
              size: item.size || "",
              description: item.desc || ""
            }
          }

          // For minimal items, use placeholder until we fetch details
          return {
            id: item.productId,
            name: "Loading...",
            price: 0,
            quantity: item.quantity || 1,
            image: "/placeholder.svg",
            color: "",
            size: "",
            description: "",
            loading: true
          }
        })

        // Set initial cart items
        setCartItems(initialFormattedItems)
        setIsCartNotFound(false)

        // Fetch details for incomplete items
        if (itemsNeedingDetails.length > 0) {
          const updatedItems = [...initialFormattedItems]

          for (let i = 0; i < itemsNeedingDetails.length; i++) {
            const incompleteItem = itemsNeedingDetails[i]
            const itemIndex = extractedItems.findIndex(item => item.productId === incompleteItem.productId)

            if (itemIndex !== -1) {
              try {
                const productDetails = await fetchProductDetails(incompleteItem.productId)

                if (productDetails) {
                  updatedItems[itemIndex] = {
                    id: incompleteItem.productId,
                    name: productDetails.title || productDetails.name || "Product",
                    price: parseFloat(productDetails.price || 0),
                    quantity: incompleteItem.quantity || 1,
                    image: productDetails.img || productDetails.image || "/placeholder.svg",
                    color: productDetails.color || "",
                    size: productDetails.size || "",
                    description: productDetails.desc || "",
                    loading: false
                  }
                }
              } catch (error) {
                console.error(`Error fetching details for product ${incompleteItem.productId}:`, error)
              }
            }
          }

          setCartItems(updatedItems)
          setLoadingItemDetails(false)
        }
      } else {
        console.warn("No items found in cart data:", data)
        setCartItems([])
        setIsCartNotFound(true)
      }
    } catch (error) {
      console.error("Network error fetching cart:", error)
      toast.error("Failed to load your cart")
      setIsCartNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to update item quantity
  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    if (!userId || !cartId) return

    try {
      // Optimistically update UI
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      )

      console.log(`Updating quantity for product ${productId} to ${newQuantity}`)

      // Get token for authorization
      const token = localStorage.getItem("token")

      // Get current products from the server to ensure we have the complete list
      const cartResponse = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })

      if (!cartResponse.ok) {
        throw new Error("Failed to get cart information")
      }

      const cartData = await cartResponse.json()

      // Get current products
      const currentProducts = cartData.cart?.products || cartData.products || []

      // Update the quantity for this product
      const updatedProducts = currentProducts.map((prod: { productId: string; quantity: number;[key: string]: any }) => {
        if (prod.productId === productId) {
          return { ...prod, quantity: newQuantity }
        }
        return prod
      })

      // Send update to server
      const updateResponse = await fetch(`${baseUrl}/cart/update/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          products: updatedProducts
        })
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update cart")
      }

      toast.success("Quantity updated")

    } catch (error) {
      console.error("Error updating quantity:", error)
      toast.error("Failed to update quantity")
      fetchCartItems(userId) // Refresh the cart to show correct state
    }
  }

  // Remove item from cart
  const removeItem = async (productId: string) => {
    if (!userId || !cartId) return

    try {
      // Remove item from local state immediately for responsive UI
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId))

      // Get token for authorization
      const token = localStorage.getItem("token")

      // Get current products from the server to ensure we have the complete list
      const cartResponse = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })

      if (!cartResponse.ok) {
        throw new Error("Failed to get cart information")
      }

      const cartData = await cartResponse.json()

      // Get current products
      const currentProducts = cartData.cart?.products || cartData.products || []

      // Filter out the removed product
      const updatedProducts = currentProducts.filter((prod: { productId: string }) => prod.productId !== productId)

      // Send update to server
      const updateResponse = await fetch(`${baseUrl}/cart/update/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          products: updatedProducts
        })
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update cart")
      }

      toast.success("Item removed from cart")

    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Failed to remove item")
      fetchCartItems(userId) // Refresh the cart to show correct state
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    if (!userId || !cartId) return

    try {
      // Clear cart in UI first
      setCartItems([])

      // Get token for authorization
      const token = localStorage.getItem("token")

      // Send update to server with empty products array
      const updateResponse = await fetch(`${baseUrl}/cart/update/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          products: []
        })
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to clear cart")
      }

      toast.success("Cart cleared")

    } catch (error) {
      console.error("Error clearing cart:", error)
      toast.error("Failed to clear cart")
      fetchCartItems(userId) // Refresh the cart to show correct state
    }
  }

  // Save item for later
  const moveToSavedForLater = async (productId: string) => {
    if (!userId) return

    try {
      setMovingItem(productId)

      // Get token for authorization
      const token = localStorage.getItem("token")

      // Use the backend's dedicated moveToSaved endpoint
      const moveResponse = await fetch(`${baseUrl}/products/move-to-saved`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          productId: productId,
          cartId: cartId
        })
      })

      if (!moveResponse.ok) {
        const errorText = await moveResponse.text()
        console.error("Error moving to saved for later:", errorText)
        throw new Error("Failed to save item for later")
      }

      const moveData = await moveResponse.json()

      // If successful, update UI
      if (moveData.removedFromCart) {
        // Remove from cart items
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
      }

      toast.success(moveData.message || "Item saved for later")

      // Make sure saved items section is open
      setSavedForLaterOpen(true)

      // Refresh saved items to get the accurate list
      fetchSavedForLaterItems()

    } catch (error) {
      console.error("Error moving item to saved for later:", error)
      toast.error("Failed to save item for later")

      // Revert optimistic updates in case of error
      fetchCartItems(userId)
      fetchSavedForLaterItems()
    } finally {
      setMovingItem(null)
    }
  }

  // Move saved item back to cart
  const moveToCart = async (savedItemId: string) => {
    if (!userId) return

    try {
      setMovingItem(savedItemId)

      // Find the saved item
      const savedItem = savedForLaterItems.find(item => item.id === savedItemId)
      if (!savedItem) {
        throw new Error("Saved item not found")
      }

      // Get token for authorization
      const token = localStorage.getItem("token")

      // First, remove from saved for later in the backend
      const toggleResponse = await fetch(`${baseUrl}/products/savedforlater/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          productId: savedItemId
        })
      })

      if (!toggleResponse.ok) {
        throw new Error("Failed to remove from saved items")
      }

      // Remove from local saved items immediately for responsive UI
      setSavedForLaterItems(prev => prev.filter(item => item.id !== savedItemId))

      // Prepare item for cart
      const cartItem = {
        productId: savedItemId,
        quantity: 1,
        title: savedItem.name,
        price: savedItem.price,
        img: savedItem.image,
        desc: savedItem.description,
        size: savedItem.size,
        color: savedItem.color
      }

      // If we have a cart already
      if (cartId) {
        // Get current cart info
        const cartResponse = await fetch(`${baseUrl}/cart/find/${userId}`, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : ""
          }
        })

        if (cartResponse.ok) {
          const cartData = await cartResponse.json()
          const currentProducts = cartData.cart?.products || cartData.products || []

          // Check if product already exists in cart
          const existingProductIndex = currentProducts.findIndex(
            (p: any) => p.productId === savedItemId
          )

          if (existingProductIndex !== -1) {
            // Product exists in cart, increase quantity
            currentProducts[existingProductIndex].quantity =
              (currentProducts[existingProductIndex].quantity || 1) + 1
          } else {
            // Add product to cart
            currentProducts.push(cartItem)
          }

          // Update cart
          const updateResponse = await fetch(`${baseUrl}/cart/update/${cartId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({
              products: currentProducts
            })
          })

          if (!updateResponse.ok) {
            throw new Error("Failed to update cart")
          }
        } else {
          throw new Error("Failed to retrieve cart information")
        }
      } else {
        // No existing cart, create a new one
        const createResponse = await fetch(`${baseUrl}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId: userId,
            products: [cartItem]
          })
        })

        if (!createResponse.ok) {
          throw new Error("Failed to create cart")
        }

        // Extract cart ID from response for future operations
        const createData = await createResponse.json()
        if (createData.cart?._id) {
          setCartId(createData.cart._id)
        } else if (createData._id) {
          setCartId(createData._id)
        }
      }

      toast.success("Item moved to cart")

      // Refresh cart and saved items lists
      fetchCartItems(userId)
      fetchSavedForLaterItems()

    } catch (error) {
      console.error("Error moving saved item to cart:", error)
      toast.error("Failed to move item to cart")

      // Refresh both lists on error
      fetchCartItems(userId)
      fetchSavedForLaterItems()
    } finally {
      setMovingItem(null)
    }
  }

  // Remove an item from saved for later
  const removeSavedItem = async (itemId: string) => {
    if (!userId) return

    try {
      // Optimistically update UI
      setSavedForLaterItems(prev => prev.filter(item => item.id !== itemId))

      // Get token for authorization
      const token = localStorage.getItem("token")

      // Remove from saved for later in the backend
      const toggleResponse = await fetch(`${baseUrl}/products/savedforlater/toggle`, {
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

      if (!toggleResponse.ok) {
        throw new Error("Failed to remove from saved items")
      }

      toast.success("Item removed from saved list")
    } catch (error) {
      console.error("Error removing saved item:", error)
      toast.error("Failed to remove saved item")

      // Refresh on error
      fetchSavedForLaterItems()
    }
  }

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !userId || !cartId) {
      toast.error("Please enter a valid promo code")
      return
    }

    try {
      setApplyingPromo(true)

      // Get token for authorization
      const token = localStorage.getItem("token")

      // Call the promo code apply endpoint
      const response = await fetch(`${baseUrl}/cart/apply-promo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          cartId: cartId,
          promoCode: promoCode
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to apply promo code")
      }

      const data = await response.json()
      console.log("Promo code applied successfully:", data)

      // Update UI with promo details
      setPromoApplied(true)
      setPromoDetails(data.cart?.promoCode || data.promoCode)

      // Show success message
      toast.success(data.message || "Promo code applied successfully")

      // Refresh cart to show updated totals
      fetchCartItems(userId)
    } catch (error) {
      console.error("Error applying promo code:", error)
      toast.error(error instanceof Error ? error.message : "Failed to apply promo code")
    } finally {
      setApplyingPromo(false)
    }
  }

  // Apply promo code from the available list
  const applyPromoFromList = (code: string) => {
    setPromoCode(code)
    handleApplyPromo()
  }

  // Remove promo code
  const handleRemovePromo = async () => {
    if (!userId || !cartId) return

    try {
      // Get token for authorization
      const token = localStorage.getItem("token")

      // Call the promo code remove endpoint
      const response = await fetch(`${baseUrl}/cart/remove-promo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          cartId: cartId
        })
      })

      if (!response.ok) {
        throw new Error("Failed to remove promo code")
      }

      // Reset promo state
      setPromoApplied(false)
      setPromoDetails(null)
      setPromoCode("")

      toast.success("Promo code removed")

      // Refresh cart to show updated totals
      fetchCartItems(userId)
    } catch (error) {
      console.error("Error removing promo code:", error)
      toast.error("Failed to remove promo code")
    }
  }

  // Fetch cart items and saved items when userId changes
  useEffect(() => {
    if (userId) {
      fetchCartItems(userId)
      fetchSavedForLaterItems()
      fetchAvailablePromoCodes()
    } else {
      setIsLoading(false)
    }
  }, [userId])

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Helper function to get the promo code icon
  const getPromoIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-5 w-5 text-green-500" />
      case 'fixed_amount':
        return <Tag className="h-5 w-5 text-blue-500" />
      case 'free_shipping':
        return <Gift className="h-5 w-5 text-purple-500" />
      case 'buy_x_get_y':
        return <Tag className="h-5 w-5 text-orange-500" />
      default:
        return <Gift className="h-5 w-5 text-gray-500" />
    }
  }

  // Helper function to get human-readable promo type
  const getPromoTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Percentage Off'
      case 'fixed_amount':
        return 'Fixed Amount'
      case 'free_shipping':
        return 'Free Shipping'
      case 'buy_x_get_y':
        return 'Buy X Get Y'
      default:
        return type
    }
  }

  // Calculate totals based on complete data
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = promoApplied && promoDetails ? parseFloat(promoDetails.discountAmount || 0) : 0
  const shipping = subtotal > 100 || (promoApplied && promoDetails?.discountType === 'free_shipping') ? 0 : 9.99
  const tax = (subtotal - discount) * 0.02
  const total = subtotal - discount + shipping + tax

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("cart.loading")}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t("cart.title")}</h1>

      {isCartNotFound || cartItems.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("cart.empty.title")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("cart.empty.description")}
          </p>
          <div className="flex flex-col space-y-4 items-center">
            <Button asChild>
              <Link href="/shop">{t("cart.empty.continueShopping")}</Link>
            </Button>

            {savedForLaterTotal > 0 && (
              <Button variant="outline" asChild>
                <Link href="/saved-for-later" className="flex items-center">
                  <Bookmark className="h-4 w-4 mr-2" />
                  {t("cart.empty.seeSavedItems", { count: savedForLaterTotal })}
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items Section - 2/3 width on desktop */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {t("cart.itemsSection.title", { count: cartItems.length })}
              </h2>
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("cart.itemsSection.clearCart")}
              </Button>
            </div>

            {/* Cart Items List */}
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 sm:h-auto sm:w-48 bg-muted">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <Link href={`/shop/${item.id}`} className="hover:underline">
                              <h3 className="font-medium">{item.name}</h3>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">{t("cart.actions.remove")}</span>
                            </Button>
                          </div>

                          {(item.color || item.size) && (
                            <div className="text-sm text-muted-foreground mb-2">
                              {item.color && <span>{item.color}</span>}
                              {item.color && item.size && <span> / </span>}
                              {item.size && <span>{item.size}</span>}
                            </div>
                          )}

                          <div className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {item.description}
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                              <span className="sr-only">{t("cart.actions.decrease")}</span>
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">{t("cart.actions.increase")}</span>
                            </Button>
                          </div>

                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => moveToSavedForLater(item.id)}
                              disabled={movingItem === item.id}
                            >
                              {movingItem === item.id ? (
                                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                              ) : (
                                <BookmarkCheck className="h-4 w-4 mr-2" />
                              )}
                              {t("cart.actions.saveForLater")}
                            </Button>

                            {/* Price format changed to direct hardcoded format */}
                            <div className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-only row of action buttons */}
                  <div className="flex sm:hidden justify-between items-center border-t p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveToSavedForLater(item.id)}
                      disabled={movingItem === item.id}
                      className="flex-1 mr-2"
                    >
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      {t("cart.actions.save")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("cart.actions.remove")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Saved For Later Section */}
            <Accordion
              type="single"
              collapsible
              value={savedForLaterOpen ? "saved" : ""}
              onValueChange={(value) => setSavedForLaterOpen(value === "saved")}
              className="mt-8 border rounded-lg"
            >
              <AccordionItem value="saved" className="border-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <Bookmark className="h-5 w-5" />
                    <span>{t("cart.savedForLater.title", { count: savedForLaterTotal })}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <div className="p-4 space-y-4">
                    {loadingSavedItems ? (
                      <div className="text-center py-8">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{t("cart.savedForLater.loading")}</p>
                      </div>
                    ) : savedForLaterItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{t("cart.savedForLater.empty")}</p>
                      </div>
                    ) : (
                      savedForLaterItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row">
                              <div className="relative h-32 sm:h-auto sm:w-32 bg-muted">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 p-4">
                                <div className="flex flex-col h-full justify-between">
                                  <div>
                                    <div className="flex justify-between items-start mb-2">
                                      <Link href={`/shop/${item.id}`} className="hover:underline">
                                        <h3 className="font-medium">{item.name}</h3>
                                      </Link>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => removeSavedItem(item.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="sr-only">{t("cart.actions.remove")}</span>
                                      </Button>
                                    </div>

                                    {(item.color || item.size) && (
                                      <div className="text-sm text-muted-foreground mb-2">
                                        {item.color && <span>{item.color}</span>}
                                        {item.color && item.size && <span> / </span>}
                                        {item.size && <span>{item.size}</span>}
                                      </div>
                                    )}

                                    {item.savedAt && (
                                      <div className="text-xs text-muted-foreground flex items-center mb-2">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {t("cart.savedForLater.savedOn", { date: formatDate(item.savedAt) })}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-between items-center mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => moveToCart(item.id)}
                                      disabled={movingItem === item.id}
                                    >
                                      {movingItem === item.id ? (
                                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                                      ) : (
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                      )}
                                      {t("cart.savedForLater.moveToCart")}
                                    </Button>

                                    {/* Price format changed to direct hardcoded format */}
                                    <div className="font-medium">${item.price.toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>

          {/* Order Summary Section - 1/3 width on desktop */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t("cart.orderSummary.title")}</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("cart.orderSummary.subtotal")}</span>
                    {/* Price format changed to direct hardcoded format */}
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {promoApplied && promoDetails && (
                    <div className="flex justify-between text-green-600">
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 mr-1" />
                        <span>Discount ({promoDetails.code})</span>
                      </div>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("cart.orderSummary.shipping")}</span>
                    <span>
                      {shipping === 0 ? t("cart.orderSummary.free") : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("cart.orderSummary.tax")}</span>
                    {/* Price format changed to direct hardcoded format */}
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between font-medium text-lg">
                    <span>{t("cart.orderSummary.total")}</span>
                    {/* Price format changed to direct hardcoded format */}
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">
                    {promoApplied ? "Promo Applied" : "Have a promo code?"}
                  </h3>

                  {promoApplied && promoDetails ? (
                    <div className="mb-4">
                      <div className="bg-muted p-3 rounded-md flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getPromoIcon(promoDetails.discountType)}
                          <div className="ml-2">
                            <div className="font-medium">{promoDetails.code}</div>
                            <div className="text-xs text-muted-foreground">
                              {promoDetails.message || getPromoTypeLabel(promoDetails.discountType)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemovePromo}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder={t("cart.promoCode.placeholder")}
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        disabled={applyingPromo || !promoCode.trim()}
                        onClick={handleApplyPromo}
                      >
                        {applyingPromo ? (
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          t("cart.promoCode.apply")
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Available Promo Codes */}
                  {availablePromoCodes.length > 0 && !promoApplied && (
                    <Accordion type="single" collapsible className="border rounded-md">
                      <AccordionItem value="promos">
                        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                          <span className="flex items-center">
                            <Tag className="h-4 w-4 mr-2" />
                            {t("cart.promoCode.availableCodes")}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 pt-0">
                          <div className="space-y-2">
                            {availablePromoCodes.map((promo) => (
                              <div
                                key={promo.code}
                                className="flex items-center justify-between border rounded p-2 cursor-pointer hover:bg-muted"
                                onClick={() => applyPromoFromList(promo.code)}
                              >
                                <div className="flex items-center">
                                  {getPromoIcon(promo.type)}
                                  <div className="ml-2">
                                    <div className="font-medium text-sm">{promo.code}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {promo.description || getPromoTypeLabel(promo.type)}
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  {t("cart.promoCode.apply")}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>

                {/* Checkout Button */}
                <Button className="w-full mt-4" size="lg" asChild>
                  <Link href="/checkout/confirmation">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    {t("cart.checkout.proceedButton")}
                  </Link>
                </Button>
              </CardContent>
              <CardFooter className="flex items-center justify-center p-4 bg-muted/50 text-xs text-muted-foreground">
                <ShoppingCart className="h-3 w-3 mr-1" />
                {t("cart.checkout.secureMessage")}
              </CardFooter>
            </Card>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/shop">
                <ArrowRight className="h-4 w-4 mr-2" />
                {t("cart.continueShopping")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}