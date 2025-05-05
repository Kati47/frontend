// use client

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link" 
import { BookmarkCheck, ShoppingCart, Star, Heart, Check, MoreHorizontal, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Define base URL for API calls with fallback
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1"

// Define TypeScript interface for component props
interface ProductCardProps {
  product: {
    _id: string; // MongoDB document ID is required
    title: string;
    price?: number; // Make price optional since it might be undefined
    desc?: string;
    size?: string;
    color?: string;
    categories?: string[];
    rating?: number;
    img?: string;
    reviewCount?: number;
    isFavorite?: boolean;
    favoriteCount?: number;
    isSavedForLater?: boolean;
    isInCart?: boolean; // New property to track cart status
  }
}

/**
 * Add product to cart API function
 * First checks if cart exists, then either updates existing cart or creates new one
 * @param userId - User ID from authentication
 * @param productData - Single product or array of products to add to cart
 * @param token - Authentication token
 * @returns Promise with API response data
 */
async function addToCart(userId: string, productData: any, token: string) {
  // Existing implementation unchanged
  if (!userId || !productData || !token) {
    throw new Error("Missing required parameters for cart addition");
  }
  
  // Normalize input to always work with an array of products
  const products = Array.isArray(productData) ? productData : [productData];
  
  console.log("Processing cart addition for:", {
    userId,
    products: products
  });
  
  try {
    // First check if the user has an existing cart
    const checkCartResponse = await fetch(`${baseUrl}/cart/find/${userId}`, {
      headers: { 
        "Authorization": `Bearer ${token}`
      }
    });
    
    console.log("Cart check response status:", checkCartResponse.status);
    
    if (checkCartResponse.ok) {
      // Cart exists - we'll update it
      const cartData = await checkCartResponse.json();
      console.log("Existing cart found:", cartData);
      
      // Extract existing products from cart
      let existingProducts = [];
      
      // Handle different API response formats
      if (cartData.products && Array.isArray(cartData.products)) {
        existingProducts = cartData.products;
      } else if (cartData.cart && cartData.cart.products && Array.isArray(cartData.cart.products)) {
        existingProducts = cartData.cart.products;
      } else {
        console.log("No existing products found in cart or unexpected format");
      }
      
      console.log("Existing products:", existingProducts.length);
      
      // Format the new products as expected by the API, preserving all details
      const formattedProducts = products.map(product => ({
        productId: product.productId,
        quantity: product.quantity || 1,
        title: product.title || "Product",
        price: typeof product.price === 'number' ? product.price : 0,
        img: product.img || "",
        desc: product.desc || "",
        size: product.size || "",
        color: product.color || ""
      }));
      
      console.log("Formatted products with full details:", formattedProducts);
      
      // Check if the product already exists in the cart
      const updatedProducts = [...existingProducts];
      
      // For each new product
      for (const newProduct of formattedProducts) {
        // Find if this product already exists in cart
        const existingProductIndex = existingProducts.findIndex(
          (p: { productId: string }) => p.productId === newProduct.productId
        );
        
        if (existingProductIndex >= 0) {
          // Product exists - update the quantity and ensure all details are preserved
          updatedProducts[existingProductIndex] = {
            ...existingProducts[existingProductIndex],
            ...newProduct,
            quantity: (existingProducts[existingProductIndex].quantity || 1) + (newProduct.quantity || 1)
          };
          console.log(`Updated existing product ${newProduct.productId} quantity`);
        } else {
          // Product doesn't exist - add it with all details
          updatedProducts.push(newProduct);
          console.log(`Added new product ${newProduct.productId} to cart`);
        }
      }
      
      console.log("Final updated products list:", updatedProducts);
      
      // Get cart ID based on response format
      const cartId = cartData.cart?._id || cartData._id;
      console.log("Using cart ID:", cartId);
      
      // Update the cart with all products
      const updateResponse = await fetch(`${baseUrl}/cart/update/${cartId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          products: updatedProducts
        }),
      });
      
      console.log("Cart update response status:", updateResponse.status);
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Cart update error response:", errorText);
        throw new Error(`Failed to update cart: ${errorText}`);
      }
      
      return await updateResponse.json();
      
    } else if (checkCartResponse.status === 404) {
      // No cart exists - create a new one with this product
      console.log("No existing cart found, creating new one");
      
      // Format the products for the API, ensuring all details are included
      const formattedProducts = products.map(product => ({
        productId: product.productId,
        quantity: product.quantity || 1,
        title: product.title || "Product",
        price: typeof product.price === 'number' ? product.price : 0,
        img: product.img || "",
        desc: product.desc || "",
        size: product.size || "",
        color: product.color || ""
      }));
      
      console.log("Formatted products for cart creation (with full details):", formattedProducts);
      
      // Create a new cart with these products
      const createResponse = await fetch(`${baseUrl}/cart/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          products: formattedProducts
        }),
      });
      
      console.log("Cart creation response status:", createResponse.status);
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Cart creation error response:", errorText);
        throw new Error(`Failed to create cart: ${errorText}`);
      }
      
      return await createResponse.json();
    } else {
      // Some other error occurred when checking for the cart
      const errorText = await checkCartResponse.text();
      console.error("Error checking for cart:", errorText);
      throw new Error(`Failed to check cart: ${errorText}`);
    }
  } catch (error) {
    console.error("Cart API error:", error);
    throw error;
  }
}

/**
 * Check if product is already in user's cart
 */
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
    return products.some((item: { productId: string }) => 
      item.productId === productId
    );
  } catch (error) {
    console.error("Error checking if product is in cart:", error)
    return false;
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  // State for UI
  const [isSaved, setIsSaved] = useState(product.isSavedForLater || false)
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false)
  const [isInCart, setIsInCart] = useState(product.isInCart || false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  
  // Default fallback values
  const rating = product.rating || 0
  const reviewCount = product.reviewCount || 0
  
  // Check product status from API on mount
  useEffect(() => {
    const checkProductStatus = async () => {
      try {
        const userId = localStorage.getItem("userId")
        const token = localStorage.getItem("token")
        
        if (!userId || !token || !product._id) return
        
        // Fetch product with user context
        const response = await fetch(`${baseUrl}/products/find/${product._id}?userId=${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          // Update state with both saved and favorite status from API
          setIsSaved(!!data.isSavedForLater)
          setIsFavorite(!!data.isFavorite)
          
          // Check if product is in cart
          const inCart = await checkIfInCart(userId, product._id, token)
          setIsInCart(inCart)
        }
      } catch (error) {
        console.error("Error checking product status:", error)
      }
    }
    
    checkProductStatus()
  }, [product._id])

  /**
   * Handle adding product to cart
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // If already in cart, redirect to cart page
    if (isInCart) {
      router.push("/cart")
      return
    }
    
    if (isAddingToCart) return
    setIsAddingToCart(true)
    
    try {
      const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")
      
      if (!userId || !token) {
        toast("Please log in first", {
          description: "You need to be logged in to add items to your cart",
          action: {
            label: "Login",
            onClick: () => router.push("/login")
          }
        })
        setIsAddingToCart(false)
        return
      }
      
      if (!product._id) {
        console.error("Product missing ID:", product)
        toast("Error", { description: "Invalid product data" })
        setIsAddingToCart(false)
        return
      }
      
      // If product is currently saved for later, remove it before adding to cart
      if (isSaved) {
        try {
          const response = await fetch(`${baseUrl}/products/savedforlater/toggle`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              userId,
              productId: product._id
            })
          })
          
          if (response.ok) {
            setIsSaved(false)
            console.log("Removed from saved items before adding to cart")
          }
        } catch (error) {
          console.error("Failed to remove from saved items:", error)
          // Continue with cart addition even if this fails
        }
      }
      
      // Create a product object with the complete structure expected by the API
      const cartProduct = {
        productId: product._id,
        quantity: 1,
        title: product.title,
        price: typeof product.price === 'number' ? product.price : 0,
        img: product.img || "",
        desc: product.desc || "",
        size: product.size || "",
        color: product.color || ""
      }
      
      await addToCart(userId, cartProduct, token)
      
      // Update cart status
      setIsInCart(true)
      
      toast("Added to cart", {
        description: `${product.title} has been added to your cart`,
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart")
        }
      })
      
    } catch (error: any) {
      console.error("Failed to add to cart:", error)
      toast("Error adding to cart", {
        description: error.message || "Something went wrong. Please try again."
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  /**
   * Toggle saved for later status (using API)
   */
  const handleToggleSaveForLater = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isTogglingBookmark) return
    setIsTogglingBookmark(true)
    
    try {
      const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")
      
      if (!userId || !token) {
        toast("Please log in first", {
          description: "You need to be logged in to save items for later",
          action: {
            label: "Login",
            onClick: () => router.push("/login")
          }
        })
        setIsTogglingBookmark(false)
        return
      }
      
      const response = await fetch(`${baseUrl}/products/savedforlater/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          productId: product._id
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update saved status")
      }
      
      const data = await response.json()
      
      setIsSaved(data.isSavedForLater)
      
      toast(data.message, {
        action: data.isSavedForLater ? {
          label: "View Saved",
          onClick: () => router.push("/saved-for-later")
        } : undefined
      })
      
    } catch (error: any) {
      console.error("Failed to toggle saved for later status:", error)
      toast("Error", { description: error.message || "Something went wrong. Please try again." })
    } finally {
      setIsTogglingBookmark(false)
    }
  }
  
  /**
   * Toggle favorite status (using API)
   */
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isTogglingFavorite) return
    setIsTogglingFavorite(true)
    
    try {
      const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")
      
      if (!userId || !token) {
        toast("Please log in first", {
          description: "You need to be logged in to favorite items",
          action: {
            label: "Login",
            onClick: () => router.push("/login")
          }
        })
        setIsTogglingFavorite(false)
        return
      }
      
      const response = await fetch(`${baseUrl}/products/favorite/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          productId: product._id
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update favorite status")
      }
      
      const data = await response.json()
      
      setIsFavorite(data.isFavorite)
      
      toast(data.message, {
        action: data.isFavorite ? {
          label: "View Favorites",
          onClick: () => router.push("/favorites")
        } : undefined
      })
      
    } catch (error: any) {
      console.error("Failed to toggle favorite status:", error)
      toast("Error", { description: error.message || "Something went wrong. Please try again." })
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  /**
   * Handle sharing product
   */
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isSharing) return
    setIsSharing(true)
    
    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.desc || `Check out this ${product.title}`,
          url: `${window.location.origin}/shop/${product._id}`
        })
        
        toast("Shared successfully", {
          description: "Product has been shared"
        })
      } else {
        // Fallback: Copy link to clipboard
        const url = `${window.location.origin}/shop/${product._id}`
        await navigator.clipboard.writeText(url)
        
        toast("Link copied", {
          description: "Product link copied to clipboard"
        })
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error("Error sharing product:", error)
        toast("Error", { 
          description: "Failed to share product"
        })
      }
    } finally {
      setIsSharing(false)
    }
  }

  // Format the price safely
  const formattedPrice = typeof product.price === 'number' 
    ? product.price.toFixed(2) 
    : "0.00"

  return (
    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/shop/${product._id}`} className="block h-full w-full">
          <Image 
            src={product.img || "/placeholder.svg"} 
            alt={product.title} 
            fill 
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
          />
          
          {/* Gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        {/* Save for Later Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transform transition-all duration-200 hover:scale-110 z-10"
          onClick={handleToggleSaveForLater}
          disabled={isTogglingBookmark}
        >
          {isTogglingBookmark ? (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <BookmarkCheck className={cn("h-5 w-5", isSaved ? "fill-primary text-primary" : "text-gray-700")} />
          )}
        </Button>
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transform transition-all duration-200 hover:scale-110 z-10"
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
        >
          {isTogglingFavorite ? (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-gray-700")} />
          )}
        </Button>
        
        {/* Share Button - Add this new button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-14 right-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transform transition-all duration-200 hover:scale-110 z-10"
          onClick={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Share2 className="h-5 w-5 text-gray-700" />
          )}
        </Button>
        
        {/* Product Info Tag */}
        {product.categories && product.categories[0] && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-sm z-10">
            {product.categories[0]}
          </div>
        )}
        
        {/* Saved Tag */}
        {isSaved && (
          <div className="absolute bottom-2 right-2 bg-primary/90 text-white backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium shadow-sm z-10">
            Saved
          </div>
        )}
        
        {/* In Cart Tag */}
        {isInCart && (
          <div className="absolute bottom-2 left-2 bg-green-600/90 text-white backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium shadow-sm z-10 flex items-center">
            <Check className="h-3 w-3 mr-1" />
            In Cart
          </div>
        )}
        
        {/* Add to Cart Button - Now as an overlay on the image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button 
            variant={isInCart ? "default" : "secondary"}
            className={cn(
              "backdrop-blur-sm shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300",
              isInCart 
                ? "bg-green-600/90 hover:bg-green-600 text-white" 
                : "bg-white/90 hover:bg-white text-gray-800"
            )}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          > 
            {isAddingToCart ? (
              <>
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </>
            ) : isInCart ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                View in Cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 pb-5">
        <div className="space-y-2">
          <Link href={`/shop/${product._id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-medium text-lg line-clamp-1 group-hover:underline decoration-1 underline-offset-2">
              {product.title}
            </h3>
          </Link>
          
          {/* Rating with conditional color based on rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(rating) 
                      ? "fill-amber-400 text-amber-400" 
                      : "fill-muted text-muted-foreground"
                  )} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1 font-medium">
              ({reviewCount})
            </span>
          </div>
          
          {/* Optional attributes row */}
          {(product.color || product.size) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {product.color && (
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full bg-${product.color.toLowerCase()}-500`}></div>
                  <span>{product.color}</span>
                </div>
              )}
              {product.size && (
                <div className="flex items-center gap-1">
                  <span className="text-xs border px-1 rounded">{product.size}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Price and Quick Add */}
          <div className="flex justify-between items-center pt-1">
            <div>
              <span className="font-bold text-lg">${formattedPrice}</span>
              {product.price && product.price > 100 && (
                <span className="text-xs ml-2 text-green-600">Free Shipping</span>
              )}
            </div>
            
            {/* Mobile-only visible cart button */}
            <Button 
              variant={isInCart ? "default" : "ghost"}
              size="icon" 
              className={cn(
                "h-8 w-8 md:hidden",
                isInCart && "bg-green-600 hover:bg-green-700"
              )}
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            > 
              {isAddingToCart ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : isInCart ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}