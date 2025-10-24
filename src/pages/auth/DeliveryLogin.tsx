import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

const DeliveryLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'delivery_partner') {
        navigate('/delivery/orders');
      } else {
        navigate('/unauthorized');
      }
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Login error:', error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-primary/10 rounded-full blur-2xl animate-float" style={{
          animationDelay: '2s'
        }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-yellow-accent/10 rounded-full blur-3xl animate-float" style={{
          animationDelay: '4s'
        }} />
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-orange-primary/10 rounded-full blur-2xl animate-float" style={{
          animationDelay: '1s'
        }} />
      </div>

      <Card className="w-full max-w-lg glass-card border-white/20 hover-lift relative z-10 rounded-3xl">
        <CardHeader className="text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-yellow-accent to-orange-primary rounded-2xl">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2 text-yellow-accent">Delivery Partner Login</CardTitle>
          <CardDescription className="text-base">Start delivering orders and earn money</CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="h-12 rounded-xl border-white/20 glass-card" 
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="h-12 rounded-xl border-white/20 glass-card" 
              />
            </div>
            
            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-yellow-accent to-orange-primary hover:from-yellow-accent/90 hover:to-orange-primary/90" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In as Delivery Partner'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 p-8 pt-0">
          <p className="text-sm text-muted-foreground text-center">
            Don't have a delivery partner account?
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Link to="/signup/delivery" className="w-full">
              <Button variant="glass" size="sm" className="w-full">Become a Delivery Partner</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeliveryLogin;
