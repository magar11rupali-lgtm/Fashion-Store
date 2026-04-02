# Day 11: Professional Admin Dashboard with shadcn/ui

## 🎯 Learning Objectives

By the end of today, you will:
- Create a professional admin dashboard with shadcn/ui
- Display analytics with beautiful card components
- Manage products using data tables
- View and manage orders with dialogs
- Build a polished, production-ready interface

## ⏱️ Estimated Time: 5-6 hours

---

## 📝 Prerequisites

Make sure you've completed [Day 0: shadcn/ui Setup](./day-00-shadcn-setup.md) first!

Required components:
```bash
npx shadcn-ui@latest add button card input label badge dialog sheet table tabs separator skeleton
```

---

## 🎨 Dashboard with shadcn/ui

### Task 1: Create Professional Dashboard Layout

Create `frontend/app/admin/page.js`:

```javascript
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardStats from '@/components/admin/DashboardStats';
import ProductsTable from '@/components/admin/ProductsTable';
import OrdersTable from '@/components/admin/OrdersTable';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your e-commerce store
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductsTable />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersTable />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
```

---

### Task 2: Build Statistics Dashboard

Create `frontend/components/admin/DashboardStats.jsx`:

```jsx
'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  ExternalLink,
  Plus
} from "lucide-react";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const products = await getAllProducts();
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const lowStock = products.filter(p => !p.attributes.inStock).length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        lowStockProducts: lowStock,
      });

      setRecentOrders(orders.slice(-5).reverse());
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      description: `${stats.lowStockProducts} out of stock`,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      description: "All time orders",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      description: "All time revenue",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Avg Order Value",
      value: stats.totalOrders > 0 ? `$${(stats.totalRevenue / stats.totalOrders).toFixed(2)}` : '$0.00',
      description: "Per order average",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Your latest customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
              <p className="text-muted-foreground mt-2">
                Orders will appear here when customers make purchases
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} items • {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">${order.total.toFixed(2)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <CardTitle className="text-lg">Add New Product</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add products to your store
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="http://localhost:1337/admin/content-manager/collectionType/api::product.product/create" target="_blank" rel="noopener noreferrer">
                Open Strapi <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <CardTitle className="text-lg">View All Orders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage customer orders
            </p>
            <Button variant="outline" className="w-full">
              Go to Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle className="text-lg">Strapi Admin</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access Strapi CMS
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="http://localhost:1337/admin" target="_blank" rel="noopener noreferrer">
                Open Strapi <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### Task 3: Create Products Table with shadcn/ui

Create `frontend/components/admin/ProductsTable.jsx`:

```jsx
'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '@/lib/api';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, ExternalLink, Eye, Edit } from "lucide-react";

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      const data = await getAllProducts();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your product inventory ({products.length} total)
            </CardDescription>
          </div>
          <Button asChild>
            <a 
              href="http://localhost:1337/admin/content-manager/collectionType/api::product.product/create"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const { name, category, price, image, inStock } = product.attributes;
                  const imageUrl = image?.data?.attributes?.url
                    ? `http://localhost:1337${image.data.attributes.url}`
                    : '/placeholder.jpg';

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">${price.toFixed(2)}</TableCell>
                      <TableCell>
                        {inStock ? (
                          <Badge variant="default" className="bg-green-500">In Stock</Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/products/${product.id}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={`http://localhost:1337/admin/content-manager/collectionType/api::product.product/${product.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Edit className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Task 4: Create Orders Table with Dialog

Create `frontend/components/admin/OrdersTable.jsx`:

```jsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Eye, Package } from "lucide-react";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders.reverse());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          View and manage customer orders ({orders.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
            <p className="text-muted-foreground mt-2">
              Orders will appear here when customers make purchases
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.customer.email}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.customer.paymentMethod === 'cod' ? 'COD' : 'Card'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Order #{order.id}</DialogTitle>
                            <DialogDescription>
                              Order details and customer information
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Customer Info */}
                            <div>
                              <h4 className="font-semibold mb-3">Customer Information</h4>
                              <div className="rounded-lg border p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Name:</span>
                                  <span className="font-medium">
                                    {order.customer.firstName} {order.customer.lastName}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Email:</span>
                                  <span>{order.customer.email}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Phone:</span>
                                  <span>{order.customer.phone}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Address:</span>
                                  <span className="text-right">
                                    {order.customer.address}, {order.customer.city}<br />
                                    {order.customer.postalCode}, {order.customer.country}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold mb-3">Order Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="rounded-lg border p-4 flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Size: {item.size} • Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <p className="font-semibold">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div>
                              <h4 className="font-semibold mb-3">Order Summary</h4>
                              <div className="rounded-lg border p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Payment Method:</span>
                                  <Badge variant="outline">
                                    {order.customer.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                                  </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Order Date:</span>
                                  <span>{new Date(order.date).toLocaleString()}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                  <span>Total:</span>
                                  <span>${order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 Professional Features Added

### Design Improvements

1. **Consistent Design System**
   - All components use shadcn/ui
   - Consistent spacing and typography
   - Professional color scheme

2. **Better UX**
   - Loading skeletons
   - Empty states with icons
   - Hover effects
   - Smooth transitions

3. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus indicators

4. **Responsive Design**
   - Mobile-first approach
   - Adaptive layouts
   - Touch-friendly buttons

---

## ✅ Testing Checklist

- [ ] Dashboard loads with professional design
- [ ] Stats cards display with icons
- [ ] Recent orders show correctly
- [ ] Quick actions cards work
- [ ] Products table displays properly
- [ ] Search filters products
- [ ] Product images load
- [ ] Stock badges show correct status
- [ ] Orders table displays all orders
- [ ] Order details dialog opens
- [ ] Dialog shows complete information
- [ ] All buttons have hover states
- [ ] Loading states show skeletons
- [ ] Empty states display correctly
- [ ] Responsive on all screen sizes

---

## 🎉 Result

You now have a **professional, production-ready admin dashboard** with:

✅ Beautiful shadcn/ui components  
✅ Consistent design system  
✅ Accessible interface  
✅ Professional animations  
✅ Responsive layout  
✅ Loading states  
✅ Empty states  
✅ Icon integration  

This dashboard looks like it was built by a professional development team!

---

[← Day 10: Deployment](./day-10-deployment.md) | [Back to Overview](./README.md)
