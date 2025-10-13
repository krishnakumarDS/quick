import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const restaurantSignupSchema = z.object({
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  fssaiNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RestaurantSignup = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    fssaiNumber: '',
    gstNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'Indian',
    'Chinese',
    'Italian',
    'Fast Food',
    'Continental',
    'Desserts',
    'Beverages',
    'South Indian',
    'North Indian',
    'Pizza',
    'Biryani',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      restaurantSignupSchema.parse(formData);

      const { error } = await signUp(
        formData.email,
        formData.password,
        'restaurant_owner',
        {
          full_name: formData.ownerName,
          phone: formData.phone,
          address: formData.address,
          restaurant_name: formData.restaurantName,
          category: formData.category,
          fssai_number: formData.fssaiNumber,
          gst_number: formData.gstNumber
        }
      );

      if (!error) {
        navigate('/login');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-light to-yellow-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Store className="h-12 w-12 text-green-fresh" />
          </div>
          <CardTitle className="text-2xl font-bold">Restaurant Signup</CardTitle>
          <CardDescription>Register your restaurant and start receiving orders</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                name="restaurantName"
                type="text"
                placeholder="Enter restaurant name"
                value={formData.restaurantName}
                onChange={handleInputChange}
                className={errors.restaurantName ? 'border-destructive' : ''}
              />
              {errors.restaurantName && <p className="text-sm text-destructive">{errors.restaurantName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                name="ownerName"
                type="text"
                placeholder="Enter owner name"
                value={formData.ownerName}
                onChange={handleInputChange}
                className={errors.ownerName ? 'border-destructive' : ''}
              />
              {errors.ownerName && <p className="text-sm text-destructive">{errors.ownerName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter contact number"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Restaurant Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Restaurant Category</Label>
              <Select onValueChange={handleSelectChange} value={formData.category}>
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select restaurant category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fssaiNumber">FSSAI Number (Optional)</Label>
                <Input
                  id="fssaiNumber"
                  name="fssaiNumber"
                  type="text"
                  placeholder="FSSAI License"
                  value={formData.fssaiNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                <Input
                  id="gstNumber"
                  name="gstNumber"
                  type="text"
                  placeholder="GST Number"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-fresh to-yellow-accent text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register Restaurant'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-green-fresh font-medium hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Your restaurant will be reviewed by our team before approval
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantSignup;