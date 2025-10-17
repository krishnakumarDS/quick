import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/auth/Login";
import CustomerSignup from "./pages/auth/CustomerSignup";
import RestaurantSignup from "./pages/auth/RestaurantSignup";
import DeliverySignup from "./pages/auth/DeliverySignup";
import CustomerHome from "./pages/customer/CustomerHome";
import FoodList from "./pages/customer/FoodList";
import CustomerOrders from "./pages/customer/CustomerOrders";
import RestaurantDetails from "./pages/customer/RestaurantDetails";
import Cart from "./pages/customer/Cart";
import Profile from "./pages/customer/Profile";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorMenu from "./pages/vendor/VendorMenu";
import DeliveryOrders from "./pages/delivery/DeliveryOrders";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup/customer" element={<CustomerSignup />} />
            <Route path="/signup/restaurant" element={<RestaurantSignup />} />
            <Route path="/signup/delivery" element={<DeliverySignup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Customer Routes */}
            <Route path="/customer/home" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerHome />
              </ProtectedRoute>
            } />
            <Route path="/customer/food" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <FoodList />
              </ProtectedRoute>
            } />
            <Route path="/customer/restaurant/:id" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <RestaurantDetails />
              </ProtectedRoute>
            } />
            <Route path="/customer/orders" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerOrders />
              </ProtectedRoute>
            } />
            <Route path="/customer/cart" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/customer/profile" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Vendor Routes */}
            <Route path="/vendor/orders" element={
              <ProtectedRoute allowedRoles={['restaurant_owner']}>
                <VendorOrders />
              </ProtectedRoute>
            } />
            <Route path="/vendor/menu" element={
              <ProtectedRoute allowedRoles={['restaurant_owner']}>
                <VendorMenu />
              </ProtectedRoute>
            } />
            
            {/* Delivery Routes */}
            <Route path="/delivery/orders" element={
              <ProtectedRoute allowedRoles={['delivery_partner']}>
                <DeliveryOrders />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
