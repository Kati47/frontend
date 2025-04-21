"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Trash2,
  Eye,
  Star
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

// Important: Make sure this matches the API_URL in your .env file
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Review interface to match the backend schema
interface Review {
  _id: string;
  productId: {
    _id: string;
    title: string;
    img?: string;
    price?: number;
  } | string;
  userId: {
    _id: string;
    username?: string;
    img?: string;
  } | string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

// Helper function to get authentication headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

// Star rating options
const ratingOptions = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" }
]

export default function MyReviewsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewDetailDialogOpen, setReviewDetailDialogOpen] = useState(false)
  const [deleteReviewDialogOpen, setDeleteReviewDialogOpen] = useState(false)
  const [itemsPerPage] = useState(10)
  const [currentReview, setCurrentReview] = useState<Review | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState("")
  
  // Get userId from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      toast.error("Please login to view your reviews");
      router.push('/login');
      return;
    }
    console.log("User ID from localStorage:", storedUserId);
    setUserId(storedUserId);
  }, [router]);

  // Fetch user reviews whenever userId, filters or pagination changes
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching reviews for user: ${userId}`);
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', itemsPerPage.toString());
        
        if (ratingFilter !== "all") {
          params.append('rating', ratingFilter);
        }
        
        // Make API call to get user reviews - direct to the correct endpoint
        // The route in reviewRoutes.js is '/user/:userId'
        const endpoint = `${API_URL}/reviews/user/${userId}?${params.toString()}`;
        console.log(`Making request to: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: getAuthHeaders(),
          credentials: 'include' // Important for cookies
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API response error:", response.status, errorText);
          throw new Error(`Server error: ${response.status} - ${errorText || 'Failed to fetch reviews'}`);
        }
        
        const data = await response.json();
        console.log("Reviews data received:", data);
        
        setReviews(data.reviews || []);
        setTotalReviews(data.totalReviews || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        setError(err.message || 'Failed to load your reviews');
        toast.error("Error loading reviews: " + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserReviews();
  }, [userId, currentPage, ratingFilter, itemsPerPage]);

  // Delete a review
  const deleteReview = async (reviewId: string) => {
    try {
      setIsSubmitting(true);
      console.log(`Deleting review: ${reviewId} for user: ${userId}`);
      
      // Fixed endpoint to match your reviewRoutes.js route structure
      const endpoint = `${API_URL}/reviews/${reviewId}?userId=${userId}`;
      console.log(`Making DELETE request to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API delete error:", response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText || 'Failed to delete review'}`);
      }
      
      // Update local state by removing the deleted review
      setReviews(reviews.filter(review => review._id !== reviewId));
      setTotalReviews(prev => prev - 1);
      
      toast.success("Review deleted successfully");
      setDeleteReviewDialogOpen(false);
      setCurrentReview(null);
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View review details
  const viewReviewDetails = (review: Review) => {
    setCurrentReview(review);
    setReviewDetailDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (review: Review) => {
    setCurrentReview(review);
    setDeleteReviewDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? "fill-amber-500 text-amber-500" : "fill-gray-200 text-gray-200"}`} 
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  // Get product details from review object safely
  const getProductDetails = (review: Review) => {
    if (typeof review.productId === 'object' && review.productId !== null) {
      return {
        id: review.productId._id,
        title: review.productId.title || 'Untitled Product',
        image: review.productId.img || '/placeholder-product.png',
        price: review.productId.price
      };
    }
    
    return {
      id: typeof review.productId === 'string' ? review.productId : 'unknown',
      title: 'Product',
      image: '/placeholder-product.png',
      price: 0
    };
  };

  // Filter reviews based on search and rating
  const filteredReviews = reviews.filter(review => {
    const productDetails = getProductDetails(review);
    
    // Filter by search query
    const matchesSearch = searchQuery 
      ? review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        productDetails.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Filter by rating
    const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesRating;
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">My Reviews</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            {ratingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="ml-2">Loading your reviews...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64 text-red-500">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setLoading(true)}
          >
            Try Again
          </Button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-muted-foreground">
          <p className="mb-4">You haven't written any reviews yet.</p>
          <Button onClick={() => router.push('/products')}>
            Browse Products to Review
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-8">
          {filteredReviews.map((review) => {
            const productDetails = getProductDetails(review);
            
            return (
              <Card key={review._id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/4 p-4 flex flex-col items-center justify-center border-r">
                    <div className="h-28 w-28 relative mb-2">
                      <Image 
                        src={productDetails.image}
                        alt={productDetails.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <h3 className="font-medium text-center mb-1">{productDetails.title}</h3>
                    {productDetails.price && (
                      <p className="text-sm text-muted-foreground">${productDetails.price.toFixed(2)}</p>
                    )}
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => router.push(`/product/${productDetails.id}`)}
                    >
                      View Product
                    </Button>
                  </div>
                  
                  <div className="md:w-3/4 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        {renderStarRating(review.rating)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Posted on {formatDate(review.createdAt)}
                      </p>
                    </div>
                    
                    <h4 className="text-xl font-bold mb-2">{review.title}</h4>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{review.comment}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Photos:</p>
                        <div className="flex gap-2 flex-wrap">
                          {review.images.map((img, i) => (
                            <div key={i} className="h-16 w-16 relative">
                              <Image 
                                src={img || "/placeholder.png"} 
                                alt={`Review image ${i+1}`}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => viewReviewDetails(review)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => openDeleteDialog(review)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filteredReviews.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={isSubmitting}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isSubmitting}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Review Details Dialog */}
      {currentReview && (
        <Dialog open={reviewDetailDialogOpen} onOpenChange={setReviewDetailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
              <DialogDescription>
                Your review for {getProductDetails(currentReview).title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  {renderStarRating(currentReview.rating)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Posted on {formatDate(currentReview.createdAt)}
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{currentReview.title}</h3>
                  <p className="mt-2">{currentReview.comment}</p>
                </div>
                
                {currentReview.images && currentReview.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Your Photos:</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {currentReview.images.map((img, i) => (
                        <div key={i} className="relative aspect-square">
                          <Image 
                            src={img || "/placeholder.png"} 
                            alt={`Review image ${i+1}`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-muted p-4 rounded-lg mt-4">
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 relative flex-shrink-0">
                    <Image 
                      src={getProductDetails(currentReview).image} 
                      alt={getProductDetails(currentReview).title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{getProductDetails(currentReview).title}</h4>
                    <Button 
                      variant="link" 
                      className="px-0 h-auto"
                      onClick={() => {
                        setReviewDetailDialogOpen(false);
                        router.push(`/product/${getProductDetails(currentReview).id}`);
                      }}
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={() => {
                  setReviewDetailDialogOpen(false);
                  openDeleteDialog(currentReview);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Review
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setReviewDetailDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Review Dialog */}
      {currentReview && (
        <Dialog open={deleteReviewDialogOpen} onOpenChange={setDeleteReviewDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Review</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this review? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{getProductDetails(currentReview).title}</h4>
                  <div>{renderStarRating(currentReview.rating)}</div>
                </div>
                <p className="font-medium text-sm">{currentReview.title}</p>
                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                  {currentReview.comment}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteReviewDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => deleteReview(currentReview._id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                    Deleting...
                  </>
                ) : "Delete Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}