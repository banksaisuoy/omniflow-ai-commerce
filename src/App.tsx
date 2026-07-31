import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import CheckoutFlow from "./components/checkout/CheckoutFlow";
import CheckoutSuccessPage from "./app/checkout/success/page";
import Auth from "./pages/Auth";
import Loyalty from "./pages/Loyalty";
import Wishlist from "./pages/Wishlist";
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-flow" element={<CheckoutFlow />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/loyalty" element={<Loyalty />} />