import { Clock, Star, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RestaurantCardProps {
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  deliveryFee: string;
  isOpen: boolean;
}

const RestaurantCard = ({
  name,
  image,
  cuisine,
  rating,
  deliveryTime,
  distance,
  deliveryFee,
  isOpen
}: RestaurantCardProps) => {
  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white border-border">
      <div className="relative h-40 overflow-hidden">
        <div className="w-full h-full bg-muted/20 flex items-center justify-center">
          <div className="text-5xl opacity-30">🍽️</div>
        </div>
        {!isOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-base">CLOSED</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow-sm flex items-center gap-1">
          <Star className="h-3 w-3 fill-green-fresh text-green-fresh" />
          <span className="text-xs font-bold text-foreground">{rating}</span>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-bold text-base mb-1 text-foreground truncate">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2 truncate">{cuisine}</p>
        
        <div className="flex items-center justify-between text-xs border-t border-border pt-2">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{distance}</span>
            </div>
          </div>
          {deliveryFee === "0" && (
            <div className="text-green-fresh font-semibold text-xs">
              FREE
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;