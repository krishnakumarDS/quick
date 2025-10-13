import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Mic, Star, ChevronDown, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
const RestaurantDetails = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [cart, setCart] = useState<any[]>([]);
  useEffect(() => {
    fetchRestaurantDetails();
    fetchMenuItems();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [id]);
  const fetchRestaurantDetails = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('restaurants').select('*').eq('id', id).single();
      if (error) throw error;
      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };
  const fetchMenuItems = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('menu_items').select('*').eq('restaurant_id', id).eq('is_available', true).order('category');
      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };
  const addToCart = (item: any) => {
    // Load existing cart from localStorage
    const existingCart = localStorage.getItem('cart');
    let cartItems = existingCart ? JSON.parse(existingCart) : [];
    
    // Check if item already exists
    const existingItemIndex = cartItems.findIndex((cartItem: any) => cartItem.id === item.id);
    
    if (existingItemIndex > -1) {
      // Increase quantity if item exists
      cartItems[existingItemIndex].quantity += 1;
    } else {
      // Add new item with restaurant info
      cartItems.push({
        ...item,
        quantity: 1,
        restaurant_id: id,
        restaurant_name: restaurant?.name
      });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setCart(cartItems);
    
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`
    });
  };
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || filter === 'veg' && item.is_vegetarian || filter === 'bestseller';
    return matchesSearch && matchesFilter;
  });
  if (loading) {
    return <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>;
  }
  if (!restaurant) return <div>Restaurant not found</div>;
  return <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <Button variant="outline" size="sm" className="border-white hover:bg-white/20 text-orange-50 text-xs sm:text-sm">
          GROUP ORDER
        </Button>
      </div>

      {/* Restaurant Info Card */}
      <div className="m-4 rounded-2xl p-4 sm:p-6 shadow-md bg-sky-400">
        <div className="flex items-start gap-2 mb-3">
          <div className="text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 bg-orange-500">
            🛡️ Swiggy Seal
          </div>
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{restaurant.name}</h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <span>45-50 mins</span>
            <span>•</span>
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>
          <div className="sm:ml-auto">
            <div className="bg-green-fresh text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 w-fit">
              {restaurant.rating || '4.5'}
              <Star className="h-3 w-3 fill-white" />
            </div>
            <p className="text-xs text-left sm:text-right mt-1">25K+ ratings</p>
          </div>
        </div>

        {/* Offer Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-bold">
              SAVE
            </div>
            <div>
              <p className="font-bold text-foreground text-sm sm:text-base">Extra ₹30 off</p>
              <p className="text-xs text-muted-foreground">APPLICABLE OVER & ABOVE COUPONS</p>
            </div>
          </div>
          <div className="text-orange-primary font-bold text-sm sm:text-base">1/5</div>
        </div>
      </div>

      {/* Search for dishes */}
      <div className="px-4 mb-4">
        <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search for dishes" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0" />
          <Mic className="h-5 w-5 text-orange-primary" />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full border whitespace-nowrap ${filter === 'all' ? 'bg-orange-primary text-white border-orange-primary' : 'bg-white border-border'}`}>
          All
        </button>
        <button onClick={() => setFilter('veg')} className={`px-4 py-2 rounded-full border whitespace-nowrap flex items-center gap-2 ${filter === 'veg' ? 'bg-green-fresh text-white border-green-fresh' : 'bg-white border-border'}`}>
          <div className="w-3 h-3 border-2 border-current rounded-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
          </div>
          Veg
        </button>
        <button onClick={() => setFilter('bestseller')} className={`px-4 py-2 rounded-full border whitespace-nowrap ${filter === 'bestseller' ? 'bg-orange-primary text-white border-orange-primary' : 'bg-white border-border'}`}>
          Bestseller
        </button>
        <button className="px-4 py-2 rounded-full border bg-white border-border whitespace-nowrap">
          Ratings 4.0+
        </button>
      </div>

      {/* 99 Store Section */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-yellow-400 text-black font-black text-xl px-2 py-1 rounded-lg transform -rotate-2">
              99
            </div>
            <h2 className="text-xl font-bold">store</h2>
            <ChevronDown className="ml-auto" />
          </div>
          <div className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1">
            ✓ Free delivery above ₹99
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md">
              {/* Item Image */}
              <div className="relative h-40 bg-gradient-to-br from-orange-400/20 to-pink-400/20 flex items-center justify-center">
                {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-6xl opacity-40">🍽️</span>}
                
                {/* Veg/Non-veg indicator */}
                <div className="absolute top-2 left-2">
                  <div className={`w-5 h-5 border-2 ${item.is_vegetarian ? 'border-green-fresh' : 'border-red-500'} rounded-sm flex items-center justify-center bg-white`}>
                    <div className={`w-2.5 h-2.5 ${item.is_vegetarian ? 'bg-green-fresh' : 'bg-red-500'} rounded-full`}></div>
                  </div>
                </div>

                {/* Bestseller badge */}
                {Math.random() > 0.5 && <div className="absolute top-2 right-2 bg-orange-primary text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" />
                    Bestseller
                  </div>}
              </div>

              {/* Item Details */}
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1 line-clamp-2">{item.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-green-fresh text-green-fresh" />
                  <span className="text-xs font-semibold">{(Math.random() * 1.5 + 3.5).toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({Math.floor(Math.random() * 50 + 10)})</span>
                </div>

                {/* Price and Add Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">₹{item.price}</p>
                  </div>
                  <Button onClick={() => addToCart(item)} size="sm" className="bg-white border-2 border-green-fresh text-green-fresh hover:bg-green-fresh hover:text-white font-bold rounded-lg px-6">
                    ADD
                  </Button>
                </div>
              </div>
            </div>)}
        </div>
      </div>

      {/* Cart Button */}
      {cart.length > 0 && <div className="fixed bottom-4 left-4 right-4 bg-green-fresh text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-base sm:text-lg">{cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items added</p>
            <p className="text-xs sm:text-sm opacity-90">Extra charges may apply</p>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/customer/cart')}
            className="bg-white text-green-fresh hover:bg-white/90 font-bold text-xs sm:text-sm w-full sm:w-auto"
          >
            VIEW CART
            <ShoppingCart className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>}
    </div>;
};
export default RestaurantDetails;