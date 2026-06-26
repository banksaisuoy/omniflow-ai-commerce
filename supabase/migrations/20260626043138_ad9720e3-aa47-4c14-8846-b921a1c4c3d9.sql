
-- ============ POS / Cashier / Shift Management ============

-- 1) SHIFTS
CREATE TABLE public.pos_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cashier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  branch_id UUID,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opening_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
  closing_cash_expected NUMERIC(12,2),
  closing_cash_actual NUMERIC(12,2),
  variance NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX pos_shifts_one_open_per_cashier
  ON public.pos_shifts(cashier_id) WHERE status='open';
CREATE INDEX pos_shifts_status_idx ON public.pos_shifts(status);

GRANT SELECT, INSERT, UPDATE ON public.pos_shifts TO authenticated;
GRANT ALL ON public.pos_shifts TO service_role;
ALTER TABLE public.pos_shifts ENABLE ROW LEVEL SECURITY;

-- 2) CASH MOVEMENTS
CREATE TABLE public.pos_cash_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID NOT NULL REFERENCES public.pos_shifts(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in','out')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pos_cash_movements TO authenticated;
GRANT ALL ON public.pos_cash_movements TO service_role;
ALTER TABLE public.pos_cash_movements ENABLE ROW LEVEL SECURITY;

-- 3) TRANSACTIONS
CREATE TABLE public.pos_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_no TEXT NOT NULL UNIQUE,
  shift_id UUID NOT NULL REFERENCES public.pos_shifts(id) ON DELETE RESTRICT,
  cashier_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id UUID REFERENCES public.profiles(id),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','voided','refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pos_txn_shift_idx ON public.pos_transactions(shift_id);
CREATE INDEX pos_txn_created_idx ON public.pos_transactions(created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.pos_transactions TO authenticated;
GRANT ALL ON public.pos_transactions TO service_role;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;

-- 4) TRANSACTION ITEMS
CREATE TABLE public.pos_transaction_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  name_snapshot TEXT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  line_discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pos_items_txn_idx ON public.pos_transaction_items(transaction_id);
GRANT SELECT, INSERT ON public.pos_transaction_items TO authenticated;
GRANT ALL ON public.pos_transaction_items TO service_role;
ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;

-- 5) PAYMENTS
CREATE TABLE public.pos_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('cash','promptpay','card','ewallet')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  ref_no TEXT,
  change_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pos_pay_txn_idx ON public.pos_payments(transaction_id);
GRANT SELECT, INSERT ON public.pos_payments TO authenticated;
GRANT ALL ON public.pos_payments TO service_role;
ALTER TABLE public.pos_payments ENABLE ROW LEVEL SECURITY;

-- 6) REFUNDS
CREATE TABLE public.pos_refunds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  refund_no TEXT NOT NULL UNIQUE,
  transaction_id UUID NOT NULL REFERENCES public.pos_transactions(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason TEXT,
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pos_refunds TO authenticated;
GRANT ALL ON public.pos_refunds TO service_role;
ALTER TABLE public.pos_refunds ENABLE ROW LEVEL SECURITY;

-- ============ Helper function: cashier or admin ============
CREATE OR REPLACE FUNCTION public.is_pos_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role IN ('admin','cashier')
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_pos_staff(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_pos_staff(UUID) TO authenticated, service_role;

-- ============ RLS Policies ============
-- shifts: cashier sees own, admin sees all
CREATE POLICY shifts_select ON public.pos_shifts FOR SELECT TO authenticated
USING (cashier_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY shifts_insert ON public.pos_shifts FOR INSERT TO authenticated
WITH CHECK (cashier_id = auth.uid() AND public.is_pos_staff(auth.uid()));
CREATE POLICY shifts_update ON public.pos_shifts FOR UPDATE TO authenticated
USING (cashier_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));

-- cash movements: scoped via shift
CREATE POLICY cash_select ON public.pos_cash_movements FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.pos_shifts s WHERE s.id=shift_id AND (s.cashier_id=auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'))));
CREATE POLICY cash_insert ON public.pos_cash_movements FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.pos_shifts s WHERE s.id=shift_id AND s.status='open' AND s.cashier_id=auth.uid()));

-- transactions: cashier sees own, admin all
CREATE POLICY txn_select ON public.pos_transactions FOR SELECT TO authenticated
USING (cashier_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY txn_insert ON public.pos_transactions FOR INSERT TO authenticated
WITH CHECK (cashier_id = auth.uid() AND public.is_pos_staff(auth.uid()));
CREATE POLICY txn_update ON public.pos_transactions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));

-- items: scoped via txn
CREATE POLICY items_select ON public.pos_transaction_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.pos_transactions t WHERE t.id=transaction_id AND (t.cashier_id=auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'))));
CREATE POLICY items_insert ON public.pos_transaction_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.pos_transactions t WHERE t.id=transaction_id AND t.cashier_id=auth.uid()));

-- payments
CREATE POLICY pay_select ON public.pos_payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.pos_transactions t WHERE t.id=transaction_id AND (t.cashier_id=auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'))));
CREATE POLICY pay_insert ON public.pos_payments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.pos_transactions t WHERE t.id=transaction_id AND t.cashier_id=auth.uid()));

-- refunds: admin only
CREATE POLICY refund_admin ON public.pos_refunds FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'))
WITH CHECK (approved_by=auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin'));

-- ============ updated_at triggers ============
CREATE TRIGGER pos_shifts_set_updated BEFORE UPDATE ON public.pos_shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pos_txn_set_updated BEFORE UPDATE ON public.pos_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Receipt number generator ============
CREATE OR REPLACE FUNCTION public.generate_pos_receipt_no()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE rn TEXT;
BEGIN
  rn := 'POS-' || to_char(now(),'YYYYMMDD') || '-' || lpad(floor(random()*100000)::TEXT, 5, '0');
  RETURN rn;
END;$$;

-- ============ Atomic POS Checkout RPC ============
CREATE OR REPLACE FUNCTION public.pos_checkout(
  _items JSONB,        -- [{product_id, name, unit_price, qty, line_discount}]
  _payments JSONB,     -- [{method, amount, ref_no, change_amount}]
  _discount_total NUMERIC DEFAULT 0,
  _vat_rate NUMERIC DEFAULT 0.07,
  _customer_id UUID DEFAULT NULL,
  _notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_shift UUID;
  v_subtotal NUMERIC := 0;
  v_total NUMERIC := 0;
  v_vat NUMERIC := 0;
  v_paid NUMERIC := 0;
  v_txn_id UUID := gen_random_uuid();
  v_receipt TEXT;
  item JSONB;
  pay JSONB;
  v_qty INT;
  v_pid UUID;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF NOT public.is_pos_staff(v_uid) THEN RAISE EXCEPTION 'forbidden'; END IF;

  SELECT id INTO v_shift FROM public.pos_shifts
   WHERE cashier_id=v_uid AND status='open' LIMIT 1;
  IF v_shift IS NULL THEN RAISE EXCEPTION 'no_open_shift'; END IF;

  -- compute subtotal
  FOR item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    v_subtotal := v_subtotal
      + (item->>'unit_price')::NUMERIC * (item->>'qty')::INT
      - COALESCE((item->>'line_discount')::NUMERIC, 0);
  END LOOP;
  v_subtotal := v_subtotal - COALESCE(_discount_total,0);
  IF v_subtotal < 0 THEN v_subtotal := 0; END IF;
  v_vat := ROUND(v_subtotal * _vat_rate / (1 + _vat_rate), 2); -- VAT included
  v_total := v_subtotal;

  -- validate payments
  FOR pay IN SELECT * FROM jsonb_array_elements(_payments) LOOP
    v_paid := v_paid + (pay->>'amount')::NUMERIC - COALESCE((pay->>'change_amount')::NUMERIC,0);
  END LOOP;
  IF v_paid + 0.01 < v_total THEN
    RAISE EXCEPTION 'insufficient_payment: paid=% total=%', v_paid, v_total;
  END IF;

  v_receipt := public.generate_pos_receipt_no();

  INSERT INTO public.pos_transactions(id, receipt_no, shift_id, cashier_id, customer_id,
    subtotal, discount_total, vat_amount, total, status, notes)
  VALUES (v_txn_id, v_receipt, v_shift, v_uid, _customer_id,
    v_subtotal + COALESCE(_discount_total,0) - 0, COALESCE(_discount_total,0), v_vat, v_total, 'paid', _notes);

  -- insert items + deduct stock
  FOR item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    v_pid := NULLIF(item->>'product_id','')::UUID;
    v_qty := (item->>'qty')::INT;
    INSERT INTO public.pos_transaction_items(transaction_id, product_id, name_snapshot, unit_price, qty, line_discount, line_total)
    VALUES (v_txn_id, v_pid, item->>'name',
      (item->>'unit_price')::NUMERIC, v_qty,
      COALESCE((item->>'line_discount')::NUMERIC, 0),
      (item->>'unit_price')::NUMERIC * v_qty - COALESCE((item->>'line_discount')::NUMERIC,0));
    IF v_pid IS NOT NULL THEN
      UPDATE public.inventory SET quantity = GREATEST(quantity - v_qty, 0),
        updated_at = now()
       WHERE product_id = v_pid;
    END IF;
  END LOOP;

  -- insert payments
  FOR pay IN SELECT * FROM jsonb_array_elements(_payments) LOOP
    INSERT INTO public.pos_payments(transaction_id, method, amount, ref_no, change_amount)
    VALUES (v_txn_id, pay->>'method', (pay->>'amount')::NUMERIC,
      pay->>'ref_no', COALESCE((pay->>'change_amount')::NUMERIC,0));
  END LOOP;

  RETURN jsonb_build_object('id', v_txn_id, 'receipt_no', v_receipt, 'total', v_total, 'vat', v_vat);
END;$$;

REVOKE EXECUTE ON FUNCTION public.pos_checkout(JSONB,JSONB,NUMERIC,NUMERIC,UUID,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pos_checkout(JSONB,JSONB,NUMERIC,NUMERIC,UUID,TEXT) TO authenticated;

-- ============ Close-shift RPC ============
CREATE OR REPLACE FUNCTION public.pos_close_shift(_shift_id UUID, _actual_cash NUMERIC, _notes TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_shift public.pos_shifts;
  v_cash_sales NUMERIC := 0;
  v_cash_in NUMERIC := 0;
  v_cash_out NUMERIC := 0;
  v_expected NUMERIC := 0;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT * INTO v_shift FROM public.pos_shifts WHERE id=_shift_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'shift_not_found'; END IF;
  IF v_shift.cashier_id <> v_uid AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=v_uid AND role='admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF v_shift.status <> 'open' THEN RAISE EXCEPTION 'shift_already_closed'; END IF;

  SELECT COALESCE(SUM(p.amount - p.change_amount),0) INTO v_cash_sales
    FROM public.pos_payments p
    JOIN public.pos_transactions t ON t.id=p.transaction_id
   WHERE t.shift_id=_shift_id AND p.method='cash' AND t.status='paid';

  SELECT COALESCE(SUM(amount),0) INTO v_cash_in
    FROM public.pos_cash_movements WHERE shift_id=_shift_id AND movement_type='in';
  SELECT COALESCE(SUM(amount),0) INTO v_cash_out
    FROM public.pos_cash_movements WHERE shift_id=_shift_id AND movement_type='out';

  v_expected := v_shift.opening_cash + v_cash_sales + v_cash_in - v_cash_out;

  UPDATE public.pos_shifts
     SET status='closed', closed_at=now(),
         closing_cash_expected=v_expected,
         closing_cash_actual=_actual_cash,
         variance=_actual_cash - v_expected,
         notes=COALESCE(_notes, notes)
   WHERE id=_shift_id;

  RETURN jsonb_build_object('expected', v_expected, 'actual', _actual_cash, 'variance', _actual_cash - v_expected);
END;$$;

REVOKE EXECUTE ON FUNCTION public.pos_close_shift(UUID,NUMERIC,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pos_close_shift(UUID,NUMERIC,TEXT) TO authenticated;
