"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import { useRouter } from "next/navigation";

interface Product {
  _id: string; 
  title: string; 
  price: number; 
  desc: string; 
  size: string; 
  color: string; 
  categories: string[]; 
  rating: number;
  img: string; 
  reviewCount: number;
  isFavorite: boolean;
}

// Hard-code the base URL for immediate testing
// You can replace this with the environment variable once confirmed working
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

// Add debug log to check if the environment variable is loading
console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
   // Update the fetch products function with detailed logging at each step

const fetchProducts = async () => {
  console.log("1. Starting fetchProducts function");
  setIsLoading(true);
  setError(null);
  
  console.log("2. Environment variables:", {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    resolvedBaseUrl: baseUrl
  });
  
  // Log the actual URL we're fetching from
  console.log("3. Fetching from:", `${baseUrl}/products/`);
  
  try {
    console.log("4. Retrieving token from localStorage");
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If no token is found, redirect to login
      router.push('/login');
      return;
    }
    
    // Use the correct endpoint for your API
    const res = await fetch(`${baseUrl}/products/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Log the complete response for debugging
    console.log("8. Response received:", {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries([...res.headers]),
      url: res.url
    });
    
    if (res.status === 401) {
      // If unauthorized, token might be expired
      console.error(" Authentication token expired or invalid");
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/login');
      return;
    }
    
    if (!res.ok) {
      console.error(" Response not OK:", res.status, res.statusText);
      throw new Error(`Failed to fetch products: ${res.status}`);
    }
    
    console.log(" Parsing response JSON");
    const data = await res.json();
    console.log("12. API Response data:", data);
    
    // Detailed logging of data structure
    console.log(" Data type:", typeof data);
    if (Array.isArray(data)) {
      console.log("14. Data is an array with length:", data.length);
    } else if (data && typeof data === 'object') {
      console.log("14. Data is an object with keys:", Object.keys(data));
    }
    
    // Simplify data handling for now
    console.log("Starting data normalization");
    if (Array.isArray(data)) {
      console.log("Setting products directly from array");
      setProducts(data);
    } else if (data && typeof data === 'object' && data.products) {
      console.log(" Setting products from data.products property");
      setProducts(data.products);
    } else if (data && typeof data === 'object') {
      console.log(" Extracting products from object values");
      // Last resort - try to extract from object
      const productsArray = Object.values(data);
      console.log(" Products array extracted:", productsArray.length);
      if (productsArray.length > 0) {
        setProducts(productsArray as Product[]);
      } else {
        console.error("18. No products found in response");
        throw new Error("No products found in response");
      }
    } else {
      console.error("16. Invalid data format");
      throw new Error("Invalid data format: Expected products data");
    }
    console.log("19. Data handling complete");
    
  } catch (error) {
    console.error("20. Error in fetchProducts:", error);
    setError(error instanceof Error ? error.message : "Failed to fetch products");
    setProducts([]); // Set to empty array to prevent further errors
  } finally {
    console.log("21. Setting isLoading to false");
    setIsLoading(false);
  }
  console.log("22. fetchProducts function complete");
};
    
    fetchProducts();
  }, [router]); // Remove baseUrl from dependencies as it shouldn't change

  // Use safe filtering that works even if products is not yet an array
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => 
        product.title && product.title.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="container py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="text-muted-foreground mt-2">Browse our collection of premium products</p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 w-full sm:w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {isLoading && (
        <div className="mt-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">Loading products...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-10 p-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-red-600">Error: {error}</p>
          <p className="text-sm text-red-500 mt-1">
            Please try refreshing the page or <button onClick={() => router.push('/login')} className="underline text-red-700">login again</button>
          </p>
        </div>
      )}

      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-muted-foreground mt-1">
            {search ? "Try a different search term" : "Check back later for new products"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
    </div>
  );
}
