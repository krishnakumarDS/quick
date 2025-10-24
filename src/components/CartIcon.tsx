import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

const CartIcon: React.FC = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate('/customer/cart')}
      className="relative"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );
};

export default CartIcon;
