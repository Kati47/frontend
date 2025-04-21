import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Upload, Plus, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input id="product-name" placeholder="e.g. Modern Leather Sofa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sku">SKU</Label>
                  <Input id="product-sku" placeholder="e.g. SOFA-LTH-001" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select>
                    <SelectTrigger id="product-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sofas">Sofas & Couches</SelectItem>
                      <SelectItem value="chairs">Chairs</SelectItem>
                      <SelectItem value="tables">Tables</SelectItem>
                      <SelectItem value="beds">Beds & Mattresses</SelectItem>
                      <SelectItem value="storage">Storage & Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-subcategory">Subcategory</Label>
                  <Select>
                    <SelectTrigger id="product-subcategory">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leather">Leather Sofas</SelectItem>
                      <SelectItem value="fabric">Fabric Sofas</SelectItem>
                      <SelectItem value="sectional">Sectional Sofas</SelectItem>
                      <SelectItem value="sleeper">Sleeper Sofas</SelectItem>
                      <SelectItem value="loveseat">Loveseats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Short Description</Label>
                <Textarea
                  id="product-description"
                  placeholder="Brief description of the product"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-full-description">Full Description</Label>
                <Textarea
                  id="product-full-description"
                  placeholder="Detailed description with features, materials, dimensions, etc."
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save as Draft</Button>
              <Button>Save and Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload high-quality images of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">Drag and drop your images here</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    or click to browse files (PNG, JPG, WEBP up to 5MB each)
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="relative group">
                      <div className="relative aspect-square rounded-md overflow-hidden border">
                        <Image
                          src={`/placeholder.svg?height=200&width=200&text=Image+${i}`}
                          alt={`Product image ${i}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {i === 1 && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="relative aspect-square rounded-md overflow-hidden border border-dashed flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <Button>Save and Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>Set pricing information and manage inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regular-price">Regular Price ($)</Label>
                  <Input id="regular-price" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-price">Sale Price ($)</Label>
                  <Input id="sale-price" type="number" placeholder="0.00" />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost-price">Cost Price ($)</Label>
                  <Input id="cost-price" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-class">Tax Class</Label>
                  <Select>
                    <SelectTrigger id="tax-class">
                      <SelectValue placeholder="Select tax class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Rate</SelectItem>
                      <SelectItem value="reduced">Reduced Rate</SelectItem>
                      <SelectItem value="zero">Zero Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock-quantity">Stock Quantity</Label>
                  <Input id="stock-quantity" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                  <Input id="low-stock-threshold" type="number" placeholder="5" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock-status">Stock Status</Label>
                  <Select>
                    <SelectTrigger id="stock-status">
                      <SelectValue placeholder="Select stock status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      <SelectItem value="backorder">On Backorder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse-location">Warehouse Location</Label>
                  <Select>
                    <SelectTrigger id="warehouse-location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Warehouse</SelectItem>
                      <SelectItem value="east">East Coast Warehouse</SelectItem>
                      <SelectItem value="west">West Coast Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <Button>Save and Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Add specifications and additional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (inches)</Label>
                  <Input id="width" type="number" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input id="height" type="number" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depth">Depth (inches)</Label>
                  <Input id="depth" type="number" placeholder="0.0" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input id="material" placeholder="e.g. Leather, Wood, Metal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" placeholder="e.g. Brown, Black, Natural" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Key Features</Label>
                <Textarea id="features" placeholder="List the main features of the product" className="min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label>Additional Specifications</Label>
                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Input placeholder="Specification name" className="flex-1" />
                    <Input placeholder="Specification value" className="flex-1" />
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <Input placeholder="Specification name" className="flex-1" />
                    <Input placeholder="Specification value" className="flex-1" />
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Specification
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty Information</Label>
                <Input id="warranty" placeholder="e.g. 2 Year Limited Warranty" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <Button>Save and Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Configure shipping details for this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input id="weight" type="number" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-class">Shipping Class</Label>
                  <Select>
                    <SelectTrigger id="shipping-class">
                      <SelectValue placeholder="Select shipping class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="bulky">Bulky Items</SelectItem>
                      <SelectItem value="fragile">Fragile</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assembly-required">Assembly Required</Label>
                <Select>
                  <SelectTrigger id="assembly-required">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="partial">Partial Assembly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-time">Estimated Delivery Time</Label>
                <Select>
                  <SelectTrigger id="delivery-time">
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1-3 Business Days</SelectItem>
                    <SelectItem value="3-5">3-5 Business Days</SelectItem>
                    <SelectItem value="5-7">5-7 Business Days</SelectItem>
                    <SelectItem value="7-14">7-14 Business Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping-notes">Special Shipping Notes</Label>
                <Textarea
                  id="shipping-notes"
                  placeholder="Any special instructions for shipping this product"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <Button>Save Product</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

