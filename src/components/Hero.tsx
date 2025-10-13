import { ArrowRight, Clock, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import heroFood from '@/assets/hero-food.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroFood}
          alt="Delicious food delivery"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your Favorite Food
            <span className="block bg-gradient-to-r from-orange-primary to-yellow-accent bg-clip-text text-transparent">
              Delivered Fast
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Order from the best restaurants near you. Fresh food, fast delivery, 
            and amazing flavors right to your doorstep.
          </p>

          {/* Location and Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Enter your delivery address"
                    className="pl-10 bg-white text-black border-none h-12 text-base"
                  />
                </div>
                <Button variant="hero" size="lg" className="h-12 px-8">
                  Find Restaurants
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <Clock className="h-5 w-5 text-yellow-accent" />
              <span className="font-semibold">30 min delivery</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <Star className="h-5 w-5 text-yellow-accent" />
              <span className="font-semibold">500+ restaurants</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <MapPin className="h-5 w-5 text-yellow-accent" />
              <span className="font-semibold">10km radius</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-orange-primary/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-accent/20 rounded-full blur-xl animate-pulse delay-1000" />
    </section>
  );
};

export default Hero;