import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus } from 'lucide-react';

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  onConfirm: (quantity: number, specialInstructions: string) => void;
  isLoading: boolean;
}

const OrderDialog: React.FC<OrderDialogProps> = ({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleConfirm = () => {
    onConfirm(quantity, specialInstructions);
    setQuantity(1);
    setSpecialInstructions('');
  };

  if (!item) return null;

  const totalPrice = (item.price * quantity).toFixed(2);
  const deliveryFee = 40;
  const taxAmount = (item.price * quantity * 0.05).toFixed(2);
  const finalAmount = (parseFloat(totalPrice) + deliveryFee + parseFloat(taxAmount)).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Customize Your Order</DialogTitle>
          <DialogDescription className="text-sm">
            {item.name} from {item.restaurants?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-20 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Any special requests for your order..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </div>

          {/* Order Summary */}
          <div className="space-y-3 border-t pt-4 bg-muted/30 -mx-6 px-6 py-4 -mb-4">
            <h3 className="font-bold text-sm">Bill Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Item Total</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (5%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>TO PAY</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="bg-orange-primary hover:bg-orange-primary/90 text-white flex-1 font-bold"
          >
            {isLoading ? 'Placing...' : `Place Order`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;