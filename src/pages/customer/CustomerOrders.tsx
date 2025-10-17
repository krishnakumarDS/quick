import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Package, CheckCircle, Truck, ArrowLeft, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation';

interface Order {
  id: string;
  order_number: string;
  restaurant_id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  final_amount: number;
  delivery_address: string;
  created_at: string;
  estimated_delivery_time: string;
  delivered_at: string;
  restaurants: {
    name: string;
    address: string;
  };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    menu_items: {
      name: string;
      description: string;
    };
  }[];
}

const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (name, address),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            menu_items (name, description)
          )
        `)
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-accent text-yellow-accent-foreground';
      case 'confirmed': return 'bg-blue-500 text-white';
      case 'preparing': return 'bg-orange-primary text-orange-primary-foreground';
      case 'ready': return 'bg-purple-500 text-white';
      case 'picked_up': return 'bg-blue-600 text-white';
      case 'out_for_delivery': return 'bg-green-fresh text-green-fresh-foreground';
      case 'delivered': return 'bg-green-600 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed': return <Clock className="h-4 w-4" />;
      case 'preparing':
      case 'ready': return <Package className="h-4 w-4" />;
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'out_for_delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return !['delivered', 'cancelled'].includes(order.status);
    } else {
      return ['delivered', 'cancelled'].includes(order.status);
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/customer/home">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
              <p className="text-sm text-muted-foreground">Track your order history</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              View and track all your orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active Orders</TabsTrigger>
                <TabsTrigger value="completed">Order History</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-green-fresh">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{order.order_number}</CardTitle>
                            <CardDescription>
                              {order.restaurants.name} • {formatDate(order.created_at)}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium mb-2">Order Items:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {order.order_items.map((item) => (
                                <li key={item.id}>
                                  • {item.menu_items.name} × {item.quantity} - ₹{item.total_price}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Delivery Address:</h4>
                            <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                            {order.estimated_delivery_time && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Expected: {formatDate(order.estimated_delivery_time)}
                              </p>
                            )}
                            {order.status === 'out_for_delivery' && (
                              <p className="text-sm font-semibold text-green-fresh mt-2 flex items-center gap-1">
                                <Truck className="h-4 w-4" />
                                Your order is arriving!
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-green-fresh">
                              Total: ₹{order.final_amount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Items: ₹{order.total_amount} + Delivery: ₹{order.delivery_fee}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {order.status === 'delivered' && (
                              <>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Star className="h-4 w-4" />
                                  Rate Order
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  Help
                                </Button>
                              </>
                            )}
                            {!['delivered', 'cancelled'].includes(order.status) && (
                              <Button variant="outline" size="sm">
                                Track Order
                              </Button>
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
                    <p className="text-muted-foreground mb-4">
                      {activeTab === 'active' 
                        ? 'You have no active orders at the moment'
                        : 'Your order history will appear here'
                      }
                    </p>
                    <Link to="/customer/food">
                      <Button>Browse Restaurants</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <CustomerBottomNavigation />
    </div>
  );
};

export default CustomerOrders;