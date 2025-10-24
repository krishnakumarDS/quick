import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Clock, CheckCircle, XCircle, Package, Menu as MenuIcon, BarChart3, Bell, ListOrdered, Loader2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UserMenu from '@/components/UserMenu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const VendorOrders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('vendor-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      // Get restaurant ID for current user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) return;

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', profile.id)
        .single();

      if (!restaurant) return;

      // Fetch orders for this restaurant
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            phone
          ),
          order_items (
            *,
            menu_items (
              name
            )
          )
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-accent text-yellow-accent-foreground';
      case 'preparing': return 'bg-orange-primary text-orange-primary-foreground';
      case 'ready_for_pickup': return 'bg-green-fresh text-green-fresh-foreground';
      case 'delivered': return 'bg-green-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'ready_for_pickup': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const readyOrders = orders.filter(o => o.status === 'ready_for_pickup').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-green-fresh" />
              <h1 className="text-2xl font-bold text-foreground">Restaurant Dashboard</h1>
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
            <Link to="/vendor/orders">
              <Button variant="ghost" className="gap-2 text-green-fresh bg-green-light flex-shrink-0 text-xs sm:text-sm">
                Orders
              </Button>
            </Link>
            <Link to="/vendor/menu">
              <Button variant="ghost" className="gap-2 flex-shrink-0 text-xs sm:text-sm">
                <MenuIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Menu Management</span>
                <span className="sm:hidden">Menu</span>
              </Button>
            </Link>
            <Link to="/vendor/analytics">
              <Button variant="ghost" className="gap-2 flex-shrink-0 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Analytics
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
              <CardDescription>Pending Orders</CardDescription>
              <CardTitle className="text-2xl text-yellow-accent">{pendingOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Preparing</CardDescription>
              <CardTitle className="text-2xl text-orange-primary">{preparingOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ready for Pickup</CardDescription>
              <CardTitle className="text-2xl text-green-fresh">{readyOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today's Revenue</CardDescription>
              <CardTitle className="text-2xl">₹2,450</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>
              Manage incoming orders and update their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TooltipProvider>
                <TabsList className="w-full flex justify-around md:grid md:grid-cols-5">
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
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="pending" className="flex-shrink-0 gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="hidden md:inline">Pending ({pendingOrders})</span>
                        <span className="md:hidden">{pendingOrders}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pending Orders</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="preparing" className="flex-shrink-0 gap-1">
                        <Loader2 className="h-4 w-4" />
                        <span className="hidden md:inline">Preparing ({preparingOrders})</span>
                        <span className="md:hidden">{preparingOrders}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Preparing Orders</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="ready_for_pickup" className="flex-shrink-0 gap-1">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="hidden md:inline">Ready ({readyOrders})</span>
                        <span className="md:hidden">{readyOrders}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ready for Pickup</p>
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
                </TabsList>
              </TooltipProvider>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-green-fresh">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg">Order #{order.order_number}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              {order.profiles?.full_name} • {new Date(order.created_at).toLocaleString()}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize text-xs">{order.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium mb-2 text-sm sm:text-base">Order Items:</h4>
                            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                              {order.order_items?.map((item: any, index: number) => (
                                <li key={index}>• {item.menu_items?.name} x {item.quantity} - ₹{item.total_price}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-sm sm:text-base">Delivery Details:</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{order.delivery_address}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Phone: {order.profiles?.phone || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="text-base sm:text-lg font-bold text-green-fresh">
                            Total: ₹{order.final_amount}
                          </div>
                          <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-2">
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                  className="bg-orange-primary hover:bg-orange-primary/90 gap-2"
                                >
                                  <Package className="h-4 w-4" />
                                  Accept & Prepare
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                  className="gap-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, 'ready_for_pickup')}
                                className="bg-green-fresh hover:bg-green-fresh/90 gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Mark Ready
                              </Button>
                            )}
                            {order.status === 'ready_for_pickup' && (
                              <Badge variant="outline" className="bg-green-light text-green-fresh">
                                Waiting for Pickup
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
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'pending' 
                        ? 'New orders will appear here'
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

export default VendorOrders;