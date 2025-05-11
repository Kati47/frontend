"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Star, 
  ShoppingCart, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  ThumbsUp, 
  Zap, 
  DollarSign, 
  Award, 
  Ruler, 
  PaintBucket, 
  Tag,
  Settings
} from "lucide-react";
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
import { useTranslation } from "@/lib/i18n/client";

// Product interface with technical details
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

// Result from backend API
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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [authError, setAuthError] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  // Get token from localStorage
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
      setError(t("compare.errors.authRequired"));
    } else {
      setAuthError(false);
    }
  }, [t]);

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
          setError("Authentication error. Please login to access product comparison.");
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

          // Get detailed comparison if we have 2 products
          if (newSelectedIds.length === 2) {
            fetchDetailedComparison(newSelectedIds);
          }
        } else if (allProducts.length >= 2) {
          // No products specified in URL, default to first two products
          setSelectedIds([allProducts[0]._id, allProducts[1]._id]);
          setSelectedProducts([allProducts[0], allProducts[1]]);

          // Get comparison for default products
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
      setIsComparisonLoading(false);
    } catch (err) {
      console.error("Error fetching detailed comparison:", err);
      setIsComparisonLoading(false);
    }
  };

  // Handle product selection change
  const handleProductChange = (index: number, productId: string) => {
    // Get other index
    const otherIndex = index === 0 ? 1 : 0;

    // Check if this product is already selected in the other dropdown
    if (selectedIds[otherIndex] === productId) {
      setError(t("compare.errors.duplicateProduct"));
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
      // Clear comparison data if we don't have 2 products
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
      return `$${difference} (${pctDifference}%) ${value1 > value2 ? "more expensive" : "cheaper"}`;
    }

    if (key === 'rating' && typeof value1 === 'number' && typeof value2 === 'number') {
      const difference = Math.abs(value1 - value2).toFixed(1);
      return `${difference} stars ${value1 > value2 ? "higher" : "lower"}`;
    }

    if (key === 'reviewCount' && typeof value1 === 'number' && typeof value2 === 'number') {
      const difference = Math.abs(value1 - value2);
      return `${difference} more reviews`;
    }

    return '';
  };

  // Get the product that is better for a specific attribute
  const getBetterProduct = (key: keyof Product) => {
    if (selectedProducts.length < 2) return -1;
    if (!selectedProducts[0] || !selectedProducts[1]) return -1;

    const value1 = selectedProducts[0][key];
    const value2 = selectedProducts[1][key];

    if (key === 'price') {
      // For price, lower is better
      if (typeof value1 === 'number' && typeof value2 === 'number') {
        if (value1 < value2) return 0;
        if (value2 < value1) return 1;
      }
    } else {
      // For other numeric values, higher is better
      if (typeof value1 === 'number' && typeof value2 === 'number') {
        if (value1 > value2) return 0;
        if (value2 > value1) return 1;
      }
    }

    return -1; // Indicates equality or non-numeric values
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">{t("compare.title")}</h1>

      {/* Authentication Error */}
      {authError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h2 className="font-bold">{t("compare.authError.title")}</h2>
          </div>
          <p className="mb-4">{error}</p>
          <Button onClick={handleAuthRedirect}>
            {t("compare.authError.loginButton")}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {!authError && isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">{t("compare.loading.products")}</p>
        </div>
      )}

      {/* Error State */}
      {!authError && !isLoading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Product Selection */}
      {!authError && !isLoading && !error && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[0, 1].map(index => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                <h2 className="font-medium mb-3">{t("compare.productSelection.chooseProduct", { number: index + 1 })}</h2>
                <Select
                  value={selectedIds[index] || ""}
                  onValueChange={(value) => handleProductChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("compare.productSelection.selectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts.map(product => (
                      <SelectItem 
                        key={product._id} 
                        value={product._id}
                        disabled={selectedIds.includes(product._id) && selectedIds.indexOf(product._id) !== index}
                      >
                        {product.title} - ${product.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedProducts[index] && selectedProducts[index]._id && (
                  <div className="mt-4 flex items-start">
                    {selectedProducts[index].img && (
                      <div className="flex-shrink-0 mr-4">
                        <Image 
                          src={selectedProducts[index].img} 
                          alt={selectedProducts[index].title}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{selectedProducts[index].title}</h3>
                      <p className="text-blue-600 font-medium">
                        ${selectedProducts[index].price?.toFixed(2)}
                      </p>
                      {selectedProducts[index].rating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm ml-1">{selectedProducts[index].rating.toFixed(1)}</span>
                          {selectedProducts[index].reviewCount && (
                            <span className="text-sm text-gray-500 ml-1">
                              ({t("compare.product.reviewCount", { 
                                count: selectedProducts[index].reviewCount,
                                reviews: selectedProducts[index].reviewCount === 1 
                                  ? t("compare.product.reviewSingular") 
                                  : t("compare.product.reviewPlural")
                              })})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {!authError && !isLoading && selectedProducts.length === 2 && 
       selectedProducts[0]._id && selectedProducts[1]._id && (
        <>
          {isComparisonLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">{t("compare.loading.analyzing")}</p>
            </div>
          ) : (
            <Tabs defaultValue="features">
              <TabsList className="mb-6">
                <TabsTrigger value="features">{t("compare.tabs.features")}</TabsTrigger>
                <TabsTrigger value="decision">{t("compare.tabs.decision")}</TabsTrigger>
              </TabsList>

              {/* Features Tab */}
              <TabsContent value="features">
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>{t("compare.features.title")}</CardTitle>
                    <CardDescription>
                      {t("compare.features.description", { 
                        product1: selectedProducts[0].title, 
                        product2: selectedProducts[1].title 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      {/* Basic info */}
                      <div className="grid grid-cols-3">
                        <div className="p-4 font-semibold bg-gray-100">{t("compare.features.featureColumn")}</div>
                        <div className="p-4 font-semibold bg-gray-100">{selectedProducts[0].title}</div>
                        <div className="p-4 font-semibold bg-gray-100">{selectedProducts[1].title}</div>
                      </div>

                      {/* Price */}
                      <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('price') ? "bg-blue-50" : ""}`}>
                        <div className="p-4 font-medium bg-gray-50">{t("compare.features.price")}</div>
                        <div className="p-4 font-bold text-blue-600">
                          ${selectedProducts[0].price?.toFixed(2)}
                        </div>
                        <div className="p-4 font-bold text-blue-600">
                          ${selectedProducts[1].price?.toFixed(2)}
                        </div>
                      </div>

                      {/* Categories */}
                      <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('categories') ? "bg-blue-50" : ""}`}>
                        <div className="p-4 font-medium bg-gray-50">{t("compare.features.categories")}</div>
                        <div className="p-4">
                          {selectedProducts[0].categories?.map((cat, i) => (
                            <Badge key={i} variant="secondary" className="mr-1 mb-1">{cat}</Badge>
                          ))}
                        </div>
                        <div className="p-4">
                          {selectedProducts[1].categories?.map((cat, i) => (
                            <Badge key={i} variant="secondary" className="mr-1 mb-1">{cat}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Color */}
                      <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('color') ? "bg-blue-50" : ""}`}>
                        <div className="p-4 font-medium bg-gray-50">{t("compare.features.color")}</div>
                        <div className="p-4 flex items-center">
                          {selectedProducts[0].color && (
                            <span className="inline-block w-4 h-4 rounded-full mr-2" 
                                  style={{ backgroundColor: selectedProducts[0].color.toLowerCase() }}></span>
                          )}
                          {selectedProducts[0].color || t("compare.features.notSpecified")}
                        </div>
                        <div className="p-4 flex items-center">
                          {selectedProducts[1].color && (
                            <span className="inline-block w-4 h-4 rounded-full mr-2" 
                                  style={{ backgroundColor: selectedProducts[1].color.toLowerCase() }}></span>
                          )}
                          {selectedProducts[1].color || t("compare.features.notSpecified")}
                        </div>
                      </div>

                      {/* Description */}
                      <div className={`grid grid-cols-3 ${highlightDifferences && isDifferent('desc') ? "bg-blue-50" : ""}`}>
                        <div className="p-4 font-medium bg-gray-50">{t("compare.features.description")}</div>
                        <div className="p-4 text-sm">{selectedProducts[0].desc}</div>
                        <div className="p-4 text-sm">{selectedProducts[1].desc}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Comparison Card */}
                {comparisonData && (
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                        {t("compare.price.title")}
                      </CardTitle>
                      <CardDescription>
                        {t("compare.price.description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedProducts.map((product, index) => {
                          const productId = product._id;
                          const priceInfo = comparisonData.comparison.price[productId];
                          if (!priceInfo) return null;
                          
                          // Determine if this is cheapest or most expensive
                          const isLowestPrice = priceInfo.position === 'cheapest';
                          const isHighestPrice = priceInfo.position === 'most expensive';
                          
                          return (
                            <div key={index} className={`
                              p-5 rounded-lg border-2 
                              ${isLowestPrice ? "border-green-300 bg-green-50" : 
                                isHighestPrice ? "border-blue-300 bg-blue-50" : 
                                "border-gray-200 bg-gray-50"}
                            `}>
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg">{product.title}</h3>
                                <span className="text-xl font-bold text-blue-700">
                                  ${product.price.toFixed(2)}
                                </span>
                              </div>
                              
                              {priceInfo.position && (
                                <Badge className={`
                                  mb-3 
                                  ${isLowestPrice ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                                    isHighestPrice ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : 
                                    "bg-gray-100 text-gray-800 hover:bg-gray-100"}
                                `}>
                                  {isLowestPrice ? t("compare.price.bestValue") : 
                                   isHighestPrice ? t("compare.price.premiumOption") : 
                                   t("compare.price.midRangeOption")}
                                </Badge>
                              )}
                              
                              {priceInfo.insight && (
                                <p className="text-sm text-gray-700 mb-3">{priceInfo.insight}</p>
                              )}
                              
                              {priceInfo.directComparison && (
                                <div className="text-sm py-2 px-3 rounded bg-white">
                                  <div className="flex items-center text-blue-600">
                                    <span>{priceInfo.directComparison}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Maintenance and Care */}
                {comparisonData && (
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle>{t("compare.maintenance.title")}</CardTitle>
                      <CardDescription>
                        {t("compare.maintenance.description")}
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
                                    <h4 className="text-blue-700 font-medium">{t("compare.maintenance.cleaning")}</h4>
                                    <p className="text-gray-700 mt-1">{maintenanceInfo.cleaning}</p>
                                  </div>
                                )}

                                {maintenanceInfo.care && maintenanceInfo.care.length > 0 && (
                                  <div>
                                    <h4 className="text-blue-700 font-medium">{t("compare.maintenance.careInstructions")}</h4>
                                    <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                      {maintenanceInfo.care.map((item: string, i) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {maintenanceInfo.lifespan && (
                                  <div>
                                    <h4 className="text-blue-700 font-medium">{t("compare.maintenance.lifespan")}</h4>
                                    <p className="text-gray-700 mt-1">{maintenanceInfo.lifespan}</p>
                                  </div>
                                )}

                                {maintenanceInfo.warranty && (
                                  <div>
                                    <h4 className="text-blue-700 font-medium">{t("compare.maintenance.warranty")}</h4>
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
                    <CardTitle>{t("compare.decision.title")}</CardTitle>
                    <CardDescription>
                      {t("compare.decision.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Expert Buying Advice */}
                    {comparisonData?.summary?.buyingAdvice && (
                      <div className="bg-amber-50 p-6 rounded-lg mb-6 border border-amber-200">
                        <div className="flex items-start mb-4">
                          <AlertCircle className="flex-shrink-0 w-6 h-6 mt-1 text-amber-600 mr-3" />
                          <h3 className="font-bold text-xl text-amber-800">{t("compare.decision.expertAdvice")}</h3>
                        </div>
                        
                        <p className="text-gray-800 leading-relaxed">
                          {comparisonData.summary.buyingAdvice}
                        </p>
                        
                        <div className="mt-4 pt-4 border-t border-amber-200 flex items-center">
                          <ThumbsUp className="text-amber-600 mr-2 h-5 w-5" />
                          <span className="text-amber-800 font-medium">{t("compare.decision.personalizedRecommendation")}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Best Choice Recommendations */}
                    {comparisonData?.summary?.bestChoice && (
                      <div className="my-8">
                        <h3 className="font-medium text-lg mb-4">{t("compare.bestChoice.title")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Best Value Choice */}
                          {comparisonData.summary.bestChoice.forValue?.id && (
                            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                              <div className="flex items-center mb-2">
                                <DollarSign className="text-green-600 mr-2 h-5 w-5" />
                                <h3 className="font-medium text-green-800">{t("compare.bestChoice.value")}</h3>
                              </div>
                              <p className="font-bold text-lg mb-2">
                                {comparisonData.summary.bestChoice.forValue.title}
                              </p>
                              {comparisonData.summary.bestChoice.forValue.reason && (
                                <p className="text-sm text-gray-700">{comparisonData.summary.bestChoice.forValue.reason}</p>
                              )}
                            </div>
                          )}
                          
                          {/* Best Aesthetics Choice */}
                          {comparisonData.summary.bestChoice.forAesthetics?.id && (
                            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                              <div className="flex items-center mb-2">
                                <PaintBucket className="text-purple-600 mr-2 h-5 w-5" />
                                <h3 className="font-medium text-purple-800">{t("compare.bestChoice.aesthetics")}</h3>
                              </div>
                              <p className="font-bold text-lg mb-2">
                                {comparisonData.summary.bestChoice.forAesthetics.title}
                              </p>
                              {comparisonData.summary.bestChoice.forAesthetics.reason && (
                                <p className="text-sm text-gray-700">{comparisonData.summary.bestChoice.forAesthetics.reason}</p>
                              )}
                            </div>
                          )}
                          
                          {/* Best Functionality Choice */}
                          {comparisonData.summary.bestChoice.forFunctionality?.id && (
                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                              <div className="flex items-center mb-2">
                                <Settings className="text-blue-600 mr-2 h-5 w-5" />
                                <h3 className="font-medium text-blue-800">{t("compare.bestChoice.functionality")}</h3>
                              </div>
                              <p className="font-bold text-lg mb-2">
                                {comparisonData.summary.bestChoice.forFunctionality.title}
                              </p>
                              {comparisonData.summary.bestChoice.forFunctionality.reason && (
                                <p className="text-sm text-gray-700">{comparisonData.summary.bestChoice.forFunctionality.reason}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
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
                            <strong>Decision Advice:</strong> {' '}
                            {getBetterProduct('price') === 0
                              ? `Choose ${selectedProducts[0].title} if budget is your primary concern`
                              : getBetterProduct('price') === 1
                                ? `Choose ${selectedProducts[1].title} if budget is your primary concern`
                                : "Both products are similarly priced"
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
                                    <span>Based on {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}</span>
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
                            <strong>Decision Advice:</strong> {' '}
                            {getBetterProduct('rating') === 0
                              ? `${selectedProducts[0].title} has higher customer ratings`
                              : getBetterProduct('rating') === 1
                                ? `${selectedProducts[1].title} has higher customer ratings`
                                : "Both products have similar ratings"
                            }
                          </div>
                        </div>
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
                              {comparisonData?.summary?.bestChoice?.forValue ? (
                                <><span className="font-medium">{comparisonData.summary.bestChoice.forValue.title}</span>: {comparisonData.summary.bestChoice.forValue.reason}</>
                              ) : (
                                getBetterProduct('price') === 0
                                  ? <><span className="font-medium">{selectedProducts[0].title}</span> is more affordable {getDifference('price')}.</>
                                  : getBetterProduct('price') === 1
                                    ? <><span className="font-medium">{selectedProducts[1].title}</span> is more affordable {getDifference('price')}.</>
                                    : "Both products are similarly priced"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Decision Checklist */}
                        <div className="mt-5 pt-5 border-t border-blue-200">
                          <p className="font-medium text-blue-800 mb-3">Decision Checklist</p>
                          <ul className="space-y-2">
                            {selectedProducts.map((product, index) => {
                              // Find matching product in functional differences
                              const productDifference = comparisonData?.summary?.functionalDifferences?.differences?.find(
                                diff => diff.id === product._id
                              );
                              
                              return (
                                <li key={index} className="flex items-start text-gray-700">
                                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium">Choose {product.title} if:</span>
                                    <ul className="list-disc ml-5 mt-1 space-y-1">
                                      {getBetterProduct('price') === index && (
                                        <li>Price is your primary concern</li>
                                      )}
                                      {getBetterProduct('rating') === index && (
                                        <li>Quality and customer satisfaction are important to you</li>
                                      )}
                                      {productDifference?.whenToChoose && (
                                        <li className="text-blue-600">{productDifference.whenToChoose}</li>
                                      )}
                                      {productDifference?.uniqueValue && (
                                        <li>You need: {productDifference.uniqueValue}</li>
                                      )}
                                    </ul>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      {/* Back Button */}
      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t("compare.backToShopping")}
        </Button>
      </div>
    </div>
  );
}