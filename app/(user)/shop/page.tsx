"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

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
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Add debug log to check if the environment variable is loading
console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);

export default function ShopPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // Show 8 products per page

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
    
    // Use the correct endpoint for your API with no limit parameter to get all products
    const res = await fetch(`${baseUrl}/products/?limit=1000`, {
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
    console.log("12a. API Response data type:", typeof data);
    console.log("12b. Is array:", Array.isArray(data));
    
    // More detailed logging of data structure
    console.log(" Data type:", typeof data);
    if (Array.isArray(data)) {
      console.log("14. Data is an array with length:", data.length);
    } else if (data && typeof data === 'object') {
      console.log("14. Data is an object with keys:", Object.keys(data));
      
      // Log more details about the data structure
      if (data.products) {
        console.log("14a. data.products exists, type:", typeof data.products);
        console.log("14b. data.products length:", Array.isArray(data.products) ? data.products.length : "not an array");
      }
      
      if (data.results) {
        console.log("14c. data.results exists, type:", typeof data.results);
        console.log("14d. data.results length:", Array.isArray(data.results) ? data.results.length : "not an array");
      }
    }
    
    // Enhanced data handling to ensure we capture all products
    console.log("Starting data normalization");
    if (Array.isArray(data)) {
      console.log("Setting products directly from array");
      setProducts(data);
    } else if (data && typeof data === 'object') {
      // Check multiple possible array properties that might contain products
      if (data.products && Array.isArray(data.products)) {
        console.log(" Setting products from data.products property");
        setProducts(data.products);
      } else if (data.results && Array.isArray(data.results)) {
        console.log(" Setting products from data.results property");
        setProducts(data.results);
      } else if (data.data && Array.isArray(data.data)) {
        console.log(" Setting products from data.data property");
        setProducts(data.data);
      } else if (data.items && Array.isArray(data.items)) {
        console.log(" Setting products from data.items property");
        setProducts(data.items);
      } else {
        console.log(" Extracting products from object values");
        // Last resort - try to extract from object
        const productsArray = Object.values(data);
        console.log(" Products array extracted:", productsArray.length);
        
        // Check if the first item looks like a product
        const firstItem = productsArray[0];
        if (productsArray.length > 0 && firstItem && typeof firstItem === 'object' && 'title' in firstItem) {
          console.log(" First item appears to be a product, setting products array");
          setProducts(productsArray as Product[]);
        } else if (productsArray.length > 0 && Array.isArray(productsArray[0])) {
          // Handle nested array case
          console.log(" First item is an array, using it as products");
          setProducts(productsArray[0] as Product[]);
        } else {
          console.error("18. No products found in response or unable to determine product structure");
          throw new Error(t("shop.errors.noProductsFound"));
        }
      }
    } else {
      console.error("16. Invalid data format");
      throw new Error(t("shop.errors.invalidDataFormat"));
    }
    console.log("19. Data handling complete");
    
  } catch (error) {
    console.error("20. Error in fetchProducts:", error);
    setError(error instanceof Error ? error.message : t("shop.errors.failedToFetch"));
    setProducts([]); // Set to empty array to prevent further errors
  } finally {
    console.log("21. Setting isLoading to false");
    setIsLoading(false);
  }
  console.log("22. fetchProducts function complete");
};
    
    fetchProducts();
  }, [router, t]); // Add t to the dependencies

  // Use safe filtering that works even if products is not yet an array
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => 
        product.title && product.title.toLowerCase().includes(search.toLowerCase())
      )
    : [];
    
  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Pagination control handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle page number click
  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page number buttons
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // Maximum number of page buttons to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    // First page
    if (startPage > 1) {
      pageNumbers.push(
        <Button 
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(1)}
          className="mx-1 h-8 w-8 p-0"
        >
          1
        </Button>
      );
      
      if (startPage > 2) {
        pageNumbers.push(
          <span key="ellipsis1" className="mx-1">...</span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button 
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(i)}
          className="mx-1 h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="ellipsis2" className="mx-1">...</span>
        );
      }
      
      pageNumbers.push(
        <Button 
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(totalPages)}
          className="mx-1 h-8 w-8 p-0"
        >
          {totalPages}
        </Button>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className="container py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("shop.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("shop.description")}</p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("shop.searchPlaceholder")}
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
              {t("common.loading")}
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">{t("shop.loadingProducts")}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-10 p-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-red-600">{t("common.error")}: {error}</p>
          <p className="text-sm text-red-500 mt-1">
            {t("shop.errors.tryRefreshing")} <button onClick={() => router.push('/login')} className="underline text-red-700">{t("shop.errors.loginAgain")}</button>
          </p>
        </div>
      )}

      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-lg font-medium">{t("shop.noProductsFound")}</p>
          <p className="text-muted-foreground mt-1">
            {search ? t("shop.tryDifferentSearch") : t("shop.checkBackLater")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {currentProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      
      {/* Pagination controls */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-center mt-10 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            className="mr-2"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("shop.pagination.prev")}
          </Button>
          
          <div className="flex items-center mx-2">
            {renderPageNumbers()}
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="ml-2"
            size="sm"
          >
            {t("shop.pagination.next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          
          <div className="w-full text-center mt-3 text-sm text-muted-foreground">
            {t("shop.pagination.showing", { 
              from: indexOfFirstProduct + 1, 
              to: Math.min(indexOfLastProduct, filteredProducts.length), 
              total: filteredProducts.length 
            })}
          </div>
        </div>
      )}
    </div>
  );
}