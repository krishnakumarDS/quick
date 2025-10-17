import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, Star, User } from 'lucide-react';

const CustomerBottomNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-around py-3">
        <Link 
          to="/customer/home" 
          className={`flex flex-col items-center gap-1 ${
            isActive('/customer/home') 
              ? 'text-orange-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <UtensilsCrossed className="h-5 w-5" />
          <span className="text-xs font-semibold">Food</span>
        </Link>
        <Link 
          to="/customer/food" 
          className={`flex flex-col items-center gap-1 ${
            isActive('/customer/food') 
              ? 'text-orange-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs">Foods</span>
        </Link>
        <Link 
          to="/customer/orders" 
          className={`flex flex-col items-center gap-1 ${
            isActive('/customer/orders') 
              ? 'text-orange-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <Star className="h-5 w-5" />
          <span className="text-xs">Orders</span>
        </Link>
        <Link 
          to="/customer/profile" 
          className={`flex flex-col items-center gap-1 ${
            isActive('/customer/profile') 
              ? 'text-orange-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default CustomerBottomNavigation;
