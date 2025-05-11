"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Star,
  StarHalf,
  Trash2,
  MoreHorizontal,
  User,
  Box,
  AlertCircle,
  Calendar,
  Lock,
  Filter,
  Info
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTranslation } from "@/lib/i18n/client"

// TypeScript interfaces
interface User {
  _id: string;
  username?: string;
  name?: string;
  img?: string;
}

interface Product {
  _id: string;
  title?: string;
  img?: string[] | string;
}

interface Review {
  _id: string;
  title: string;
  comment: string;
  rating: number;
  userId: User | string;
  productId: Product;
  flagLevel?: 'green' | 'yellow' | 'red';
  createdAt: string;
}

interface DeletionReason {
  value: string;
  label: string;
}

interface RatingDistribution {
  [key: string]: number;
}

interface FlagDistribution {
  [key: string]: number;
}

// Predefined deletion reasons
const DELETION_REASONS: DeletionReason[] = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "offensive", label: "Contains offensive language" },
  { value: "spam", label: "Spam or promotional content" },
  { value: "irrelevant", label: "Irrelevant to product" },
  { value: "misleading", label: "Misleading or false information" },
  { value: "personal_attack", label: "Personal attack on staff" },
  { value: "privacy", label: "Contains personal information" },
  { value: "other", label: "Other reason" }
];

export default function ReviewsManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [authError, setAuthError] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [sortFilter, setSortFilter] = useState<string>("newest")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<string>("all")
  
  // Dialog state for deletion reason
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)
  const [deleteError, setDeleteError] = useState<string>("")
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
  const [deletionReason, setDeletionReason] = useState<string>("")
  const [customReason, setCustomReason] = useState<string>("")

  // State for reviews data
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([])
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({})
  const [flagDistribution, setFlagDistribution] = useState<FlagDistribution>({})
  
  // State for review users data
  const [reviewUsers, setReviewUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [totalUserPages, setTotalUserPages] = useState<number>(1)
  
  // Mapping of user IDs to names
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  
  // Current user ID from local storage
  const [currentUserId, setCurrentUserId] = useState<string>("")
  
  const itemsPerPage = 10
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
  
  // Get user ID on component mount
  useEffect(() => {
    const userId = getUserIdFromLocalStorage();
    setCurrentUserId(userId);
  }, []);
  
  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = (): string => {
    try {
      const storedUserId = localStorage.getItem("userId") || ""
      console.log("User ID from localStorage:", storedUserId)
      return storedUserId
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }
  
  // Function to retrieve the auth token
  const getAuthToken = (): string => {
    try {
      return localStorage.getItem("token") || ""
    } catch (err) {
      console.error("Error accessing localStorage for token:", err)
      return ""
    }
  }
  
  // Extract user ID from review data
  const extractUserId = (review: { userId?: User | string }): string | null => {
    if (!review || !review.userId) return null;
    
    // If userId is an object with _id
    if (typeof review.userId === 'object' && review.userId._id) {
      return review.userId._id;
    }
    
    // If userId is a string (direct ID)
    if (typeof review.userId === 'string') {
      return review.userId;
    }
    
    return null;
  }
  
  // Fetch user names for reviews whenever they change
  useEffect(() => {
    // Collect all unique user IDs that need name fetching
    const pendingUserIds = new Set<string>();
    
    displayedReviews.forEach(review => {
      const userId = extractUserId(review);
      if (userId && !userNames[userId]) {
        pendingUserIds.add(userId);
      }
    });
    
    // Fetch names for all pending user IDs
    pendingUserIds.forEach(userId => {
      fetchUserName(userId);
    });
  }, [displayedReviews, userNames]);
  
  // Fetch user name by ID using the correct endpoint path
  const fetchUserName = async (userId: string): Promise<void> => {
    if (!userId || userNames[userId]) return;
    
    try {
      console.log(`Fetching name for user ID from review: ${userId}`);
      const token = getAuthToken();
      
      // Updated to use the correct endpoint structure: /users/:id/name
      const response = await fetch(`${API_URL}/users/${userId}/name`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`Error fetching user name for ${userId}: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      console.log(`Name data received for ${userId}:`, data);
      
      if (data && data.name) {
        setUserNames(prev => ({
          ...prev,
          [userId]: data.name
        }));
      }
    } catch (error) {
      console.error(`Error fetching name for user ${userId}:`, error);
    }
  };
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [ratingFilter, sortFilter, viewMode])
  
  // Fetch appropriate data based on viewMode
  useEffect(() => {
    if (viewMode === "all") {
      fetchAllReviews()
    } else if (viewMode === "product") {
      fetchAllReviews() // We'll sort client-side for product view
    } else if (viewMode === "user") {
      fetchReviewUsers()
    }
  }, [currentPage, ratingFilter, sortFilter, viewMode])
  
  // Filter and search reviews
  useEffect(() => {
    let filteredReviews = [...allReviews]
    
    // Apply view mode filter
    if (viewMode === "product") {
      // Group reviews by product
      filteredReviews = filteredReviews.sort((a, b) => {
        const productA = a.productId?.title || "Unknown"
        const productB = b.productId?.title || "Unknown"
        return productA.localeCompare(productB)
      })
    } else if (viewMode === "user") {
      // Group reviews by user
      filteredReviews = filteredReviews.sort((a, b) => {
        const userAName = getUserDisplayName(a.userId)
        const userBName = getUserDisplayName(b.userId)
        return userAName.localeCompare(userBName)
      })
    }
    
    // Apply search filter if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredReviews = filteredReviews.filter(review => {
        const title = review.title?.toLowerCase() || ""
        const comment = review.comment?.toLowerCase() || ""
        const productName = review.productId?.title?.toLowerCase() || ""
        const userName = getUserDisplayName(review.userId).toLowerCase()
        
        return title.includes(query) || 
               comment.includes(query) || 
               productName.includes(query) || 
               userName.includes(query)
      })
    }
    
    setDisplayedReviews(filteredReviews)
  }, [allReviews, viewMode, searchQuery, userNames])
  
  // Fetch all reviews
  const fetchAllReviews = async (): Promise<void> => {
    try {
      setLoading(true)
      setAuthError(false)
      
      // Build query parameters based on controller implementation
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: sortFilter
      })
      
      if (ratingFilter !== "all") {
        params.append("rating", ratingFilter)
      }
      
      const token = getAuthToken()
      const userId = currentUserId || getUserIdFromLocalStorage()
      
      if (!token || !userId) {
        console.error("No auth token or user ID found")
        setAuthError(true)
        setLoading(false)
        return
      }
      
      console.log(`Fetching reviews with params: ${params}`)
      const response = await fetch(`${API_URL}/reviews?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.status === 401) {
        setAuthError(true)
        setLoading(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Reviews data received:", data)
      
      setAllReviews(data.reviews)
      setDisplayedReviews(data.reviews)
      setTotalReviews(data.totalReviews)
      setTotalPages(data.totalPages)
      setRatingDistribution(data.ratingDistribution)
      
      if (data.flagDistribution) {
        setFlagDistribution(data.flagDistribution)
      }
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setLoading(false)
    }
  }
  
  // Fetch users who've written reviews
  const fetchReviewUsers = async (): Promise<void> => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
      const token = getAuthToken()
      const userId = currentUserId || getUserIdFromLocalStorage()
      
      if (!token || !userId) {
        setAuthError(true)
        setLoading(false)
        return
      }
      
      console.log(`Fetching review users with params: ${params}`)
      const response = await fetch(`${API_URL}/reviews/users?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.status === 401) {
        setAuthError(true)
        setLoading(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch review users: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Review users data received:", data)
      
      setReviewUsers(data.users)
      setTotalUsers(data.totalUsers)
      setTotalUserPages(data.totalPages)
      
      // Fetch names for all users
      data.users.forEach((user: User) => {
        if (user._id) {
          fetchUserName(user._id);
        }
      });
      
      // Also fetch reviews by the first user to display
      if (data.users.length > 0) {
        await fetchUserReviews(data.users[0]._id)
      } else {
        setAllReviews([])
        setDisplayedReviews([])
      }
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching review users:", error)
      setLoading(false)
    }
  }
  
  // Fetch reviews by a specific user
  const fetchUserReviews = async (userId: string): Promise<void> => {
    try {
      const token = getAuthToken()
      
      const params = new URLSearchParams({
        page: '1',
        limit: '50' // Get more reviews to show for this user
      })
      
      console.log(`Fetching reviews for user: ${userId}`)
      const response = await fetch(`${API_URL}/reviews/user/${userId}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user reviews: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("User reviews received:", data)
      
      // Make sure we have the name for this user
      fetchUserName(userId);
      
      setAllReviews(data.reviews)
      setDisplayedReviews(data.reviews)
    } catch (error) {
      console.error(`Error fetching reviews for user ${userId}:`, error)
    }
  }
  
  // Delete a review
  const handleDeleteClick = (review: Review): void => {
    setReviewToDelete(review)
    setDeletionReason("")
    setCustomReason("")
    setDeleteError("")
    setDeleteDialogOpen(true)
  }
  
  const confirmDeleteReview = async (): Promise<void> => {
    // Validate a reason was selected
    if (!deletionReason) {
      setDeleteError("Please select a reason for deletion")
      return
    }
    
    // For "other" option, require custom reason
    if (deletionReason === "other" && !customReason.trim()) {
      setDeleteError("Please provide additional details")
      return
    }
    
    if (!reviewToDelete) {
      setDeleteError("No review selected for deletion")
      return
    }
    
    try {
      setDeleteLoading(true)
      const token = getAuthToken()
      const userId = currentUserId || getUserIdFromLocalStorage()
      
      if (!token || !userId) {
        console.error("No auth token or user ID found")
        alert("You must be logged in to perform this action")
        setDeleteDialogOpen(false)
        return
      }
      
      // Prepare the deletion data
      const deleteData = {
        reason: deletionReason,
        details: customReason || undefined
      }
      
      console.log("Delete request data:", deleteData);
      
      // Match the API implementation for review deletion
      const response = await fetch(`${API_URL}/reviews/${reviewToDelete._id}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deleteData),
        credentials: 'include'
      })
      
      if (response.status === 400) {
        const data = await response.json()
        setDeleteError(data.message || "Invalid request. Please provide a valid reason.")
        setDeleteLoading(false)
        return
      }
      
      if (response.status === 401 || response.status === 403) {
        const data = await response.json()
        setDeleteError(data.message || "You are not authorized to perform this action");
        setDeleteLoading(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(`Failed to delete review: ${response.status}`)
      }
      
      // Refresh the data based on current view mode
      if (viewMode === "user") {
        fetchReviewUsers()
      } else {
        fetchAllReviews()
      }
      
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting review:", error)
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDeleteError("Failed to delete review: " + errorMessage)
    } finally {
      setDeleteLoading(false)
    }
  }
  
  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.checked) {
      setSelectedReviews(displayedReviews.map(review => review._id))
    } else {
      setSelectedReviews([])
    }
  }

  // Handle single select
  const handleSelectReview = (reviewId: string): void => {
    if (selectedReviews.includes(reviewId)) {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId))
    } else {
      setSelectedReviews([...selectedReviews, reviewId])
    }
  }
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
  }
  
  // Redirect to login if not authenticated
  const handleAuthError = (): void => {
    router.push('/login?redirect=/admin/reviews')
  }
  
  // Get product image URL
  const getProductImageUrl = (product: Product | null | undefined): string | null => {
    if (!product) return null;
    
    // Check if img is an array
    if (Array.isArray(product.img) && product.img.length > 0) {
      return product.img[0];
    }
    
    // Check if img is a string
    if (typeof product.img === 'string' && product.img) {
      return product.img;
    }
    
    return null;
  }
  
  // Rating stars display component
  const RatingStars = ({ rating }: { rating: number }) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />)
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />)
      }
    }
    
    return <div className="flex">{stars}</div>
  }

  // Get badge color based on flag level
  const getFlagBadgeColor = (flagLevel: string | undefined): string => {
    switch (flagLevel) {
      case 'green': return 'bg-green-100 text-green-800'
      case 'yellow': return 'bg-yellow-100 text-yellow-800'
      case 'red': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get user display name using the fetched names from getUserNameById
  const getUserDisplayName = (user: User | string | undefined | null): string => {
    if (!user) return "User not available";
    
    // Get the user ID first
    const userId = extractUserId({userId: user});
    
    if (!userId) return "User ID not available";
    
    // Check if we have the name in our cache
    if (userNames[userId]) {
      return userNames[userId];
    }
    
    // Use username if available
    if (typeof user === 'object' && user.username) {
      return user.username;
    }
    
    // Show formatted user ID while loading the name
    return `User ${userId.substring(0, 8)}...`;
  }

  // If there's an auth error, show login prompt
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          You need to be logged in to view and manage reviews.
        </p>
        <Button onClick={handleAuthError}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
          <p className="text-muted-foreground mt-2">Manage product reviews and customer feedback</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={viewMode} onValueChange={(value) => setViewMode(value)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="product">By Product</SelectItem>
              <SelectItem value="user">By User</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortFilter} onValueChange={setSortFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 flex justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading reviews...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="md:col-span-3">
              <CardHeader className="p-4 pb-2">
                <CardTitle>Reviews ({displayedReviews.length})</CardTitle>
                <CardDescription>
                  {viewMode === "all" ? "All customer reviews" : 
                    viewMode === "product" ? "Reviews grouped by product" : 
                    "Reviews grouped by user"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50">
                      <tr>
                        <th scope="col" className="p-4 w-8">
                          <div className="flex items-center">
                            <input
                              id="checkbox-all"
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300"
                              onChange={handleSelectAll}
                              checked={selectedReviews.length === displayedReviews.length && displayedReviews.length > 0}
                            />
                            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3">
                          {viewMode === "user" ? "User" : "Product"}
                        </th>
                        <th scope="col" className="px-4 py-3">
                          {viewMode === "product" ? "User" : "Rating"}
                        </th>
                        <th scope="col" className="px-4 py-3">Review</th>
                        <th scope="col" className="px-4 py-3">Date</th>
                        <th scope="col" className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedReviews.length > 0 ? (
                        displayedReviews.map((review) => (
                          <tr 
                            key={review._id} 
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300"
                                  checked={selectedReviews.includes(review._id)}
                                  onChange={() => handleSelectReview(review._id)}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {viewMode === "user" ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    {typeof review.userId === 'object' && review.userId?.img ? (
                                      <Image
                                        src={review.userId.img}
                                        alt={getUserDisplayName(review.userId)}
                                        width={40}
                                        height={40}
                                        className="object-cover rounded-full"
                                      />
                                    ) : (
                                      <User className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <span className="font-medium">
                                    {getUserDisplayName(review.userId)}
                                  </span>
                                </div>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                          {getProductImageUrl(review.productId) ? (
                                            <Image
                                              src={getProductImageUrl(review.productId) as string}
                                              alt={review.productId?.title || "Product"}
                                              width={40}
                                              height={40}
                                              className="object-cover"
                                            />
                                          ) : (
                                            <Box className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </div>
                                        <span className="font-medium truncate max-w-[180px]">
                                          {review.productId?.title || "Unknown Product"}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{review.productId?.title || "Unknown Product"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {viewMode === "product" ? (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{getUserDisplayName(review.userId)}</span>
                                </div>
                              ) : (
                                <RatingStars rating={review.rating} />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium line-clamp-1">{review.title}</p>
                                  {review.flagLevel && (
                                    <Badge className={getFlagBadgeColor(review.flagLevel)}>
                                      {review.flagLevel}
                                    </Badge>
                                  )}
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-xs text-muted-foreground line-clamp-1">{review.comment}</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">{review.comment}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {formatDate(review.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(review)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center">
                            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No reviews found matching your criteria</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Review Metrics</CardTitle>
                <CardDescription>
                  Overview of ratings and review statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Rating Distribution</h3>
                    {Object.keys(ratingDistribution).length > 0 ? (
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = ratingDistribution[rating.toString()] || 0
                          const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                          
                          return (
                            <div key={rating} className="flex items-center gap-2">
                              <div className="flex items-center w-16">
                                <span className="font-medium">{rating}</span>
                                <Star className="h-4 w-4 ml-1 fill-amber-500 text-amber-500" />
                              </div>
                              <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="absolute h-full bg-amber-500" 
                                  style={{ width: `${percentage}%` }} 
                                />
                              </div>
                              <div className="w-16 text-right text-sm">{count} ({percentage}%)</div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No rating data available</p>
                      </div>
                    )}
                  </div>
                  
                  {Object.keys(flagDistribution).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3">Flag Level Distribution</h3>
                      <div className="space-y-2">
                        {['green', 'yellow', 'red'].map((flag) => {
                          const count = flagDistribution[flag] || 0
                          const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                          const colors: Record<string, string> = {
                            green: 'bg-green-500',
                            yellow: 'bg-yellow-500',
                            red: 'bg-red-500'
                          }
                          
                          return (
                            <div key={flag} className="flex items-center gap-2">
                              <div className="flex items-center w-16">
                                <Badge className={getFlagBadgeColor(flag)}>
                                  {flag}
                                </Badge>
                              </div>
                              <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`absolute h-full ${colors[flag]}`}
                                  style={{ width: `${percentage}%` }} 
                                />
                              </div>
                              <div className="w-16 text-right text-sm">{count} ({percentage}%)</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Reviews:</span>
                        <span className="font-medium">{totalReviews}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reviewers:</span>
                        <span className="font-medium">{totalUsers}</span>
                      </div>
                      {displayedReviews.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Latest Review:</span>
                          <span className="font-medium">{formatDate(displayedReviews[0].createdAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalReviews)} of {totalReviews} reviews
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageToShow = i + 1
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageToShow = currentPage - 3 + i
                      }
                      if (currentPage > totalPages - 2) {
                        pageToShow = totalPages - 4 + i
                      }
                    }
                    return (
                      <Button
                        key={pageToShow}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setCurrentPage(pageToShow)}
                      >
                        {pageToShow}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Please select a reason for deleting this review. This information will be stored for moderation records.
            </DialogDescription>
          </DialogHeader>
          
          {reviewToDelete && (
            <div className="bg-muted/50 p-3 rounded-md text-sm mb-4">
              <div className="flex justify-between mb-1">
                <p className="font-medium">{reviewToDelete.title}</p>
                <RatingStars rating={reviewToDelete.rating} />
              </div>
              <p className="text-muted-foreground mb-3">{reviewToDelete.comment}</p>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <div className="font-medium flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  <span>By: {getUserDisplayName(reviewToDelete.userId)}</span>
                </div>
                <div className="font-medium flex items-center gap-1.5">
                  <Box className="h-3 w-3" />
                  <span>Product: {reviewToDelete.productId?.title || "Unknown"}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Deletion Reason <span className="text-red-500">*</span>
              </label>
              <Select 
                value={deletionReason} 
                onValueChange={setDeletionReason}
              >
                <SelectTrigger className={deleteError && !deletionReason ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a reason for deletion" />
                </SelectTrigger>
                <SelectContent>
                  {DELETION_REASONS.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {deleteError && !deletionReason && (
                <p className="text-xs text-red-500">{deleteError}</p>
              )}
            </div>
            
            {deletionReason === "other" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Additional Details <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please provide details about the reason for deletion"
                  className={deleteError && deletionReason === "other" && !customReason ? "border-red-500" : ""}
                  rows={3}
                />
                {deleteError && deletionReason === "other" && !customReason && (
                  <p className="text-xs text-red-500">Please provide additional details</p>
                )}
              </div>
            )}

            {deleteError && !(deletionReason === "other" && !customReason) && !(deletionReason === "") && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{deleteError}</p>
              </div>
            )}

            <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Why do we delete reviews?</p>
                <p>Reviews that contain inappropriate content, offensive language, or irrelevant information may be removed to maintain the quality and trustworthiness of our product reviews.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteReview}
              disabled={deleteLoading || !deletionReason || (deletionReason === "other" && !customReason)}
            >
              {deleteLoading ? (
                <>
                  <span className="mr-2">Deleting</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                </>
              ) : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}