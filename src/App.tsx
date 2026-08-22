import TrackOrder from "./pages/TrackOrder";
import VisualSearch from "./pages/VisualSearch";
import Wishlist from "./pages/Wishlist";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

            <Route path="/track" element={<TrackOrder />} />
            <Route path="/visual-search" element={<VisualSearch />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/faq" element={<FAQ />} />

            <Route path="*" element={<NotFound />} />
          </Routes>