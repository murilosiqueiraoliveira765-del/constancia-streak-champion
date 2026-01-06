-- Tabela para notificações pendentes
CREATE TABLE IF NOT EXISTS public.pending_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, type)
);

-- Enable RLS
ALTER TABLE public.pending_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" 
ON public.pending_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.pending_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.pending_notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Service role can insert (for edge function)
CREATE POLICY "Service role can insert notifications" 
ON public.pending_notifications 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_notifications;