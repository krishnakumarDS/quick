import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Mail, Phone, MapPin, Navigation, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LocationService } from '@/services/LocationService';
import { useToast } from '@/hooks/use-toast';
import MapLocationPicker from '@/components/MapLocationPicker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation';

const Profile = () => {
  const navigate = useNavigate();
  const { signOut, user, userRole } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setPhone(data?.phone || '');
      setAddress(data?.address || '');
      
      // Auto-fetch location if not already set
      if (!data?.address && !data?.latitude && !data?.longitude) {
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!user) return;
    
    setIsGettingLocation(true);
    try {
      const locationData = await LocationService.getCurrentLocationWithAddress();
      
      if (locationData) {
        setAddress(locationData.address);
        
        // Save to database
        const { error } = await supabase
          .from('profiles')
          .update({
            address: locationData.address,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          })
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Location Updated",
          description: "Your location has been automatically detected and saved.",
        });
        
        // Trigger profile update event
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }
    } catch (error: any) {
      console.error('GPS location failed, trying IP-based location...', error);
      
      // Try IP-based location as fallback
      try {
        const ipLocationData = await LocationService.getIPLocation();
        
        if (ipLocationData) {
          setAddress(ipLocationData.address);
          
          // Save to database
          const { error } = await supabase
            .from('profiles')
            .update({
              address: ipLocationData.address,
              latitude: ipLocationData.latitude,
              longitude: ipLocationData.longitude,
            })
            .eq('user_id', user.id);

          if (error) throw error;
          
          toast({
            title: "Approximate Location Detected",
            description: `Using approximate location: ${ipLocationData.address}. You can update this manually if needed.`,
          });
          
          // Trigger profile update event
          window.dispatchEvent(new CustomEvent('profileUpdated'));
          return;
        }
      } catch (ipError) {
        console.error('IP location also failed:', ipError);
      }
      
      // Show map picker dialog for manual location selection
      console.log('All location methods failed, showing map picker');
      setShowMapDialog(true);

      // Provide specific error messages based on error type
      let errorTitle = "Location Detection Failed";
      let errorDescription = "Could not automatically detect your location. Please select your location on the map.";
      
      if (error.code === 1) { // PERMISSION_DENIED
        errorTitle = "Location Permission Required";
        errorDescription = `Please allow location access in your browser settings. ${LocationService.getLocationInstructions()}`;
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorTitle = "Location Services Unavailable";
        errorDescription = "Unable to determine your location. Please select your location on the map.";
      } else if (error.code === 3) { // TIMEOUT
        errorTitle = "Location Request Timeout";
        errorDescription = "Location request took too long. Please select your location on the map.";
      } else if (error.message) {
        errorDescription = error.message;
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapLocationSelect = async (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    try {
      setAddress(location.address);

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setShowMapDialog(false);

      toast({
        title: "Location Updated",
        description: `Your location has been set to: ${location.address}`,
      });

      // Trigger profile update event
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save location. Please try again.",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone,
          address,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      
      // Trigger profile update event
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to role-specific login page based on current user role
      switch (userRole) {
        case 'customer':
          navigate('/login/customer');
          break;
        case 'delivery_partner':
          navigate('/login/delivery');
          break;
        case 'restaurant_owner':
          navigate('/login/restaurant');
          break;
        case 'admin':
          navigate('/login');
          break;
        default:
          navigate('/login/customer');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b shadow-sm px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your account settings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and delivery address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Full Name
              </Label>
              <Input 
                id="name"
                value={profile?.full_name || ''} 
                readOnly 
                className="h-10 text-sm bg-muted/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </Label>
              <Input 
                id="email"
                value={user?.email || ''} 
                readOnly 
                className="h-10 text-sm bg-muted/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone Number
              </Label>
              <Input 
                id="phone"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Address
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="address"
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="h-10 text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="h-10 px-3"
                >
                  <Navigation className="h-3 w-3" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 px-3"
                    >
                      <MapPin className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Your Location</DialogTitle>
                      <DialogDescription>
                        Choose your delivery location on the map below. You can drag the marker to adjust the exact position.
                      </DialogDescription>
                    </DialogHeader>
                    <MapLocationPicker
                      onLocationSelect={handleMapLocationSelect}
                      initialLocation={profile?.latitude && profile?.longitude ? {
                        latitude: profile.latitude,
                        longitude: profile.longitude,
                        address: profile.address
                      } : undefined}
                      className="w-full"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogout}
              className="w-full bg-orange-primary hover:bg-orange-primary/90 text-white font-semibold"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <CustomerBottomNavigation />
    </div>
  );
};

export default Profile;
