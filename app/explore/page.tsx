import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Grid, List } from "lucide-react"
import Image from "next/image"

export default function ExplorePage() {
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
        <p className="text-muted-foreground mt-2">Discover new content and trending topics</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search for content..." className="pl-10" />
      </div>

      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Trending Now</h2>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={`/placeholder.svg?height=300&width=400&text=Image+${i}`}
                    alt={`Trending item ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Trending Topic {i}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    A brief description of this trending topic that people are talking about.
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <span className="text-xs text-muted-foreground">2.5k views</span>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-48 sm:h-auto sm:w-48">
                    <Image
                      src={`/placeholder.svg?height=300&width=300&text=Image+${i}`}
                      alt={`Trending item ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col">
                    <h3 className="font-semibold">Trending Topic {i}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex-1">
                      A more detailed description of this trending topic that people are talking about. This format
                      allows for more content to be displayed in a list view.
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">2.5k views</span>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

