import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/product/product-card"

// Mock sale products data
const saleProducts = [
  {
    id: "201",
    name: "Classic Leather Tote",
    price: 99.99,
    originalPrice: 149.99,
    discount: 33,
    rating: 4.7,
    reviewCount: 42,
    image: "/placeholder.svg?height=400&width=400&text=Tote",
    isFavorite: false,
  },
  {
    id: "202",
    name: "Vintage Leather Messenger Bag",
    price: 129.99,
    originalPrice: 179.99,
    discount: 28,
    rating: 4.8,
    reviewCount: 36,
    image: "/placeholder.svg?height=400&width=400&text=Messenger",
    isFavorite: true,
  },
  {
    id: "203",
    name: "Slim Leather Wallet",
    price: 39.99,
    originalPrice: 59.99,
    discount: 33,
    rating: 4.9,
    reviewCount: 58,
    image: "/placeholder.svg?height=400&width=400&text=Wallet",
    isFavorite: false,
  },
  {
    id: "204",
    name: "Leather Belt Bundle",
    price: 69.99,
    originalPrice: 99.99,
    discount: 30,
    rating: 4.6,
    reviewCount: 27,
    image: "/placeholder.svg?height=400&width=400&text=Belts",
    isFavorite: false,
  },
  {
    id: "205",
    name: "Leather Watch Strap Set",
    price: 49.99,
    originalPrice: 79.99,
    discount: 38,
    rating: 4.7,
    reviewCount: 31,
    image: "/placeholder.svg?height=400&width=400&text=Watch+Straps",
    isFavorite: false,
  },
  {
    id: "206",
    name: "Leather Keychain",
    price: 14.99,
    originalPrice: 24.99,
    discount: 40,
    rating: 4.5,
    reviewCount: 19,
    image: "/placeholder.svg?height=400&width=400&text=Keychain",
    isFavorite: false,
  },
  {
    id: "207",
    name: "Leather Passport Holder",
    price: 29.99,
    originalPrice: 44.99,
    discount: 33,
    rating: 4.8,
    reviewCount: 22,
    image: "/placeholder.svg?height=400&width=400&text=Passport",
    isFavorite: false,
  },
  {
    id: "208",
    name: "Leather Luggage Tag",
    price: 19.99,
    originalPrice: 29.99,
    discount: 33,
    rating: 4.6,
    reviewCount: 15,
    image: "/placeholder.svg?height=400&width=400&text=Luggage+Tag",
    isFavorite: false,
  },
]

// Group products by discount range
const dealsByDiscount = {
  "30% Off or More": saleProducts.filter((p) => p.discount >= 30),
  "20% Off or More": saleProducts.filter((p) => p.discount >= 20),
  "All Deals": saleProducts,
}

export default function SalePage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="relative h-[300px] rounded-lg overflow-hidden mb-8">
        <Image
          src="/placeholder.svg?height=300&width=1200&text=Summer+Sale"
          alt="Summer Sale"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20 flex items-center">
          <div className="p-8">
            <Badge className="mb-2 bg-blue-600 hover:bg-blue-700">Limited Time</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Summer Sale</h1>
            <p className="text-lg text-muted-foreground max-w-md mb-6">
              Up to 40% off on selected leather goods. Hurry while supplies last!
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Sale ends in: 3 days 12:45:30</span>
            </div>
            <Button asChild>
              <Link href="#deals">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Deals */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {saleProducts.slice(0, 3).map((product) => (
            <div key={product.id} className="relative">
              <Badge className="absolute top-2 left-2 z-10 bg-blue-600 hover:bg-blue-700">
                {product.discount}% OFF
              </Badge>
              <ProductCard
                product={{
                  ...product,
                  price: product.price,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* All Deals */}
      <div id="deals">
        <h2 className="text-2xl font-bold mb-6">All Deals</h2>

        <Tabs defaultValue="All Deals" className="mb-6">
          <TabsList>
            {Object.keys(dealsByDiscount).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(dealsByDiscount).map(([category, products]) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="relative">
                    <Badge className="absolute top-2 left-2 z-10 bg-blue-600 hover:bg-blue-700">
                      {product.discount}% OFF
                    </Badge>
                    <ProductCard
                      product={{
                        ...product,
                        price: product.price,
                      }}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Sale Information */}
      <div className="mt-12 bg-muted rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Sale Information</h3>
        <div className="space-y-2 text-muted-foreground">
          <p>• Sale runs from July 1 to July 15, 2023</p>
          <p>• Discounts apply to selected items only</p>
          <p>• Cannot be combined with other offers or promotions</p>
          <p>• Free shipping on all orders over $50</p>
          <p>• All sales are final, no returns or exchanges on sale items</p>
        </div>
      </div>
    </div>
  )
}

