import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FitnessPreferences {
  id?: string;
  goal: string;
  fitness_level: string;
  available_days: number;
  session_duration: number;
  equipment: string[];
  health_conditions?: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  warmup: string;
  exercises: WorkoutExercise[];
  cooldown: string;
}

export interface GeneratedPlan {
  id?: string;
  plan_name: string;
  description: string;
  weekly_schedule: WorkoutDay[];
  tips: string[];
  progression: string;
}

export interface StoredPlan {
  id: string;
  user_id: string;
  preference_id: string;
  plan_name: string;
  plan_data: GeneratedPlan;
  is_active: boolean;
  created_at: string;
}

export const useFitnessPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fitness_preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('fitness_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as FitnessPreferences | null;
    },
    enabled: !!user,
  });
};

export const useSavePreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: Omit<FitnessPreferences, 'id'>) => {
      if (!user) throw new Error('Not authenticated');

      // Upsert preferences
      const { data, error } = await supabase
        .from('fitness_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitness_preferences'] });
    },
  });
};

export const useGeneratedPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['generated_plans', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('generated_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        plan_data: item.plan_data as unknown as GeneratedPlan
      })) as StoredPlan[];
    },
    enabled: !!user,
  });
};

export const useActivePlan = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active_plan', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('generated_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        plan_data: data.plan_data as unknown as GeneratedPlan
      } as StoredPlan;
    },
    enabled: !!user,
  });
};

export const useGeneratePlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: FitnessPreferences) => {
      if (!user) throw new Error('Not authenticated');

      // First save preferences
      const { data: prefData, error: prefError } = await supabase
        .from('fitness_preferences')
        .upsert({
          user_id: user.id,
          goal: preferences.goal,
          fitness_level: preferences.fitness_level,
          available_days: preferences.available_days,
          session_duration: preferences.session_duration,
          equipment: preferences.equipment,
          health_conditions: preferences.health_conditions,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (prefError) throw prefError;

      // Call edge function to generate plan
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-workout-plan', {
        body: { preferences }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Erro ao gerar plano');
      }

      if (functionData?.error) {
        throw new Error(functionData.error);
      }

      const plan = functionData.plan as GeneratedPlan;

      // Deactivate all existing plans
      await supabase
        .from('generated_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Save the new plan
      const { data: planData, error: planError } = await supabase
        .from('generated_plans')
        .insert([{
          user_id: user.id,
          preference_id: prefData.id,
          plan_name: plan.plan_name,
          plan_data: JSON.parse(JSON.stringify(plan)),
          is_active: true,
        }])
        .select()
        .single();

      if (planError) throw planError;

      return { 
        ...planData, 
        plan_data: plan
      } as StoredPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated_plans'] });
      queryClient.invalidateQueries({ queryKey: ['active_plan'] });
      queryClient.invalidateQueries({ queryKey: ['fitness_preferences'] });
      toast.success('Plano de treino gerado com sucesso!');
    },
    onError: (error) => {
      console.error('Error generating plan:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar plano');
    },
  });
};

export const useSetActivePlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Deactivate all plans
      await supabase
        .from('generated_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate the selected plan
      const { error } = await supabase
        .from('generated_plans')
        .update({ is_active: true })
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated_plans'] });
      queryClient.invalidateQueries({ queryKey: ['active_plan'] });
      toast.success('Plano ativado!');
    },
  });
};
