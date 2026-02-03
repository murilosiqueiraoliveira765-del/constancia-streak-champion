import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Clock, 
  Repeat,
  Lightbulb,
  TrendingUp,
  Dumbbell,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoredPlan, WorkoutDay } from '@/hooks/usePersonalizedPlan';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PersonalizedPlanViewProps {
  plan: StoredPlan;
  onRegeneratePlan?: () => void;
}

const PersonalizedPlanView = ({ plan, onRegeneratePlan }: PersonalizedPlanViewProps) => {
  const [openDays, setOpenDays] = useState<string[]>([]);
  const planData = plan.plan_data;

  const toggleDay = (dayId: string) => {
    setOpenDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="text-center">
        <h2 className="font-display text-2xl tracking-wider">{planData.plan_name}</h2>
        <p className="text-muted-foreground mt-2">{planData.description}</p>
      </div>

      {/* Weekly Schedule */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="font-display text-sm tracking-wider">PROGRAMAÇÃO SEMANAL</h3>
        </div>

        <div className="space-y-3">
          {planData.weekly_schedule.map((day, index) => (
            <Collapsible 
              key={day.day} 
              open={openDays.includes(day.day)}
              onOpenChange={() => toggleDay(day.day)}
            >
              <CollapsibleTrigger asChild>
                <Card className={cn(
                  'p-4 cursor-pointer transition-all hover:border-primary/50',
                  openDays.includes(day.day) && 'border-primary'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-display text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{day.day}</h4>
                        <p className="text-sm text-muted-foreground">{day.focus}</p>
                      </div>
                    </div>
                    {openDays.includes(day.day) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2 space-y-3 pl-4 border-l-2 border-primary/30">
                  {/* Warmup */}
                  <div className="glass-card p-3">
                    <div className="flex items-center gap-2 text-amber-500 mb-1">
                      <Play className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase">Aquecimento</span>
                    </div>
                    <p className="text-sm">{day.warmup}</p>
                  </div>

                  {/* Exercises */}
                  <div className="space-y-2">
                    {day.exercises.map((exercise, i) => (
                      <Card key={i} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium">{exercise.name}</h5>
                            {exercise.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Repeat className="w-3 h-3" />
                              <span>{exercise.sets}x{exercise.reps}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{exercise.rest_seconds}s</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Cooldown */}
                  <div className="glass-card p-3">
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                      <Play className="w-4 h-4 rotate-180" />
                      <span className="text-xs font-medium uppercase">Desaquecimento</span>
                    </div>
                    <p className="text-sm">{day.cooldown}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </section>

      {/* Tips */}
      {planData.tips && planData.tips.length > 0 && (
        <section className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-display text-sm tracking-wider">DICAS</h3>
          </div>
          <ul className="space-y-2">
            {planData.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Progression */}
      {planData.progression && (
        <section className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-display text-sm tracking-wider">PROGRESSÃO</h3>
          </div>
          <p className="text-sm text-muted-foreground">{planData.progression}</p>
        </section>
      )}

      {/* Regenerate Button */}
      {onRegeneratePlan && (
        <Button
          variant="outline"
          onClick={onRegeneratePlan}
          className="w-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Gerar Novo Plano
        </Button>
      )}
    </div>
  );
};

export default PersonalizedPlanView;
