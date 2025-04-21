"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Share, Star, ShoppingCart, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function DetailsScreen() {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <header className="sticky top-0 z-10 bg-background py-4 border-b mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="relative aspect-square w-full mb-6 bg-muted rounded-lg overflow-hidden">
        <Image
          src="/placeholder.svg?height=600&width=600"
          alt="Premium Wireless Headphones"
          fill
          className="object-cover"
        />
        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">New</Badge>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">Premium Wireless Headphones</h1>
            <p className="text-2xl font-bold text-primary">$299.99</p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">(128 reviews)</span>
          </div>
        </div>

        <p className="text-muted-foreground">
          Experience immersive sound with our premium wireless headphones. Featuring active noise cancellation, 40-hour
          battery life, and ultra-comfortable ear cushions for extended listening sessions.
        </p>

        <div className="flex gap-4">
          <Button className="flex-1" size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button variant="secondary" className="flex-1" size="lg">
            Buy Now
          </Button>
        </div>

        <Separator />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger>Product Details</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>Active Noise Cancellation technology</li>
                <li>40-hour battery life</li>
                <li>Bluetooth 5.2 connectivity</li>
                <li>Memory foam ear cushions</li>
                <li>Built-in microphone for calls</li>
                <li>Touch controls for volume and playback</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="specifications">
            <AccordionTrigger>Specifications</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Weight</div>
                <div>250g</div>
                <div className="text-muted-foreground">Dimensions</div>
                <div>7.5 x 6.5 x 4.0 inches</div>
                <div className="text-muted-foreground">Driver Size</div>
                <div>40mm</div>
                <div className="text-muted-foreground">Frequency Response</div>
                <div>20Hz - 20kHz</div>
                <div className="text-muted-foreground">Impedance</div>
                <div>32 Ohms</div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping & Returns</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground mb-2">
                Free shipping on all orders over $100. Delivery within 3-5 business days.
              </p>
              <p className="text-muted-foreground">
                30-day money-back guarantee. Return shipping is free for defective items.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((review) => (
              <Card key={review}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                      <AvatarFallback>{`U${review}`}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">User {review}</h4>
                        <span className="text-xs text-muted-foreground">2 weeks ago</span>
                      </div>
                      <div className="flex mb-2">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < 5 - (review % 2) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                            />
                          ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        These headphones exceeded my expectations. The sound quality is exceptional, and the noise
                        cancellation works perfectly. Very comfortable for long listening sessions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Reviews
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10">
        <div className="max-w-3xl mx-auto flex gap-4">
          <Button className="flex-1" size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button variant="secondary" className="flex-1" size="lg">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  )
}

