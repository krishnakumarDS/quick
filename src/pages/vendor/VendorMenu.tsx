import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Store, Plus, Edit, Trash2, LogOut, Package, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  is_vegetarian: boolean;
  preparation_time: number;
  image_url?: string;
}

interface Restaurant {
  id: string;
  name: string;
  is_active: boolean;
  is_approved: boolean;
  image_url?: string;
}

const VendorMenu = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_vegetarian: false,
    preparation_time: 30,
    image_url: ''
  });

  const categories = [
    'appetizers', 'main_course', 'desserts', 'beverages', 'pizza', 'pasta', 'biryani', 'chinese', 'indian', 'continental'
  ];

  useEffect(() => {
    fetchRestaurantData();
  }, [user]);

  const fetchRestaurantData = async () => {
    if (!user) return;
    
    try {
      // Get user profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Get restaurant data
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', profile.id)
        .single();

      if (restaurantData) {
        setRestaurant(restaurantData);
        
        // Get menu items
        const { data: menuData } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .order('category', { ascending: true });

        if (menuData) {
          setMenuItems(menuData);
        }
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async () => {
    if (!restaurant) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: !restaurant.is_active })
        .eq('id', restaurant.id);

      if (error) throw error;

      setRestaurant({ ...restaurant, is_active: !restaurant.is_active });
      toast({
        title: 'Status Updated',
        description: `Restaurant is now ${!restaurant.is_active ? 'accepting' : 'not accepting'} orders`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update restaurant status',
      });
    }
  };

  const toggleItemAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(menuItems.map(item => 
        item.id === itemId ? { ...item, is_available: !currentStatus } : item
      ));

      toast({
        title: 'Item Updated',
        description: `Item is now ${!currentStatus ? 'available' : 'unavailable'}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update item availability',
      });
    }
  };

  const addMenuItem = async () => {
    if (!restaurant || !newItem.name || !newItem.category || !newItem.price) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          restaurant_id: restaurant.id,
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          category: newItem.category,
          is_vegetarian: newItem.is_vegetarian,
          preparation_time: newItem.preparation_time,
          is_available: true,
          image_url: newItem.image_url || null
        })
        .select()
        .single();

      if (error) throw error;

      setMenuItems([...menuItems, data]);
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: '',
        is_vegetarian: false,
        preparation_time: 30,
        image_url: ''
      });
      setIsAddDialogOpen(false);

      toast({
        title: 'Item Added',
        description: 'Menu item has been added successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add menu item',
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Restaurant Not Found</CardTitle>
            <CardDescription>
              No restaurant found for this account. Please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-fresh rounded-xl">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Menu Management</h1>
                <p className="text-sm text-muted-foreground">{restaurant.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user?.email?.split('@')[0]}</span>
                </span>
              </div>
              <Button variant="glass" size="sm" onClick={signOut} className="gap-2 hover-lift">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass-card border-b border-white/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 md:gap-8 py-4 overflow-x-auto">
            <Link to="/vendor/orders">
              <Button variant="ghost" className="gap-2 whitespace-nowrap">
                <Package className="h-5 w-5" />
                <span className="hidden sm:inline">Orders</span>
              </Button>
            </Link>
            <Button variant="ghost" className="gap-2 text-green-fresh bg-green-fresh/10 border border-green-fresh/20 whitespace-nowrap">
              <Store className="h-5 w-5" />
              <span className="hidden sm:inline">Menu Management</span>
            </Button>
            <Link to="/vendor/analytics">
              <Button variant="ghost" className="gap-2 whitespace-nowrap">
                <BarChart3 className="h-5 w-5" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Restaurant Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Restaurant Status</CardTitle>
                <CardDescription>
                  {restaurant.is_approved 
                    ? 'Control whether your restaurant is accepting new orders'
                    : 'Your restaurant is pending approval from admin'
                  }
                </CardDescription>
              </div>
              {restaurant.is_approved && (
                <div className="flex items-center gap-2 sm:gap-4">
                  <Label htmlFor="restaurant-status" className="text-sm">Accepting Orders</Label>
                  <Switch
                    id="restaurant-status"
                    checked={restaurant.is_active}
                    onCheckedChange={toggleRestaurantStatus}
                  />
                  <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                    {restaurant.is_active ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Restaurant Image */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Restaurant Image</CardTitle>
            <CardDescription>
              Upload a photo of your restaurant to attract more customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImageUpload={async (imageUrl) => {
                try {
                  const { error } = await supabase
                    .from('restaurants')
                    .update({ image_url: imageUrl })
                    .eq('id', restaurant.id);

                  if (error) throw error;

                  setRestaurant({ ...restaurant, image_url: imageUrl });
                  toast({
                    title: "Restaurant Image Updated",
                    description: "Your restaurant image has been updated successfully.",
                  });
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update restaurant image.",
                  });
                }
              }}
              currentImage={restaurant.image_url}
              label="Restaurant Photo"
              maxSize={10}
            />
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>
                  Manage your restaurant's menu items and availability
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add New Item</span>
                    <span className="sm:hidden">Add Item</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                    <DialogDescription>
                      Fill in the details for your new menu item
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="Enter item name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Enter item description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prep-time">Prep Time (min)</Label>
                        <Input
                          id="prep-time"
                          type="number"
                          value={newItem.preparation_time}
                          onChange={(e) => setNewItem({ ...newItem, preparation_time: parseInt(e.target.value) || 30 })}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={newItem.category} 
                        onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="vegetarian"
                        checked={newItem.is_vegetarian}
                        onCheckedChange={(checked) => setNewItem({ ...newItem, is_vegetarian: checked })}
                      />
                      <Label htmlFor="vegetarian">Vegetarian</Label>
                    </div>
                    <ImageUpload
                      onImageUpload={(imageUrl) => setNewItem({ ...newItem, image_url: imageUrl })}
                      currentImage={newItem.image_url}
                      label="Food Image"
                      maxSize={5}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addMenuItem}>Add Item</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {menuItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No menu items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your menu by adding your first item
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <Card key={item.id} className={`border-l-4 ${item.is_available ? 'border-l-green-fresh' : 'border-l-gray-400'}`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        {item.image_url && (
                          <div className="w-full sm:w-32 h-32 flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                            {item.is_vegetarian && (
                              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                VEG
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {item.category.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-muted-foreground mb-2 text-sm">{item.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <span className="font-medium text-green-fresh text-base sm:text-lg">₹{item.price}</span>
                            <span>Prep: {item.preparation_time} mins</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`item-${item.id}`} className="text-xs sm:text-sm">
                              Available
                            </Label>
                            <Switch
                              id={`item-${item.id}`}
                              checked={item.is_available}
                              onCheckedChange={() => toggleItemAvailability(item.id, item.is_available)}
                            />
                          </div>
                          <Badge variant={item.is_available ? 'default' : 'secondary'} className="text-xs">
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VendorMenu;