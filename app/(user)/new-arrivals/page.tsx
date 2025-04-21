import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/product/product-card"

// Mock new arrivals data
const newArrivals = [
  {
    id: "101",
    name: "Premium Leather Messenger Bag",
    price: 199.99,
    rating: 4.9,
    reviewCount: 12,
    image: "/placeholder.svg?height=400&width=400&text=Messenger+Bag",
    isFavorite: false,
    isNew: true,
  },
  {
    id: "102",
    name: "Handcrafted Leather Journal",
    price: 49.99,
    rating: 4.8,
    reviewCount: 8,
    image: "/placeholder.svg?height=400&width=400&text=Journal",
    isFavorite: false,
    isNew: true,
  },
  {
    id: "103",
    name: "Leather AirPods Case",
    price: 29.99,
    rating: 4.7,
    reviewCount: 15,
    image: "/placeholder.svg?height=400&width=400&text=AirPods+Case",
    isFavorite: true,
    isNew: true,
  },
  {
    id: "104",
    name: "Minimalist Leather Card Holder",
    price: 39.99,
    rating: 4.9,
    reviewCount: 7,
    image: "/placeholder.svg?height=400&width=400&text=Card+Holder",
    isFavorite: false,
    isNew: true,
  },
  {
    id: "105",
    name: "Leather Desk Mat",
    price: 79.99,
    rating: 4.8,
    reviewCount: 5,
    image: "/placeholder.svg?height=400&width=400&text=Desk+Mat",
    isFavorite: false,
    isNew: true,
  },
  {
    id: "106",
    name: "Leather Laptop Sleeve",
    price: 89.99,
    rating: 4.6,
    reviewCount: 9,
    image: "/placeholder.svg?height=400&width=400&text=Laptop+Sleeve",
    isFavorite: false,
    isNew: true,
  },
  {
    id: "107",
    name: "Leather Watch Roll",
    price: 69.99,
    rating: 4.7,
    reviewCount: 3,
    image: "/placeholder.svg?height=400&width=400&text=Watch+Roll",
    isFavorite: false,
    isNew: true,
  },
  {
    id: "108",
    name: "Leather Cable Organizer",
    price: 24.99,
    rating: 4.5,
    reviewCount: 11,
    image: "/placeholder.svg?height=400&width=400&text=Cable+Organizer",
    isFavorite: false,
    isNew: true,
  },
]

export default function NewArrivalsPage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="relative h-[300px] rounded-lg overflow-hidden mb-8">
        <Image
          src="/placeholder.svg?height=300&width=1200&text=New+Arrivals"
          alt="New Arrivals"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20 flex items-center">
          <div className="p-8">
            <Badge className="mb-2">Just Landed</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">New Arrivals</h1>
            <p className="text-lg text-muted-foreground max-w-md mb-6">
              Discover our latest collection of premium leather goods, crafted with the finest materials.
            </p>
            <Button asChild>
              <Link href="#products">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Featured New Arrival */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured New Arrival</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=600&width=600&text=Featured+Product"
              alt="Featured New Arrival"
              fill
              className="object-cover"
            />
            <Badge className="absolute top-4 left-4">New</Badge>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Limited Edition Leather Weekender Bag</h3>
            <p className="text-xl font-semibold text-primary">$299.99</p>
            <p className="text-muted-foreground">
              Our new limited edition weekender bag is perfect for short trips and weekend getaways. Crafted from
              full-grain leather with solid brass hardware, this bag is designed to last a lifetime and develop a
              beautiful patina over time.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Premium full-grain leather</li>
              <li>• Solid brass hardware</li>
              <li>• Cotton canvas lining</li>
              <li>• Multiple interior pockets</li>
              <li>• Adjustable shoulder strap</li>
            </ul>
            <div className="flex gap-4 pt-4">
              <Button size="lg">Add to Cart</Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/product/featured">View Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* All New Arrivals */}
      <div id="products">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All New Arrivals</h2>
          <Button variant="outline" asChild>
            <Link href="/shop" className="flex items-center gap-2">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <div key={product.id} className="relative">
              {product.isNew && <Badge className="absolute top-2 left-2 z-10">New</Badge>}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
        <div className="relative h-[200px] rounded-lg overflow-hidden">
          <Image
            src="/placeholder.svg?height=200&width=1200&text=Coming+Soon"
            alt="Coming Soon"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20 flex items-center">
            <div className="p-8">
              <h3 className="text-xl font-bold mb-2">Fall Collection 2023</h3>
              <p className="text-muted-foreground mb-4">
                Our new Fall Collection is coming soon. Sign up for our newsletter to be the first to know when it
                launches.
              </p>
              <Button variant="outline">Get Notified</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

