const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

// Types
export interface User {
  _id: string;
  name?: string;
  username?: string;
}

export interface Product {
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
  
  // Multilingual fields (if your API supports them)
  title_fr?: string;
  title_ar?: string;
  title_zh?: string;
  title_ja?: string;
  title_es?: string;
  
  desc_fr?: string;
  desc_ar?: string;
  desc_zh?: string;
  desc_ja?: string;
  desc_es?: string;
}

export interface Review {
  _id: string;
  userId: string | User;
  username?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

// Product Service Functions
export const ProductService = {
  // Get localized field from product based on current locale
  getLocalizedField(product: Product, field: string, locale: string = 'en'): string {
    if (!product) return '';
    
    // If not English and a localized version exists, use it
    if (locale !== 'en') {
      const localizedField = `${field}_${locale}` as keyof Product;
      if (product[localizedField] && typeof product[localizedField] === 'string') {
        return product[localizedField] as string;
      }
    }
    
    // Fallback to the default field
    return product[field as keyof Product] as string || '';
  },
  
  // Fetch product details
  async fetchProduct(productId: string, userId?: string, token?: string | null, locale: string = 'en'): Promise<Product> {
    try {
      // Basic product endpoint
      let url = `${baseUrl}/products/find/${productId}`;
      
      // If user is logged in, use the enhanced endpoint that includes user-specific info
      if (userId && token) {
        url = `${baseUrl}/products/find/${productId}?userId=${userId}`;
      }
      
      // Add locale parameter if API supports it
      if (locale !== 'en') {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}locale=${locale}`;
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
      return data.product || data;
    } catch (err) {
      console.error("Error fetching product:", err);
      throw err;
    }
  },

  // Fetch product reviews
  async fetchReviews(productId: string, token?: string | null): Promise<Review[]> {
    try {
      console.log(`Fetching reviews for product: ${productId}`);
      
      // Define the API endpoint
      const url = `${baseUrl}/reviews/product/${productId}`;
      
      let response;
      
      // Try authenticated request if token exists
      if (token) {
        console.log("Attempting authenticated fetch for reviews");
        response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } else {
        // Fallback to unauthenticated request
        console.log("Attempting unauthenticated fetch for reviews");
        response = await fetch(url);
      }
      
      // Check if the response is successful
      if (!response.ok) {
        console.log(`Error response: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      console.log("Reviews data received:", data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.reviews)) {
        return data.reviews;
      } else {
        console.log("No reviews found or unexpected data format:", data);
        return [];
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      return [];
    }
  },

  // Check if product is already in user's cart
  async checkIfInCart(userId: string, productId: string, token: string): Promise<boolean> {
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
  },

  // Fetch user name by ID
  async fetchUserName(userId: string, token?: string | null): Promise<{ name?: string, username?: string }> {
    try {
      console.log(`Fetching name for user ID: ${userId}`);
      
      // Updated to use the correct endpoint structure
      const response = await fetch(`${baseUrl}/users/${userId}/name`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Error fetching user name for ${userId}: ${response.status}`);
        return {};
      }
      
      const data = await response.json();
      console.log(`Name data received for ${userId}:`, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching name for user ${userId}:`, error);
      return {};
    }
  },

  // Add to cart function
  async addToCart(userId: string, productData: any, token: string) {
    if (!userId || !productData || !token) {
      throw new Error("Missing required parameters for cart addition");
    }
    
    // Normalize input to always work with an array of products
    const products = Array.isArray(productData) ? productData : [productData];
    
    try {
      // First check if the user has an existing cart
      const checkCartResponse = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (checkCartResponse.ok) {
        // Cart exists - we'll update it
        const cartData = await checkCartResponse.json();
        
        // Extract existing products from cart
        let existingProducts = [];
        
        // Handle different API response formats
        if (cartData.products && Array.isArray(cartData.products)) {
          existingProducts = cartData.products;
        } else if (cartData.cart && cartData.cart.products && Array.isArray(cartData.cart.products)) {
          existingProducts = cartData.cart.products;
        }
        
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
          } else {
            // Product doesn't exist - add it with all details
            updatedProducts.push(newProduct);
          }
        }
        
        // Get cart ID based on response format
        const cartId = cartData.cart?._id || cartData._id;
        
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
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Failed to update cart: ${errorText}`);
        }
        
        return await updateResponse.json();
        
      } else if (checkCartResponse.status === 404) {
        // No cart exists - create a new one with this product
        
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
        
        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Failed to create cart: ${errorText}`);
        }
        
        return await createResponse.json();
      } else {
        // Some other error occurred when checking for the cart
        const errorText = await checkCartResponse.text();
        throw new Error(`Failed to check cart: ${errorText}`);
      }
    } catch (error) {
      console.error("Cart API error:", error);
      throw error;
    }
  },

  // Check cart status
  async checkCartStatus(productId: string, userId: string, token: string | null) {
    if (!userId || !token) return { isInCart: false, quantity: 1 };
    
    try {
      const response = await fetch(`${baseUrl}/cart/find/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        return { isInCart: false, quantity: 1 };
      }
      
      const data = await response.json();
      const cart = data.cart || data;
      
      const productInCart = cart.products?.find(
        (item: any) => item.productId === productId
      );
      
      return { 
        isInCart: !!productInCart, 
        quantity: productInCart ? (productInCart.quantity || 1) : 1 
      };
    } catch (err) {
      console.error("Error checking cart status:", err);
      return { isInCart: false, quantity: 1 };
    }
  },

  // Toggle favorite status
  async toggleFavorite(userId: string, productId: string, token: string) {
    try {
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
        throw new Error("Failed to update favorite status");
      }
      
      return await response.json();
    } catch (err) {
      console.error("Error toggling favorite:", err);
      throw err;
    }
  },

  // Toggle save for later status
  async toggleSaveForLater(userId: string, productId: string, token: string) {
    try {
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
        throw new Error("Failed to update saved status");
      }
      
      return await response.json();
    } catch (err) {
      console.error("Error toggling save for later:", err);
      throw err;
    }
  },

  // Submit a review
  async submitReview(reviewData: any, token: string) {
    try {
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
        throw new Error(errorData.message || "Failed to submit review");
      }
      
      return await response.json();
    } catch (err) {
      console.error("Error submitting review:", err);
      throw err;
    }
  }
};