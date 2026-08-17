import TrackOrder from "./pages/TrackOrder";
import VisualSearch from "./pages/VisualSearch";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Settings from "./pages/Settings";

import NotFound from "./pages/NotFound";
import { AIChatWidget } from "./components/chat/AIChatWidget";
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/visual-search" element={<VisualSearch />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />