import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Auth from "./pages/Auth";
import Loyalty from "./pages/Loyalty";
import Wishlist from "./pages/Wishlist";
import GiftCards from "./pages/GiftCards";
import BundleBuilder from "./pages/BundleBuilder";
import Referral from "./pages/Referral";
import AiConcierge from "./pages/AiConcierge";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import TrackOrder from "./pages/TrackOrder";
import VisualSearch from "./pages/VisualSearch";
import AdminDashboard from "./pages/admin/AdminDashboard";

import NotFound from "./pages/NotFound";
import { AIChatWidget } from "./components/chat/AIChatWidget";
import { ThemeProvider } from "./components/ThemeProvider";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/gift-cards" element={<GiftCards />} />
            <Route path="/bundles" element={<BundleBuilder />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/concierge" element={<AiConcierge />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/visual-search" element={<VisualSearch />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
          <AIChatWidget />
        </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;