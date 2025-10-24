import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, ShoppingBag } from 'lucide-react';

interface CartConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentRestaurantName?: string;
  newRestaurantName?: string;
  itemCount: number;
}

const CartConfirmationDialog: React.FC<CartConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentRestaurantName,
  newRestaurantName,
  itemCount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <DialogTitle>Different Restaurant</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            You have {itemCount} item{itemCount !== 1 ? 's' : ''} from {currentRestaurantName} in your cart.
            <br /><br />
            Adding items from {newRestaurantName} will remove your current items and start a new order.
            <br /><br />
            Are you sure you want to continue?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartConfirmationDialog;
