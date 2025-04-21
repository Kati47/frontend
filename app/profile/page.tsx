import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Settings, MapPin, Calendar, Mail, LinkIcon } from "lucide-react"
import Image from "next/image"

export default function ProfilePage() {
  return (
    <div className="space-y-6 pb-16">
      <Card>
        <CardContent className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src="/placeholder.svg?height=400&width=1200&text=Cover+Image"
              alt="Cover image"
              fill
              className="object-cover"
            />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-12 sm:-mt-16">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
                <AvatarImage src="/placeholder.svg?height=128&width=128&text=JD" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">Jane Doe</h1>
                    <p className="text-muted-foreground">@janedoe</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p>Product Designer and Developer based in San Francisco</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    janedoe.com
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined March 2020
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    jane@example.com
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="font-bold">1,234</span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-bold">5,678</span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40&text=JD" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Jane Doe</p>
                      <span className="text-muted-foreground">@janedoe</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{i} day ago</span>
                    </div>
                    <p className="mt-2">
                      This is a sample post content. It could be a status update, a thought, or any other content shared
                      by the user on their profile.
                    </p>
                    {i === 1 && (
                      <div className="mt-3 relative rounded-md overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=400&width=600&text=Post+Image"
                          alt="Post image"
                          width={600}
                          height={400}
                          className="object-cover w-full"
                        />
                      </div>
                    )}
                    <div className="flex gap-4 mt-4">
                      <Button variant="ghost" size="sm">
                        Like
                      </Button>
                      <Button variant="ghost" size="sm">
                        Comment
                      </Button>
                      <Button variant="ghost" size="sm">
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden">
                <Image
                  src={`/placeholder.svg?height=300&width=300&text=Media+${i}`}
                  alt={`Media item ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="likes" className="mt-6 space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&text=U${i}`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">User {i}</p>
                      <span className="text-muted-foreground">@user{i}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{i + 1} days ago</span>
                    </div>
                    <p className="mt-2">
                      This is a post that Jane liked. It appears in her likes tab to show content she has engaged with.
                    </p>
                    <div className="flex gap-4 mt-4">
                      <Button variant="ghost" size="sm" className="text-primary">
                        Liked
                      </Button>
                      <Button variant="ghost" size="sm">
                        Comment
                      </Button>
                      <Button variant="ghost" size="sm">
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

