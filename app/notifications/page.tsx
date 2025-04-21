import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageSquare, Heart, User, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function NotificationsPage() {
  return (
    <div className="space-y-6 pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">Stay updated with your latest activity</p>
        </div>
        <Button variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mentions">
            Mentions
            <Badge className="ml-2 bg-primary text-primary-foreground" variant="secondary">
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {[
            {
              id: 1,
              type: "mention",
              user: "Alex Johnson",
              action: "mentioned you in a comment",
              time: "2 minutes ago",
              read: false,
              icon: User,
            },
            {
              id: 2,
              type: "comment",
              user: "Sarah Miller",
              action: "commented on your post",
              time: "1 hour ago",
              read: false,
              icon: MessageSquare,
            },
            {
              id: 3,
              type: "like",
              user: "David Wilson",
              action: "liked your photo",
              time: "3 hours ago",
              read: true,
              icon: Heart,
            },
            {
              id: 4,
              type: "system",
              user: "System",
              action: "Your account was successfully updated",
              time: "1 day ago",
              read: true,
              icon: Bell,
            },
            {
              id: 5,
              type: "reminder",
              user: "Reminder",
              action: "You have an upcoming event tomorrow",
              time: "1 day ago",
              read: true,
              icon: Clock,
            },
          ].map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-70" : ""}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${notification.user.charAt(0)}`} />
                    <AvatarFallback>{notification.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                    <notification.icon className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{notification.user}</p>
                    {!notification.read && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.action}</p>
                  <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mentions" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40&text=A" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Alex Johnson</p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    New
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">mentioned you in a comment</p>
                <p className="text-xs text-muted-foreground mt-2">2 minutes ago</p>
              </div>
            </CardContent>
          </Card>
          <p className="text-center text-muted-foreground py-4">No more mentions</p>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40&text=S" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Sarah Miller</p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    New
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">commented on your post</p>
                <p className="text-xs text-muted-foreground mt-2">1 hour ago</p>
              </div>
            </CardContent>
          </Card>
          <p className="text-center text-muted-foreground py-4">No more comments</p>
        </TabsContent>

        <TabsContent value="likes" className="mt-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40&text=D" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">David Wilson</p>
                <p className="text-sm text-muted-foreground mt-1">liked your photo</p>
                <p className="text-xs text-muted-foreground mt-2">3 hours ago</p>
              </div>
            </CardContent>
          </Card>
          <p className="text-center text-muted-foreground py-4">No more likes</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

