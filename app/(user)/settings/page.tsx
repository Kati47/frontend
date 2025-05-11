"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, Lock, Mail, User as UserIcon, Phone, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

// Define user profile type based on your model
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
  isAdmin: boolean;
}

export default function SettingsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Get auth token from localStorage
  const getAuthToken = () => {
    try {
      return localStorage.getItem("token") || "";
    } catch (err) {
      console.error("Error accessing localStorage:", err);
      return "";
    }
  };

  // Get user ID from localStorage or session
  useEffect(() => {
    try {
      // Usually you would store the user ID when logging in
      const id = localStorage.getItem("userId");
      if (id) {
        setUserId(id);
      } else {
        // If not found in localStorage, you might need to get it from session or context
        // For example, if you have user context: setUserId(userContext.id);
        toast({
          title: "Missing User ID",
          description: "User ID not found in storage. Please log in again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error getting user ID:", err);
    }
  }, [toast]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const data = await response.json();
        setProfile(data);
        setFormData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Could not load your profile. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, toast, API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(`${API_URL}/users/edit/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "We couldn't update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && userId) {
    return <div className="flex items-center justify-center h-screen">Loading profile...</div>;
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to view your profile</p>
        <Button onClick={() => window.location.href = "/login"}>
          Go to Login
        </Button>
      </div>
    );
  }

  // Generate avatar fallback initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-0 pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your profile details and contact information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-5">
            {/* Profile Avatar Section */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div>
                <Avatar className="h-28 w-28 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {profile?.name ? getInitials(profile.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-medium text-lg">{profile?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.email}
                </p>
                {profile?.isAdmin && (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                    Administrator
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Personal Details */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input 
                  id="name" 
                  value={formData.name || ""} 
                  onChange={handleChange}
                  className="h-10" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Phone Number
                </Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="h-10" 
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="h-10" 
                  required 
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed directly for security reasons.
                </p>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Address Information
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium">
                    Street Address
                  </Label>
                  <Input 
                    id="street" 
                    value={formData.street || ""}
                    onChange={handleChange}
                    className="h-10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment" className="text-sm font-medium">
                    Apartment/Suite
                  </Label>
                  <Input 
                    id="apartment" 
                    value={formData.apartment || ""}
                    onChange={handleChange}
                    className="h-10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input 
                    id="city" 
                    value={formData.city || ""}
                    onChange={handleChange}
                    className="h-10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm font-medium">
                    Postal Code
                  </Label>
                  <Input 
                    id="postalCode" 
                    value={formData.postalCode || ""}
                    onChange={handleChange}
                    className="h-10" 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country
                  </Label>
                  <Input 
                    id="country" 
                    value={formData.country || ""}
                    onChange={handleChange}
                    className="h-10" 
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Password Change Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Password & Security
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-medium">
                    Current Password
                  </Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-10" 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-10" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave password fields empty if you don't want to change it.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Communication Preferences */}
            <div className="space-y-4">
              <h3 className="font-medium text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails" className="text-sm font-medium">
                      Marketing emails
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive emails about new products, features, and offers
                    </p>
                  </div>
                  <Switch id="marketing-emails" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="account-emails" className="text-sm font-medium">
                      Account emails
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive emails about your account activity and security
                    </p>
                  </div>
                  <Switch id="account-emails" defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4 bg-muted/20">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="min-w-[120px]">
              {isUpdating ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}