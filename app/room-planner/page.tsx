"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  ChevronLeft, 
  Bed, 
  Grid3X3, 
  PlusCircle, 
  MinusCircle,
  Sofa,
  Tv,
  Lamp,
  Table,
  DoorOpen,
  Armchair,
  MonitorSmartphone,
  Square,
  LayoutDashboard,
  RotateCw,
  X,
  CircleDot,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// TypeScript interface for the room planner
declare global {
  interface Window {
    roomPlanner: {
      addFurniture: (type: string) => void;
      toggleGrid: () => void;
      addRoomVertex: () => void;
      removeRoomVertex: () => void;
      updateRoomDimensions: (width: number, height: number) => void;
      saveRoomState: () => any; // Returns room state to save
      loadRoomState: (state: any) => void; // Loads room state from saved data
    };
  }
}

// Product interface
interface Product {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  price: number;
  image?: string;
  img?: string;
  category?: string;
  categories?: string[];
  rating?: number;
  tags?: string[];
  colors?: string[];
}

// Saved design interface
interface SavedDesign {
  name: string;
  data: {
    furniture?: Array<{
      type: string;
      x: number;
      y: number;
      rotation?: number;
      color?: string;
      style?: string;
    }>;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export default function RoomPlannerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState("furniture");
  const [loaded, setLoaded] = useState(false);
  const [roomWidth, setRoomWidth] = useState(400);
  const [roomHeight, setRoomHeight] = useState(300);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [currentDesignName, setCurrentDesignName] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<SavedDesign | null>(null);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  
  // Session tracking for non-authenticated users
  const [sessionId, setSessionId] = useState<string>("");
  
  // Authentication state
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Load authentication data on mount
  useEffect(() => {
    // Check for auth data
    const token = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    
    setAuthToken(token);
    setUserId(storedUserId);
    
    // Set up session ID for non-authenticated users
    if (!token) {
      const existingSessionId = localStorage.getItem('guestSessionId');
      if (existingSessionId) {
        setSessionId(existingSessionId);
      } else {
        const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('guestSessionId', newSessionId);
        setSessionId(newSessionId);
      }
    }
    
    // Initialize the room planner
    if (typeof window !== 'undefined') {
      import('@/lib/room-planner').then(module => {
        const { initRoomPlanner } = module;
        if (canvasRef.current) {
          initRoomPlanner(canvasRef.current);
          setLoaded(true);
        }
      }).catch(err => {
        console.error("Failed to load room planner module:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load room planner. Please try refreshing the page."
        });
      });
    }
  }, []);

  // Generate headers for API requests with proper Bearer token format
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token with correct Bearer format if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  };

  // Handle room dimension changes
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value);
    if (!isNaN(width) && width > 0) {
      setRoomWidth(width);
      if (window.roomPlanner) {
        window.roomPlanner.updateRoomDimensions(width, roomHeight);
      }
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = parseInt(e.target.value);
    if (!isNaN(height) && height > 0) {
      setRoomHeight(height);
      if (window.roomPlanner) {
        window.roomPlanner.updateRoomDimensions(roomWidth, height);
      }
    }
  };

  // Save current room state
  const saveCurrentDesign = () => {
    if (window.roomPlanner && currentDesignName.trim()) {
      try {
        const roomState = window.roomPlanner.saveRoomState();
        const newSavedDesigns = [...savedDesigns, {
          name: currentDesignName,
          data: roomState
        }];
        
        localStorage.setItem('roomPlanner_savedDesigns', JSON.stringify(newSavedDesigns));
        setSavedDesigns(newSavedDesigns);
        setSaveDialogOpen(false);
        setCurrentDesignName("");
        
        toast({
          title: "Success",
          description: `Design "${currentDesignName}" saved successfully!`
        });
      } catch (err) {
        console.error("Failed to save room state:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save your design. Please try again."
        });
      }
    }
  };

  // Load saved designs from localStorage
  const loadSavedDesigns = () => {
    try {
      const savedData = localStorage.getItem('roomPlanner_savedDesigns');
      if (savedData) {
        setSavedDesigns(JSON.parse(savedData));
      }
    } catch (err) {
      console.error("Failed to load saved designs:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load saved designs."
      });
    }
  };

  // Load a specific design
  const loadDesign = (design: SavedDesign) => {
    if (window.roomPlanner) {
      try {
        window.roomPlanner.loadRoomState(design.data);
        toast({
          title: "Success",
          description: `Loaded design: ${design.name}`
        });
      } catch (err) {
        console.error("Failed to load design:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load the selected design."
        });
      }
    }
  };

  // Get product recommendations for a room design with proper authentication
  const getSimilarProducts = async (design: SavedDesign) => {
    setIsLoadingRecommendations(true);
    setSelectedDesign(design);
    setRecommendationsOpen(true);
    
    try {
      if (!design.data.furniture || design.data.furniture.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No furniture items in this design to recommend products for."
        });
        setIsLoadingRecommendations(false);
        return;
      }
      
      // Get current auth token to ensure it's fresh
      const currentToken = localStorage.getItem('authToken');
      
      // Prepare headers with proper Bearer token
      const headers = {
        'Content-Type': 'application/json',
        ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
      };
      
      // Log the headers we're sending (for debugging)
      console.log('Request headers:', headers);
      
      // Prepare request body
      const requestBody = {
        furniture: design.data.furniture,
        userId: userId || undefined,
        sessionId: !authToken ? sessionId : undefined,
        limit: 12 // Request up to 12 recommendations
      };
      
      console.log('Request body:', requestBody);
      
      // Make the API request
      const response = await fetch(`${API_URL}/products/recommendations`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        credentials: 'include' // Include cookies for session-based auth if used
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        // Try to get more details about the error
        let errorDetail;
        try {
          const errorData = await response.json();
          errorDetail = errorData.message || `Status code: ${response.status}`;
        } catch (e) {
          errorDetail = `Status code: ${response.status}`;
        }
        
        throw new Error(`Failed to get recommendations: ${errorDetail}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (!data.success) {
        throw new Error(data.message || "Failed to get recommendations");
      }
      
      // Use the products from the unified recommendations response
      const primaryProducts = data.recommendations.primaryProducts || [];
      const complementaryProducts = data.recommendations.complementaryProducts || [];
      
      console.log(`Found ${primaryProducts.length} primary and ${complementaryProducts.length} complementary products`);
      
      const allProducts = [...primaryProducts, ...complementaryProducts];
      
      setRecommendedProducts(allProducts);
      
      if (allProducts.length === 0) {
        toast({
          title: "Info",
          description: "No matching products found for this design."
        });
      }
      
    } catch (error) {
      console.error("Error getting product recommendations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to get product recommendations: ${(error as Error).message || "Unknown error"}`
      });
      setRecommendedProducts([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Load saved designs when component mounts
  useEffect(() => {
    loadSavedDesigns();
  }, []);

  // Get furniture icon based on type
  const getFurnitureIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bed': return <Bed className="h-8 w-8 text-muted-foreground" />;
      case 'sofa': return <Sofa className="h-8 w-8 text-muted-foreground" />;
      case 'tv': return <Tv className="h-8 w-8 text-muted-foreground" />;
      case 'lamp': return <Lamp className="h-8 w-8 text-muted-foreground" />;
      case 'table': return <Table className="h-8 w-8 text-muted-foreground" />;
      case 'desk': return <Table className="h-8 w-8 text-muted-foreground" />;
      case 'chair': return <Armchair className="h-8 w-8 text-muted-foreground" />;
      case 'dresser': return <MonitorSmartphone className="h-8 w-8 text-muted-foreground" />;
      case 'nightstand': return <LayoutDashboard className="h-8 w-8 text-muted-foreground" />;
      case 'rug': return <Square className="h-8 w-8 text-muted-foreground" />;
      case 'door': return <DoorOpen className="h-8 w-8 text-muted-foreground" />;
      case 'window': return <Square className="h-8 w-8 text-muted-foreground" />; 
      default: return <CircleDot className="h-8 w-8 text-muted-foreground" />;
    }
  };

  // Available furniture items
  const furnitureItems = ["Bed", "Desk", "Chair", "Sofa", "Table", "Dresser", "TV", "Lamp", "Nightstand", "Rug", "Door", "Window"];

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/shop" className="flex items-center text-sm font-medium">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Shop
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setSaveDialogOpen(true)}
            >
              Save Design
            </Button>
            <Button>Order Furniture</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-64 border-r bg-muted/40 p-4">
          <h2 className="font-semibold mb-4">Room Planner</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="furniture">Furniture</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
              <TabsTrigger value="designs">Saved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="furniture" className="mt-2">
              <div className="grid grid-cols-2 gap-2">
                {furnitureItems.map((item) => (
                  <Card 
                    key={item}
                    className="p-2 text-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      if (window.roomPlanner) {
                        window.roomPlanner.addFurniture(item);
                      }
                    }}
                  >
                    <div className="h-16 flex items-center justify-center">
                      {getFurnitureIcon(item)}
                    </div>
                    <p className="text-xs mt-1">{item}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="dimensions" className="mt-2 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Width</label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    value={roomWidth}
                    onChange={handleWidthChange}
                    className="flex h-9 w-full"
                    placeholder="Width (cm)"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Height</label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    value={roomHeight}
                    onChange={handleHeightChange}
                    className="flex h-9 w-full"
                    placeholder="Height (cm)"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="designs" className="mt-2">
              {savedDesigns.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No saved designs yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSaveDialogOpen(true)}
                    className="mt-2"
                  >
                    Save Current Design
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedDesigns.map((design, index) => {
                    // Count furniture types
                    const furnitureCount = design.data.furniture ? design.data.furniture.length : 0;
                    
                    // Create furniture summary
                    const furnitureSummary = design.data.furniture 
                      ? Object.entries(
                          design.data.furniture.reduce((acc: {[key: string]: number}, item) => {
                            acc[item.type] = (acc[item.type] || 0) + 1;
                            return acc;
                          }, {})
                        )
                          .map(([type, count]) => `${count as number} ${type}${(count as number) > 1 ? 's' : ''}`)
                          .join(', ')
                      : 'No items';
                    
                    return (
                      <Card 
                        key={index} 
                        className="p-2 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => loadDesign(design)}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{design.name}</p>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSavedDesigns = savedDesigns.filter((_, i) => i !== index);
                              localStorage.setItem('roomPlanner_savedDesigns', JSON.stringify(newSavedDesigns));
                              setSavedDesigns(newSavedDesigns);
                              toast({
                                title: "Info",
                                description: "Design deleted"
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          <p>{furnitureCount} {furnitureCount === 1 ? 'item' : 'items'}</p>
                          <p className="truncate">{furnitureSummary}</p>
                        </div>
                        {/* Actions Row */}
                        <div className="mt-2 flex justify-between">
                          {/* See similar items button */}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent loading the design
                              getSimilarProducts(design);
                            }}
                            className="text-xs"
                            disabled={isLoadingRecommendations && selectedDesign?.name === design.name}
                          >
                            {isLoadingRecommendations && selectedDesign?.name === design.name ? (
                              <>
                                <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              'See similar items'
                            )}
                          </Button>
                          
                          {/* See in store button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent loading the design
                              
                              // Extract furniture types for the URL parameters
                              const furnitureTypes = design.data.furniture 
                                ? [...new Set(design.data.furniture.map(item => item.type.toLowerCase()))]
                                : [];
                                
                              // Build the URL with parameters
                              const params = new URLSearchParams();
                              
                              // Add furniture items
                              furnitureTypes.forEach(type => params.append('items', type));
                              
                              // Add session ID if no token
                              if (!authToken && sessionId) {
                                params.append('sessionId', sessionId);
                              }
                              
                              // Navigate to shop page with these items
                              window.location.href = `/shop?${params.toString()}`;
                            }}
                            className="text-xs"
                          >
                            Shop these items
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Room Corners:</span>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {
                    if (window.roomPlanner) {
                      window.roomPlanner.addRoomVertex();
                    }
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {
                    if (window.roomPlanner) {
                      window.roomPlanner.removeRoomVertex();
                    }
                  }}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => {
                if (window.roomPlanner) {
                  window.roomPlanner.toggleGrid();
                }
              }}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Toggle Grid
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-0 relative">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          <canvas 
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: loaded ? 'block' : 'none' }}
          ></canvas>
        </div>
      </div>

      {/* Save Design Dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 space-y-4">
            <h3 className="font-semibold text-lg">Save Room Design</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Design Name</label>
              <Input 
                value={currentDesignName}
                onChange={(e) => setCurrentDesignName(e.target.value)}
                placeholder="Enter a name for your design"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCurrentDesign}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Product Recommendations Dialog */}
      {recommendationsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Recommended Products for "{selectedDesign?.name}"
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRecommendationsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {isLoadingRecommendations ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : recommendedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendedProducts.map((product) => {
                  const productName = product.name || product.title || 'Unnamed Product';
                  const productImage = product.image || product.img;
                  const productCategory = product.category || 
                                         (product.categories && product.categories[0]) || 
                                         'Furniture';
                  
                  // Build product URL with session param if needed
                  let productUrl = `/product/${product._id}`;
                  if (!authToken && sessionId) {
                    productUrl += `?sessionId=${encodeURIComponent(sessionId)}`;
                  }
                  
                  return (
                    <Link 
                      href={productUrl}
                      key={product._id} 
                      className="block group"
                    >
                      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-48 bg-muted">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                              {getFurnitureIcon(productCategory)}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium truncate">{productName}</h4>
                          <p className="text-sm text-muted-foreground mt-1 mb-2">{productCategory}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">${product.price?.toFixed(2) || '0.00'}</span>
                            <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-white">
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No matching products found for this design.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setRecommendationsOpen(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}