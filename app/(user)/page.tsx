"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  Star,
  ShoppingCart,
  Share2,
  BookmarkCheck,
  Package,
  AlertTriangle,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface Product {
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
  model3d?: {
    modelId: string;
  };
  averageRating?: number;
  reviewCount?: number;
  isFavorite: boolean;
  isSavedForLater: boolean;
  isInCart: boolean;
  cartQuantity: number;
}

interface Review {
  rating: number;
  title: string;
  comment: string;
}

// Helper functions
const formatSizes = (sizes: string) => sizes.split(",").map((s) => s.trim());
const formatColors = (colors: string) => colors.split(",").map((c) => c.trim());
const getStockStatus = (product: Product, t: any) => {
  if (!product.inStock) {
    return {
      badge: "destructive",
      text: "outOfStock",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  }
  if (product.quantity <= 5) {
    return {
      badge: "secondary",
      text: "lowStock",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  }
  return {
    badge: "default",
    text: "inStock",
    icon: <Check className="h-4 w-4" />,
  };
};

// Hard-code fake data for demo purposes
const MOCK_PRODUCT = {
  _id: "1",
  title: "Office Chair",
  desc: "Modern ergonomic office chair with adjustable features and premium comfort. Perfect for long working hours with excellent lumbar support and breathable mesh back.",
  img: "/placeholder-product.png",
  categories: ["Furniture", "Office", "Chairs"],
  size: "Standard",
  color: "Black,Gray,Blue",
  price: 299.99,
  inStock: true,
  quantity: 15,
  model3d: {
    modelId: "b228a29fa84544c2be501c295653ffe7", // Sketchfab model ID for the office chair
    format: "sketchfab",
  },
  averageRating: 4.7,
  reviewCount: 28,
  isFavorite: false,
  isSavedForLater: false,
  isInCart: false,
  cartQuantity: 0,
};

const MOCK_REVIEWS = [
  {
    _id: "1",
    username: "OfficeProBuyer",
    rating: 5,
    title: "Perfect Office Chair",
    comment: "Excellent build quality and very comfortable for long working hours. The 3D preview really helped me make the decision!",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    username: "ErgoEnthusiast",
    rating: 4,
    title: "Great Value",
    comment: "Very comfortable and easy to assemble. The adjustable features are great.",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  }
];

interface SketchfabViewerProps {
  modelId: string;
  title?: string;
  height?: string;
  width?: string;
}

function SketchfabViewer({
  modelId,
  title = "Sketchfab Model",
  height = "400px",
  width = "100%",
}: SketchfabViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Clean the model ID to ensure it's just the ID without any URL parts
  const cleanModelId = modelId.includes("/")
    ? modelId.split("/").filter((part) => part.length > 20)[0]
    : modelId;

  useEffect(() => {
    // Handle iframe resize or any initialization if needed
    const handleResize = () => {
      // Any resize handling code if needed
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const embedUrl = `https://sketchfab.com/models/${cleanModelId}/embed`;

  return (
    <div className="sketchfab-embed-wrapper" style={{ height, width }}>
      <iframe
        ref={iframeRef}
        title={title}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0.5rem",
        }}
        src={embedUrl}
      />
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t } = useTranslation();
  const productId = "dfads";
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews] = useState(MOCK_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [userId] = useState<string | null>("demo-user"); // Replace with actual user authentication

  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const incrementQuantity = () =>
    setQuantity((prev) => Math.min(product?.quantity || 1, prev + 1));
  const [newReview, setNewReview] = useState<Review>({
    rating: 5,
    title: "",
    comment: "",
  });

  // Load mock data on mount
  useEffect(() => {
    setProduct(MOCK_PRODUCT);
    setIsLoading(false);
  }, []);

  // Simplified handlers that just update local state
  const handleAddToCart = () => {
    setProduct((prev) =>
      prev ? { ...prev, isInCart: true, cartQuantity: quantity } : null
    );
    toast.success(t("product.addedToCart"));
  };

  const handleToggleFavorite = () => {
    const newValue = !product?.isFavorite;
    setProduct((prev) =>
      prev ? { ...prev, isFavorite: !prev.isFavorite } : null
    );
    toast.success(newValue ? t("product.addToFavorites") : t("product.removeFromFavorites"));
  };

  const handleToggleBookmark = () => {
    const newValue = !product?.isSavedForLater;
    setProduct((prev) =>
      prev ? { ...prev, isSavedForLater: !prev.isSavedForLater } : null
    );
    toast.success(newValue ? t("product.savedForLater") : t("product.removeFromSaved"));
  };

  const handleShare = () => {
    toast.success(t("product.linkCopied"));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("product.reviewSubmitted"));
    setShowReviewForm(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-medium mb-2">
            {t("product.loadingDetails")}
          </h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/shop">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("common.backToShop")}
          </Link>
        </Button>

        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("product.errorLoading")}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/shop">{t("product.browseOtherProducts")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // No product state
  if (!product) {
    return (
      <div className="container py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/shop">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("common.backToShop")}
          </Link>
        </Button>

        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("product.notFound")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("product.notFoundDescription")}
          </p>
          <Button asChild>
            <Link href="/shop">{t("product.browseProducts")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Available sizes and colors
  const availableSizes = formatSizes(product.size);
  const availableColors = formatColors(product.color);

  // Get stock status
  const stockStatus = getStockStatus(product, t);

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          {t("common.home")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          href="/shop"
          className="text-muted-foreground hover:text-foreground"
        >
          {t("common.shop")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="truncate max-w-[200px]">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images and 3D Model Section */}
        <div>
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="image">{t("product.images")}</TabsTrigger>
              {product.model3d && product.model3d.modelId && (
                <TabsTrigger value="3d">{t("product.3dModel")}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="image" className="mt-0">
              <div className="aspect-square relative overflow-hidden rounded-lg border bg-white">
                <Image
                  src={product.img || "/placeholder-product.png"}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </TabsContent>

            {product.model3d && product.model3d.modelId && (
              <TabsContent value="3d" className="mt-0">
                <div className="aspect-square relative overflow-hidden rounded-lg border bg-white">
                  <SketchfabViewer
                    modelId={product.model3d.modelId}
                    title={product.title}
                    height="100%"
                    width="100%"
                  />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>
                    {t("product.interactive3dModelInstructions")}
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      (product.averageRating || 0) >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {product.averageRating?.toFixed(1) || t("product.noRatings")}
                  {product.reviewCount
                    ? ` (${product.reviewCount} ${product.reviewCount === 1 ? t("product.review") : t("product.reviews")})`
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-semibold">
              {t("common.price", { price: product.price.toFixed(2) })}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-muted-foreground mb-4">{product.desc}</p>

            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={
                  stockStatus.badge as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                }
              >
                <span className="flex items-center gap-1">
                  {stockStatus.icon}
                  {t(`product.${stockStatus.text}`)}
                </span>
              </Badge>

              {product.categories && product.categories.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {product.categories.map((category, index) => (
                    <Badge key={index} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="size" className="text-base">
                  {t("product.size")}
                </Label>
                <RadioGroup
                  id="size"
                  className="flex flex-wrap gap-2 mt-2"
                  value={selectedSize || availableSizes[0]}
                  onValueChange={setSelectedSize}
                >
                  {availableSizes.map((size) => (
                    <div key={size}>
                      <RadioGroupItem
                        id={`size-${size}`}
                        value={size}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className={`px-3 py-1 rounded-md cursor-pointer border ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />
            </div>
          )}

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="color" className="text-base">
                  {t("product.color")}
                </Label>
                <RadioGroup
                  id="color"
                  className="flex flex-wrap gap-2 mt-2"
                  value={selectedColor || availableColors[0]}
                  onValueChange={setSelectedColor}
                >
                  {availableColors.map((color) => (
                    <div key={color}>
                      <RadioGroupItem
                        id={`color-${color}`}
                        value={color}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`color-${color}`}
                        className={`px-3 py-1 rounded-md cursor-pointer border ${
                          selectedColor === color
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <Label htmlFor="quantity" className="text-base">
              {t("product.quantity")}
            </Label>
            <div className="flex items-center mt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">{t("product.decrease")}</span>
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantity}
                className="h-9 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value) || value < 1) {
                    setQuantity(1);
                  } else if (value > product.quantity) {
                    setQuantity(product.quantity);
                  } else {
                    setQuantity(value);
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={incrementQuantity}
                disabled={quantity >= product.quantity}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">{t("product.increase")}</span>
              </Button>

              <span className="ml-2 text-sm text-muted-foreground">
                {t("product.available", { count: product.quantity })}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              className="flex-1"
              disabled={!product.inStock || isAddingToCart || product.isInCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("product.adding")}
                </span>
              ) : product.isInCart ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t("product.inCart")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {t("product.addToCart")}
                </span>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className={product.isFavorite ? "text-red-500" : ""}
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    className={`h-4 w-4 ${
                      product.isFavorite ? "fill-red-500" : ""
                    }`}
                  />
                )}
                <span className="sr-only">
                  {product.isFavorite
                    ? t("product.removeFromFavorites")
                    : t("product.addToFavorites")}
                </span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={product.isSavedForLater ? "text-blue-500" : ""}
                onClick={handleToggleBookmark}
                disabled={isTogglingBookmark}
              >
                {isTogglingBookmark ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <BookmarkCheck
                    className={`h-4 w-4 ${
                      product.isSavedForLater ? "fill-blue-500" : ""
                    }`}
                  />
                )}
                <span className="sr-only">
                  {product.isSavedForLater
                    ? t("product.removeFromSaved")
                    : t("product.savedForLater")}
                </span>
              </Button>

              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                <span className="sr-only">{t("product.share")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">{t("product.description")}</TabsTrigger>
            <TabsTrigger value="reviews">
              {t("product.reviews")} {product.reviewCount ? `(${product.reviewCount})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p>{product.desc}</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-8">
              {/* Review Summary */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <h3 className="text-3xl font-bold">
                      {product.averageRating?.toFixed(1) || "0.0"}
                    </h3>
                    <div className="flex items-center my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            (product.averageRating || 0) >= star
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      {t("product.basedOnReviews", { 
                        count: product.reviewCount || 0,
                        reviewText: product.reviewCount === 1 ? t("product.review") : t("product.reviews")
                      })}
                    </p>
                  </div>
                </div>

                <div className="md:w-2/3">
                  {!userReview && userId && (
                    <div>
                      {showReviewForm ? (
                        <Card>
                          <CardHeader>
                            <h3 className="text-lg font-semibold">
                              {t("product.writeReview")}
                            </h3>
                          </CardHeader>
                          <CardContent>
                            <form
                              onSubmit={handleReviewSubmit}
                              className="space-y-4"
                            >
                              <div>
                                <Label htmlFor="rating">{t("product.rating")}</Label>
                                <RadioGroup
                                  id="rating"
                                  className="flex gap-2 mt-2"
                                  value={newReview.rating.toString()}
                                  onValueChange={(value) =>
                                    setNewReview({
                                      ...newReview,
                                      rating: parseInt(value),
                                    })
                                  }
                                >
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <div key={rating}>
                                      <RadioGroupItem
                                        id={`rating-${rating}`}
                                        value={rating.toString()}
                                        className="sr-only"
                                      />
                                      <Label
                                        htmlFor={`rating-${rating}`}
                                        className={`px-3 py-1 rounded-md cursor-pointer border ${
                                          parseInt(
                                            newReview.rating.toString()
                                          ) === rating
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background hover:bg-muted"
                                        }`}
                                      >
                                        {rating}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>

                              <div>
                                <Label htmlFor="title">{t("product.reviewTitle")}</Label>
                                <Input
                                  id="title"
                                  value={newReview.title}
                                  onChange={(e) =>
                                    setNewReview({
                                      ...newReview,
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder={t("product.summarizeReview")}
                                />
                              </div>

                              <div>
                                <Label htmlFor="comment">{t("product.reviewComment")}</Label>
                                <Textarea
                                  id="comment"
                                  value={newReview.comment}
                                  onChange={(e) =>
                                    setNewReview({
                                      ...newReview,
                                      comment: e.target.value,
                                    })
                                  }
                                  placeholder={t("product.writeReviewHere")}
                                  rows={4}
                                  required
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowReviewForm(false)}
                                >
                                  {t("common.cancel")}
                                </Button>
                                <Button type="submit">{t("common.submit")}</Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-center p-6 border rounded-lg">
                          <h3 className="font-medium mb-2">
                            {t("product.shareThoughts")}
                          </h3>
                          <Button onClick={() => setShowReviewForm(true)}>
                            {t("product.writeReview")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Reviews List */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">{t("product.customerReviews")}</h3>

                {reviews.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">
                      {t("product.noReviewsYet")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar>
                            {/* <AvatarImage src={review.userAvatar} /> */}
                            <AvatarFallback>
                              {review.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {review.username || t("product.anonymousUser")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                review.createdAt || ""
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                review.rating >= star
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>

                        {review.title && (
                          <h4 className="font-medium mb-1">{review.title}</h4>
                        )}

                        <p>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}