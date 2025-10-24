import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Store, Truck, Package, BarChart3, LogOut, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { signOut, user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalUsers: 1247,
    totalRestaurants: 89,
    activeDeliveryPartners: 156,
    todayOrders: 342,
    pendingApprovals: 12
  };

  const pendingRestaurants = [
    {
      id: 1,
      name: 'New Pizza Place',
      owner: 'Mario Rossi',
      category: 'Italian',
      applied: '2 days ago',
      documents: 'Complete'
    },
    {
      id: 2,
      name: 'Healthy Bites',
      owner: 'Sarah Green',
      category: 'Healthy Food',
      applied: '1 day ago',
      documents: 'Pending FSSAI'
    }
  ];

  const pendingDeliveryPartners = [
    {
      id: 1,
      name: 'Raj Kumar',
      vehicle: 'Motorcycle',
      license: 'DL1234567890',
      applied: '3 hours ago',
      documents: 'Complete'
    },
    {
      id: 2,
      name: 'Amit Singh',
      vehicle: 'Bicycle',
      license: 'DL0987654321',
      applied: '1 day ago',
      documents: 'Pending verification'
    }
  ];

  const recentOrders = [
    {
      id: 'ORD001',
      customer: 'John Doe',
      restaurant: 'Pizza Palace',
      amount: '₹598',
      status: 'delivered',
      time: '5 min ago'
    },
    {
      id: 'ORD002',
      customer: 'Jane Smith',
      restaurant: 'Burger Hub',
      amount: '₹349',
      status: 'in_transit',
      time: '12 min ago'
    },
    {
      id: 'ORD003',
      customer: 'Mike Johnson',
      restaurant: 'Spice Garden',
      amount: '₹425',
      status: 'preparing',
      time: '18 min ago'
    }
  ];

  const handleApproval = (type: string, id: number, action: 'approve' | 'reject') => {
    console.log(`${action} ${type} with id ${id}`);
  };

  const handleLogout = async () => {
    await signOut();
    // Redirect to role-specific login page based on current user role
    switch (userRole) {
      case 'customer':
        navigate('/login/customer');
        break;
      case 'delivery_partner':
        navigate('/login/delivery');
        break;
      case 'restaurant_owner':
        navigate('/login/restaurant');
        break;
      case 'admin':
        navigate('/login');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, Administrator
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{stats.totalUsers}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Restaurants</CardDescription>
              <CardTitle className="text-2xl text-green-fresh">{stats.totalRestaurants}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Delivery Partners</CardDescription>
              <CardTitle className="text-2xl text-yellow-accent">{stats.activeDeliveryPartners}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today's Orders</CardDescription>
              <CardTitle className="text-2xl text-orange-primary">{stats.todayOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Approvals</CardDescription>
              <CardTitle className="text-2xl text-destructive">{stats.pendingApprovals}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pending Restaurant Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Pending Restaurant Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingRestaurants.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{restaurant.name}</h4>
                          <p className="text-sm text-muted-foreground">Owner: {restaurant.owner}</p>
                          <p className="text-sm text-muted-foreground">{restaurant.category} • {restaurant.applied}</p>
                          <Badge variant={restaurant.documents === 'Complete' ? 'default' : 'secondary'} className="text-xs">
                            {restaurant.documents}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval('restaurant', restaurant.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproval('restaurant', restaurant.id, 'approve')}
                            className="bg-green-fresh hover:bg-green-fresh/90"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Delivery Partner Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Pending Delivery Partner Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingDeliveryPartners.map((partner) => (
                      <div key={partner.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{partner.name}</h4>
                          <p className="text-sm text-muted-foreground">Vehicle: {partner.vehicle}</p>
                          <p className="text-sm text-muted-foreground">License: {partner.license}</p>
                          <p className="text-sm text-muted-foreground">{partner.applied}</p>
                          <Badge variant={partner.documents === 'Complete' ? 'default' : 'secondary'} className="text-xs">
                            {partner.documents}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval('delivery', partner.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproval('delivery', partner.id, 'approve')}
                            className="bg-yellow-accent hover:bg-yellow-accent/90"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{order.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.customer} • {order.restaurant}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.amount}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{order.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage customer accounts and their activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground">User management features will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Restaurant Management
                </CardTitle>
                <CardDescription>Approve restaurants and monitor their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Restaurant Management</h3>
                  <p className="text-muted-foreground">Restaurant management features will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Partner Management
                </CardTitle>
                <CardDescription>Approve and monitor delivery partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Delivery Partner Management</h3>
                  <p className="text-muted-foreground">Delivery partner management features will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Tracking
                </CardTitle>
                <CardDescription>Monitor all orders across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Order Tracking</h3>
                  <p className="text-muted-foreground">Order tracking features will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics & Reports
                </CardTitle>
                <CardDescription>View platform analytics and generate reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
                  <p className="text-muted-foreground">Analytics features will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Support & Complaints</CardTitle>
                <CardDescription>Handle customer support requests and complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">Support Management</h3>
                  <p className="text-muted-foreground">Support features will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;