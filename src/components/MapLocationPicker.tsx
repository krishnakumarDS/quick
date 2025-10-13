import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, MapPin, Navigation } from 'lucide-react';

// Fix for default markers in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  className?: string;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isMapReady, setIsMapReady] = useState(false);

  // Reverse geocoding function using Nominatim (OpenStreetMap)
  const getAddressFromCoords = async (lat: number, lon: number): Promise<string> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RapidDishNetwork/1.0',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      
      if (data.display_name) {
        return data.display_name;
      }
      
      // Fallback: construct address from components
      const components = data.address || {};
      const parts = [
        components.house_number,
        components.road,
        components.suburb,
        components.city,
        components.state,
        components.country,
      ].filter(Boolean);
      
      return parts.join(', ') || 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return `Location: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default to India center if no initial location
    const defaultLat = initialLocation?.latitude || 20.5937;
    const defaultLon = initialLocation?.longitude || 78.9629;
    const defaultZoom = initialLocation ? 18 : 5;

    const map = L.map(mapRef.current).setView([defaultLat, defaultLon], defaultZoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Add initial marker if location provided
    if (initialLocation) {
      addMarker(initialLocation.latitude, initialLocation.longitude, initialLocation.address);
    }

    // Add click handler to place marker
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      await addMarker(lat, lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLocation]);

  // Add marker to map
  const addMarker = async (lat: number, lon: number, address?: string) => {
    if (!mapInstanceRef.current) return;

    setIsLoading(true);

    try {
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Create new marker
      const marker = L.marker([lat, lon], { draggable: true }).addTo(mapInstanceRef.current);
      markerRef.current = marker;

      // Center map on marker
      mapInstanceRef.current.setView([lat, lon], 18);

      // Get address if not provided
      let finalAddress = address;
      if (!finalAddress) {
        finalAddress = await getAddressFromCoords(lat, lon);
      }

      setCurrentAddress(finalAddress);

      // Add drag handler
      marker.on('dragend', async () => {
        const newPos = marker.getLatLng();
        const newAddress = await getAddressFromCoords(newPos.lat, newPos.lng);
        setCurrentAddress(newAddress);
      });

    } catch (error) {
      console.error('Error adding marker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await addMarker(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        let message = 'Error getting location: ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += 'Location access denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location information unavailable. Please try again or select manually on the map.';
            break;
          case error.TIMEOUT:
            message += 'Location request timed out. Please try again.';
            break;
          default:
            message += error.message;
        }
        
        alert(message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Confirm location selection
  const confirmLocation = () => {
    if (markerRef.current) {
      const pos = markerRef.current.getLatLng();
      onLocationSelect({
        latitude: pos.lat,
        longitude: pos.lng,
        address: currentAddress,
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Set Your Delivery Location
        </CardTitle>
        <CardDescription>
          Click "Use Current Location" or click on the map to set your delivery address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={getCurrentLocation}
            disabled={isLoading || !isMapReady}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Use Current Location
          </Button>
        </div>

        <div
          ref={mapRef}
          className="h-96 w-full rounded-lg border"
          style={{ minHeight: '300px' }}
        />

        {currentAddress && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Selected Address:</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              📍 {currentAddress}
            </p>
            <Button
              onClick={confirmLocation}
              className="w-full"
              disabled={!currentAddress}
            >
              Confirm This Location
            </Button>
          </div>
        )}

        {!isMapReady && (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading map...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapLocationPicker;
