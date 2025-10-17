import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LocationService } from '@/services/LocationService';
import MapLocationPicker from '@/components/MapLocationPicker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  is_vegetarian: boolean;
  restaurant_id: string;
  restaurant_name?: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);

  useEffect(() => {
    loadUserAddress();
  }, []);

  const loadUserAddress = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('address, latitude, longitude')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.address) {
        setDeliveryAddress(profile.address);
      }
    } catch (error) {
      console.error('Error loading address:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (!user) return;
    
    setIsGettingLocation(true);
    try {
      const locationData = await LocationService.getCurrentLocationWithAddress();
      
      if (locationData) {
        setDeliveryAddress(locationData.address);
        
        // Save to database
        const { error } = await supabase
          .from('profiles')
          .update({
            address: locationData.address,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          })
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Location Updated",
          description: "Your delivery address has been automatically detected and saved.",
        });
      }
    } catch (error: any) {
      console.error('GPS location failed, trying IP-based location...', error);
      
      // Try IP-based location as fallback
      try {
        const ipLocationData = await LocationService.getIPLocation();
        
        if (ipLocationData) {
          setDeliveryAddress(ipLocationData.address);
          
          // Save to database
          const { error } = await supabase
            .from('profiles')
            .update({
              address: ipLocationData.address,
              latitude: ipLocationData.latitude,
              longitude: ipLocationData.longitude,
            })
            .eq('user_id', user.id);

          if (error) throw error;
          
          toast({
            title: "Approximate Location Detected",
            description: `Using approximate location: ${ipLocationData.address}. You can update this manually if needed.`,
          });
          return;
        }
      } catch (ipError) {
        console.error('IP location also failed:', ipError);
      }
      
      // Show map picker dialog for manual location selection
      console.log('All location methods failed, showing map picker');
      setShowMapDialog(true);

      // Provide specific error messages based on error type
      let errorTitle = "Location Detection Failed";
      let errorDescription = "Could not automatically detect your location. Please select your location on the map.";
      
      if (error.code === 1) { // PERMISSION_DENIED
        errorTitle = "Location Permission Required";
        errorDescription = `Please allow location access in your browser settings. ${LocationService.getLocationInstructions()}`;
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorTitle = "Location Services Unavailable";
        errorDescription = "Unable to determine your location. Please select your location on the map.";
      } else if (error.code === 3) { // TIMEOUT
        errorTitle = "Location Request Timeout";
        errorDescription = "Location request took too long. Please select your location on the map.";
      } else if (error.message) {
        errorDescription = error.message;
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapLocationSelect = async (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    try {
      setDeliveryAddress(location.address);

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setShowMapDialog(false);

      toast({
        title: "Location Updated",
        description: `Your delivery address has been set to: ${location.address}`,
      });
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save location. Please try again.",
      });
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart"
    });
  };

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const taxAmount = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + taxAmount;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before placing order",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your delivery address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Get restaurant_id from first item (all items should be from same restaurant)
      const restaurantId = cartItems[0].restaurant_id;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: profile.id,
          restaurant_id: restaurantId,
          total_amount: subtotal,
          delivery_fee: deliveryFee,
          tax_amount: taxAmount,
          final_amount: total,
          delivery_address: deliveryAddress,
          special_instructions: specialInstructions,
          order_number: `ORD${Date.now()}`,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cod'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: `Order ${order.order_number} has been sent to the restaurant`
      });

      navigate('/customer/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Failed to place order",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b shadow-sm px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Your Cart</h1>
          <p className="text-xs text-muted-foreground">{cartItems.length} items</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Add items to get started</p>
            <Button onClick={() => navigate('/customer/food')}>
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b last:border-0">
                    <div className={`w-4 h-4 border-2 ${item.is_vegetarian ? 'border-green-fresh' : 'border-red-500'} rounded-sm flex items-center justify-center flex-shrink-0 mt-1`}>
                      <div className={`w-2 h-2 ${item.is_vegetarian ? 'bg-green-fresh' : 'bg-red-500'} rounded-full`}></div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">₹{item.price}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address *
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Textarea
                      id="address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your complete delivery address"
                      className="flex-1"
                      rows={3}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="h-auto px-3"
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-auto px-3"
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Select Delivery Location</DialogTitle>
                          <DialogDescription>
                            Choose your delivery location on the map below. You can drag the marker to adjust the exact position.
                          </DialogDescription>
                        </DialogHeader>
                        <MapLocationPicker
                          onLocationSelect={handleMapLocationSelect}
                          className="w-full"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div>
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests or cooking instructions"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bill Summary */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Item Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes (5%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-green-fresh">₹{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-green-fresh hover:bg-green-fresh/90 text-white font-bold py-6 text-lg"
            >
              {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
            </Button>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <CustomerBottomNavigation />
    </div>
  );
};

export default Cart;
