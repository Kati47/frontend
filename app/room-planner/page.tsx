"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  ShoppingBag,
  Move,
  Maximize2,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// TypeScript interface for the room planner with enhanced drag and resize functionality
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
      
      // New methods for improved interaction
      selectItem: (x: number, y: number) => boolean;  // Returns true if an item was selected
      deselectAll: () => void;                       // Deselect all items
      getSelectedItem: () => {                       // Get currently selected item
        id: string;
        type: string;
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
      } | null;
      moveSelectedItem: (x: number, y: number) => void; // Move to specific position
      resizeSelectedItem: (width: number, height: number) => void; // Resize to dimensions
      rotateSelectedItem: (angle: number) => void;   // Set rotation angle
      deleteSelectedItem: () => void;                // Delete the selected item
      duplicateSelectedItem: () => void;             // Duplicate the selected item
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
      width?: number;
      height?: number;
      id?: string;
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
  
  // New state for managing furniture interaction
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'move' | 'resize' | 'rotate'>('move');
  const [dragStartPoint, setDragStartPoint] = useState({ x: 0, y: 0 });
  const [itemStartPosition, setItemStartPosition] = useState({ x: 0, y: 0 });
  const [itemStartDimensions, setItemStartDimensions] = useState({ width: 0, height: 0 });
  const [itemStartRotation, setItemStartRotation] = useState(0);
  
  // Canvas position and dimensions
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  
  // Session tracking for non-authenticated users
  const [sessionId, setSessionId] = useState<string>("");
  
  // Authentication state
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Update canvas rect for accurate positioning
  const updateCanvasRect = useCallback(() => {
    if (canvasRef.current) {
      setCanvasRect(canvasRef.current.getBoundingClientRect());
    }
  }, []);
  
  // Track window resize to update canvas rect
  useEffect(() => {
    window.addEventListener('resize', updateCanvasRect);
    return () => window.removeEventListener('resize', updateCanvasRect);
  }, [updateCanvasRect]);
  
  // Mouse down handler for canvas interaction
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!window.roomPlanner || !canvasRect) return;
    
    // Calculate mouse position relative to canvas
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    // Try to select an item at this position
    const selected = window.roomPlanner.selectItem(x, y);
    
    if (selected) {
      // Item was selected
      const item = window.roomPlanner.getSelectedItem();
      setSelectedItem(item);
      
      // Store initial state for the interaction
      setIsDragging(true);
      setDragStartPoint({ x, y });
      setItemStartPosition({ x: item!.x, y: item!.y });
      setItemStartDimensions({ width: item!.width, height: item!.height });
      setItemStartRotation(item!.rotation || 0);
      setInteractionMode('move');
    } else {
      // Nothing selected, clear selection
      setSelectedItem(null);
      window.roomPlanner.deselectAll();
    }
  }, [canvasRect]);
  
  // Mouse move handler
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !window.roomPlanner || !canvasRect || !selectedItem) return;
    
    // Calculate mouse position relative to canvas
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    // Calculate delta from start point
    const deltaX = x - dragStartPoint.x;
    const deltaY = y - dragStartPoint.y;
    
    if (interactionMode === 'move') {
      // Move item by applying the delta to the initial position
      const newX = itemStartPosition.x + deltaX;
      const newY = itemStartPosition.y + deltaY;
      window.roomPlanner.moveSelectedItem(newX, newY);
    } 
    else if (interactionMode === 'resize') {
      // Resize considering both X and Y changes
      const newWidth = Math.max(20, itemStartDimensions.width + deltaX);
      const newHeight = Math.max(20, itemStartDimensions.height + deltaY);
      window.roomPlanner.resizeSelectedItem(newWidth, newHeight);
    }
    else if (interactionMode === 'rotate') {
      // Calculate angle based on center of item and current mouse position
      const centerX = itemStartPosition.x + itemStartDimensions.width / 2;
      const centerY = itemStartPosition.y + itemStartDimensions.height / 2;
      
      const startAngle = Math.atan2(
        dragStartPoint.y - centerY,
        dragStartPoint.x - centerX
      );
      
      const currentAngle = Math.atan2(
        y - centerY,
        x - centerX
      );
      
      // Calculate rotation delta in degrees
      const angleDelta = (currentAngle - startAngle) * (180 / Math.PI);
      const newAngle = (itemStartRotation + angleDelta) % 360;
      
      window.roomPlanner.rotateSelectedItem(newAngle);
    }
    
    // Update selected item state
    setSelectedItem(window.roomPlanner.getSelectedItem());
  }, [isDragging, interactionMode, dragStartPoint, itemStartPosition, itemStartDimensions, itemStartRotation, canvasRect, selectedItem]);
  
  // Mouse up handler
  const handleCanvasMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      
      // Update selected item state once more
      if (window.roomPlanner) {
        setSelectedItem(window.roomPlanner.getSelectedItem());
      }
    }
  }, [isDragging]);
  
  // Start resize operation
  const handleStartResize = useCallback((e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    if (!selectedItem || !window.roomPlanner || !canvasRect) return;
    
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    setIsDragging(true);
    setIsResizing(true);
    setDragStartPoint({ x, y });
    setItemStartDimensions({ width: selectedItem.width, height: selectedItem.height });
    setInteractionMode('resize');
  }, [selectedItem, canvasRect]);
  
  // Start rotation operation
  const handleStartRotate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem || !window.roomPlanner || !canvasRect) return;
    
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    setIsDragging(true);
    setIsRotating(true);
    setDragStartPoint({ x, y });
    setItemStartRotation(selectedItem.rotation || 0);
    setItemStartPosition({ x: selectedItem.x, y: selectedItem.y });
    setInteractionMode('rotate');
  }, [selectedItem, canvasRect]);
  
  // Delete selected item
  const handleDeleteItem = useCallback(() => {
    if (!selectedItem || !window.roomPlanner) return;
    
    window.roomPlanner.deleteSelectedItem();
    setSelectedItem(null);
  }, [selectedItem]);
  
  // Duplicate selected item
  const handleDuplicateItem = useCallback(() => {
    if (!selectedItem || !window.roomPlanner) return;
    
    window.roomPlanner.duplicateSelectedItem();
    setSelectedItem(window.roomPlanner.getSelectedItem());
  }, [selectedItem]);
  
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
      import('@/lib/room-planner').then(async module => {
        const { initRoomPlanner } = module;
        if (canvasRef.current) {
          // Add custom event handling for selection changes
          const onItemSelected = (item: any) => {
            setSelectedItem(item);
          };
          
          await initRoomPlanner(canvasRef.current, { onItemSelected });
          setLoaded(true);
          updateCanvasRect();
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
  }, [updateCanvasRect]);
  
  // Add keyboard shortcuts for item manipulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!window.roomPlanner || !selectedItem) return;
      
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          handleDeleteItem();
          break;
        case 'Escape':
          window.roomPlanner.deselectAll();
          setSelectedItem(null);
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleDuplicateItem();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, handleDeleteItem, handleDuplicateItem]);

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
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/shop" className="flex items-center text-sm font-medium">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setSaveDialogOpen(true)}
              className="px-4"
            >
              Save Design
            </Button>
            <Button className="px-4">Order Furniture</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-72 border-r bg-muted/40 p-5">
          <h2 className="font-semibold text-lg mb-5">Room Planner</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="furniture">Furniture</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
              <TabsTrigger value="designs">Saved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="furniture" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {furnitureItems.map((item) => (
                  <Card 
                    key={item}
                    className="p-3 text-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      if (window.roomPlanner) {
                        window.roomPlanner.addFurniture(item);
                      }
                    }}
                  >
                    <div className="h-16 flex items-center justify-center">
                      {getFurnitureIcon(item)}
                    </div>
                    <p className="text-sm mt-2 font-medium">{item}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="dimensions" className="mt-4 space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-medium block">Room Width</label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    value={roomWidth}
                    onChange={handleWidthChange}
                    className="flex h-10 w-full"
                    placeholder="Width (cm)"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium block">Room Height</label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    value={roomHeight}
                    onChange={handleHeightChange}
                    className="flex h-10 w-full"
                    placeholder="Height (cm)"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="designs" className="mt-4">
              {savedDesigns.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="mb-3">No saved designs yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSaveDialogOpen(true)}
                    className="mt-2 px-4"
                  >
                    Save Current Design
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
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
                        className="p-3 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => loadDesign(design)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-base">{design.name}</p>
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
                        <div className="mt-1 text-sm text-muted-foreground mb-3">
                          <p>{furnitureCount} {furnitureCount === 1 ? 'item' : 'items'}</p>
                          <p className="line-clamp-2">{furnitureSummary}</p>
                        </div>
                        {/* Actions Row */}
                        <div className="mt-3 flex justify-between gap-2">
                          {/* See similar items button */}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent loading the design
                              getSimilarProducts(design);
                            }}
                            className="text-xs px-2 flex-1"
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
                            className="text-xs px-2 flex-1"
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
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Room Corners:</span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => {
                    if (window.roomPlanner) {
                      window.roomPlanner.addRoomVertex();
                    }
                  }}
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => {
                    if (window.roomPlanner) {
                      window.roomPlanner.removeRoomVertex();
                    }
                  }}
                >
                  <MinusCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center h-10"
              onClick={() => {
                if (window.roomPlanner) {
                  window.roomPlanner.toggleGrid();
                }
              }}
            >
              <Grid3X3 className="h-5 w-5 mr-2" />
              Toggle Grid
            </Button>
          </div>
          
          {/* Item manipulation controls - show when an item is selected */}
          {selectedItem && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm mb-4">Selected Item: {selectedItem.type}</h3>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center justify-center"
                  onClick={() => setInteractionMode('move')}
                  data-active={interactionMode === 'move'}
                >
                  <Move className="h-4 w-4 mr-2" />
                  Move
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center justify-center"
                  onClick={() => setInteractionMode('resize')}
                  data-active={interactionMode === 'resize'}
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Resize
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center justify-center"
                  onClick={() => setInteractionMode('rotate')}
                  data-active={interactionMode === 'rotate'}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Rotate
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center justify-center"
                  onClick={handleDeleteItem}
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                <p>Tip: Click and drag to {interactionMode} the item</p>
                <p className="mt-1">Keyboard: Del to delete, Esc to deselect</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-0 relative">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {/* Canvas for room planner */}
          <canvas 
            ref={canvasRef}
            className="w-full h-full"
            style={{ 
              display: loaded ? 'block' : 'none',
              cursor: isDragging 
                ? (interactionMode === 'move' 
                  ? 'grabbing' 
                  : interactionMode === 'resize' 
                    ? 'nwse-resize'
                    : 'move')
                : selectedItem ? 'grab' : 'default'
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          ></canvas>
          
          {/* Selection overlay with resize handles */}
          {selectedItem && !isDragging && loaded && (
            <div 
              className="absolute pointer-events-none"
              style={{
                left: `${selectedItem.x}px`,
                top: `${selectedItem.y}px`,
                width: `${selectedItem.width}px`,
                height: `${selectedItem.height}px`,
                transform: `rotate(${selectedItem.rotation || 0}deg)`,
                transformOrigin: 'center center',
                border: '2px dashed #3b82f6',
                zIndex: 10
              }}
            >
              {/* Resize handles at corners */}
              <div 
                className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-3 -ml-3 top-0 left-0 cursor-nwse-resize pointer-events-auto hover:bg-blue-100"
                onMouseDown={(e) => handleStartResize(e, 'nw')}
              />
              <div 
                className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-3 -mr-3 top-0 right-0 cursor-nesw-resize pointer-events-auto hover:bg-blue-100"
                onMouseDown={(e) => handleStartResize(e, 'ne')}
              />
              <div 
                className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mb-3 -ml-3 bottom-0 left-0 cursor-nesw-resize pointer-events-auto hover:bg-blue-100"
                onMouseDown={(e) => handleStartResize(e, 'sw')}
              />
              <div 
                className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mb-3 -mr-3 bottom-0 right-0 cursor-nwse-resize pointer-events-auto hover:bg-blue-100"
                onMouseDown={(e) => handleStartResize(e, 'se')}
              />
              
              {/* Rotation handle */}
              <div 
                className="absolute w-7 h-7 bg-white border-2 border-blue-500 rounded-full -mt-12 top-0 left-1/2 -ml-3.5 cursor-grab pointer-events-auto hover:bg-blue-100 flex items-center justify-center"
                onMouseDown={handleStartRotate}
              >
                <RotateCw className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Design Dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 space-y-5">
            <h3 className="font-semibold text-xl">Save Room Design</h3>
            <div className="space-y-3">
              <label className="text-sm font-medium block">Design Name</label>
              <Input 
                value={currentDesignName}
                onChange={(e) => setCurrentDesignName(e.target.value)}
                placeholder="Enter a name for your design"
                className="h-10"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)} className="px-4">
                Cancel
              </Button>
              <Button onClick={saveCurrentDesign} className="px-4">
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-xl">
                Recommended Products for "{selectedDesign?.name}"
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRecommendationsOpen(false)}
                className="h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {isLoadingRecommendations ? (
              <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : recommendedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
                        <div className="p-4">
                          <h4 className="font-medium text-base truncate">{productName}</h4>
                          <p className="text-sm text-muted-foreground mt-2 mb-3">{productCategory}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-base">${product.price?.toFixed(2) || '0.00'}</span>
                            <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-white px-3">
                              <ShoppingBag className="h-4 w-4 mr-2" />
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
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No matching products found for this design.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6 px-6"
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