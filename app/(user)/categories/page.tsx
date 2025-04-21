import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

// Mock categories data
const categories = [
  {
    id: "1",
    name: "Bags",
    description: "Stylish and functional bags for every occasion",
    image: "/placeholder.svg?height=400&width=400&text=Bags",
    count: 24,
    subcategories: ["Crossbody Bags", "Tote Bags", "Backpacks", "Clutches", "Shoulder Bags"],
  },
  {
    id: "2",
    name: "Wallets",
    description: "Premium wallets to keep your essentials organized",
    image: "/placeholder.svg?height=400&width=400&text=Wallets",
    count: 18,
    subcategories: ["Bifold Wallets", "Card Holders", "Money Clips", "Travel Wallets"],
  },
  {
    id: "3",
    name: "Accessories",
    description: "Complete your look with our elegant accessories",
    image: "/placeholder.svg?height=400&width=400&text=Accessories",
    count: 32,
    subcategories: ["Keychains", "Luggage Tags", "Passport Holders", "Phone Cases"],
  },
  {
    id: "4",
    name: "Belts",
    description: "Handcrafted belts for both casual and formal wear",
    image: "/placeholder.svg?height=400&width=400&text=Belts",
    count: 12,
    subcategories: ["Dress Belts", "Casual Belts", "Reversible Belts", "Woven Belts"],
  },
  {
    id: "5",
    name: "Watches",
    description: "Timeless watches with premium leather straps",
    image: "/placeholder.svg?height=400&width=400&text=Watches",
    count: 15,
    subcategories: ["Analog Watches", "Digital Watches", "Smartwatches", "Watch Straps"],
  },
  {
    id: "6",
    name: "Travel",
    description: "Leather travel essentials for your journeys",
    image: "/placeholder.svg?height=400&width=400&text=Travel",
    count: 20,
    subcategories: ["Luggage", "Travel Kits", "Passport Covers", "Travel Wallets"],
  },
]

export default function CategoriesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-2">Browse our products by category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.id}`}>
            <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
              <div className="relative aspect-video">
                <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} products</p>
                  </CardContent>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                <div className="flex flex-wrap gap-1">
                  {category.subcategories.slice(0, 3).map((subcategory) => (
                    <span key={subcategory} className="text-xs bg-muted px-2 py-1 rounded-full">
                      {subcategory}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      +{category.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

