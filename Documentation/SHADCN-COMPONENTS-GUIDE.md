# shadcn/ui Components Reference Guide

A comprehensive guide to using shadcn/ui components in your Fashion E-Commerce project.

## 📚 Table of Contents

- [Installation](#installation)
- [Core Components](#core-components)
- [Form Components](#form-components)
- [Data Display](#data-display)
- [Feedback Components](#feedback-components)
- [Layout Components](#layout-components)
- [Navigation Components](#navigation-components)
- [Common Patterns](#common-patterns)

---

## 🚀 Installation

### Initial Setup

```bash
cd frontend
npx shadcn-ui@latest init
```

### Install Components

```bash
# Essential components for e-commerce
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add select
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
```

---

## 🎨 Core Components

### Button

**Usage in E-Commerce:**
- Add to Cart buttons
- Checkout buttons
- Navigation actions
- Form submissions

```jsx
import { Button } from "@/components/ui/button"

// Primary action (Add to Cart)
<Button>Add to Cart</Button>

// Secondary action
<Button variant="secondary">Continue Shopping</Button>

// Outline style
<Button variant="outline">View Details</Button>

// Destructive action (Remove from cart)
<Button variant="destructive">Remove</Button>

// Ghost button (subtle actions)
<Button variant="ghost">Cancel</Button>

// Link style
<Button variant="link">Learn More</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// With icon
<Button>
  <ShoppingCart className="mr-2 h-4 w-4" />
  Add to Cart
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Processing...
</Button>
```

### Card

**Usage in E-Commerce:**
- Product cards
- Order summaries
- Dashboard statistics
- Information panels

```jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Product Card
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Classic White T-Shirt</CardTitle>
    <CardDescription>Premium cotton blend</CardDescription>
  </CardHeader>
  <CardContent>
    <img src="/product.jpg" alt="Product" className="w-full rounded-md" />
    <p className="mt-4 text-2xl font-bold">$29.99</p>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Add to Cart</Button>
  </CardFooter>
</Card>

// Stats Card (Dashboard)
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
  </CardContent>
</Card>
```

### Badge

**Usage in E-Commerce:**
- Stock status
- Category labels
- Order status
- Discount tags

```jsx
import { Badge } from "@/components/ui/badge"

// Stock status
<Badge variant="default" className="bg-green-500">In Stock</Badge>
<Badge variant="destructive">Out of Stock</Badge>

// Category
<Badge variant="secondary">T-Shirts</Badge>

// Order status
<Badge variant="outline">Pending</Badge>

// Sale badge
<Badge className="bg-red-500">Sale</Badge>

// Custom colors
<Badge className="bg-purple-500">New Arrival</Badge>
```

---

## 📝 Form Components

### Input & Label

**Usage in E-Commerce:**
- Search bars
- Checkout forms
- Login forms
- Product filters

```jsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Basic input
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>

// Search bar
<div className="relative">
  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Search products..."
    className="pl-10"
  />
</div>

// With error state
<div className="space-y-2">
  <Label htmlFor="name">Name</Label>
  <Input 
    id="name" 
    className={errors.name ? "border-red-500" : ""}
  />
  {errors.name && (
    <p className="text-sm text-red-500">{errors.name}</p>
  )}
</div>
```

### Select

**Usage in E-Commerce:**
- Size selection
- Quantity selection
- Sorting options
- Filter dropdowns

```jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Size selector
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select size" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="xs">Extra Small</SelectItem>
    <SelectItem value="s">Small</SelectItem>
    <SelectItem value="m">Medium</SelectItem>
    <SelectItem value="l">Large</SelectItem>
    <SelectItem value="xl">Extra Large</SelectItem>
  </SelectContent>
</Select>

// Sort dropdown
<Select onValueChange={(value) => setSortBy(value)}>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Sort by" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="price-asc">Price: Low to High</SelectItem>
    <SelectItem value="price-desc">Price: High to Low</SelectItem>
    <SelectItem value="name-asc">Name: A to Z</SelectItem>
    <SelectItem value="newest">Newest First</SelectItem>
  </SelectContent>
</Select>
```

---

## 📊 Data Display

### Table

**Usage in E-Commerce:**
- Product lists (admin)
- Order history
- Inventory management

```jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Product</TableHead>
        <TableHead>Price</TableHead>
        <TableHead>Stock</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {products.map((product) => (
        <TableRow key={product.id}>
          <TableCell className="font-medium">{product.name}</TableCell>
          <TableCell>${product.price}</TableCell>
          <TableCell>
            <Badge variant={product.inStock ? "default" : "destructive"}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="sm">Edit</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Separator

**Usage in E-Commerce:**
- Section dividers
- Order summary sections
- Form sections

```jsx
import { Separator } from "@/components/ui/separator"

<div>
  <h3>Shipping Information</h3>
  <Separator className="my-4" />
  <p>Address details...</p>
</div>
```

---

## 💬 Feedback Components

### Dialog

**Usage in E-Commerce:**
- Order details
- Confirmation modals
- Product quick view
- Delete confirmations

```jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

// Order details dialog
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">View Order</Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Order #12345</DialogTitle>
      <DialogDescription>
        Order details and customer information
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {/* Order content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Close</Button>
      <Button>Print Invoice</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Confirmation dialog
<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete Product</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the product.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Sheet

**Usage in E-Commerce:**
- Shopping cart sidebar
- Mobile menu
- Filter panel
- Product details sidebar

```jsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Shopping cart
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">
      <ShoppingCart className="mr-2 h-4 w-4" />
      Cart ({cartItems.length})
    </Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Shopping Cart</SheetTitle>
      <SheetDescription>
        {cartItems.length} items in your cart
      </SheetDescription>
    </SheetHeader>
    <div className="mt-8 space-y-4">
      {cartItems.map((item) => (
        <div key={item.id} className="flex gap-4">
          {/* Cart item */}
        </div>
      ))}
    </div>
    <div className="mt-8">
      <Button className="w-full">Checkout</Button>
    </div>
  </SheetContent>
</Sheet>
```

### Toast

**Usage in E-Commerce:**
- Add to cart confirmation
- Success messages
- Error notifications

```jsx
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

function Component() {
  const { toast } = useToast()

  const addToCart = () => {
    // Add item logic
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart.",
    })
  }

  const showError = () => {
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with your request.",
    })
  }

  return (
    <>
      <Button onClick={addToCart}>Add to Cart</Button>
      <Toaster />
    </>
  )
}
```

### Skeleton

**Usage in E-Commerce:**
- Loading product cards
- Loading tables
- Loading content

```jsx
import { Skeleton } from "@/components/ui/skeleton"

// Loading product card
<Card>
  <CardHeader>
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-[200px] w-full" />
  </CardContent>
</Card>

// Loading table rows
{loading ? (
  <>
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </>
) : (
  <Table>...</Table>
)}
```

---

## 🧭 Navigation Components

### Tabs

**Usage in E-Commerce:**
- Product details (Description, Reviews, Specs)
- Admin dashboard sections
- Account settings

```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Product details tabs
<Tabs defaultValue="description">
  <TabsList>
    <TabsTrigger value="description">Description</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
    <TabsTrigger value="shipping">Shipping</TabsTrigger>
  </TabsList>
  <TabsContent value="description">
    <p>Product description...</p>
  </TabsContent>
  <TabsContent value="reviews">
    <div>Customer reviews...</div>
  </TabsContent>
  <TabsContent value="shipping">
    <p>Shipping information...</p>
  </TabsContent>
</Tabs>

// Admin dashboard
<Tabs defaultValue="overview">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="products">Products</TabsTrigger>
    <TabsTrigger value="orders">Orders</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <DashboardStats />
  </TabsContent>
  <TabsContent value="products">
    <ProductsTable />
  </TabsContent>
  <TabsContent value="orders">
    <OrdersTable />
  </TabsContent>
</Tabs>
```

---

## 🎯 Common E-Commerce Patterns

### Product Card with shadcn/ui

```jsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

<Card className="hover:shadow-lg transition-shadow">
  <CardHeader className="p-0">
    <div className="relative h-64 overflow-hidden rounded-t-lg">
      <Image src={product.image} alt={product.name} fill className="object-cover" />
      {!product.inStock && (
        <Badge variant="destructive" className="absolute top-2 right-2">
          Out of Stock
        </Badge>
      )}
    </div>
  </CardHeader>
  <CardContent className="p-4">
    <Badge variant="secondary" className="mb-2">{product.category}</Badge>
    <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
    <p className="text-2xl font-bold">${product.price}</p>
  </CardContent>
  <CardFooter className="p-4 pt-0">
    <Button className="w-full" disabled={!product.inStock}>
      {product.inStock ? "Add to Cart" : "Out of Stock"}
    </Button>
  </CardFooter>
</Card>
```

### Checkout Form

```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

<Card>
  <CardHeader>
    <CardTitle>Shipping Information</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input id="firstName" placeholder="John" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input id="lastName" placeholder="Doe" />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="john@example.com" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="address">Address</Label>
      <Input id="address" placeholder="123 Main St" />
    </div>
    <Button className="w-full">Place Order</Button>
  </CardContent>
</Card>
```

### Order Summary

```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

<Card>
  <CardHeader>
    <CardTitle>Order Summary</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {cartItems.map((item) => (
      <div key={item.id} className="flex justify-between">
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
        </div>
        <p className="font-semibold">${item.price * item.quantity}</p>
      </div>
    ))}
    <Separator />
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>${subtotal}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span>{shipping === 0 ? "FREE" : `$${shipping}`}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Tax</span>
        <span>${tax}</span>
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>${total}</span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🎨 Customization Tips

### Custom Colors

```jsx
// Use Tailwind classes
<Button className="bg-purple-600 hover:bg-purple-700">
  Custom Color
</Button>

// Or update CSS variables in globals.css
:root {
  --primary: 262.1 83.3% 57.8%; /* Purple */
}
```

### Custom Sizes

```jsx
<Button className="h-12 px-8 text-lg">
  Large Custom Button
</Button>
```

### Combining Components

```jsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Products</CardTitle>
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add New
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <Table>...</Table>
  </CardContent>
</Card>
```

---

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Component Examples](https://ui.shadcn.com/examples)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**This guide covers all the shadcn/ui components you'll use in your e-commerce project!**
