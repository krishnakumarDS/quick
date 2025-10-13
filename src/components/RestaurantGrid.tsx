import RestaurantCard from './RestaurantCard';
import restaurant1 from '@/assets/restaurant-1.jpg';
import restaurant2 from '@/assets/restaurant-2.jpg';
import restaurant3 from '@/assets/restaurant-3.jpg';

const restaurants = [
  {
    id: '1',
    name: 'Bella Vista Restaurant',
    image: restaurant1,
    cuisine: 'Italian • Mediterranean',
    rating: 4.5,
    deliveryTime: '25-30 min',
    distance: '2.1 km',
    deliveryFee: '0',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Pizza Palace',
    image: restaurant2,
    cuisine: 'Pizza • Italian',
    rating: 4.7,
    deliveryTime: '30-35 min',
    distance: '1.8 km',
    deliveryFee: '25',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Sakura Sushi',
    image: restaurant3,
    cuisine: 'Japanese • Sushi',
    rating: 4.8,
    deliveryTime: '20-25 min',
    distance: '3.2 km',
    deliveryFee: '0',
    isOpen: true,
  },
  {
    id: '4',
    name: 'Spice Garden',
    image: restaurant1,
    cuisine: 'Indian • Spicy',
    rating: 4.6,
    deliveryTime: '35-40 min',
    distance: '2.7 km',
    deliveryFee: '30',
    isOpen: false,
  },
  {
    id: '5',
    name: 'Burger Junction',
    image: restaurant2,
    cuisine: 'American • Fast Food',
    rating: 4.3,
    deliveryTime: '15-20 min',
    distance: '1.2 km',
    deliveryFee: '0',
    isOpen: true,
  },
  {
    id: '6',
    name: 'Green Bowl',
    image: restaurant3,
    cuisine: 'Healthy • Salads',
    rating: 4.4,
    deliveryTime: '25-30 min',
    distance: '2.9 km',
    deliveryFee: '20',
    isOpen: true,
  },
];

const RestaurantGrid = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Popular Restaurants Near You</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover amazing restaurants in your area. Fresh food, fast delivery, and great prices.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              name={restaurant.name}
              image={restaurant.image}
              cuisine={restaurant.cuisine}
              rating={restaurant.rating}
              deliveryTime={restaurant.deliveryTime}
              distance={restaurant.distance}
              deliveryFee={restaurant.deliveryFee}
              isOpen={restaurant.isOpen}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantGrid;