import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Shield, User, Key, Globe, Upload } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information and how others see you on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80&text=JD" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="font-medium">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    This will be displayed on your profile and throughout the app
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="janedoe" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="jane@example.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Product Designer and Developer based in San Francisco"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="San Francisco, CA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://janedoe.com" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account credentials and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p>Protect your account with 2FA</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-medium text-destructive">Danger Zone</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p>Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all your data</p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Email Notifications", description: "Receive notifications via email" },
                { title: "Push Notifications", description: "Receive notifications on your device" },
                { title: "SMS Notifications", description: "Receive notifications via text message" },
                { title: "In-App Notifications", description: "Receive notifications within the app" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p>{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={i < 2} />
                </div>
              ))}

              <Separator className="my-4" />

              <h3 className="font-medium">Notification Types</h3>
              <div className="space-y-4">
                {[
                  { title: "Comments", description: "When someone comments on your posts" },
                  { title: "Mentions", description: "When someone mentions you in a post" },
                  { title: "Likes", description: "When someone likes your posts" },
                  { title: "Follows", description: "When someone follows you" },
                  { title: "Direct Messages", description: "When you receive a direct message" },
                  { title: "System Updates", description: "Important system updates and announcements" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p>{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Reset to Default</Button>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-medium">Account Privacy</h3>
              <div className="space-y-4">
                {[
                  { title: "Private Account", description: "Only approved followers can see your content" },
                  { title: "Activity Status", description: "Show when you're active on the platform" },
                  { title: "Read Receipts", description: "Let others know when you've read their messages" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p>{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={i === 1} />
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <h3 className="font-medium">Content Visibility</h3>
              <div className="space-y-4">
                {[
                  { title: "Who can see your posts", options: ["Everyone", "Followers", "Only Me"] },
                  { title: "Who can comment on your posts", options: ["Everyone", "Followers", "No One"] },
                  { title: "Who can message you", options: ["Everyone", "Followers", "No One"] },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <Label>{item.title}</Label>
                    <select className="w-full p-2 rounded-md border">
                      {item.options.map((option, j) => (
                        <option key={j} selected={j === 1}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <h3 className="font-medium">Data Usage</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Data Collection",
                    description: "Allow us to collect usage data to improve your experience",
                  },
                  { title: "Personalized Ads", description: "See ads based on your activity and preferences" },
                  { title: "Location Services", description: "Allow access to your location for relevant content" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p>{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={i === 0} />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Customize how the application looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {["Light", "Dark", "System"].map((theme, i) => (
                    <div
                      key={i}
                      className={`border rounded-md p-4 text-center cursor-pointer ${i === 1 ? "border-primary" : ""}`}
                    >
                      <p className="font-medium">{theme}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="font-medium">Accessibility</h3>
              <div className="space-y-4">
                {[
                  { title: "Reduce Motion", description: "Minimize animations and transitions" },
                  { title: "High Contrast", description: "Increase contrast for better visibility" },
                  { title: "Larger Text", description: "Increase the size of text throughout the app" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p>{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={i === 2} />
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <h3 className="font-medium">Layout</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default View</Label>
                  <select className="w-full p-2 rounded-md border">
                    <option>Grid</option>
                    <option selected>List</option>
                    <option>Compact</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p>Compact Navigation</p>
                    <p className="text-sm text-muted-foreground">Use icons only in navigation menus</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Reset to Default</Button>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

