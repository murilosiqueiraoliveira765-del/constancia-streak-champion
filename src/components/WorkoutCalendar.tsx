import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDailyCheckins } from '@/hooks/useProfile';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
  isFuture
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface WorkoutCalendarProps {
  className?: string;
}

const WorkoutCalendar = ({ className }: WorkoutCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: checkins } = useDailyCheckins();

  // Set of dates where user trained
  const trainedDates = useMemo(() => {
    const dates = new Set<string>();
    checkins?.forEach(checkin => {
      dates.add(checkin.checkin_date);
    });
    return dates;
  }, [checkins]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    if (!checkins || checkins.length === 0) return 0;
    
    const sortedDates = [...checkins]
      .map(c => c.checkin_date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    
    // Check if trained today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }
    
    let expectedDate = new Date(sortedDates[0]);
    
    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      if (isSameDay(date, expectedDate)) {
        streak++;
        expectedDate = new Date(expectedDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    
    return streak;
  }, [checkins]);

  // Days in current month view
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days for the first week
    const firstDayOfWeek = getDay(start);
    const paddingDays = Array(firstDayOfWeek).fill(null);
    
    return [...paddingDays, ...days];
  }, [currentMonth]);

  // Stats for current month
  const monthStats = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    let count = 0;
    
    trainedDates.forEach(date => {
      if (date.startsWith(monthStr)) {
        count++;
      }
    });
    
    return { trainedDays: count };
  }, [currentMonth, trainedDates]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className={cn('glass-card p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h3 className="font-display text-lg tracking-wider capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {monthStats.trainedDays} dias treinados
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8"
          disabled={isSameMonth(currentMonth, new Date())}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = format(day, 'yyyy-MM-dd');
          const isTrained = trainedDates.has(dateStr);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const isFutureDay = isFuture(day);

          return (
            <div
              key={dateStr}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center relative transition-all',
                !isCurrentMonth && 'opacity-30',
                isDayToday && !isTrained && 'ring-1 ring-primary/50',
                isTrained && 'bg-primary text-primary-foreground',
                !isTrained && !isFutureDay && isCurrentMonth && 'bg-muted/30',
                isFutureDay && 'opacity-30'
              )}
            >
              {isTrained ? (
                <div className="flex flex-col items-center">
                  <Flame className="w-3 h-3 mb-0.5" />
                  <span className="text-[10px] font-medium">
                    {format(day, 'd')}
                  </span>
                </div>
              ) : (
                <span className={cn(
                  'text-xs',
                  isDayToday && 'font-bold text-primary'
                )}>
                  {format(day, 'd')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Streak indicator */}
      {currentStreak > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 text-primary">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="font-display text-xl">{currentStreak}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            dias consecutivos
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary flex items-center justify-center">
            <Flame className="w-2 h-2 text-primary-foreground" />
          </div>
          <span>Treinado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted/30" />
          <span>Não treinado</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;
