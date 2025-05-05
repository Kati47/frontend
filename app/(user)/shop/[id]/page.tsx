"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Heart,
  Star,
  ShoppingCart,
  Share2,
  BookmarkCheck,
  Package,
  AlertTriangle,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Define base URL for API calls with fallback
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

interface User {
  _id: string;
  name?: string;
  username?: string;
}

interface Product {
  _id: string;
  title: string;
  desc: string;
  img: string;
  categories: string[];
  size: string;
  color: string;
  price: number;
  inStock: boolean;
  quantity: number;
  lowStockThreshold: number;
  model3d: string | null;
  model3dFormat: string | null;
  model3dThumbnail: string | null;
  favoritedBy: Array<{
    userId: string;
    addedAt: string;
  }>;
  savedForLaterBy: Array<{
    userId: string;
    savedAt: string;
    fromCart: boolean;
  }>;
  favoriteCount: number;
  savedForLaterCount: number;
  averageRating: number;
  reviewCount: number;
  isInCart?: boolean;
  cartQuantity?: number;
}

interface Review {
  _id: string;
  userId: string | User;
  username?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

interface SketchfabViewerProps {
  modelId: string;
  title?: string;
  height?: string;
  width?: string;
}

// SketchfabViewer component for 3D models
function SketchfabViewer({
  modelId,
  title = "3D Model",
  height = "400px",
  width = "100%",
}: SketchfabViewerProps) {
  // Extract model ID from URL if needed
  let embedId = modelId;
  if (modelId.includes("/models/")) {
    // Extract ID from a Sketchfab URL format
    const matches = modelId.match(/\/models\/([a-zA-Z0-9]+)/);
    if (matches && matches[1]) {
      embedId = matches[1];
    }
  }

  // Direct embed URL construction
  const embedUrl = `https://sketchfab.com/models/${embedId}/embed`;

  return (
    <div className="sketchfab-embed-wrapper" style={{ height, width }}>
      <iframe
        title={title}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0.5rem",
        }}
        src={embedUrl}
      />
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = params.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [newReview, setNewReview] = useState<Partial<Review>>({
    rating: 5,
    title: "",
    comment: "",
  });
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [isSharing, setIsSharing] = useState(false);

  // Functions for quantity control
  const incrementQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    try {
      const storedUserId = localStorage.getItem("userId") || "";
      return storedUserId;
    } catch (err) {
      console.error("Error accessing localStorage:", err);
      return "";
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const storedUserId = getUserIdFromLocalStorage();
    const storedToken = localStorage.getItem("token");
    
    setUserId(storedUserId);
    setToken(storedToken);
    
    if (storedUserId && productId) {
      fetchProduct(productId, storedUserId, storedToken);
      fetchReviews(productId);
      checkIfInCart(storedUserId, productId, storedToken || "")
        .then(inCart => {
          setIsInCart(inCart);
          if (inCart) {
            checkCartStatus(productId, storedUserId, storedToken);
          }
        });
    } else {
      fetchProduct(productId);
      fetchReviews(productId);
    }

    // Save optimistic reviews in localStorage if they exist
    const storedReviews = JSON.parse(localStorage.getItem(`product-reviews-${productId}`) || "[]");
    if (storedReviews.length > 0) {
      console.log("Found locally stored reviews:", storedReviews);
      setReviews(storedReviews);
    }
  }, [productId]);

  // Fetch user name by ID
  const fetchUserName = async (userId: string): Promise<void> => {
    if (!userId || userNames[userId]) return;
    
    try {
      console.log(`Fetching name for user ID from review: ${userId}`);
      
      // Updated to use the correct endpoint structure: /users/:id/name
      const response = await fetch(`${baseUrl}/users/${userId}/name`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Error fetching user name for ${userId}: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      console.log(`Name data received for ${userId}:`, data);
      
      if (data && (data.name || data.username)) {
        setUserNames(prev => ({
          ...prev,
          [userId]: data.name || data.username || 'User'
        }));
      }
    } catch (error) {
      console.error(`Error fetching name for user ${userId}:`, error);
    }
  };

  // Extract user ID from review
  const extractUserId = (review: Review): string | null => {
    if (!review || !review.userId) return null;
    
    // If userId is an object with _id
    if (typeof review.userId === 'object' && 'string' !== typeof review.userId) {
      return (review.userId as User)._id;
    }
    
    // If userId is a string (direct ID)
    if (typeof review.userId === 'string') {
      return review.userId;
    }
    
    return null;
  };

  // Get display name for user
  const getUserDisplayName = (review: Review): string => {
    const userId = extractUserId(review);
    
    if (userId && userNames[userId]) {
      return userNames[userId];
    }
    
    if (typeof review.userId === 'object' && 'string' !== typeof review.userId) {
      const user = review.userId as User;
      return user.name || user.username || 'Anonymous';
    }
    
    return review.username || 'Anonymous';
  };

  // Fetch user names for reviews whenever they change
  useEffect(() => {
    // Collect all unique user IDs that need name fetching
    const pendingUserIds = new Set<string>();
    
    reviews.forEach(review => {
      const userId = extractUserId(review);
      if (userId && !userNames[userId]) {
        pendingUserIds.add(userId);
      }
    });
    
    // Fetch names for all pending user IDs
    pendingUserIds.forEach(userId => {
      fetchUserName(userId);
    });
  }, [reviews, userNames]);

  // Fetch product details
  const fetchProduct = async (productId: string, userId?: string, token?: string | null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Basic product endpoint
      let url = `${baseUrl}/products/find/${productId}`;
      
      // If user is logged in, use the enhanced endpoint that includes user-specific info
      if (userId && token) {
        url = `${baseUrl}/products/find/${productId}?userId=${userId}`;
      }
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(
          `Failed to fetch product: ${response.status} ${response.statusText}`
        );
      }
      
      const data = await response.json();
      
      // Handle different API response formats
      const productData = data.product || data;
      
      // Set favorite and saved status based on API response or manual check
      const isUserFavorite = productData.favoritedBy?.some(
        (fav: any) => fav.userId === userId
      );
      
      const isUserSaved = productData.savedForLaterBy?.some(
        (saved: any) => saved.userId === userId
      );
      
      setIsFavorite(!!isUserFavorite);
      setIsSaved(!!isUserSaved);
      setProduct(productData);
      
      // Set initial size and color
      if (productData.size) {
        const sizes = productData.size.split(",").map((s: string) => s.trim());
        setSelectedSize(sizes[0]);
      }
      
      if (productData.color) {
        const colors = productData.color.split(",").map((c: string) => c.trim());
        setSelectedColor(colors[0]);
      }
      
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load product details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product reviews
  const fetchReviews = async (productId: string) => {
    try {
      console.log(`Fetching reviews for product: ${productId}`);
      
      // First try without authentication
      const response = await fetch(`${baseUrl}/reviews/product/${productId}`);
      
      if (!response.ok) {
        console.error("Failed to fetch reviews:", response.status);
        
        // If auth is required, try with token
        if (response.status === 401 && token) {
          console.log("Attempting authenticated fetch for reviews");
          const authResponse = await fetch(`${baseUrl}/reviews/product/${productId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log("Authenticated reviews data:", authData);
            
            // Process and set reviews
            if (Array.isArray(authData)) {
              setReviews(authData);
            } else if (authData && Array.isArray(authData.reviews)) {
              setReviews(authData.reviews);
            }
            return;
          }
        }
        
        // If all fails, set empty reviews
        setReviews([]);
        return;
      }
      
      const data = await response.json();
      console.log("Reviews data received:", data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setReviews(data);
      } else if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        console.log("No reviews found or unexpected data format:", data);
        setReviews([]);
      }
      
      // Save to localStorage for immediate feedback
      localStorage.setItem(`product-reviews-${productId}`, JSON.stringify(
        Array.isArray(data) ? data : 
        (data && Array.isArray(data.reviews)) ? data.reviews : []
      ));
      
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    }
  };

  // Check if product is already in user's cart
  const checkIfInCart = async (userId: string, productId: string, token: string): Promise<boolean> => {
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
  };

  // Add to cart function
  async function addToCart(userId: string, productData: any, token: string) {
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

  // Check if the product is in user's cart
  const checkCartStatus = async (productId: string, userId: string, token: string | null) => {
    if (!userId || !token) return;
    
    try {
      const response = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        console.error("Failed to fetch cart:", response.status);
        return;
      }
      
      const data = await response.json();
      const cart = data.cart || data;
      
      const productInCart = cart.products?.find(
        (item: any) => item.productId === productId
      );
      
      setIsInCart(!!productInCart);
      
      if (productInCart) {
        setQuantity(productInCart.quantity || 1);
      }
    } catch (err) {
      console.error("Error checking cart status:", err);
    }
  };

  // Handle adding product to cart
  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please log in to add items to your cart", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    
    // If already in cart, redirect to cart page
    if (isInCart) {
      router.push("/cart");
      return;
    }
    
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    
    try {
      if (!product?._id) {
        console.error("Product missing ID:", product);
        toast.error("Invalid product data");
        setIsAddingToCart(false);
        return;
      }
      
      // If product is currently saved for later, remove it before adding to cart
      if (isSaved && token) {
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
          });
          
          if (response.ok) {
            setIsSaved(false);
            console.log("Removed from saved items before adding to cart");
          }
        } catch (error) {
          console.error("Failed to remove from saved items:", error);
          // Continue with cart addition even if this fails
        }
      }
      
      // Check if product is null before accessing its properties
      if (!product) {
        throw new Error("Product data is missing");
      }
      
      // Check if product is null before accessing its properties
      if (!product) {
        throw new Error("Product data is missing");
      }
      
      // Check if product is null before accessing its properties
      if (!product) {
        throw new Error("Product data is missing");
      }
      
      // Create a product object with the complete structure expected by the API
      const cartProduct = {
        productId: product._id,
        quantity: quantity,
        title: product.title,
        price: typeof product.price === 'number' ? product.price : 0,
        img: product.img || "",
        desc: product.desc || "",
        size: selectedSize || (product.size ? product.size.split(',')[0].trim() : ''),
        color: selectedColor || (product.color ? product.color.split(',')[0].trim() : '')
      };
      
      if (!token) {
        throw new Error("Authentication token is missing");
      }
      
      await addToCart(userId, cartProduct, token);
      
      // Update cart status
      setIsInCart(true);
      
      toast.success("Product added to cart", {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to add product to cart. Please try again."
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Please log in to submit a review", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    
    try {
      // Validate required fields according to your Review schema
      if (!newReview.title?.trim()) {
        toast.error("Please provide a review title");
        return;
      }
      
      if (!newReview.comment?.trim()) {
        toast.error("Please provide a review comment");
        return;
      }
      
      // Create review data with all required fields from your schema
      const reviewData = {
        userId,
        productId,
        rating: newReview.rating || 5,
        title: newReview.title?.trim(),
        comment: newReview.comment?.trim(),
        // Your schema has these fields with defaults, but include them for completeness
        status: "approved", // This is the default in your schema
        flagLevel: "green",  // This is the default in your schema
        autoModerated: true  // This is the default in your schema
      };
      
      console.log("Submitting review:", reviewData);
      
      // Add an optimistic review immediately for better UX
      const optimisticReview: Review = {
        _id: `temp-${Date.now()}`,
        userId: userId,
        username: localStorage.getItem("username") || "You", 
        rating: newReview.rating || 5,
        title: newReview.title || "",
        comment: newReview.comment || "",
        createdAt: new Date().toISOString()
      };
      
      // Add the optimistic review to the UI immediately
      setReviews(prevReviews => [optimisticReview, ...prevReviews]);
      
      // Store in local storage temporarily in case of page reload
      const storedReviews = JSON.parse(localStorage.getItem(`product-reviews-${productId}`) || "[]");
      localStorage.setItem(
        `product-reviews-${productId}`, 
        JSON.stringify([optimisticReview, ...storedReviews])
      );
      
      // Your backend expects POST to /reviews
      const response = await fetch(`${baseUrl}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Review submission failed:", errorData);
        
        // Remove the optimistic review on error
        setReviews(prevReviews => 
          prevReviews.filter(review => review._id !== optimisticReview._id)
        );
        
        // Update local storage to remove failed review
        const currentStored = JSON.parse(localStorage.getItem(`product-reviews-${productId}`) || "[]");
        localStorage.setItem(
          `product-reviews-${productId}`, 
          JSON.stringify(currentStored.filter((r: Review) => r._id !== optimisticReview._id))
        );
        
        throw new Error(errorData.message || "Failed to submit review");
      }
      
      const responseData = await response.json();
      console.log("Review submission response:", responseData);
      
      // Reset review form
      setNewReview({
        rating: 5,
        title: "",
        comment: "",
      });
      
      setShowReviewForm(false);
      
      toast.success(responseData.message || "Review submitted successfully");
      
      // Refetch reviews and product to update rating
      fetchReviews(productId);
      fetchProduct(productId, userId, token);
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to submit review. Please try again."
      );
    }
  };

  // Toggle product favorite status
  const handleToggleFavorite = async () => {
    if (!userId) {
      toast.error("Please log in to save favorites", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    
    try {
      setIsTogglingFavorite(true);
      
      // Optimistic UI update
      setIsFavorite(!isFavorite);
      
      const response = await fetch(`${baseUrl}/products/favorite/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          productId,
        }),
      });
      
      if (!response.ok) {
        // Revert optimistic update on error
        setIsFavorite(isFavorite);
        throw new Error("Failed to update favorite status");
      }
      
      const data = await response.json();
      
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites"
      );
      
      // Refetch product to update favorite count
      fetchProduct(productId, userId, token);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update favorite status. Please try again."
      );
      
      // Revert optimistic update on error
      setIsFavorite(isFavorite);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Toggle save for later status
  const handleToggleSaveForLater = async () => {
    if (!userId) {
      toast.error("Please log in to save items for later", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    
    try {
      setIsTogglingBookmark(true);
      
      // Optimistic UI update
      setIsSaved(!isSaved);
      
      const response = await fetch(`${baseUrl}/products/savedforlater/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          productId,
        }),
      });
      
      if (!response.ok) {
        // Revert optimistic update on error
        setIsSaved(isSaved);
        throw new Error("Failed to update saved status");
      }
      
      const data = await response.json();
      
      toast.success(
        isSaved ? "Removed from saved items" : "Saved for later"
      );
      
      // Refetch product to update saved count
      fetchProduct(productId, userId, token);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update saved status. Please try again."
      );
      
      // Revert optimistic update on error
      setIsSaved(isSaved);
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  // Share functionality - Updated to match the requested format
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    
    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.desc || `Check out this ${product.title}`,
          url: `${window.location.origin}/shop/${product._id}`
        });
        
        toast("Shared successfully", {
          description: "Product has been shared"
        });
      } else {
        // Fallback: Copy link to clipboard
        const url = `${window.location.origin}/shop/${product._id}`;
        await navigator.clipboard.writeText(url);
        
        toast("Link copied", {
          description: "Product link copied to clipboard"
        });
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error("Error sharing product:", error);
        toast("Error", { 
          description: "Failed to share product"
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-medium mb-2">
            Loading product details...
          </h2>
        </div>
      </div>
    );
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
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-medium mb-2">Error Loading Product</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/shop">Browse Other Products</Link>
          </Button>
        </div>
      </div>
    );
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
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Available sizes and colors
  const availableSizes = product.size.split(",").map(s => s.trim());
  const availableColors = product.color.split(",").map(c => c.trim());

  // Get stock status
  const stockStatus = product.inStock
    ? product.quantity <= product.lowStockThreshold
      ? {
          badge: "secondary",
          text: "Low Stock",
          icon: <AlertTriangle className="h-4 w-4" />,
        }
      : {
          badge: "default",
          text: "In Stock",
          icon: <Check className="h-4 w-4" />,
        }
    : {
        badge: "destructive",
        text: "Out of Stock",
        icon: <AlertTriangle className="h-4 w-4" />,
      };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          href="/shop"
          className="text-muted-foreground hover:text-foreground"
        >
          Shop
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="truncate max-w-[200px]">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images and 3D Model Section */}
        <div>
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="image">Images</TabsTrigger>
              {product.model3d && (
                <TabsTrigger value="3d">3D Model</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="image" className="mt-0">
              <div className="aspect-square relative overflow-hidden rounded-lg border bg-white">
                <Image
                  src={product.img || "/placeholder-product.png"}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </TabsContent>

            {product.model3d && (
              <TabsContent value="3d" className="mt-0">
                <div className="aspect-square relative overflow-hidden rounded-lg border bg-white">
                  {product.model3dFormat === 'sketchfab' ? (
                    <SketchfabViewer
                      modelId={product.model3d}
                      title={product.title}
                      height="100%"
                      width="100%"
                    />
                  ) : product.model3dThumbnail ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={product.model3dThumbnail}
                        alt={`3D model of ${product.title}`}
                        fill
                        className="object-contain p-4"
                      />
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <Button>
                          View 3D Model ({product.model3dFormat})
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <p className="mb-4 text-center">
                        3D model available in {product.model3dFormat} format
                      </p>
                      <Button>
                        Download 3D Model
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>
                    {product.model3dFormat === 'sketchfab' 
                      ? "Interactive 3D model - click and drag to rotate, scroll to zoom"
                      : `3D model available in ${product.model3dFormat} format`}
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      (product.averageRating || 0) >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {product.averageRating?.toFixed(1) || "No ratings"}
                  {product.reviewCount
                    ? ` (${product.reviewCount} reviews)`
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-semibold">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-muted-foreground mb-4">{product.desc}</p>

            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={
                  stockStatus.badge as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                }
              >
                <span className="flex items-center gap-1">
                  {stockStatus.icon}
                  {stockStatus.text}
                </span>
              </Badge>

              {product.categories && product.categories.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {product.categories.map((category, index) => (
                    <Badge key={index} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="size" className="text-base">
                  Size
                </Label>
                <RadioGroup
                  id="size"
                  className="flex flex-wrap gap-2 mt-2"
                  value={selectedSize || availableSizes[0]}
                  onValueChange={setSelectedSize}
                >
                  {availableSizes.map((size) => (
                    <div key={size}>
                      <RadioGroupItem
                        id={`size-${size}`}
                        value={size}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className={`px-3 py-1 rounded-md cursor-pointer border ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />
            </div>
          )}

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="color" className="text-base">
                  Color
                </Label>
                <RadioGroup
                  id="color"
                  className="flex flex-wrap gap-2 mt-2"
                  value={selectedColor || availableColors[0]}
                  onValueChange={setSelectedColor}
                >
                  {availableColors.map((color) => (
                    <div key={color}>
                      <RadioGroupItem
                        id={`color-${color}`}
                        value={color}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`color-${color}`}
                        className={`px-3 py-1 rounded-md cursor-pointer border ${
                          selectedColor === color
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <Label htmlFor="quantity" className="text-base">
              Quantity
            </Label>
            <div className="flex items-center mt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease</span>
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantity}
                className="h-9 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value) || value < 1) {
                    setQuantity(1);
                  } else if (value > product.quantity) {
                    setQuantity(product.quantity);
                  } else {
                    setQuantity(value);
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={incrementQuantity}
                disabled={quantity >= product.quantity}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase</span>
              </Button>

              <span className="ml-2 text-sm text-muted-foreground">
                {product.quantity} available
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              className={`flex-1 ${isInCart ? 'bg-green-600 hover:bg-green-700 border-green-500' : ''}`}
              disabled={!product.inStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </span>
              ) : isInCart ? (
                <span className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-white" />
                  View in Cart
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </span>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className={isFavorite ? "text-red-500 hover:bg-red-50" : "hover:bg-red-50"}
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorite ? "fill-red-500" : ""
                    }`}
                  />
                )}
                <span className="sr-only">
                  {isFavorite
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={isSaved ? "text-blue-500 hover:bg-blue-50" : "hover:bg-blue-50"}
                onClick={handleToggleSaveForLater}
                disabled={isTogglingBookmark}
              >
                {isTogglingBookmark ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <BookmarkCheck
                    className={`h-4 w-4 ${
                      isSaved ? "fill-blue-500" : ""
                    }`}
                  />
                )}
                <span className="sr-only">
                  {isSaved
                    ? "Remove from Saved"
                    : "Save for Later"}
                </span>
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleShare}
                disabled={isSharing}
                className="hover:bg-violet-50"
              >
                {isSharing ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4 text-violet-600" />
                )}
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews {product.reviewCount ? `(${product.reviewCount})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p>{product.desc}</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-8">
              {/* Review Summary */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <h3 className="text-3xl font-bold">
                      {product.averageRating?.toFixed(1) || "0.0"}
                    </h3>
                    <div className="flex items-center my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            (product.averageRating || 0) >= star
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Based on {product.reviewCount || 0}{" "}
                      {product.reviewCount === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>

                <div className="md:w-2/3">
                  {/* Review Form */}
                  <div>
                    {showReviewForm ? (
                      <Card>
                        <CardHeader>
                          <h3 className="text-lg font-semibold">
                            Write a Review
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <form
                            onSubmit={handleReviewSubmit}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="rating">Rating</Label>
                              <RadioGroup
                                id="rating"
                                className="flex gap-2 mt-2"
                                value={String(newReview.rating || 5)}
                                onValueChange={(value) =>
                                  setNewReview({
                                    ...newReview,
                                    rating: parseInt(value),
                                  })
                                }
                              >
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <div key={rating}>
                                    <RadioGroupItem
                                      id={`rating-${rating}`}
                                      value={String(rating)}
                                      className="sr-only"
                                    />
                                    <Label
                                      htmlFor={`rating-${rating}`}
                                      className={`px-3 py-1 rounded-md cursor-pointer border ${
                                        (newReview.rating || 5) === rating
                                          ? "bg-primary text-primary-foreground border-primary"
                                          : "bg-background hover:bg-muted"
                                      }`}
                                    >
                                      {rating}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>

                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={newReview.title || ""}
                                onChange={(e) =>
                                  setNewReview({
                                    ...newReview,
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Summarize your review"
                              />
                            </div>

                            <div>
                              <Label htmlFor="comment">Review</Label>
                              <Textarea
                                id="comment"
                                value={newReview.comment || ""}
                                onChange={(e) =>
                                  setNewReview({
                                    ...newReview,
                                    comment: e.target.value,
                                  })
                                }
                                placeholder="Write your review here"
                                rows={4}
                                required
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowReviewForm(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Submit Review</Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center p-6 border rounded-lg">
                        <h3 className="font-medium mb-2">
                          Share your thoughts about this product
                        </h3>
                        <Button onClick={() => setShowReviewForm(true)}>
                          Write a Review
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reviews List */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>

                {reviews.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">
                      No reviews yet. Be the first to review this product.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="p-5 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/5 text-primary">
                              {getUserDisplayName(review)[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(review))}&background=random`} />
                          </Avatar>
                          <div>
                            <p className="font-medium text-base">
                              {getUserDisplayName(review)}
                              {!getUserDisplayName(review) && 
                                <span className="text-xs text-muted-foreground ml-1">(User info loading...)</span>
                              }
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <span>{new Date(review.createdAt || Date.now()).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                {review.rating}
                                <Star className="h-3 w-3 ml-0.5 text-yellow-400 fill-yellow-400" />
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 inline-block ${
                                review.rating >= star
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>

                        {review.title && (
                          <h4 className="font-medium text-lg mb-2">{review.title}</h4>
                        )}

                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}