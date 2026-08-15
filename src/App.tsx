import VisualSearch from "./pages/VisualSearch";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";
import { AIChatWidget } from "./components/chat/AIChatWidget";
import { ThemeProvider } from "./components/ThemeProvider";

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="*" element={<NotFound />} />

          </Routes>