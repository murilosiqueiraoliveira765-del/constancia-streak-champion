import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_workouts: number;
  current_plan: string;
  plan_start_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useWorkouts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workouts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAddWorkout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (workout: {
      workout_type: string;
      duration_seconds: number;
      exercises_completed: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          ...workout,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Also add daily checkin
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_checkins')
        .upsert({
          user_id: user.id,
          checkin_date: today,
          workout_id: data.id,
        }, { onConflict: 'user_id,checkin_date' });
      
      // Update profile stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, total_workouts')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        const newStreak = profile.current_streak + 1;
        await supabase
          .from('profiles')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, profile.longest_streak),
            total_workouts: profile.total_workouts + 1,
          })
          .eq('id', user.id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
    },
  });
};

export const useExerciseProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exercise_progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAddExerciseProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (progress: {
      exercise_name: string;
      max_reps?: number;
      max_time_seconds?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('exercise_progress')
        .insert({
          user_id: user.id,
          ...progress,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise_progress'] });
    },
  });
};

export const useDailyCheckins = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
