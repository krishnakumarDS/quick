# Location Services Documentation

## Automatic Location Detection

The Rapid Dish Network app now includes automatic location detection features that eliminate the need for users to manually enter their addresses.

### Features

1. **Automatic Location Detection**: When users first log in, the app automatically detects their current location
2. **Reverse Geocoding**: Converts GPS coordinates to readable addresses
3. **Manual Location Update**: Users can manually refresh their location using the navigation button
4. **Fallback Service**: Uses free geocoding services if Google Maps API is not configured
5. **IP-Based Fallback**: When GPS fails, automatically falls back to IP-based location detection
6. **Progressive Accuracy**: Tries high-accuracy GPS first, then falls back to lower accuracy, then IP-based location

### Implementation Details

#### Components Updated

- **UserMenu**: Automatically fetches location on profile load if not already set
- **CustomerHome**: Shows current location with option to refresh
- **Cart**: Pre-fills delivery address with user's saved location

#### New Files Created

- `src/hooks/useGeolocation.ts`: Custom hook for geolocation functionality
- `src/services/LocationService.ts`: Service for location operations, reverse geocoding, and IP-based fallback

#### Location Detection Strategy

The app uses a progressive fallback strategy for maximum reliability:

1. **High-Accuracy GPS**: First attempts to get precise location using GPS
2. **Low-Accuracy GPS**: If high accuracy fails, tries with lower accuracy settings
3. **IP-Based Location**: If GPS completely fails, uses IP geolocation services
4. **Manual Entry**: As final fallback, allows manual address entry

#### IP-Based Location Services

When GPS fails, the app automatically tries multiple IP geolocation services:
- `ipapi.co` - Primary service
- `ip-api.com` - Secondary service  
- `ipgeolocation.io` - Tertiary service

This ensures maximum reliability even when GPS is unavailable.

### Configuration

#### Optional: Google Maps API Key

For better reverse geocoding accuracy, you can configure a Google Maps API key:

1. Get your API key from [Google Cloud Console](https://developers.google.com/maps/documentation/javascript/get-api-key)
2. Add it to your `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

**Note**: The app works without this API key using free fallback services.

### Database Schema

The location data is stored in the `profiles` table:
- `address`: Human-readable address string
- `latitude`: GPS latitude coordinate
- `longitude`: GPS longitude coordinate

### User Experience

1. **First Time Users**: Location is automatically detected and saved
2. **Returning Users**: Saved location is displayed, with option to refresh
3. **Manual Override**: Users can still manually enter addresses if needed
4. **Error Handling**: Comprehensive error handling with browser-specific instructions

### Error Handling

The app includes comprehensive error handling for location services:

1. **Permission Denied**: Clear instructions on how to enable location access for different browsers
2. **Location Unavailable**: Guidance for network connectivity issues
3. **Timeout Errors**: Automatic retry suggestions
4. **Browser Support**: Graceful fallback for unsupported browsers

#### Error Messages

- **Permission Denied**: "Please allow location access in your browser settings. [Browser-specific instructions]"
- **Location Unavailable**: "Unable to determine your location. Please check your internet connection and try again."
- **Timeout**: "Location request took too long. Please try again."

#### Browser-Specific Instructions

The app provides browser-specific instructions for enabling location access:
- **Chrome**: "Click the location icon in your address bar and select 'Allow' for this site."
- **Firefox**: "Click the shield icon in your address bar and allow location access for this site."
- **Safari**: "Go to Safari > Preferences > Websites > Location and allow access for this site."
- **Edge**: "Click the location icon in your address bar and select 'Allow' for this site."

### Privacy & Security

- Location data is only requested when needed
- Users can deny location permission and enter addresses manually
- All location data is stored securely in the Supabase database
- No location data is shared with third parties except for geocoding services
