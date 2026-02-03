-- Create table for user fitness preferences
CREATE TABLE public.fitness_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal TEXT NOT NULL, -- 'muscle_gain', 'weight_loss', 'endurance', 'flexibility', 'general_fitness'
  fitness_level TEXT NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  available_days INTEGER NOT NULL DEFAULT 3, -- days per week
  session_duration INTEGER NOT NULL DEFAULT 45, -- minutes
  equipment TEXT[] DEFAULT ARRAY[]::TEXT[], -- available equipment
  health_conditions TEXT, -- any limitations
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Create table for generated workout plans
CREATE TABLE public.generated_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preference_id UUID REFERENCES public.fitness_preferences(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_data JSONB NOT NULL, -- stores the full AI-generated plan
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fitness_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fitness_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.fitness_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.fitness_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.fitness_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON public.fitness_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for generated_plans
CREATE POLICY "Users can view their own plans"
  ON public.generated_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON public.generated_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.generated_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON public.generated_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_fitness_preferences_updated_at
  BEFORE UPDATE ON public.fitness_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();