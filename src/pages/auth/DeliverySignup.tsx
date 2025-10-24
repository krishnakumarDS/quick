import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const deliverySignupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  vehicleType: z.string().min(1, 'Please select a vehicle type'),
  vehicleNumber: z.string().min(4, 'Vehicle number must be at least 4 characters'),
  licenseNumber: z.string().min(8, 'License number must be at least 8 characters'),
  bankAccountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const DeliverySignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const vehicleTypes = [
    'Bicycle',
    'Motorcycle',
    'Scooter',
    'Car',
    'Van'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, vehicleType: value }));
    if (errors.vehicleType) {
      setErrors(prev => ({ ...prev, vehicleType: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      deliverySignupSchema.parse(formData);

      const { error } = await signUp(
        formData.email,
        formData.password,
        'delivery_partner',
        {
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          vehicle_type: formData.vehicleType,
          vehicle_number: formData.vehicleNumber,
          license_number: formData.licenseNumber,
          bank_account_number: formData.bankAccountNumber,
          ifsc_code: formData.ifscCode
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-light to-orange-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Truck className="h-12 w-12 text-yellow-accent" />
          </div>
          <CardTitle className="text-2xl font-bold">Delivery Partner Signup</CardTitle>
          <CardDescription>Join our delivery team and start earning</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your mobile number"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select onValueChange={handleSelectChange} value={formData.vehicleType}>
                <SelectTrigger className={errors.vehicleType ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((vehicle) => (
                    <SelectItem key={vehicle} value={vehicle.toLowerCase()}>
                      {vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleType && <p className="text-sm text-destructive">{errors.vehicleType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                name="vehicleNumber"
                type="text"
                placeholder="Enter vehicle registration number"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                className={errors.vehicleNumber ? 'border-destructive' : ''}
              />
              {errors.vehicleNumber && <p className="text-sm text-destructive">{errors.vehicleNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Driving License Number</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                placeholder="Enter driving license number"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className={errors.licenseNumber ? 'border-destructive' : ''}
              />
              {errors.licenseNumber && <p className="text-sm text-destructive">{errors.licenseNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Bank Account (Optional)</Label>
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  type="text"
                  placeholder="Account Number"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code (Optional)</Label>
                <Input
                  id="ifscCode"
                  name="ifscCode"
                  type="text"
                  placeholder="IFSC Code"
                  value={formData.ifscCode}
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
              className="w-full bg-gradient-to-r from-yellow-accent to-orange-primary text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Join as Delivery Partner'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-accent font-medium hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Your application will be reviewed by our team
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverySignup;