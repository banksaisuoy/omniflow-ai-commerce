import BlogPost from "./pages/BlogPost";
import TrackOrder from "./pages/TrackOrder";
import VisualSearch from "./pages/VisualSearch";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";

import NotFound from "./pages/NotFound";
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/visual-search" element={<VisualSearch />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />