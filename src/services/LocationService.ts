interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formattedAddress: string;
}

interface ReverseGeocodeResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

export class LocationService {
  private static readonly GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  /**
   * Reverse geocode coordinates to get address information
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<LocationData | null> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found. Using fallback reverse geocoding.');
      return this.fallbackReverseGeocode(latitude, longitude);
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.GOOGLE_MAPS_API_KEY}`
      );
      
      const data: ReverseGeocodeResponse = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return this.parseGoogleMapsResponse(result);
      }
      
      throw new Error(`Geocoding failed: ${data.status}`);
    } catch (error) {
      console.error('Google Maps reverse geocoding failed:', error);
      return this.fallbackReverseGeocode(latitude, longitude);
    }
  }

  /**
   * Fallback reverse geocoding using free services (Nominatim + BigDataCloud)
   */
  private static async fallbackReverseGeocode(latitude: number, longitude: number): Promise<LocationData | null> {
    try {
      // Try Nominatim (OpenStreetMap) first - more accurate and free
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      
      try {
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'RapidDishNetwork/1.0',
          },
        });
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          
          if (nominatimData.display_name) {
            const components = nominatimData.address || {};
            
            return {
              address: nominatimData.display_name,
              city: components.city || components.town || components.village || '',
              state: components.state || components.province || '',
              country: components.country || '',
              postalCode: components.postcode || '',
              formattedAddress: nominatimData.display_name,
            };
          }
        }
      } catch (nominatimError) {
        console.log('Nominatim failed, trying BigDataCloud...', nominatimError);
      }
      
      // Fallback to BigDataCloud
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      const data = await response.json();
      
      if (data.localityInfo) {
        const { administrative, locality } = data.localityInfo;
        
        const city = locality?.[0]?.name || administrative?.[2]?.name || '';
        const state = administrative?.[1]?.name || '';
        const country = administrative?.[0]?.name || '';
        
        const formattedAddress = [data.locality, city, state, country]
          .filter(Boolean)
          .join(', ');
        
        return {
          address: data.locality || '',
          city,
          state,
          country,
          postalCode: data.postcode || '',
          formattedAddress,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Fallback reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Parse Google Maps API response
   */
  private static parseGoogleMapsResponse(result: any): LocationData {
    const components = result.address_components;
    let city = '';
    let state = '';
    let country = '';
    let postalCode = '';
    
    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
    });
    
    return {
      address: result.formatted_address,
      city,
      state,
      country,
      postalCode,
      formattedAddress: result.formatted_address,
    };
  }

  /**
   * Get user's current location with address
   */
  static async getCurrentLocationWithAddress(): Promise<{
    latitude: number;
    longitude: number;
    address: string;
    locationData: LocationData | null;
  } | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Try with high accuracy first, then fallback to lower accuracy
      const tryLocation = (options: PositionOptions, attempt: number = 1) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              const locationData = await this.reverseGeocode(latitude, longitude);
              resolve({
                latitude,
                longitude,
                address: locationData?.formattedAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                locationData,
              });
            } catch (error) {
              // Still resolve with coordinates even if reverse geocoding fails
              resolve({
                latitude,
                longitude,
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                locationData: null,
              });
            }
          },
          (error) => {
            // If high accuracy fails and this is the first attempt, try with lower accuracy
            if (attempt === 1 && options.enableHighAccuracy) {
              console.log('High accuracy failed, trying with lower accuracy...');
              tryLocation({
                enableHighAccuracy: false,
                timeout: 20000,
                maximumAge: 600000, // 10 minutes
              }, 2);
              return;
            }
            
            // Provide more specific error messages
            let errorMessage = 'Unknown geolocation error';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. This could be due to:\n• GPS/Location services being disabled\n• Poor GPS signal (try moving to a window or outdoors)\n• Network connectivity issues\n• Browser location service restrictions';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again or check your internet connection.';
                break;
            }
            
            const customError = new Error(errorMessage);
            (customError as any).code = error.code;
            reject(customError);
          },
          options
        );
      };

      // Start with high accuracy
      tryLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      });
    });
  }

  /**
   * Get approximate location using IP geolocation as fallback
   */
  static async getIPLocation(): Promise<{
    latitude: number;
    longitude: number;
    address: string;
    locationData: LocationData | null;
  } | null> {
    console.log('Attempting IP-based location detection...');
    
    try {
      // Try multiple IP geolocation services for better reliability
      const services = [
        {
          url: 'https://ipapi.co/json/',
          parser: (data: any) => ({
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            country: data.country_name,
            region: data.region
          })
        },
        {
          url: 'https://ip-api.com/json/',
          parser: (data: any) => ({
            latitude: data.lat,
            longitude: data.lon,
            city: data.city,
            country: data.country,
            region: data.regionName
          })
        },
        {
          url: 'https://api.db-ip.com/v2/free/self',
          parser: (data: any) => ({
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            city: data.city,
            country: data.countryName,
            region: data.stateProv
          })
        }
      ];

      for (const service of services) {
        try {
          console.log(`Trying IP service: ${service.url}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch(service.url, { 
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            console.log(`Service ${service.url} returned ${response.status}`);
            continue;
          }
          
          const data = await response.json();
          console.log(`Service ${service.url} response:`, data);
          
          const parsed = service.parser(data);
          
          if (parsed.latitude && parsed.longitude && parsed.city && parsed.country) {
            const address = `${parsed.city}, ${parsed.country}`;
            console.log(`IP location successful: ${address}`);
            
            return {
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              address,
              locationData: {
                address: parsed.city,
                city: parsed.city,
                state: parsed.region || '',
                country: parsed.country,
                postalCode: '',
                formattedAddress: address,
              },
            };
          }
        } catch (error) {
          console.log(`IP geolocation service ${service.url} failed:`, error);
          continue;
        }
      }
      
      console.log('All IP geolocation services failed');
      return null;
    } catch (error) {
      console.error('IP geolocation error:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if geolocation is supported and get permission status
   */
  static async checkLocationSupport(): Promise<{
    supported: boolean;
    permission: 'granted' | 'denied' | 'prompt' | 'unknown';
    message?: string;
  }> {
    if (!navigator.geolocation) {
      return {
        supported: false,
        permission: 'unknown',
        message: 'Geolocation is not supported by this browser'
      };
    }

    // Check if we can get permission status (modern browsers)
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return {
          supported: true,
          permission: permission.state as 'granted' | 'denied' | 'prompt',
          message: permission.state === 'denied' 
            ? 'Location access is blocked. Please enable it in your browser settings.'
            : undefined
        };
      } catch (error) {
        // Fallback for browsers that don't support permissions API
        return {
          supported: true,
          permission: 'prompt',
          message: 'Location permission status unknown'
        };
      }
    }

    return {
      supported: true,
      permission: 'prompt',
      message: 'Location permission status unknown'
    };
  }

  /**
   * Get user-friendly instructions for enabling location access
   */
  static getLocationInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return 'Click the location icon in your address bar and select "Allow" for this site.';
    } else if (userAgent.includes('firefox')) {
      return 'Click the shield icon in your address bar and allow location access for this site.';
    } else if (userAgent.includes('safari')) {
      return 'Go to Safari > Preferences > Websites > Location and allow access for this site.';
    } else if (userAgent.includes('edge')) {
      return 'Click the location icon in your address bar and select "Allow" for this site.';
    }
    
    return 'Please enable location access in your browser settings for this website.';
  }

  /**
   * Test IP location services (for debugging)
   */
  static async testIPLocationServices(): Promise<void> {
    console.log('Testing IP location services...');
    
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
      'https://api.db-ip.com/v2/free/self'
    ];

    for (const service of services) {
      try {
        console.log(`Testing: ${service}`);
        const response = await fetch(service);
        const data = await response.json();
        console.log(`✅ ${service} - Success:`, data);
      } catch (error) {
        console.log(`❌ ${service} - Failed:`, error);
      }
    }
  }
}
