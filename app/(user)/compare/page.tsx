"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Star, ShoppingCart, AlertCircle, Check, ArrowRight, ThumbsUp, Zap, DollarSign, Award, Ruler, PaintBucket, Tag } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product/product-card";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Enhanced Product interface with technical details
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
}

// Comparison result from backend API
interface ComparisonResult {
  success: boolean;
  comparison: {
    basic: Record<string, any>;
    price: Record<string, any>;
    function: Record<string, any>;
    technicalDetails: Record<string, any>;
    compatibility: Record<string, any>;
    maintenance: Record<string, any>;
  };
  summary: {
    products: Array<{
      id: string;
      title: string;
      price: number;
      image: string;
      summary: string;
    }>;
    functionalDifferences: {
      title: string;
      differences: Array<{
        id: string;
        title: string;
        primaryFunction: string;
        uniqueValue: string;
        whenToChoose: string;
      }>;
    };
    technicalComparison: {
      title: string;
      specs: Array<any>;
    };
    bestChoice: {
      forFunctionality: Record<string, any>;
      forAesthetics: Record<string, any>;
      forValue: Record<string, any>;
    };
    buyingAdvice: string;
  };
}

// Base URL for API calls
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [comparisonScore, setComparisonScore] = useState<Record<string, number>>({});

  // Get auth token from localStorage
  const getAuthToken = () => {
    try {
      return localStorage.getItem("token") || "";
    } catch (err) {
      console.error("Error accessing localStorage:", err);
      return "";
    }
  };

  // Check if the user is authenticated
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setAuthError(true);
      setError("Authentication required. Please log in to compare products.");
    } else {
      setAuthError(false);
    }
  }, []);

  // Fetch all products from backend
  useEffect(() => {
    const fetchAllProducts = async () => {
      if (authError) return;

      try {
        setIsLoading(true);

        const token = getAuthToken();
        const response = await fetch(`${baseUrl}/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setAllProducts(data.products || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setIsLoading(false);

        if (err instanceof Error && err.message.includes('401')) {
          setAuthError(true);
          setError("Authentication error. Please log in again.");
        }
      }
    };

    fetchAllProducts();
  }, [authError]);

  // Load product comparison from URL params
  useEffect(() => {
    if (isFirstLoad && !isLoading && allProducts.length > 0) {
      try {
        // Get product IDs from URL params
        const product1Id = searchParams.get('product1');
        const product2Id = searchParams.get('product2');

        const newSelectedIds: string[] = [];
        const newSelectedProducts: Product[] = [];

        // Find the first product
        if (product1Id) {
          const product1 = allProducts.find(p => p._id === product1Id);
          if (product1) {
            newSelectedIds.push(product1Id);
            newSelectedProducts.push(product1);
          }
        }

        // Find the second product
        if (product2Id) {
          const product2 = allProducts.find(p => p._id === product2Id);
          if (product2) {
            newSelectedIds.push(product2Id);
            newSelectedProducts.push(product2);
          }
        }

        // If we found products, update the state
        if (newSelectedIds.length > 0) {
          setSelectedIds(newSelectedIds);
          setSelectedProducts(newSelectedProducts);

          // Fetch detailed comparison if we have 2 products
          if (newSelectedIds.length === 2) {
            fetchDetailedComparison(newSelectedIds);
          }
        } else if (allProducts.length >= 2) {
          // If no products specified in URL, default to first two products
          setSelectedIds([allProducts[0]._id, allProducts[1]._id]);
          setSelectedProducts([allProducts[0], allProducts[1]]);

          // Fetch comparison for default products
          fetchDetailedComparison([allProducts[0]._id, allProducts[1]._id]);
        }

        setIsFirstLoad(false);
      } catch (err) {
        console.error("Error loading products from URL:", err);
      }
    }
  }, [isFirstLoad, isLoading, allProducts, searchParams]);

  // Fetch detailed comparison from backend
  const fetchDetailedComparison = async (productIds: string[]) => {
    if (productIds.length !== 2 || productIds.includes("")) return;

    try {
      setIsComparisonLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${baseUrl}/products/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds,
          userId: localStorage.getItem("userId") || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setComparisonData(data);

      // Calculate comparison scores
      calculateComparisonScores(data);

      setIsComparisonLoading(false);
    } catch (err) {
      console.error("Error fetching detailed comparison:", err);
      setIsComparisonLoading(false);
    }
  };

  // Calculate comparison scores for decision making
  const calculateComparisonScores = (data: ComparisonResult) => {
    if (!data || !data.comparison) return;

    const scores: Record<string, number> = {};

    // Loop through products 
    Object.keys(data.comparison.basic).forEach(productId => {
      let score = 0;

      // Price score (lower is better)
      const priceInfo = data.comparison.price[productId];
      if (priceInfo) {
        if (priceInfo.position === 'cheapest') {
          score += 2;
        } else if (priceInfo.position === 'most expensive') {
          score -= 1;
        }
      }

      // Rating score
      const product = selectedProducts.find(p => p._id === productId);
      if (product) {
        score += product.rating / 2; // Rating 0-5 becomes 0-2.5 points
      }

      // Function score (unique capabilities)
      const functionInfo = data.comparison.function[productId];
      if (functionInfo && functionInfo.uniqueCapabilities) {
        score += functionInfo.uniqueCapabilities.length * 0.5;
      }

      scores[productId] = parseFloat(score.toFixed(1));
    });

    setComparisonScore(scores);
  };

  // Handle product selection change
  const handleProductChange = (index: number, productId: string) => {
    // Get other index
    const otherIndex = index === 0 ? 1 : 0;

    // Check if this product is already selected in the other dropdown
    if (selectedIds[otherIndex] === productId) {
      setError("Cannot compare a product with itself. Please select a different product.");
      return;
    }

    // Find the product object
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    // Create copies of the arrays
    const newSelectedIds = [...selectedIds];
    const newSelectedProducts = [...selectedProducts];

    // Update the arrays
    newSelectedIds[index] = productId;
    newSelectedProducts[index] = product;

    // If we don't have 2 products yet, add empty placeholder
    while (newSelectedIds.length < 2) {
      newSelectedIds.push("");
      newSelectedProducts.push({} as Product);
    }

    // Update state
    setSelectedIds(newSelectedIds);
    setSelectedProducts(newSelectedProducts);
    setError(null);

    // If we have 2 valid product IDs, fetch detailed comparison
    if (newSelectedIds.length === 2 && !newSelectedIds.includes("")) {
      fetchDetailedComparison(newSelectedIds);
    } else {
      // Reset comparison data if we don't have 2 products
      setComparisonData(null);
    }

    // Update URL
    updateUrl(newSelectedIds);
  };

  // Update URL with selected product IDs
  const updateUrl = (ids: string[]) => {
    const params = new URLSearchParams();

    if (ids[0]) params.set('product1', ids[0]);
    if (ids[1]) params.set('product2', ids[1]);

    router.push(`/compare?${params.toString()}`);
  };

  // Redirect to login
  const handleAuthRedirect = () => {
    router.push('/login?redirect=/compare');
  };

  // Check if a certain aspect of the products is different
  const isDifferent = (key: keyof Product) => {
    if (selectedProducts.length < 2) return false;
    if (!selectedProducts[0] || !selectedProducts[1]) return false;

    const value1 = selectedProducts[0][key];
    const value2 = selectedProducts[1][key];

    // Handle arrays like categories
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) return true;
      return !value1.every(v => value2.includes(v));
    }

    return value1 !== value2;
  };

  // Get the value difference description for selected key
  const getDifference = (key: keyof Product) => {
    if (selectedProducts.length < 2) return '';
    if (!selectedProducts[0] || !selectedProducts[1]) return '';

    const value1 = selectedProducts[0][key];
    const value2 = selectedProducts[1][key];

    if (key === 'price' && typeof value1 === 'number' && typeof value2 === 'number') {
      const difference = Math.abs(value1 - value2).toFixed(2);
      const pctDifference = Math.round((Math.abs(value1 - value2) / Math.min(value1, value2)) * 100);
      return `$${difference} (${pctDifference}%) ${value1 > value2 ? 'more expensive' : 'cheaper'}`;
    }

    if (key === 'rating' && typeof value1 === 'number' && typeof value2 === 'number') {
      const difference = Math.abs(value1 - value2).toFixed(1);
      return `${difference} stars ${value1 > value2 ? 'higher' : 'lower'}`;
    }

    if (key === 'reviewCount' && typeof value1 === 'number' && typeof value2 === 'number') {
      const difference = Math.abs(value1 - value2);
      return `${difference} more reviews`;
    }

    return '';
  };

  // Get the product that is better for a specific attribute
  const getBetterProduct = (key: keyof Product) => {
    if (selectedProducts.length < 2) return null;
    if (!selectedProducts[0] || !selectedProducts[1]) return null;

    const value1 = selectedProducts[0][key];
    const value2 = selectedProducts[1][key];

    if (value1 === value2) return 'equal';

    // For price, lower is better
    if (key === 'price' && typeof value1 === 'number' && typeof value2 === 'number') {
      return value1 < value2 ? 0 : 1;
    }

    // For rating and reviewCount, higher is better
    if ((key === 'rating' || key === 'reviewCount') &&
      typeof value1 === 'number' && typeof value2 === 'number') {
      return value1 > value2 ? 0 : 1;
    }

    return null;
  };

  return (
    <div className="container py-10 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Comparison</h1>
        <p className="mt-2 text-gray-600">Compare products side by side to find the perfect match</p>
      </div>

      {/* Auth Error */}
      {authError && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertCircle className="text-amber-500 mr-2" />
              <div>
                <h3 className="font-semibold">Authentication Required</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Please log in to use the product comparison feature.
                </p>
                <Button
                  onClick={handleAuthRedirect}
                  className="mt-4 bg-amber-500 hover:bg-amber-600"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Banner */}
      {error && !authError && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !authError && (
        <Card className="text-center p-8">
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Selection */}
      {!isLoading && !authError && allProducts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Products to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Product Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Product
                </label>
                <Select
                  value={selectedIds[0] || ""}
                  onValueChange={(value) => handleProductChange(0, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts
                      .filter(p => p._id !== selectedIds[1]) // Filter out the product selected in dropdown 2
                      .map(product => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.title}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Second Product Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Second Product
                </label>
                <Select
                  value={selectedIds[1] || ""}
                  onValueChange={(value) => handleProductChange(1, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts
                      .filter(p => p._id !== selectedIds[0]) // Filter out the product selected in dropdown 1
                      .map(product => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.title}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>


          </CardContent>
        </Card>
      )}

      {/* No Products Message */}
      {!isLoading && !authError && allProducts.length === 0 && (
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-gray-600">
              No products available for comparison. Please add products first.
            </p>
            <Button
              onClick={() => router.push('/shop')}
              className="mt-4"
            >
              Go to Shop
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comparison Loading */}
      {isComparisonLoading && (
        <Card className="mb-6 bg-blue-50 border-blue-100">
          <CardContent className="pt-6 pb-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
            <p>Analyzing products and generating comparison...</p>
          </CardContent>
        </Card>
      )}

      {/* Products Comparison with Tabs */}
      {!isLoading && !authError && selectedProducts.length === 2 &&
        selectedProducts[0]._id && selectedProducts[1]._id && (
          <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Comparison</TabsTrigger>
              <TabsTrigger value="decision">Decision Guide</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Product Cards */}
                {/* Product Cards */}
                {selectedProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Functional Summary (Overview Tab) */}
              {comparisonData && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Functional Differences</CardTitle>
                    <CardDescription>
                      Understanding how these products serve different needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {comparisonData.summary.functionalDifferences.differences.map((diff, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-medium text-lg mb-1">{diff.title}</h3>
                          <p className="text-gray-600 mb-3">{diff.primaryFunction}</p>

                          <div className="space-y-2 text-sm">
                            <div className="flex">
                              <span className="text-blue-600 font-medium w-28">Unique Value:</span>
                              <span>{diff.uniqueValue}</span>
                            </div>
                            <div className="flex">
                              <span className="text-blue-600 font-medium w-28">When to Choose:</span>
                              <span>{diff.whenToChoose}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {comparisonData.summary.buyingAdvice && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">Shopping Advice</h3>
                        <p className="text-gray-800">{comparisonData.summary.buyingAdvice}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Detailed Comparison Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Comparison</CardTitle>
                  <CardDescription>
                    Compare all product specifications side by side
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {/* Product Headers */}
                    <div className="grid grid-cols-3 bg-gray-50">
                      <div className="p-4 font-medium">Feature</div>
                      <div className="p-4 font-medium">{selectedProducts[0].title}</div>
                      <div className="p-4 font-medium">{selectedProducts[1].title}</div>
                    </div>

                    {/* Price */}
                    <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('price') ? "bg-blue-50" : ""}`}>
                      <div className="p-4 font-medium bg-gray-50 flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        Price
                      </div>
                      <div className={`p-4 ${getBetterProduct('price') === 0 ? "text-green-600 font-medium" : ""}`}>
                        ${selectedProducts[0].price?.toFixed(2)}
                        {getBetterProduct('price') === 0 && (
                          <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Best Price</Badge>
                        )}
                      </div>
                      <div className={`p-4 ${getBetterProduct('price') === 1 ? "text-green-600 font-medium" : ""}`}>
                        ${selectedProducts[1].price?.toFixed(2)}
                        {getBetterProduct('price') === 1 && (
                          <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Best Price</Badge>
                        )}
                      </div>
                      {highlightDifferences && isDifferent('price') && (
                        <div className="col-span-3 bg-blue-50 px-4 py-2 text-sm text-blue-800">
                          Difference: {getDifference('price')}
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('rating') ? "bg-blue-50" : ""}`}>
                      <div className="p-4 font-medium bg-gray-50 flex items-center">
                        <Star className="h-5 w-5 text-gray-400 mr-2" />
                        Rating
                      </div>
                      <div className={`p-4 ${getBetterProduct('rating') === 0 ? "text-green-600 font-medium" : ""}`}>
                        <div className="flex items-center">
                          <span className="mr-2">{selectedProducts[0].rating?.toFixed(1)}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${star <= Math.round(selectedProducts[0].rating || 0)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div>
                          {getBetterProduct('rating') === 0 && (
                            <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Higher Rated</Badge>
                          )}
                        </div>
                      </div>
                      <div className={`p-4 ${getBetterProduct('rating') === 1 ? "text-green-600 font-medium" : ""}`}>
                        <div className="flex items-center">
                          <span className="mr-2">{selectedProducts[1].rating?.toFixed(1)}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${star <= Math.round(selectedProducts[1].rating || 0)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div>
                          {getBetterProduct('rating') === 1 && (
                            <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Higher Rated</Badge>
                          )}
                        </div>
                      </div>
                      {highlightDifferences && isDifferent('rating') && (
                        <div className="col-span-3 bg-blue-50 px-4 py-2 text-sm text-blue-800">
                          Difference: {getDifference('rating')}
                        </div>
                      )}
                    </div>

                    {/* Review Count */}
                    <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('reviewCount') ? "bg-blue-50" : ""}`}>
                      <div className="p-4 font-medium bg-gray-50 flex items-center">
                        <ThumbsUp className="h-5 w-5 text-gray-400 mr-2" />
                        Reviews
                      </div>
                      <div className={`p-4 ${getBetterProduct('reviewCount') === 0 ? "text-green-600 font-medium" : ""}`}>
                        {selectedProducts[0].reviewCount} reviews
                        {getBetterProduct('reviewCount') === 0 && selectedProducts[0].reviewCount > 10 && (
                          <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">More Reviews</Badge>
                        )}
                      </div>
                      <div className={`p-4 ${getBetterProduct('reviewCount') === 1 ? "text-green-600 font-medium" : ""}`}>
                        {selectedProducts[1].reviewCount} reviews
                        {getBetterProduct('reviewCount') === 1 && selectedProducts[1].reviewCount > 10 && (
                          <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">More Reviews</Badge>
                        )}
                      </div>
                    </div>

                    {/* Size */}
                    <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('size') ? "bg-blue-50" : ""}`}>
                      <div className="p-4 font-medium bg-gray-50 flex items-center">
                        <Ruler className="h-5 w-5 text-gray-400 mr-2" />
                        Size
                      </div>
                      <div className="p-4">{selectedProducts[0].size}</div>
                      <div className="p-4">{selectedProducts[1].size}</div>
                    </div>

                    {/* Color */}
                    <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('color') ? "bg-blue-50" : ""}`}>
                      <div className="p-4 font-medium bg-gray-50 flex items-center">
                        <PaintBucket className="h-5 w-5 text-gray-400 mr-2" />
                        Color
                      </div>
                      <div className="p-4 flex items-center">
                        <div
                          className="w-6 h-6 rounded-full mr-2 border"
                          style={{ backgroundColor: selectedProducts[0].color }}
                        ></div>
                        <span>{selectedProducts[0].color}</span>
                      </div>
                      <div className="p-4 flex items-center">
                        <div
                          className="w-6 h-6 rounded-full mr-2 border"
                          style={{ backgroundColor: selectedProducts[1].color }}
                        ></div>
                        <span>{selectedProducts[1].color}</span>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('categories') ? "bg-blue-50" : ""}`}>
                      <div className="p-4 font-medium bg-gray-50 flex items-center">
                        <Tag className="h-5 w-5 text-gray-400 mr-2" />
                        Categories
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {selectedProducts[0].categories?.map((category, idx) => (
                            <Badge key={idx} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {selectedProducts[1].categories?.map((category, idx) => (
                            <Badge key={idx} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('desc') ? "bg-blue-50" : ""}`}>
                      <div className="p-4 font-medium bg-gray-50">Description</div>
                      <div className="p-4 text-sm">{selectedProducts[0].desc}</div>
                      <div className="p-4 text-sm">{selectedProducts[1].desc}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Comparison (if available) */}
              {comparisonData && comparisonData.summary.technicalComparison.specs.length > 0 && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Technical Specifications</CardTitle>
                    <CardDescription>
                      Detailed technical features comparison
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {comparisonData.summary.technicalComparison.specs.map((specGroup, groupIndex) => (
                      <div key={groupIndex} className="mb-6">
                        <h3 className="text-lg font-medium mb-3">{specGroup.name}</h3>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          {specGroup.products.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 p-4">
                              {specGroup.products.map((productSpec: { title: string; specs: Record<string, string | number> }, productIndex) => (
                                <div key={productIndex} className="bg-white p-4 rounded border">
                                  <h4 className="font-medium text-blue-700 mb-3">{productSpec.title}</h4>
                                  <div className="space-y-2">
                                    {Object.entries(productSpec.specs).map(([specName, specValue], specIndex) => (
                                      <div key={specIndex} className="grid grid-cols-2 text-sm">
                                        <span className="text-gray-600">{specName}:</span>
                                        <span className="font-medium">{specValue as string}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Maintenance and Care */}
              {comparisonData && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Maintenance & Care</CardTitle>
                    <CardDescription>
                      How to maintain and care for each product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedProducts.map((product, index) => {
                        const productId = product._id;
                        const maintenanceInfo = comparisonData.comparison.maintenance[productId];
                        if (!maintenanceInfo) return null;

                        return (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-lg mb-3">{product.title}</h3>

                            <div className="space-y-4">
                              {maintenanceInfo.cleaning && (
                                <div>
                                  <h4 className="text-blue-700 font-medium">Cleaning</h4>
                                  <p className="text-gray-700 mt-1">{maintenanceInfo.cleaning}</p>
                                </div>
                              )}

                              {maintenanceInfo.care && maintenanceInfo.care.length > 0 && (
                                <div>
                                  <h4 className="text-blue-700 font-medium">Care Instructions</h4>
                                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                    {maintenanceInfo.care.map((item: string, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {maintenanceInfo.lifespan && (
                                <div>
                                  <h4 className="text-blue-700 font-medium">Expected Lifespan</h4>
                                  <p className="text-gray-700 mt-1">{maintenanceInfo.lifespan}</p>
                                </div>
                              )}

                              {maintenanceInfo.warranty && (
                                <div>
                                  <h4 className="text-blue-700 font-medium">Warranty</h4>
                                  <p className="text-gray-700 mt-1">{maintenanceInfo.warranty}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Decision Guide Tab */}
            <TabsContent value="decision">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Decision Guide</CardTitle>
                  <CardDescription>
                    A logical framework to help you choose between these products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Overall Comparison Scores */}
                  <div className="mb-8">
                    <h3 className="font-medium text-lg mb-4">Overall Comparison Scores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedProducts.map((product, index) => {
                        const score = comparisonScore[product._id] || 0;

                        return (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">{product.title}</h4>
                              <div className="text-xl font-bold text-blue-600">{score} / 10</div>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${(score / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Key Decision Factors */}
                  <div className="mb-8">
                    <h3 className="font-medium text-lg mb-4">Key Decision Factors</h3>

                    <div className="space-y-4">
                      {/* Price Factor */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <DollarSign className="text-green-500 mr-2" />
                          <h4 className="font-medium">Price Considerations</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {selectedProducts.map((product, index) => {
                            const priceInfo = comparisonData?.comparison.price[product._id];

                            return (
                              <div key={index} className="bg-white p-3 rounded border">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{product.title}</span>
                                  <span className="text-blue-600 font-bold">${product.price?.toFixed(2)}</span>
                                </div>

                                {priceInfo?.insight && (
                                  <p className="text-sm text-gray-600">{priceInfo.insight}</p>
                                )}

                                {!priceInfo?.insight && getBetterProduct('price') === index && (
                                  <p className="text-sm text-green-600">
                                    More affordable option ({getDifference('price')})
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3 text-sm text-gray-700">
                          <strong>Decision advice:</strong> {' '}
                          {getBetterProduct('price') === 0
                            ? `Choose ${selectedProducts[0].title} if budget is your primary concern.`
                            : getBetterProduct('price') === 1
                              ? `Choose ${selectedProducts[1].title} if budget is your primary concern.`
                              : 'Both products are similarly priced, so consider other factors for your decision.'
                          }
                        </div>
                      </div>

                      {/* Quality Factor (based on ratings) */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Star className="text-amber-500 fill-amber-500 mr-2" />
                          <h4 className="font-medium">Quality & Customer Satisfaction</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {selectedProducts.map((product, index) => {
                            return (
                              <div key={index} className="bg-white p-3 rounded border">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{product.title}</span>
                                  <div className="flex items-center">
                                    <span className="mr-1">{product.rating?.toFixed(1)}</span>
                                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                  </div>
                                </div>

                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>Based on {product.reviewCount} reviews</span>
                                </div>

                                {getBetterProduct('rating') === index && isDifferent('rating') && (
                                  <p className="text-sm text-green-600 mt-1">
                                    Higher rated ({getDifference('rating')})
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3 text-sm text-gray-700">
                          <strong>Decision advice:</strong> {' '}
                          {getBetterProduct('rating') === 0
                            ? `${selectedProducts[0].title} has better user ratings, suggesting higher satisfaction and quality.`
                            : getBetterProduct('rating') === 1
                              ? `${selectedProducts[1].title} has better user ratings, suggesting higher satisfaction and quality.`
                              : 'Both products have similar ratings, suggesting comparable quality.'
                          }
                        </div>
                      </div>

                      {/* Functional Purpose */}
                      {comparisonData && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-3">
                            <Zap className="text-purple-500 mr-2" />
                            <h4 className="font-medium">Functional Purpose</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {comparisonData.summary.functionalDifferences.differences.map((diff, index) => {
                              const matchingProduct = selectedProducts.find(p => p._id === diff.id);
                              if (!matchingProduct) return null;

                              return (
                                <div key={index} className="bg-white p-3 rounded border">
                                  <div className="mb-1 font-medium">{matchingProduct.title}</div>
                                  <div className="text-sm text-gray-700 mb-2">{diff.primaryFunction}</div>
                                  <div className="text-xs text-blue-600">{diff.whenToChoose}</div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-3 text-sm text-gray-700">
                            <strong>Decision advice:</strong> {' '}
                            {comparisonData.summary.buyingAdvice}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Final Recommendation */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <h3 className="font-bold text-xl mb-4 text-blue-800">Final Recommendation</h3>

                    <div className="space-y-4">
                      {/* Budget Choice */}
                      <div className="flex">
                        <DollarSign className="flex-shrink-0 w-5 h-5 mt-1 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-blue-800">Best Budget Choice</p>
                          <p className="text-gray-700">
                            {getBetterProduct('price') === 0
                              ? <><span className="font-medium">{selectedProducts[0].title}</span> is more affordable
                                by {getDifference('price')} and offers better value for money.</>
                              : getBetterProduct('price') === 1
                                ? <><span className="font-medium">{selectedProducts[1].title}</span> is more affordable
                                  by {getDifference('price')} and offers better value for money.</>
                                : 'Both products are similarly priced, so your decision should be based on features rather than price.'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Quality Choice */}
                      <div className="flex">
                        <Award className="flex-shrink-0 w-5 h-5 mt-1 text-amber-600 mr-3" />
                        <div>
                          <p className="font-medium text-blue-800">Best Quality Choice</p>
                          <p className="text-gray-700">
                            {getBetterProduct('rating') === 0
                              ? <><span className="font-medium">{selectedProducts[0].title}</span> has higher customer ratings
                                ({selectedProducts[0].rating?.toFixed(1)} vs {selectedProducts[1].rating?.toFixed(1)}),
                                suggesting better quality and satisfaction.</>
                              : getBetterProduct('rating') === 1
                                ? <><span className="font-medium">{selectedProducts[1].title}</span> has higher customer ratings
                                  ({selectedProducts[1].rating?.toFixed(1)} vs {selectedProducts[0].rating?.toFixed(1)}),
                                  suggesting better quality and satisfaction.</>
                                : 'Both products have comparable quality based on customer ratings.'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Feature Choice */}
                      {comparisonData && (
                        <div className="flex">
                          <Zap className="flex-shrink-0 w-5 h-5 mt-1 text-purple-600 mr-3" />
                          <div>
                            <p className="font-medium text-blue-800">Best Feature Match</p>
                            <p className="text-gray-700">
                              {comparisonData.summary.buyingAdvice}
                            </p>

                            {comparisonData.summary.bestChoice.forFunctionality &&
                              Object.values(comparisonData.summary.bestChoice.forFunctionality).length > 0 && (
                                <div className="mt-2">
                                  {Object.values(comparisonData.summary.bestChoice.forFunctionality).map((choice: any, i) => {
                                    const matchingProduct = selectedProducts.find(p => p._id === choice.id);
                                    if (!matchingProduct) return null;

                                    return (
                                      <p key={i} className="text-blue-600 text-sm">
                                        <span className="font-medium">{matchingProduct.title}</span>: {choice.reason}
                                      </p>
                                    );
                                  })}
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Decision Checklist */}
                      <div className="mt-5 pt-5 border-t border-blue-200">
                        <p className="font-medium text-blue-800 mb-3">Decision Checklist</p>
                        <ul className="space-y-2">
                          <li className="flex items-center text-gray-700">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            Choose <span className="font-medium mx-1">{selectedProducts[0].title}</span> if:
                            {getBetterProduct('price') === 0 && (
                              <span className="ml-1">price is your primary concern,</span>
                            )}
                            {getBetterProduct('rating') === 0 && (
                              <span className="ml-1">quality is important to you,</span>
                            )}
                            {comparisonData && comparisonData.summary.functionalDifferences.differences[0]?.whenToChoose && (
                              <span className="ml-1 text-blue-600">
                                {comparisonData.summary.functionalDifferences.differences[0].whenToChoose.toLowerCase()}
                              </span>
                            )}
                          </li>
                          <li className="flex items-center text-gray-700">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            Choose <span className="font-medium mx-1">{selectedProducts[1].title}</span> if:
                            {getBetterProduct('price') === 1 && (
                              <span className="ml-1">price is your primary concern,</span>
                            )}
                            {getBetterProduct('rating') === 1 && (
                              <span className="ml-1">quality is important to you,</span>
                            )}
                            {comparisonData && comparisonData.summary.functionalDifferences.differences[1]?.whenToChoose && (
                              <span className="ml-1 text-blue-600">
                                {comparisonData.summary.functionalDifferences.differences[1].whenToChoose.toLowerCase()}
                              </span>
                            )}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

      {/* Back Button */}
      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Shopping
        </Button>
      </div>
    </div>
  );
}