import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, UserCircle, Store, Truck, LogIn, Star, Clock, MapPin } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">QuickDeliver</h1>
            </div>
            <Link to="/login">
              <Button variant="glass" className="gap-2 hover-lift">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-orange-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-fresh/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          <div className="absolute bottom-40 right-10 w-28 h-28 bg-purple-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto animate-scale-in">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Delicious Food</span>
              <br />
              <span className="text-foreground">Delivered Fast</span>
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto">
              Experience the future of food delivery with lightning-fast service, 
              fresh ingredients, and flavors that will make your taste buds dance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/login">
                <Button size="xl" variant="hero" className="w-full sm:w-auto">
                  Start Ordering Now
                </Button>
              </Link>
              <Link to="/signup/restaurant">
                <Button size="xl" variant="glass" className="w-full sm:w-auto">
                  Join as Partner
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="glass-card p-6 hover-lift rounded-2xl">
                <Clock className="h-8 w-8 text-orange-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground">30 min</div>
                <div className="text-sm text-muted-foreground">Average delivery</div>
              </div>
              <div className="glass-card p-6 hover-lift rounded-2xl">
                <Star className="h-8 w-8 text-yellow-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground">4.9/5</div>
                <div className="text-sm text-muted-foreground">Customer rating</div>
              </div>
              <div className="glass-card p-6 hover-lift rounded-2xl">
                <MapPin className="h-8 w-8 text-green-fresh mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Partner restaurants</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Options */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Join Our Platform</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your role and start your journey with QuickDeliver today
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover-lift bg-gradient-card border-orange-primary/20 rounded-2xl overflow-hidden group">
            <CardHeader className="text-center p-8">
              <div className="p-4 bg-gradient-primary rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <UserCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Customer</CardTitle>
              <CardDescription className="text-base">
                Order delicious food from your favorite restaurants with lightning-fast delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-8 pt-0">
              <Link to="/signup/customer">
                <Button variant="hero" size="lg" className="w-full">
                  Sign Up as Customer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-card border-green-fresh/20 rounded-2xl overflow-hidden group">
            <CardHeader className="text-center p-8">
              <div className="p-4 bg-gradient-fresh rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Store className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Restaurant Owner</CardTitle>
              <CardDescription className="text-base">
                Register your restaurant and start receiving orders from hungry customers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-8 pt-0">
              <Link to="/signup/restaurant">
                <Button variant="success" size="lg" className="w-full">
                  Sign Up as Restaurant
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-card border-yellow-accent/20 rounded-2xl overflow-hidden group">
            <CardHeader className="text-center p-8">
              <div className="p-4 bg-gradient-sunset rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Delivery Partner</CardTitle>
              <CardDescription className="text-base">
                Earn money by delivering food and be part of our growing network
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-8 pt-0">
              <Link to="/signup/delivery">
                <Button variant="glow" size="lg" className="w-full">
                  Join as Delivery Partner
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
