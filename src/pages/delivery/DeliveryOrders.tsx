import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, MapPin, Clock, CheckCircle, Package, DollarSign, Navigation, Bell, ListOrdered, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserMenu from '@/components/UserMenu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DeliveryOrders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');

  const orders = [
    {
      id: 'ORD20240927001',
      restaurantName: 'Pizza Palace',
      restaurantAddress: '123 Restaurant St',
      customerName: 'John Doe',
      customerAddress: '456 Customer Ave',
      distance: '2.5 km',
      earnings: '₹45',
      status: 'available',
      time: '5 minutes ago',
      items: ['Margherita Pizza x2', 'Coca Cola x1'],
      total: '₹598'
    },
    {
      id: 'ORD20240927002',
      restaurantName: 'Burger Hub',
      restaurantAddress: '789 Food Street',
      customerName: 'Jane Smith',
      customerAddress: '321 Home Road',
      distance: '1.8 km',
      earnings: '₹38',
      status: 'accepted',
      time: '10 minutes ago',
      items: ['Chicken Burger x1', 'Fries x1'],
      total: '₹349'
    },
    {
      id: 'ORD20240927003',
      restaurantName: 'Spice Garden',
      restaurantAddress: '456 Spice Lane',
      customerName: 'Mike Johnson',
      customerAddress: '789 Delivery St',
      distance: '3.2 km',
      earnings: '₹52',
      status: 'picked_up',
      time: '20 minutes ago',
      items: ['Butter Chicken x1', 'Naan x2'],
      total: '₹425'
    },
    {
      id: 'ORD20240927004',
      restaurantName: 'Sweet Treats',
      restaurantAddress: '101 Dessert Ave',
      customerName: 'Sarah Wilson',
      customerAddress: '202 Sweet Home',
      distance: '1.5 km',
      earnings: '₹35',
      status: 'delivered',
      time: '1 hour ago',
      items: ['Chocolate Cake x1'],
      total: '₹275'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-yellow-accent text-yellow-accent-foreground';
      case 'accepted': return 'bg-orange-primary text-orange-primary-foreground';
      case 'picked_up': return 'bg-blue-500 text-white';
      case 'delivered': return 'bg-green-fresh text-green-fresh-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Package className="h-4 w-4" />;
      case 'accepted': return <Clock className="h-4 w-4" />;
      case 'picked_up': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleOrderAction = (orderId: string, action: string) => {
    console.log(`${action} order ${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'available') return order.status === 'ready';
    if (activeTab === 'active') return ['accepted', 'picked_up', 'out_for_delivery'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'delivered';
    return true;
  });

  const availableOrders = orders.filter(o => o.status === 'ready').length;
  const activeOrders = orders.filter(o => ['accepted', 'picked_up', 'out_for_delivery'].includes(o.status)).length;
  const todayEarnings = orders.filter(o => o.status === 'delivered').reduce((sum, order) => 
    sum + parseInt(order.earnings.replace('₹', '')), 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-yellow-accent" />
              <h1 className="text-2xl font-bold text-foreground">Delivery Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 sm:gap-8 py-4 overflow-x-auto">
            <Link to="/delivery/orders">
              <Button variant="ghost" className="gap-2 text-yellow-accent bg-yellow-light flex-shrink-0 text-xs sm:text-sm">
                Orders
              </Button>
            </Link>
            <Link to="/delivery/earnings">
              <Button variant="ghost" className="gap-2 flex-shrink-0 text-xs sm:text-sm">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Earnings
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Available Orders</CardDescription>
              <CardTitle className="text-2xl text-yellow-accent">{availableOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Deliveries</CardDescription>
              <CardTitle className="text-2xl text-orange-primary">{activeOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today's Earnings</CardDescription>
              <CardTitle className="text-2xl text-green-fresh">₹{todayEarnings}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Deliveries Completed</CardDescription>
              <CardTitle className="text-2xl">12</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Orders</CardTitle>
            <CardDescription>
              Accept orders and manage your deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TooltipProvider>
                <TabsList className="w-full flex justify-around md:grid md:grid-cols-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="available" className="flex-shrink-0 gap-1">
                        <Package className="h-4 w-4" />
                        <span className="hidden md:inline">Available ({availableOrders})</span>
                        <span className="md:hidden">{availableOrders}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Available Orders</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="active" className="flex-shrink-0 gap-1">
                        <PlayCircle className="h-4 w-4" />
                        <span className="hidden md:inline">Active ({activeOrders})</span>
                        <span className="md:hidden">{activeOrders}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Active Deliveries</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="completed" className="flex-shrink-0 gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden md:inline">Completed</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Completed Orders</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="all" className="flex-shrink-0 gap-1">
                        <ListOrdered className="h-4 w-4" />
                        <span className="hidden md:inline">All</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>All Orders</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsList>
              </TooltipProvider>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-yellow-accent">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg">{order.id}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              {order.restaurantName} → {order.customerName} • {order.time}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize text-xs">{order.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-1 text-sm sm:text-base">
                              <Package className="h-4 w-4" />
                              Pickup Location:
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{order.restaurantName}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{order.restaurantAddress}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-1 text-sm sm:text-base">
                              <MapPin className="h-4 w-4" />
                              Delivery Location:
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{order.customerName}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{order.customerAddress}</p>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <p><strong>Distance:</strong> {order.distance}</p>
                              <p><strong>Order Total:</strong> {order.total}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">You'll earn</p>
                              <p className="text-xl font-bold text-green-fresh">{order.earnings}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Items: {order.items.join(', ')}
                          </div>
                          <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
                            {order.status === 'available' && (
                              <Button
                                size="sm"
                                onClick={() => handleOrderAction(order.id, 'accept')}
                                className="bg-yellow-accent hover:bg-yellow-accent/90 gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Accept Order
                              </Button>
                            )}
                            {order.status === 'accepted' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleOrderAction(order.id, 'pickup')}
                                  className="bg-orange-primary hover:bg-orange-primary/90 gap-2"
                                >
                                  <Package className="h-4 w-4" />
                                  Mark Picked Up
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Navigation className="h-4 w-4" />
                                  Navigate
                                </Button>
                              </>
                            )}
                            {order.status === 'picked_up' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleOrderAction(order.id, 'deliver')}
                                  className="bg-green-fresh hover:bg-green-fresh/90 gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Mark Delivered
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Navigation className="h-4 w-4" />
                                  Navigate to Customer
                                </Button>
                              </>
                            )}
                            {order.status === 'delivered' && (
                              <Badge variant="outline" className="bg-green-light text-green-fresh">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'available' 
                        ? 'New delivery orders will appear here'
                        : `No ${activeTab} orders at the moment`
                      }
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DeliveryOrders;