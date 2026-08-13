import BundleBuilder from "./pages/BundleBuilder";
import Referral from "./pages/Referral";
import AiConcierge from "./pages/AiConcierge";
import ProfileSettings from "./pages/ProfileSettings";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import TrackOrder from "./pages/TrackOrder";
            <Route path="/bundles" element={<BundleBuilder />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/concierge" element={<AiConcierge />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/track" element={<TrackOrder />} />