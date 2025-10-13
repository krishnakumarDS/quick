import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UtensilsCrossed, Search, Filter, Star, Clock, ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UserMenu from '@/components/UserMenu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import OrderDialog from '@/components/OrderDialog';

const FoodList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          restaurants (
            id,
            name,
            category,
            rating,
            is_active,
            is_approved
          )
        `)
        .eq('is_available', true)
        .eq('restaurants.is_active', true)
        .eq('restaurants.is_approved', true);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'burger', label: 'Burgers' },
    { value: 'indian', label: 'Indian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'desserts', label: 'Desserts' }
  ];

  const handleOrderNow = (item: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to place an order",
        variant: "destructive"
      });
      return;
    }
    setSelectedItem(item);
    setOrderDialogOpen(true);
  };

  const handleConfirmOrder = async (quantity: number, specialInstructions: string) => {
    if (!selectedItem) return;

    setCreatingOrder(true);
    
    try {
      // Get customer profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, address, full_name, phone')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const itemTotal = selectedItem.price * quantity;
      const deliveryFee = 40;
      const taxAmount = itemTotal * 0.05;
      const finalAmount = itemTotal + deliveryFee + taxAmount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: profile.id,
          restaurant_id: selectedItem.restaurant_id,
          total_amount: itemTotal,
          delivery_fee: deliveryFee,
          tax_amount: taxAmount,
          discount_amount: 0,
          final_amount: finalAmount,
          payment_method: 'cod',
          payment_status: 'pending',
          delivery_address: profile.address || 'Address not set',
          special_instructions: specialInstructions || null,
          order_number: `TEMP${Date.now()}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          menu_item_id: selectedItem.id,
          quantity: quantity,
          unit_price: selectedItem.price,
          total_price: itemTotal,
          special_instructions: specialInstructions || null
        });

      if (itemError) throw itemError;

      toast({
        title: "Order Placed!",
        description: `Your order #${order.order_number} has been sent to ${selectedItem.restaurants?.name}`,
      });

      setOrderDialogOpen(false);
      setSelectedItem(null);

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive"
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.restaurants?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/customer/home">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-lg font-bold text-foreground">Restaurants</h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="bg-white border-b sticky top-[57px] z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for dishes or restaurants"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-muted/30 border-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`whitespace-nowrap rounded-full ${
                    selectedCategory === category.value 
                      ? "bg-orange-primary hover:bg-orange-primary/90 text-white" 
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Items List */}
      <main className="container mx-auto px-4 py-4 bg-muted/20">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {loading ? 'Loading...' : `${filteredMenuItems.length} Restaurants`}
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="md:w-48 h-48" />
                  <div className="flex-1 p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {filteredMenuItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white border-border">
                  <div className="flex gap-3 p-3">
                    <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted/30">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {item.is_vegetarian && (
                              <div className="w-4 h-4 border-2 border-green-fresh flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-green-fresh"></div>
                              </div>
                            )}
                            <h3 className="font-bold text-base text-foreground truncate">{item.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{item.description}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {item.restaurants?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-green-fresh fill-green-fresh" />
                            <span className="font-bold text-foreground">{item.restaurants?.rating || '0.0'}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{item.preparation_time} min</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-foreground">
                            ₹{item.price}
                          </div>
                          <Button 
                            size="sm"
                            className="bg-orange-primary hover:bg-orange-primary/90 text-white h-8 px-4 rounded-md font-bold text-xs uppercase"
                            onClick={() => handleOrderNow(item)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredMenuItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <UtensilsCrossed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </main>

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        item={selectedItem}
        onConfirm={handleConfirmOrder}
        isLoading={creatingOrder}
      />
    </div>
  );
};

export default FoodList;