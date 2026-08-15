import GiftCards from "./pages/GiftCards";
import BundleBuilder from "./pages/BundleBuilder";
import Referral from "./pages/Referral";
import Profile from "./pages/Profile";
import AiConcierge from "./pages/AiConcierge";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
            <Route path="/gift-cards" element={<GiftCards />} />
            <Route path="/bundles" element={<BundleBuilder />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/concierge" element={<AiConcierge />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />