-- Tabela para rastreamento de água
CREATE TABLE public.water_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL DEFAULT 250,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own water intake" 
ON public.water_intake FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water intake" 
ON public.water_intake FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water intake" 
ON public.water_intake FOR DELETE USING (auth.uid() = user_id);

-- Tabela para configurações de lembretes
CREATE TABLE public.reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  daily_water_goal_ml INTEGER NOT NULL DEFAULT 2000,
  water_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  water_reminder_interval_minutes INTEGER NOT NULL DEFAULT 60,
  water_reminder_start_hour INTEGER NOT NULL DEFAULT 7,
  water_reminder_end_hour INTEGER NOT NULL DEFAULT 22,
  meal_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  breakfast_time TIME DEFAULT '07:00',
  lunch_time TIME DEFAULT '12:00',
  dinner_time TIME DEFAULT '19:00',
  snack_time TIME DEFAULT '15:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" 
ON public.reminder_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.reminder_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.reminder_settings FOR UPDATE USING (auth.uid() = user_id);

-- Tabela para confirmações de lembretes (para rastrear se confirmou)
CREATE TABLE public.reminder_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('water', 'breakfast', 'lunch', 'dinner', 'snack')),
  confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE public.reminder_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own confirmations" 
ON public.reminder_confirmations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own confirmations" 
ON public.reminder_confirmations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_reminder_settings_updated_at
BEFORE UPDATE ON public.reminder_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();