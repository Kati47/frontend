"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star, Share, Truck, RotateCcw, Shield, Clock, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProductCard from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Product interface
interface Product {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  desc?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  colors?: Array<{ id: string; name: string; value: string }>;
  sizes?: string[];
  images?: string[];
  img?: string;
  image?: string;
  features?: string[];
  specifications?: Record<string, string>;
  stock?: number;
  inStock?: boolean;
  quantity?: number;
  sku?: string;
  category?: string;
  categories?: string[];
  tags?: string[];
  isFavorite?: boolean;
  isSaved?: boolean;
}

// Review interface
interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  // Generate auth headers for API requests
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
  };

  // Check if product is in cart
  async function checkIfInCart(userId: string, productId: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/cart/find/${userId}`, {
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

  // Load product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Load auth data
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const storedUserId = getUserIdFromLocalStorage();
        
        setAuthToken(token);
        setUserId(storedUserId);
        
        // Get or create session ID for non-authenticated users
        let sid = localStorage.getItem("guestSessionId");
        if (!token && !sid) {
          sid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem("guestSessionId", sid);
        }
        setSessionId(sid);
        
        // Fetch product details
        const url = `${API_URL}/products/find/${params.id}${!token && sid ? `?sessionId=${sid}` : ""}`;
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Failed to load product");
        }

        const productData = data.product;
        
        // Set up product state
        setProduct(productData);
        setMainImage(productData.images?.[0] || productData.image || productData.img || "/placeholder.svg");
        
        if (productData.colors?.length > 0) {
          setSelectedColor(productData.colors[0].id);
        }
        
        if (productData.sizes?.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        
        // Set favorite and saved status
        setIsFavorite(productData.isFavorite || false);
        setIsSaved(productData.isSaved || false);
        
        // Check if product is in cart
        if (token && storedUserId) {
          const productInCart = await checkIfInCart(storedUserId, params.id, token);
          setIsInCart(productInCart);
        }
        
        // Fetch reviews, recommendations and other related data
        fetchProductReviews(params.id);
        fetchRecommendations(productData);
        
      } catch (err) {
        console.error("Error loading product:", err);
        setError((err as Error).message || "Failed to load product");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProductData();
    }
  }, [params.id]);

  // Fetch product reviews
  const fetchProductReviews = async (productId: string) => {
    try {
      const response = await fetch(`${API_URL}/reviews/product/${productId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      // Don't show error toast for reviews as it's not critical
    }
  };

  // Fetch product recommendations
  const fetchRecommendations = async (productData: Product) => {
    try {
      // Get categories and tags from the product to find recommendations
      const productCategories = productData.categories || [];
      const productCategory = productData.category;
      
      // If we have a category, use it for recommendations
      const categories = [...productCategories];
      if (productCategory && !categories.includes(productCategory)) {
        categories.push(productCategory);
      }

      // Get token for auth
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const sid = localStorage.getItem("guestSessionId");

      // Use GET with query parameters for more reliable public access
      const params = new URLSearchParams();
      
      // Add categories
      categories.forEach(category => {
        params.append('categories', category.toLowerCase());
      });
      
      // Add limits
      params.append('limit', '4');
      
      // Add session ID if available and no auth token
      if (!token && sid) {
        params.append('sessionId', sid);
      }
      
      // Make API request
      const response = await fetch(`${API_URL}/products/recommendations?${params.toString()}`, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to get recommendations");
      }

      // Combine primary and complementary products and filter out the current product
      const allRecommendations = [
        ...(data.recommendations?.primaryProducts || []),
        ...(data.recommendations?.complementaryProducts || [])
      ].filter(p => p._id !== params.get('id'));
      
      // Limit to 4 products and remove duplicates
      const uniqueRecommendations = Array.from(
        new Map(allRecommendations.map(item => [item._id, item])).values()
      ).slice(0, 4);
      
      setRecommendedProducts(uniqueRecommendations);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      // Don't show error toast for recommendations as it's not critical
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      if (!authToken) {
        // Redirect to login if not authenticated
        toast({
          title: "Authentication required",
          description: "Please log in to add items to favorites",
          action: {
            label: "Login",
            onClick: () => router.push('/login')
          }
        });
        return;
      }

      const response = await fetch(`${API_URL}/products/favorite/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          productId: params.id 
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle favorite status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setIsFavorite(!isFavorite);
        toast({
          title: isFavorite ? "Removed from favorites" : "Added to favorites",
          description: isFavorite ? 
            "This product has been removed from your favorites." : 
            "This product has been added to your favorites."
        });
      } else {
        throw new Error(data.message || "Failed to update favorites");
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorites. Please try again."
      });
    }
  };

  // Toggle saved for later status
  const toggleSaved = async () => {
    try {
      if (!authToken) {
        // Redirect to login if not authenticated
        toast({
          title: "Authentication required",
          description: "Please log in to save items for later",
          action: {
            label: "Login",
            onClick: () => router.push('/login')
          }
        });
        return;
      }

      const response = await fetch(`${API_URL}/products/savedforlater/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          productId: params.id 
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle saved status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setIsSaved(!isSaved);
        toast({
          title: isSaved ? "Removed from saved items" : "Saved for later",
          description: isSaved ? 
            "This product has been removed from your saved items." : 
            "This product has been saved for later."
        });
      } else {
        throw new Error(data.message || "Failed to update saved items");
      }
    } catch (err) {
      console.error("Error toggling saved status:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update saved items. Please try again."
      });
    }
  };

  // Add product to cart
  const addToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      // Show message and early return if already in cart
      if (isInCart) {
        toast({
          title: "Already in cart",
          description: "This item is already in your cart.",
          action: {
            label: "View Cart",
            onClick: () => router.push('/cart')
          }
        });
        return;
      }
      
      const token = authToken;
      const sid = sessionId;
      
      if (!product) return;
      
      // Prepare request body
      const requestBody: any = {
        productId: params.id,
        quantity: quantity,
      };
      
      // Add sessionId for guest users
      if (!token && sid) {
        requestBody.sessionId = sid;
      }
      
      // Add selected variants if applicable
      if (selectedColor && product.colors) {
        const colorInfo = product.colors.find(c => c.id === selectedColor);
        requestBody.color = colorInfo?.name || selectedColor;
      }
      
      if (selectedSize) {
        requestBody.size = selectedSize;
      }

      // Add product details for cart display
      requestBody.title = product.name || product.title;
      requestBody.price = product.price;
      requestBody.img = product.img || product.image || product.images?.[0];
      requestBody.desc = product.description || product.desc;

      // Make API request to add to cart
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to add item to cart: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setIsInCart(true);
        toast({
          title: "Added to cart",
          description: `${product?.name || product?.title || 'Product'} has been added to your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push('/cart')
          }
        });
      } else {
        throw new Error(data.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart. Please try again."
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">{error || "The requested product could not be found."}</p>
        <Button onClick={() => router.push('/shop')}>
          Return to Shop
        </Button>
      </div>
    );
  }
  
  const productName = product.name || product.title || 'Untitled Product';
  const productImages = product.images || [product.image || product.img || '/placeholder.svg'];
  const productDescription = product.description || product.desc || 'No description available';
  const productPrice = product.price || 0;
  const productOriginalPrice = product.originalPrice || productPrice;
  const productRating = product.rating || 0;
  const productReviewCount = product.reviewCount || reviews.length || 0;
  const productColors = product.colors || [];
  const productSizes = product.sizes || [];
  const productFeatures = product.features || [];
  const productSpecifications = product.specifications || {};
  const productStock = typeof product.stock !== 'undefined' ? product.stock : 
                       (product.inStock === false ? 0 : (product.quantity || 10));
  const productSku = product.sku || params.id;
  const isOutOfStock = productStock === 0 || product.inStock === false;

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            <Image src={mainImage || "/placeholder.svg"} alt={productName} fill className="object-cover" priority />
            {productOriginalPrice > productPrice && <Badge className="absolute top-4 left-4">Sale</Badge>}
            {isOutOfStock && <Badge variant="destructive" className="absolute top-4 right-4">Out of Stock</Badge>}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border",
                  mainImage === image && "ring-2 ring-primary ring-offset-2",
                )}
                onClick={() => setMainImage(image)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${productName} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{productName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(productRating)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted-foreground",
                      )}
                    />
                  ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {productRating.toFixed(1)} ({productReviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${productPrice.toFixed(2)}</span>
            {productOriginalPrice > productPrice && (
              <span className="text-lg text-muted-foreground line-through">${productOriginalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted-foreground">{productDescription}</p>

          <Separator />

          {/* Stock Status */}
          <div className="flex justify-between items-center">
            <span className="font-medium">Availability:</span>
            <span className={cn(
              isOutOfStock ? "text-red-600" : 
              (productStock <= 5 ? "text-amber-600" : "text-green-600")
            )}>
              {isOutOfStock ? "Out of Stock" : 
               (productStock <= 5 ? `Low Stock (${productStock} left)` : "In Stock")}
            </span>
          </div>

          {/* Color Selection */}
          {productColors.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">
                  Color: {productColors.find((c) => c.id === selectedColor)?.name || 'Default'}
                </span>
              </div>
              <div className="flex gap-2">
                {productColors.map((color) => (
                  <button
                    key={color.id}
                    className={cn(
                      "h-8 w-8 rounded-full border",
                      selectedColor === color.id && "ring-2 ring-primary ring-offset-2",
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.id)}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {productSizes.length > 0 && (
            <div className="space-y-4">
              <span className="font-medium">Size</span>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-3 gap-2">
                {productSizes.map((size) => (
                  <div key={size}>
                    <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                    <Label
                      htmlFor={`size-${size}`}
                      className="flex h-10 items-center justify-center rounded-md border border-muted bg-background text-center text-sm font-medium ring-offset-background peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Quantity</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  -
                </Button>
                <div className="flex h-8 w-12 items-center justify-center border-y">{quantity}</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => setQuantity(Math.min(productStock || 10, quantity + 1))}
                  disabled={isOutOfStock || (productStock > 0 && quantity >= productStock)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                className="flex-1" 
                size="lg" 
                onClick={addToCart} 
                disabled={isOutOfStock || isInCart || isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-current rounded-full" />
                    Adding...
                  </>
                ) : isInCart ? (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    In Your Cart
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12" 
                onClick={toggleFavorite}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-primary text-primary")} />
                <span className="sr-only">Add to favorites</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12" 
                onClick={toggleSaved}
              >
                <Bookmark className={cn("h-5 w-5", isSaved && "fill-primary text-primary")} />
                <span className="sr-only">Save for later</span>
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Share className="h-5 w-5" />
                <span className="sr-only">Share product</span>
              </Button>
            </div>
            
            {isInCart && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => router.push('/cart')}
              >
                View Cart
              </Button>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Free shipping over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">30-day returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">2-year warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Ships in 1-2 business days</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <span>SKU: {productSku}</span>
              {product.category && (
                <span className="ml-4">Category: {product.category}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="details" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {productFeatures.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium mb-4">Product Features</h3>
                <ul className="space-y-2">
                  {productFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium mb-4">Product Features</h3>
                <p className="text-muted-foreground">Features information not available.</p>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium mb-4">Product Description</h3>
              <p className="text-muted-foreground">{productDescription}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.keys(productSpecifications).length > 0 ? (
              <div>
                <h3 className="text-lg font-medium mb-4">Technical Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(productSpecifications).map(([key, value], index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 py-2 border-b">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium mb-4">Specifications</h3>
                <p className="text-muted-foreground">No detailed specifications available for this product.</p>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium mb-4">Care Instructions</h3>
              <p className="text-muted-foreground">
                Please refer to the manufacturer's care instructions for this product.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Customer Reviews</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-5 w-5",
                            i < Math.floor(productRating)
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted-foreground",
                          )}
                        />
                      ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Based on {productReviewCount} reviews</span>
                </div>
              </div>
              <Button onClick={() => authToken ? router.push(`/reviews/write/${params.id}`) : router.push('/login?next=/reviews/write/' + params.id)}>
                Write a Review
              </Button>
            </div>

            <Separator />

            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={review.user.avatar || `/placeholder.svg?height=40&width=40&text=${review.user.name.charAt(0)}`} />
                        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground",
                            )}
                          />
                        ))}
                    </div>
                    {review.title && <h4 className="font-medium">{review.title}</h4>}
                    <p className="text-muted-foreground">{review.comment}</p>
                    <Separator className="mt-4" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>

            {reviews.length > 5 && (
              <Button variant="outline" className="w-full">
                Load More Reviews
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I care for this product?</AccordionTrigger>
            <AccordionContent>
              Please refer to the product specifications for specific care instructions. In general, we recommend 
              following the manufacturer's guidelines for cleaning and maintenance to ensure the longevity of your product.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What is your return policy?</AccordionTrigger>
            <AccordionContent>
              We offer a 30-day return policy for all our products. Items must be in their original condition with all
              tags attached. Please note that customized items cannot be returned unless there is a manufacturing
              defect.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How long does shipping take?</AccordionTrigger>
            <AccordionContent>
              Domestic orders typically ship within 1-2 business days and arrive within 3-5 business days. International
              shipping times vary by location but generally take 7-14 business days.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Related Products / Recommendations */}
      <div>
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        {recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No recommendations available for this product.</p>
          </div>
        )}
      </div>
    </div>
  );
}