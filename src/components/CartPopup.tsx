import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string;
  itemCount?: number;
}

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose, restaurantName, itemCount = 0 }) => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice } = useCart();
  const [showFullCart, setShowFullCart] = useState(false);

  const handleViewCart = () => {
    navigate('/customer/cart');
    onClose();
  };

  const totalPrice = getTotalPrice();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Items Added to Cart
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-lg font-semibold">
                {itemCount} item{itemCount !== 1 ? 's' : ''} added to cart
              </p>
              {restaurantName && (
                <p className="text-sm text-muted-foreground">
                  from {restaurantName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Items:</span>
                <Badge variant="secondary">{cartItems.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="font-bold text-lg">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={handleViewCart}
                className="flex-1 bg-orange-primary hover:bg-orange-primary/90"
              >
                View Cart
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartPopup;
