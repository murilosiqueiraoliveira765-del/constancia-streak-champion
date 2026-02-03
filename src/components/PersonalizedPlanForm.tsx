import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Target, 
  Dumbbell, 
  Clock, 
  Calendar,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FitnessPreferences, useGeneratePlan, useFitnessPreferences } from '@/hooks/usePersonalizedPlan';

const GOALS = [
  { id: 'muscle_gain', label: 'Ganho de Massa', icon: '💪', description: 'Hipertrofia e força' },
  { id: 'weight_loss', label: 'Emagrecer', icon: '🔥', description: 'Perda de gordura' },
  { id: 'endurance', label: 'Resistência', icon: '🏃', description: 'Cardio e stamina' },
  { id: 'flexibility', label: 'Flexibilidade', icon: '🧘', description: 'Mobilidade e alongamento' },
  { id: 'general_fitness', label: 'Geral', icon: '⚡', description: 'Condicionamento completo' },
];

const LEVELS = [
  { id: 'beginner', label: 'Iniciante', description: 'Começando agora ou voltando após pausa' },
  { id: 'intermediate', label: 'Intermediário', description: '6+ meses de treino regular' },
  { id: 'advanced', label: 'Avançado', description: '2+ anos de experiência' },
];

const EQUIPMENT = [
  { id: 'dumbbells', label: 'Halteres' },
  { id: 'barbell', label: 'Barra' },
  { id: 'resistance_bands', label: 'Elásticos' },
  { id: 'pull_up_bar', label: 'Barra fixa' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'treadmill', label: 'Esteira' },
  { id: 'gym_machines', label: 'Aparelhos de academia' },
];

interface PersonalizedPlanFormProps {
  onPlanGenerated?: () => void;
}

const PersonalizedPlanForm = ({ onPlanGenerated }: PersonalizedPlanFormProps) => {
  const { data: existingPreferences } = useFitnessPreferences();
  const generatePlan = useGeneratePlan();

  const [preferences, setPreferences] = useState<FitnessPreferences>({
    goal: existingPreferences?.goal || 'muscle_gain',
    fitness_level: existingPreferences?.fitness_level || 'beginner',
    available_days: existingPreferences?.available_days || 3,
    session_duration: existingPreferences?.session_duration || 45,
    equipment: existingPreferences?.equipment || [],
    health_conditions: existingPreferences?.health_conditions || '',
  });

  const handleEquipmentToggle = (equipmentId: string) => {
    setPreferences(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(e => e !== equipmentId)
        : [...prev.equipment, equipmentId]
    }));
  };

  const handleSubmit = async () => {
    await generatePlan.mutateAsync(preferences);
    onPlanGenerated?.();
  };

  return (
    <div className="space-y-6">
      {/* Goal Selection */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-display text-sm tracking-wider">OBJETIVO</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GOALS.map(goal => (
            <button
              key={goal.id}
              onClick={() => setPreferences(prev => ({ ...prev, goal: goal.id }))}
              className={cn(
                'p-3 rounded-xl text-left transition-all border',
                preferences.goal === goal.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              )}
            >
              <span className="text-2xl">{goal.icon}</span>
              <p className="font-medium text-sm mt-1">{goal.label}</p>
              <p className="text-xs text-muted-foreground">{goal.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Fitness Level */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="font-display text-sm tracking-wider">NÍVEL</h3>
        </div>
        <RadioGroup
          value={preferences.fitness_level}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, fitness_level: value }))}
          className="space-y-2"
        >
          {LEVELS.map(level => (
            <div key={level.id} className="flex items-center space-x-3">
              <RadioGroupItem value={level.id} id={level.id} />
              <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                <span className="font-medium">{level.label}</span>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* Days per week */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-display text-sm tracking-wider">DIAS POR SEMANA</h3>
        </div>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map(days => (
            <button
              key={days}
              onClick={() => setPreferences(prev => ({ ...prev, available_days: days }))}
              className={cn(
                'flex-1 py-3 rounded-lg font-display text-lg transition-all border',
                preferences.available_days === days
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              )}
            >
              {days}
            </button>
          ))}
        </div>
      </section>

      {/* Session Duration */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-display text-sm tracking-wider">DURAÇÃO</h3>
          </div>
          <span className="font-display text-lg">{preferences.session_duration} min</span>
        </div>
        <Slider
          value={[preferences.session_duration]}
          onValueChange={([value]) => setPreferences(prev => ({ ...prev, session_duration: value }))}
          min={20}
          max={90}
          step={5}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>20 min</span>
          <span>90 min</span>
        </div>
      </section>

      {/* Equipment */}
      <section>
        <h3 className="font-display text-sm tracking-wider mb-3">EQUIPAMENTOS DISPONÍVEIS</h3>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT.map(eq => (
            <div key={eq.id} className="flex items-center space-x-2">
              <Checkbox
                id={eq.id}
                checked={preferences.equipment.includes(eq.id)}
                onCheckedChange={() => handleEquipmentToggle(eq.id)}
              />
              <Label htmlFor={eq.id} className="text-sm cursor-pointer">
                {eq.label}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Sem equipamentos? Não se preocupe, geramos um plano com peso corporal.
        </p>
      </section>

      {/* Health Conditions */}
      <section>
        <h3 className="font-display text-sm tracking-wider mb-3">RESTRIÇÕES OU LESÕES</h3>
        <Textarea
          placeholder="Ex: Dor no joelho, problema na lombar... (opcional)"
          value={preferences.health_conditions}
          onChange={(e) => setPreferences(prev => ({ ...prev, health_conditions: e.target.value }))}
          className="resize-none"
          rows={2}
        />
      </section>

      {/* Generate Button */}
      <Button
        onClick={handleSubmit}
        disabled={generatePlan.isPending}
        className="w-full py-6 text-lg font-display gap-2"
      >
        {generatePlan.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            GERANDO PLANO...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            GERAR MEU PLANO
          </>
        )}
      </Button>
    </div>
  );
};

export default PersonalizedPlanForm;
