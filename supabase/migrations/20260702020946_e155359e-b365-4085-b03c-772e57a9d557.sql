
-- gdrive_settings: key-value config (folder ids etc.)
CREATE TABLE public.gdrive_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gdrive_settings TO authenticated;
GRANT ALL ON public.gdrive_settings TO service_role;
ALTER TABLE public.gdrive_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage gdrive_settings" ON public.gdrive_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_gdrive_settings_updated BEFORE UPDATE ON public.gdrive_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- gdrive_backups: history
CREATE TABLE public.gdrive_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT,
  size_bytes BIGINT DEFAULT 0,
  tables JSONB NOT NULL DEFAULT '[]'::jsonb,
  row_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'success',
  error TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.gdrive_backups TO authenticated;
GRANT ALL ON public.gdrive_backups TO service_role;
ALTER TABLE public.gdrive_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read gdrive_backups" ON public.gdrive_backups
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert gdrive_backups" ON public.gdrive_backups
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ai_chat_sessions
CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'สนทนากับผู้ช่วย',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_sessions TO authenticated;
GRANT ALL ON public.ai_chat_sessions TO service_role;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own chat sessions" ON public.ai_chat_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_ai_chat_sessions_updated BEFORE UPDATE ON public.ai_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ai_chat_messages
CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.ai_chat_messages TO authenticated;
GRANT ALL ON public.ai_chat_messages TO service_role;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own chat messages" ON public.ai_chat_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ai_chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "users insert own chat messages" ON public.ai_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.ai_chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

-- product_recommendations: precomputed similarity
CREATE TABLE public.product_recommendations (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  recommended_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  algorithm TEXT NOT NULL DEFAULT 'vector_similarity',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_recommendations TO anon, authenticated;
GRANT ALL ON public.product_recommendations TO service_role;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read recommendations" ON public.product_recommendations
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage recommendations" ON public.product_recommendations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
