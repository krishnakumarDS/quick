import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Mic, Heart, Star, ChevronDown, User, Home, UtensilsCrossed, ShoppingBag, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UserMenu from '@/components/UserMenu';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationService } from '@/services/LocationService';
import { useToast } from '@/hooks/use-toast';
import MapLocationPicker from '@/components/MapLocationPicker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
const CustomerHome = () => {
  const {
    user
  } = useAuth();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  
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
      setRestaurants(data || []);
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
    emoji: '⭐',
    color: 'from-orange-400 to-red-400'
  }, {
    name: 'Parotta',
    emoji: '🫓',
    color: 'from-yellow-400 to-orange-400'
  }, {
    name: 'Shawarma',
    emoji: '🌯',
    color: 'from-green-400 to-teal-400'
  }, {
    name: 'Pizzas',
    emoji: '🍕',
    color: 'from-red-400 to-pink-400'
  }, {
    name: 'Idli',
    emoji: '🍚',
    color: 'from-blue-400 to-cyan-400'
  }, {
    name: 'Biryani',
    emoji: '🍛',
    color: 'from-purple-400 to-pink-400'
  }, {
    name: 'Burgers',
    emoji: '🍔',
    color: 'from-orange-400 to-yellow-400'
  }, {
    name: 'Chinese',
    emoji: '🥡',
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
          <UserMenu />
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

      {/* Promotional Banner */}
      <section className="bg-gradient-to-br from-cyan-400 to-blue-500 -mt-4 rounded-t-3xl px-4 pt-6 pb-8">
        <div className="bg-white/95 rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            
            
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            
            
          </div>
          
          <h2 className="text-3xl font-extrabold text-foreground mb-2">
            Meals at just <span className="text-orange-primary">₹99</span>
          </h2>
          <p className="text-muted-foreground mb-4">from your favorite brands</p>
          <Button className="bg-orange-primary hover:bg-orange-primary/90 text-white font-bold rounded-full px-8">
            ORDER NOW
          </Button>
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
                      <div className="w-full h-full bg-gradient-to-br from-orange-400/20 to-pink-400/20 flex items-center justify-center">
                        <span className="text-6xl opacity-30">🍽️</span>
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
                  <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-md`}>
                    <span className="text-5xl">{category.emoji}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* 99 Store Section */}
      <section className="px-4 py-6 bg-gradient-to-br from-cyan-50 to-blue-50 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 text-black font-black text-xl px-2 py-1 rounded-lg transform -rotate-2">
              99
            </div>
            <h2 className="text-2xl font-bold text-foreground">store</h2>
          </div>
          <Link to="/customer/food">
            <Button variant="ghost" className="text-orange-primary font-semibold">
              See All →
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-black text-white p-1 rounded-full">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">Meals at ₹99 + Free Delivery</p>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-40 h-40 rounded-2xl bg-gradient-to-br from-orange-400/30 to-pink-400/30 flex items-center justify-center">
                <span className="text-6xl opacity-40">🍱</span>
              </div>)}
          </div>
        </div>
      </section>

      {/* All Restaurants */}
      <section className="px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">All Restaurants</h2>
        <Link to="/customer/food">
          <Button className="w-full bg-orange-primary hover:bg-orange-primary/90 text-white font-bold py-6 rounded-xl">
            View All Restaurants
          </Button>
        </Link>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="flex items-center justify-around py-3">
          <Link to="/customer/home" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/customer/food" className="flex flex-col items-center gap-1 text-orange-primary">
            <UtensilsCrossed className="h-5 w-5" />
            <span className="text-xs font-semibold">Food</span>
          </Link>
          <Link to="/customer/food" className="flex flex-col items-center gap-1 text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs">99 store</span>
          </Link>
          <Link to="/customer/orders" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Star className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </Link>
        </div>
      </nav>

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