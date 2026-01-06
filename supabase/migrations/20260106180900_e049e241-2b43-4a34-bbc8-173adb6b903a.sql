-- Remove a política permissiva e adiciona uma mais restritiva
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.pending_notifications;

-- A edge function usa service role key que bypassa RLS, então não precisa de policy de insert
-- Usuários autenticados não devem poder inserir diretamente