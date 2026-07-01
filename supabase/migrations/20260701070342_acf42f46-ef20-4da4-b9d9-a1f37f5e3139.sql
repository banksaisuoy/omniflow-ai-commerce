
-- RBAC
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','cashier','customer');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "ur_self_select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "ur_admin_manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- Migrate existing admin roles from profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM public.profiles WHERE role = 'admin'
ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'customer'::app_role FROM public.profiles WHERE role IS NULL OR role = 'customer'
ON CONFLICT DO NOTHING;

-- LOYALTY
CREATE TABLE public.loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','vip')),
  birthday DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.loyalty_accounts TO authenticated;
GRANT ALL ON public.loyalty_accounts TO service_role;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_select" ON public.loyalty_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "loyalty_insert" ON public.loyalty_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loyalty_update" ON public.loyalty_accounts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('purchase','redemption','referral','birthday','manual','refund')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.loyalty_transactions TO authenticated;
GRANT ALL ON public.loyalty_transactions TO service_role;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lt_select" ON public.loyalty_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "lt_insert" ON public.loyalty_transactions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_loyalty_tier()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.tier := CASE
    WHEN NEW.lifetime_points >= 20000 THEN 'vip'
    WHEN NEW.lifetime_points >= 5000 THEN 'gold'
    WHEN NEW.lifetime_points >= 1000 THEN 'silver'
    ELSE 'bronze' END;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_loyalty_tier BEFORE UPDATE OF lifetime_points ON public.loyalty_accounts FOR EACH ROW EXECUTE FUNCTION public.update_loyalty_tier();

-- REFERRALS
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','expired')),
  reward_points INTEGER NOT NULL DEFAULT 200,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ref_select" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "ref_insert" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);

-- FLASH SALES
CREATE TABLE public.flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT, banner_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.flash_sales TO anon, authenticated;
GRANT ALL ON public.flash_sales TO service_role;
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fs_select" ON public.flash_sales FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "fs_all_admin" ON public.flash_sales FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.flash_sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flash_sale_id UUID NOT NULL REFERENCES public.flash_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sale_price NUMERIC(10,2) NOT NULL,
  stock_limit INTEGER NOT NULL DEFAULT 0,
  sold_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(flash_sale_id, product_id)
);
GRANT SELECT ON public.flash_sale_items TO anon, authenticated;
GRANT ALL ON public.flash_sale_items TO service_role;
ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fsi_select" ON public.flash_sale_items FOR SELECT USING (true);
CREATE POLICY "fsi_all_admin" ON public.flash_sale_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- BUNDLES
CREATE TABLE public.bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT, image_url TEXT,
  bundle_price NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bundles TO anon, authenticated;
GRANT ALL ON public.bundles TO service_role;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "b_select" ON public.bundles FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "b_all_admin" ON public.bundles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE(bundle_id, product_id)
);
GRANT SELECT ON public.bundle_items TO anon, authenticated;
GRANT ALL ON public.bundle_items TO service_role;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_select" ON public.bundle_items FOR SELECT USING (true);
CREATE POLICY "bi_all_admin" ON public.bundle_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- GIFT CARDS
CREATE TABLE public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  initial_amount NUMERIC(10,2) NOT NULL CHECK (initial_amount > 0),
  balance NUMERIC(10,2) NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_email TEXT, recipient_email TEXT, recipient_name TEXT, message TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','used','expired','cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.gift_cards TO authenticated;
GRANT ALL ON public.gift_cards TO service_role;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gc_select" ON public.gift_cards FOR SELECT TO authenticated USING (auth.uid() = sender_id OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "gc_insert" ON public.gift_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "gc_all_admin" ON public.gift_cards FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.gift_card_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  order_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_used NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gift_card_redemptions TO authenticated;
GRANT ALL ON public.gift_card_redemptions TO service_role;
ALTER TABLE public.gift_card_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gcr_select" ON public.gift_card_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::app_role));

-- WISHLIST
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  notify_on_price_drop BOOLEAN NOT NULL DEFAULT true,
  notify_on_restock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT ALL ON public.wishlists TO service_role;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wl_all" ON public.wishlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_flash_sales_updated BEFORE UPDATE ON public.flash_sales FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_bundles_updated BEFORE UPDATE ON public.bundles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_gift_cards_updated BEFORE UPDATE ON public.gift_cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
