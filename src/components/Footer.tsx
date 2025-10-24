import { Facebook, Twitter, Instagram, Smartphone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-primary to-yellow-accent bg-clip-text text-transparent">
              Quick Delivery
            </div>
            <p className="text-gray-300">
              Your favorite food delivered fast. Fresh ingredients, amazing flavors, 
              and reliable service right to your doorstep.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-orange-primary/20">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-orange-primary/20">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-orange-primary/20">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="justify-start p-0 h-auto text-gray-300 hover:text-white">
                About Us
              </Button>
              <Button variant="ghost" className="justify-start p-0 h-auto text-gray-300 hover:text-white">
                How it Works
              </Button>
              <Button variant="ghost" className="justify-start p-0 h-auto text-gray-300 hover:text-white">
                Partner with Us
              </Button>
              <Button variant="ghost" className="justify-start p-0 h-auto text-gray-300 hover:text-white">
                Careers
              </Button>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="justify-start p-0 h-auto text-gray-300 hover:text-white">
                Help Center
              </Button>
              <Button variant="ghost" className="justify-start p-0 h-auto text-gray-300 hover:text-white">
                Contact Us
              </Button>
              <Button variant="ghost" className="justify-start p-0 h-auto text-gray-300 hover:text-white">
                Privacy Policy
              </Button>
              <Button variant="ghost" className="justify-start p-0 h-auto text-gray-300 hover:text-white">
                Terms of Service
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-orange-primary" />
                <span className="text-gray-300">+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-primary" />
                <span className="text-gray-300">support@quickdelivery.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-orange-primary" />
                <span className="text-gray-300">Available in 50+ cities</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Quick Delivery. All rights reserved. Made with ❤️ for food lovers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;