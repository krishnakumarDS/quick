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
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation';

const FoodList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .eq('is_approved', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      
      // If no data from database, use sample restaurant data
      if (!data || data.length === 0) {
        const sampleData = getSampleRestaurants();
        setRestaurants(sampleData);
      } else {
        setRestaurants(data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      // If there's an error, still show sample restaurant data
      const sampleData = getSampleRestaurants();
      setRestaurants(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const getSampleRestaurants = () => {
    return [
      {
        id: 'sample-restaurant-1',
        name: 'Spice Palace',
        description: 'Authentic Indian cuisine with a modern twist',
        category: 'Indian',
        rating: 4.5,
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
        is_active: true,
        is_approved: true,
        address: '123 Main Street, Coimbatore',
        delivery_time: '25-30 mins',
        total_reviews: 150
      },
      {
        id: 'sample-restaurant-2',
        name: 'Pizza Corner',
        description: 'Fresh Italian pizzas made with authentic ingredients',
        category: 'Italian',
        rating: 4.3,
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
        is_active: true,
        is_approved: true,
        address: '456 Park Avenue, Coimbatore',
        delivery_time: '20-25 mins',
        total_reviews: 120
      },
      {
        id: 'sample-restaurant-3',
        name: 'Burger Palace',
        description: 'Juicy burgers and crispy fries for the perfect meal',
        category: 'Fast Food',
        rating: 4.2,
        image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
        is_active: true,
        is_approved: true,
        address: '789 Central Road, Coimbatore',
        delivery_time: '15-20 mins',
        total_reviews: 200
      },
      {
        id: 'sample-restaurant-4',
        name: 'Chinese Delight',
        description: 'Authentic Chinese cuisine with fresh ingredients',
        category: 'Chinese',
        rating: 4.1,
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
        is_active: true,
        is_approved: true,
        address: '321 Garden Street, Coimbatore',
        delivery_time: '30-35 mins',
        total_reviews: 85
      },
      {
        id: 'sample-restaurant-5',
        name: 'Sweet Treats',
        description: 'Delicious desserts and baked goods',
        category: 'Desserts',
        rating: 4.6,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
        is_active: true,
        is_approved: true,
        address: '654 Market Street, Coimbatore',
        delivery_time: '20-25 mins',
        total_reviews: 180
      }
    ];
  };

  const categories = [
    { value: 'all', label: 'All Restaurants' },
    { value: 'Indian', label: 'Indian' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Fast Food', label: 'Fast Food' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Desserts', label: 'Desserts' }
  ];


  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || restaurant.category === selectedCategory;
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
                placeholder="Search for restaurants"
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
            {loading ? 'Loading...' : `${filteredRestaurants.length} Restaurants`}
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
              {filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white border-border">
                  <div className="flex gap-3 p-3">
                    <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted/30">
                      {restaurant.image_url ? (
                        <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
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
                            <h3 className="font-bold text-base text-foreground truncate">{restaurant.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{restaurant.description}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {restaurant.address}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-green-fresh fill-green-fresh" />
                            <span className="font-bold text-foreground">{restaurant.rating}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{restaurant.delivery_time}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{restaurant.category}</span>
                          <Link to={`/customer/restaurant/${restaurant.id}`}>
                            <Button 
                              size="sm"
                              className="bg-orange-primary hover:bg-orange-primary/90 text-white h-8 px-4 rounded-md font-bold text-xs uppercase"
                            >
                              View Menu
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredRestaurants.length === 0 && !loading && (
              <div className="text-center py-12">
                <UtensilsCrossed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </main>


      {/* Bottom Navigation */}
      <CustomerBottomNavigation />
    </div>
  );
};

export default FoodList;