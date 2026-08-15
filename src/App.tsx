import TrackOrder from "./pages/TrackOrder";
import VisualSearch from "./pages/VisualSearch";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Profile from "./pages/Profile";

import NotFound from "./pages/NotFound";
import { AIChatWidget } from "./components/chat/AIChatWidget";
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/visual-search" element={<VisualSearch />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />