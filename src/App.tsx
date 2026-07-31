import Referral from "./pages/Referral";
import AiConcierge from "./pages/AiConcierge";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";
import BlogPost from "./pages/BlogPost";
import TrackOrder from "./pages/TrackOrder";
import VisualSearch from "./pages/VisualSearch";
            <Route path="/referral" element={<Referral />} />
            <Route path="/concierge" element={<AiConcierge />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/visual-search" element={<VisualSearch />} />