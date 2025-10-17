import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Mic, Heart, Star, ChevronDown, User, Home, UtensilsCrossed, ShoppingBag, Navigation, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationService } from '@/services/LocationService';
import { useToast } from '@/hooks/use-toast';
import MapLocationPicker from '@/components/MapLocationPicker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation';
const CustomerHome = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showCartBottomPopup, setShowCartBottomPopup] = useState(true);
  
  useEffect(() => {
    fetchRestaurants();
    fetchAddress();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchAddress();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  // Show cart popup if user has items in cart when they visit home page
  useEffect(() => {
    if (cartItems.length > 0) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowCartPopup(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [cartItems.length]);
  
  const fetchAddress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('address, latitude, longitude')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setAddress(data?.address || '');
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (!user) return;
    
    setIsGettingLocation(true);
    try {
      const locationData = await LocationService.getCurrentLocationWithAddress();
      
      if (locationData) {
        setAddress(locationData.address);
        
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
          description: "Your location has been automatically detected and saved.",
        });
      }
    } catch (error: any) {
      console.error('GPS location failed, trying IP-based location...', error);
      
      // Try IP-based location as fallback
      try {
        const ipLocationData = await LocationService.getIPLocation();
        
        if (ipLocationData) {
          console.log('IP location data received:', ipLocationData);
          setAddress(ipLocationData.address);
          console.log('Address state updated to:', ipLocationData.address);
          
          // Save to database
          const { error } = await supabase
            .from('profiles')
            .update({
              address: ipLocationData.address,
              latitude: ipLocationData.latitude,
              longitude: ipLocationData.longitude,
            })
            .eq('user_id', user.id);

          if (error) {
            console.error('Database update failed:', error);
            throw error;
          }
          
          console.log('Database updated successfully');
          
          toast({
            title: "Approximate Location Detected",
            description: `Using approximate location: ${ipLocationData.address}. You can update this manually if needed.`,
          });
          console.log('Toast notification shown');
          return;
        } else {
          console.log('IP location data is null or undefined');
        }
      } catch (ipError) {
        console.error('IP location also failed:', ipError);
      }
      
        // Final fallback: Show map picker dialog
        console.log('All location methods failed, showing map picker');
        setShowMapDialog(true);

        // Provide specific error messages based on error type
        let errorTitle = "Location Detection Failed";
        let errorDescription = "Could not automatically detect your location. Please select your location on the map below.";

        if (error.code === 1) { // PERMISSION_DENIED
          errorTitle = "Location Permission Required";
          errorDescription = `Please allow location access in your browser settings. ${LocationService.getLocationInstructions()}`;
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          errorTitle = "Location Services Unavailable";
          errorDescription = "Unable to determine your location. Please select your location on the map below.";
        } else if (error.code === 3) { // TIMEOUT
          errorTitle = "Location Request Timeout";
          errorDescription = "Location request took too long. Please select your location on the map below.";
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
      setAddress(location.address);

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
        description: `Your location has been set to: ${location.address}`,
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
  const fetchRestaurants = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('restaurants').select('*').eq('is_active', true).eq('is_approved', true).order('rating', {
        ascending: false
      });
      if (error) throw error;
      
      // Add sample restaurants with images if no restaurants exist
      let restaurantsData = data || [];
      
      if (restaurantsData.length === 0) {
        restaurantsData = [
          {
            id: 'sample-1',
            name: 'Spice Garden',
            category: 'Indian Cuisine',
            rating: 4.5,
            image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
            is_active: true,
            is_approved: true,
            address: '123 Main Street, Coimbatore',
            closing_time: '23:00',
            commission_rate: 0.1,
            created_at: new Date().toISOString(),
            delivery_radius: 5,
            description: 'Authentic Indian cuisine',
            email: 'spicegarden@example.com',
            opening_time: '10:00',
            owner_id: 'sample-owner-1',
            phone: '+91 9876543210',
            updated_at: new Date().toISOString(),
            latitude: 11.0168,
            longitude: 76.9558,
            total_reviews: 150
          },
          {
            id: 'sample-2',
            name: 'Pizza Corner',
            category: 'Italian',
            rating: 4.3,
            image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
            is_active: true,
            is_approved: true,
            address: '456 Park Avenue, Coimbatore',
            closing_time: '22:30',
            commission_rate: 0.12,
            created_at: new Date().toISOString(),
            delivery_radius: 4,
            description: 'Fresh Italian pizzas',
            email: 'pizzacorner@example.com',
            opening_time: '11:00',
            owner_id: 'sample-owner-2',
            phone: '+91 9876543211',
            updated_at: new Date().toISOString(),
            latitude: 11.0168,
            longitude: 76.9558,
            total_reviews: 120
          },
          {
            id: 'sample-3',
            name: 'Burger Palace',
            category: 'Fast Food',
            rating: 4.2,
            image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
            is_active: true,
            is_approved: true,
            address: '789 Central Road, Coimbatore',
            closing_time: '23:30',
            commission_rate: 0.08,
            created_at: new Date().toISOString(),
            delivery_radius: 6,
            description: 'Juicy burgers and fries',
            email: 'burgerpalace@example.com',
            opening_time: '09:00',
            owner_id: 'sample-owner-3',
            phone: '+91 9876543212',
            updated_at: new Date().toISOString(),
            latitude: 11.0168,
            longitude: 76.9558,
            total_reviews: 200
          },
          {
            id: 'sample-4',
            name: 'Sushi Master',
            category: 'Japanese',
            rating: 4.7,
            image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
            is_active: true,
            is_approved: true,
            address: '321 Garden Street, Coimbatore',
            closing_time: '22:00',
            commission_rate: 0.15,
            created_at: new Date().toISOString(),
            delivery_radius: 3,
            description: 'Fresh sushi and Japanese cuisine',
            email: 'sushimaster@example.com',
            opening_time: '12:00',
            owner_id: 'sample-owner-4',
            phone: '+91 9876543213',
            updated_at: new Date().toISOString(),
            latitude: 11.0168,
            longitude: 76.9558,
            total_reviews: 85
          },
          {
            id: 'sample-5',
            name: 'Taco Fiesta',
            category: 'Mexican',
            rating: 4.1,
            image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            is_active: true,
            is_approved: true,
            address: '654 Market Street, Coimbatore',
            closing_time: '23:00',
            commission_rate: 0.1,
            created_at: new Date().toISOString(),
            delivery_radius: 5,
            description: 'Authentic Mexican tacos',
            email: 'tacofiesta@example.com',
            opening_time: '10:30',
            owner_id: 'sample-owner-5',
            phone: '+91 9876543214',
            updated_at: new Date().toISOString(),
            latitude: 11.0168,
            longitude: 76.9558,
            total_reviews: 95
          },
          {
            id: 'sample-6',
            name: 'Noodle House',
            category: 'Chinese',
            rating: 4.4,
            image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
            is_active: true,
            is_approved: true,
            address: '987 Food Court, Coimbatore',
            closing_time: '22:30',
            commission_rate: 0.11,
            created_at: new Date().toISOString(),
            delivery_radius: 4,
            description: 'Delicious Chinese noodles',
            email: 'noodlehouse@example.com',
            opening_time: '11:30',
            owner_id: 'sample-owner-6',
            phone: '+91 9876543215',
            updated_at: new Date().toISOString(),
            latitude: 11.0168,
            longitude: 76.9558,
            total_reviews: 180
          }
        ];
      }
      
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .eq('is_approved', true)
        .ilike('name', `%${value}%`)
        .limit(5);

      if (error) throw error;
      setSearchSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching restaurants:', error);
    }
  };

  const handleSelectRestaurant = (restaurantId: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    window.location.href = `/customer/restaurant/${restaurantId}`;
  };
  
  const categories = [{
    name: 'Specials',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&h=200&fit=crop&auto=format',
    color: 'from-orange-400 to-red-400'
  }, {
    name: 'Parotta',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop&auto=format',
    color: 'from-yellow-400 to-orange-400'
  }, {
    name: 'Shawarma',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=200&fit=crop&auto=format',
    color: 'from-green-400 to-teal-400'
  }, {
    name: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&auto=format',
    color: 'from-red-400 to-pink-400'
  }, {
    name: 'Idli',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop&auto=format',
    color: 'from-blue-400 to-cyan-400'
  },  {
    name: 'Burgers',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&auto=format',
    color: 'from-orange-400 to-yellow-400'
  }, {
    name: 'Chinese',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop&auto=format',
    color: 'from-red-500 to-orange-500'
  }];
  const filters = [{
    name: 'MIN Rs. 100 OFF',
    active: false
  }, {
    name: 'FAST DELIVERY',
    active: false
  }, {
    name: 'PURE VEG',
    active: false
  }, {
    name: 'RATING 4.0+',
    active: false
  }];
  return <div className="min-h-screen bg-background pb-20">
      {/* Header with Location */}
      <header className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white px-4 pt-3 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {address ? (
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 fill-white" />
                <span className="font-bold text-base">{address}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  <Navigation className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button 
                className="flex items-center gap-2 mb-1"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <MapPin className="h-4 w-4 fill-white" />
                <span className="font-bold text-base">
                  {isGettingLocation ? 'Detecting location...' : 'Tap to detect location'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
            
            {/* Manual location entry option when location fails */}
            {!address && !isGettingLocation && (
              <div className="mt-2">
                <span className="text-white/80 text-sm">
                  Location detection failed. Please update your address in the profile menu above.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 relative">
          <div className="flex-1 bg-white rounded-xl px-4 py-3 flex items-center gap-3 relative">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for restaurants..." 
              value={searchQuery} 
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground placeholder:text-muted-foreground" 
            />
            <Mic className="h-5 w-5 text-orange-primary" />
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-border z-50 max-h-60 overflow-y-auto">
                {searchSuggestions.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => handleSelectRestaurant(restaurant.id)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3 border-b border-border last:border-b-0"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400/20 to-pink-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{restaurant.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{restaurant.category}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-fresh text-white px-2 py-1 rounded text-xs font-bold">
                      <Star className="h-3 w-3 fill-white" />
                      {restaurant.rating || '4.3'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="bg-white rounded-xl px-4 py-3 flex flex-col items-center justify-center min-w-[60px]">
            <span className="text-green-fresh font-bold text-xs">VEG</span>
            <div className="w-3 h-3 border-2 border-green-fresh rounded-sm flex items-center justify-center mt-1">
              <div className="w-1.5 h-1.5 bg-green-fresh rounded-full"></div>
            </div>
          </button>
        </div>
      </header>

      {/* Image 1 Section */}
      <section className="px-4 py-6 mb-6">
        <div className="rounded-2xl overflow-hidden">
          <img 
            src="/image1.jpg" 
            alt="Promotional Banner"
            className="w-full h-auto object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'flex';
              }
            }}
          />
          <div className="w-full h-48 bg-gradient-to-br from-orange-400/30 to-pink-400/30 flex items-center justify-center" style={{ display: 'none' }}>
            <span className="text-6xl opacity-40">🍽️</span>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {filters.map(filter => <button key={filter.name} className="px-4 py-2 rounded-full border border-border bg-white text-sm font-medium whitespace-nowrap hover:border-orange-primary transition-colors">
              {filter.name}
            </button>)}
        </div>
      </section>

      {/* Restaurant Cards - Horizontal Scroll */}
      <section className="px-4 py-2">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="w-56">
                  <Skeleton className="h-40 rounded-2xl mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>) : restaurants.slice(0, 6).map((restaurant, index) => <Link key={restaurant.id} to={`/customer/restaurant/${restaurant.id}`}>
                  <div className="w-56 group">
                    <div className="relative rounded-2xl overflow-hidden mb-2 h-40">
                      {restaurant.image_url ? (
                        <img 
                          src={restaurant.image_url} 
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full bg-gradient-to-br from-orange-400/20 to-pink-400/20 flex items-center justify-center"
                        style={{ display: restaurant.image_url ? 'none' : 'flex' }}
                      >
                        <div className="text-center">
                          <span className="text-6xl opacity-30 block mb-2">🍽️</span>
                          <span className="text-xs text-gray-500 font-medium">{restaurant.name}</span>
                        </div>
                      </div>
                      <button className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </button>
                      {index % 3 === 0 && <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md font-bold text-sm">
                          30% OFF
                        </div>}
                      {index % 3 === 1 && <div className="absolute bottom-3 left-3 bg-orange-primary text-white px-3 py-1 rounded-md font-bold text-xs">
                          ITEMS AT ₹69
                        </div>}
                      {index % 3 === 2 && <div className="absolute bottom-3 left-3 bg-green-fresh text-white px-3 py-1 rounded-md font-bold text-xs">
                          ITEMS AT ₹59
                        </div>}
                    </div>
                    <h3 className="font-bold text-base text-foreground truncate mb-1 group-hover:text-orange-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <div className="bg-green-fresh rounded-full p-0.5">
                          <Star className="h-2.5 w-2.5 fill-white text-white" />
                        </div>
                        <span className="font-bold text-foreground">{restaurant.rating || '4.3'}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">25-30 mins</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{restaurant.category}</p>
                  </div>
                </Link>)}
          </div>
        </div>
      </section>

      {/* What's on your mind? - Categories */}
      <section className="px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">What's on your mind?</h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-6 min-w-max">
            {categories.map(category => <Link key={category.name} to="/customer/food">
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-md overflow-hidden relative`}>
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        // Fallback to emoji if image fails
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300" style={{ display: 'none' }}>
                      <span className="text-5xl opacity-60">🍽️</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* 99 Store Section */}
      <section className="px-4 py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mx-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
               <h2 className="text-xl font-bold text-foreground">Available Offers</h2>
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white p-1 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">Meals at ₹99 + Free Delivery</p>
        </div>
            </div>
          </div>
          <Link to="/customer/food" className="text-orange-primary font-semibold text-sm">
            See All &gt;
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-2">
            {[
              { 
                id: 1, 
                name: 'Chicken Fried Rice', 
                image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop',
                price: 99,
                originalPrice: null,
                isVeg: false
              },
              { 
                id: 2, 
                name: 'White Idiyappam', 
                image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop',
                price: 99,
                originalPrice: null,
                isVeg: true
              },
              { 
                id: 3, 
                name: 'Dosa', 
                image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop',
                price: 69,
                originalPrice: 90,
                isVeg: true
              },
              { 
                id: 4, 
                name: 'Butter Chicken', 
                image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop',
                price: 99,
                originalPrice: null,
                isVeg: false
              },
              { 
                id: 5, 
                name: 'Paneer Tikka', 
                image: 'https://images.unsplash.com/photo-1609501676725-7186f3a0b0c0?w=200&h=200&fit=crop',
                price: 99,
                originalPrice: null,
                isVeg: true
              }
            ].map(item => (
              <div key={item.id} className="w-32 flex-shrink-0 bg-white rounded-xl shadow-sm border relative group cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                    className="w-full h-24 object-cover rounded-t-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
                  <div className="w-full h-24 bg-gradient-to-br from-orange-400/30 to-pink-400/30 flex items-center justify-center rounded-t-xl absolute inset-0" style={{ display: 'none' }}>
                    <span className="text-3xl opacity-40">🍱</span>
                  </div>
                  
                  {/* Plus Button */}
                  <button className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-green-600 transition-colors">
                    +
                  </button>
                  
                  {/* Veg/Non-Veg Indicator */}
                  <div className="absolute top-2 left-2">
                    <div className={`w-3 h-3 rounded-full border-2 border-white ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.isVeg ? (
                        <div className="w-1 h-1 bg-white rounded-full mx-auto mt-0.5"></div>
                      ) : (
                        <div className="w-1 h-1 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-1">
                    {item.originalPrice ? (
                      <>
                        <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice}</span>
                        <span className="text-sm font-bold text-orange-primary">₹{item.price}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-orange-primary">₹{item.price}</span>
                    )}
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image 2 Section */}
      <section className="px-4 py-6 mb-6">
        <div className="rounded-2xl overflow-hidden">
          <img 
            src="/image2.jpg" 
            alt="Promotional Banner 2"
            className="w-full h-auto object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'flex';
              }
            }}
          />
          <div className="w-full h-48 bg-gradient-to-br from-blue-400/30 to-purple-400/30 flex items-center justify-center" style={{ display: 'none' }}>
            <span className="text-6xl opacity-40">🎉</span>
          </div>
        </div>
      </section>

      {/* All Restaurants */}
      <section className="px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">All Restaurants</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <Link 
                key={restaurant.id} 
                to={`/customer/restaurant/${restaurant.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
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
                    <div className="w-full h-full bg-gradient-to-br from-orange-400/30 to-pink-400/30 flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-2xl opacity-40">🍽️</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-1">{restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{restaurant.category}</p>
                    <p className="text-xs text-muted-foreground">{restaurant.address}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-foreground">{restaurant.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{restaurant.total_reviews} reviews</p>
                  </div>
                </div>
        </Link>
            ))}
            
            {restaurants.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No restaurants available</h3>
                <p className="text-muted-foreground">Check back later for new restaurants!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Cart Popup */}
      {cartItems.length > 0 && showCartBottomPopup && <div className="fixed bottom-20 left-4 right-4 bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg z-50">
          <div className="flex items-center justify-between">
            {/* Left side - Cart items info */}
            <div className="flex-1">
              <p className="font-bold text-base sm:text-lg">{cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items in cart</p>
              <p className="text-xs sm:text-sm opacity-90">Continue shopping or view cart</p>
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
              <Link to="/customer/cart">
                <Button 
                  size="sm" 
                  className="bg-white text-green-500 hover:bg-white/90 font-bold text-xs sm:text-sm"
                >
                  VIEW CART
                  <ShoppingBag className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>}

      {/* Bottom Navigation */}
      <CustomerBottomNavigation />

      {/* Map Location Picker Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Location</DialogTitle>
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
    </div>;
};
export default CustomerHome;