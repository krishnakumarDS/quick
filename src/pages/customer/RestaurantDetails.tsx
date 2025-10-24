import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Mic, Star, ChevronDown, ShoppingCart, Plus, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation';
import { useCart } from '@/contexts/CartContext';
import CartPopup from '@/components/CartPopup';
import CartConfirmationDialog from '@/components/CartConfirmationDialog';
const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, getCartItemsByRestaurant, cartItems, clearCart } = useCart();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [addedItemCount, setAddedItemCount] = useState(0);
  const [showCartBottomPopup, setShowCartBottomPopup] = useState(true);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<any>(null);
  useEffect(() => {
    fetchRestaurantDetails();
    fetchMenuItems();
  }, [id]);
  const fetchRestaurantDetails = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('restaurants').select('*').eq('id', id).single();
      if (error) throw error;
      
      // If no restaurant found, use sample data
      if (!data) {
        const sampleRestaurant = {
          id: id || 'sample-restaurant-1',
          name: 'Spice Palace',
          description: 'Authentic Indian cuisine with a modern twist',
          category: 'Indian',
          image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
          address: '123 Main Street, Coimbatore',
          latitude: 11.0168,
          longitude: 76.9558,
          phone: '+91 9876543210',
          email: 'spicepalace@example.com',
          opening_time: '10:00',
          closing_time: '23:00',
          is_active: true,
          is_approved: true,
          rating: 4.5,
          total_reviews: 250,
          delivery_radius: 5000,
          commission_rate: 10.00
        };
        setRestaurant(sampleRestaurant);
      } else {
      setRestaurant(data);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      // If there's an error, still show sample data
      const sampleRestaurant = {
        id: id || 'sample-restaurant-1',
        name: 'Spice Palace',
        description: 'Authentic Indian cuisine with a modern twist',
        category: 'Indian',
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
        address: '123 Main Street, Coimbatore',
        latitude: 11.0168,
        longitude: 76.9558,
        phone: '+91 9876543210',
        email: 'spicepalace@example.com',
        opening_time: '10:00',
        closing_time: '23:00',
        is_active: true,
        is_approved: true,
        rating: 4.5,
        total_reviews: 250,
        delivery_radius: 5000,
        commission_rate: 10.00
      };
      setRestaurant(sampleRestaurant);
    }
  };
  const fetchMenuItems = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('menu_items').select('*').eq('restaurant_id', id).eq('is_available', true).order('category');
      if (error) throw error;
      
      // If no data from database, use comprehensive sample data with proper images
      if (!data || data.length === 0) {
        const sampleData = getComprehensiveSampleDataForRestaurant(id);
        setMenuItems(sampleData);
      } else {
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // If there's an error, still show comprehensive sample data
      const sampleData = getComprehensiveSampleDataForRestaurant(id);
      setMenuItems(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const getComprehensiveSampleDataForRestaurant = (restaurantId: string | undefined) => {
    // Return comprehensive sample data based on restaurant ID or default data
    const allSampleData = [
      // Indian Items
      {
        id: 'sample-butter-chicken',
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken pieces',
        category: 'indian',
        price: 279.00,
        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        is_vegetarian: false,
        is_available: true,
        preparation_time: 25,
        restaurant_id: restaurantId || 'sample-restaurant-1'
      },
      {
        id: 'sample-paneer-tikka',
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese marinated in spices and yogurt',
        category: 'indian',
        price: 199.00,
        image_url: 'https://images.unsplash.com/photo-1609501676725-7186f3a0b0c0?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 20,
        restaurant_id: restaurantId || 'sample-restaurant-1'
      },
      {
        id: 'sample-dal-makhani',
        name: 'Dal Makhani',
        description: 'Creamy black lentils cooked with butter and cream',
        category: 'indian',
        price: 179.00,
        image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 30,
        restaurant_id: restaurantId || 'sample-restaurant-1'
      },
      {
        id: 'sample-chicken-curry',
        name: 'Chicken Curry',
        description: 'Spicy and aromatic chicken curry with traditional Indian spices',
        category: 'indian',
        price: 249.00,
        image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d4d0?w=400&h=300&fit=crop',
        is_vegetarian: false,
        is_available: true,
        preparation_time: 30,
        restaurant_id: restaurantId || 'sample-restaurant-1'
      },
      {
        id: 'sample-rajma-chawal',
        name: 'Rajma Chawal',
        description: 'Red kidney beans curry served with steamed rice',
        category: 'indian',
        price: 159.00,
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 25,
        restaurant_id: restaurantId || 'sample-restaurant-1'
      },

      // Pizza Items
      {
        id: 'sample-margherita-pizza',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        category: 'pizza',
        price: 299.00,
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 20,
        restaurant_id: restaurantId || 'sample-restaurant-5'
      },
      {
        id: 'sample-pepperoni-pizza',
        name: 'Pepperoni Pizza',
        description: 'Pizza topped with spicy pepperoni and melted cheese',
        category: 'pizza',
        price: 349.00,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
        is_vegetarian: false,
        is_available: true,
        preparation_time: 22,
        restaurant_id: restaurantId || 'sample-restaurant-5'
      },

      // Burger Items
      {
        id: 'sample-chicken-burger',
        name: 'Chicken Burger',
        description: 'Juicy chicken patty with lettuce, tomato, and special sauce',
        category: 'burger',
        price: 199.00,
        image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
        is_vegetarian: false,
        is_available: true,
        preparation_time: 15,
        restaurant_id: restaurantId || 'sample-restaurant-6'
      },
      {
        id: 'sample-veg-burger',
        name: 'Veg Burger',
        description: 'Delicious vegetable patty with fresh vegetables and mayo',
        category: 'burger',
        price: 149.00,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 12,
        restaurant_id: restaurantId || 'sample-restaurant-6'
      },

      // Chinese Items
      {
        id: 'sample-fried-rice',
        name: 'Fried Rice',
        description: 'Wok-fried rice with vegetables and choice of protein',
        category: 'chinese',
        price: 179.00,
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 18,
        restaurant_id: restaurantId || 'sample-restaurant-7'
      },
      {
        id: 'sample-noodles',
        name: 'Hakka Noodles',
        description: 'Stir-fried noodles with mixed vegetables and soy sauce',
        category: 'chinese',
        price: 159.00,
        image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 15,
        restaurant_id: restaurantId || 'sample-restaurant-7'
      },

      // Dessert Items
      {
        id: 'sample-chocolate-cake',
        name: 'Chocolate Cake',
        description: 'Rich and moist chocolate cake with chocolate frosting',
        category: 'desserts',
        price: 129.00,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 10,
        restaurant_id: restaurantId || 'sample-restaurant-8'
      },
      {
        id: 'sample-ice-cream',
        name: 'Vanilla Ice Cream',
        description: 'Creamy vanilla ice cream with your choice of toppings',
        category: 'desserts',
        price: 89.00,
        image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
        is_vegetarian: true,
        is_available: true,
        preparation_time: 5,
        restaurant_id: restaurantId || 'sample-restaurant-8'
      }
    ];

    // Return all items for the restaurant (or all items if no specific restaurant)
    return allSampleData;
  };
  const handleAddToCart = (item: any) => {
    const currentRestaurantId = restaurant?.id || id;
    const currentCartItems = getCartItemsByRestaurant(currentRestaurantId);
    const otherRestaurantItems = cartItems.filter(cartItem => cartItem.restaurant_id !== currentRestaurantId);
    
    // If there are items from a different restaurant, show confirmation dialog
    if (otherRestaurantItems.length > 0) {
      setPendingItem(item);
      setShowConfirmationDialog(true);
      return;
    }
    
    // Add item directly if no conflict
    addItemToCart(item);
  };

  const addItemToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      is_vegetarian: item.is_vegetarian,
      restaurant_id: restaurant?.id || id,
      restaurant_name: restaurant?.name
    });
    
    setAddedItemCount(prev => prev + 1);
    setShowCartPopup(true);
    
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const handleConfirmAddToCart = () => {
    if (pendingItem) {
      // Clear cart and add new item
      clearCart();
      addItemToCart(pendingItem);
      setPendingItem(null);
    }
    setShowConfirmationDialog(false);
  };

  const handleCancelAddToCart = () => {
    setPendingItem(null);
    setShowConfirmationDialog(false);
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
      {/* Restaurant Image Header */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-500 to-blue-600">
        <img 
          src={restaurant.image_url} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
            if (nextElement) {
              nextElement.style.display = 'flex';
            }
          }}
        />
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center absolute inset-0" style={{ display: 'none' }}>
          <span className="text-6xl opacity-40">🍽️</span>
        </div>
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 bg-transparent text-white px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="bg-black/30 rounded-full p-2">
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
          <Button variant="outline" size="sm" className="border-white hover:bg-white/20 text-white text-xs sm:text-sm bg-black/30">
          GROUP ORDER
        </Button>
        </div>
      </div>

      {/* Restaurant Info Card */}
      <div className="m-4 rounded-2xl p-4 sm:p-6 shadow-md bg-sky-400 -mt-8 relative z-10">
        <div className="flex items-start gap-2 mb-3">
          <div className="text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 bg-orange-500">
            🛡️ Quick Deal
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-xl font-bold text-foreground mb-2 uppercase">{restaurant.name}</h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-4">
          <div className="flex items-center text-black gap-2" >
            <span>45-50 mins</span>
            <span>•</span>
            <span className="line-clamp-1 text-black">{restaurant.address}</span>
          </div>
          <div className="sm:ml-auto">
            <div className="bg-green-fresh text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 w-fit">
              {restaurant.rating || '4.5'}
              <Star className="h-3 w-3 fill-white" />
            </div>
            <p className="text-sm text-left sm:text-right mt-1 text-white">25K+ ratings</p>
          </div>
        </div>

        {/* Offer Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-bold">
              SAVE
            </div>
            <div>
              <p className="font-bold text-foreground text-sm sm:text-base">Extra 10% off</p>
              <p className="text-xs text-muted-foreground">FOR OPENING PERIOD ORDERS</p>
            </div>
          </div>
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
      <section className="px-4 py-6 mb-6">
        <div className="rounded-2xl overflow-hidden">
          <img 
            src="/image2.jpg" 
            alt="99 Store Promotional Banner"
            className="w-full h-auto object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'flex';
              }
            }}
          />
            </div>
      </section>

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
                  <Button onClick={() => handleAddToCart(item)} size="sm" className="bg-white border-2 border-green-fresh text-green-fresh hover:bg-green-fresh hover:text-white font-bold rounded-lg px-6">
                    ADD
                  </Button>
                </div>
              </div>
            </div>)}
        </div>
      </div>

      {/* Cart Button */}
      {cartItems.length > 0 && showCartBottomPopup && <div className="fixed bottom-20 left-4 right-4 bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg z-50">
          <div className="flex items-center justify-between">
            {/* Left side - Cart items info */}
            <div className="flex-1">
              <p className="font-bold text-base sm:text-lg">{cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items added</p>
              <p className="text-xs sm:text-sm opacity-90">Extra charges may apply</p>
            </div>
            
            {/* Right side - Close button and View Cart button */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowCartBottomPopup(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/customer/cart')}
                className="bg-white text-green-fresh hover:bg-white/90 font-bold text-xs sm:text-sm"
              >
                VIEW CART
                <ShoppingCart className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>}

      {/* Cart Popup */}
      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        restaurantName={restaurant?.name}
        itemCount={addedItemCount}
      />

      {/* Cart Confirmation Dialog */}
      <CartConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={handleCancelAddToCart}
        onConfirm={handleConfirmAddToCart}
        currentRestaurantName={cartItems.find(item => item.restaurant_id !== (restaurant?.id || id))?.restaurant_name}
        newRestaurantName={restaurant?.name}
        itemCount={cartItems.filter(item => item.restaurant_id !== (restaurant?.id || id)).length}
      />

      {/* Bottom Navigation */}
      <CustomerBottomNavigation />
    </div>;
};
export default RestaurantDetails;