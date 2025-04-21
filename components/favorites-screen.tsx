"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample product data
const initialProducts = [
  {
    id: 1,
    name: "Minimalist Desk Lamp",
    price: "$89.99",
    image: "/placeholder.svg?height=300&width=300",
    favorited: true,
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    price: "$249.99",
    image: "/placeholder.svg?height=300&width=300",
    favorited: true,
  },
  {
    id: 3,
    name: "Wireless Headphones",
    price: "$179.99",
    image: "/placeholder.svg?height=300&width=300",
    favorited: true,
  },
  {
    id: 4,
    name: "Smart Watch Series 5",
    price: "$299.99",
    image: "/placeholder.svg?height=300&width=300",
    favorited: true,
  },
  {
    id: 5,
    name: "Portable Bluetooth Speaker",
    price: "$129.99",
    image: "/placeholder.svg?height=300&width=300",
    favorited: true,
  },
  {
    id: 6,
    name: "Leather Laptop Sleeve",
    price: "$59.99",
    image: "/placeholder.svg?height=300&width=300",
    favorited: true,
  },
]

export default function FavoritesScreen() {
  const [products, setProducts] = useState(initialProducts)
  const [viewType, setViewType] = useState("grid")

  const removeFromFavorites = (id: number) => {
    setProducts(products.filter((product) => product.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="sticky top-0 z-10 bg-background py-4 border-b mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Favorites</h1>
          </div>
          <Tabs value={viewType} onValueChange={setViewType} className="w-auto">
            <TabsList className="grid w-[160px] grid-cols-2">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <AnimatePresence>
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
                  <div className="relative aspect-square">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90"
                      onClick={() => removeFromFavorites(product.id)}
                    >
                      <Heart className="h-5 w-5 fill-primary text-primary" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg line-clamp-1">{product.name}</h3>
                    <p className="text-primary font-semibold mt-1">{product.price}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="flex flex-row">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">{product.name}</h3>
                        <p className="text-primary font-semibold mt-1">{product.price}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-muted"
                        onClick={() => removeFromFavorites(product.id)}
                      >
                        <Heart className="h-5 w-5 fill-primary text-primary" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </AnimatePresence>

      {products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">Items you favorite will appear here</p>
        </div>
      )}
    </div>
  )
}

