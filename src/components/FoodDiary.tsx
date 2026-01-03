import { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Loader2, Calendar, Utensils, Coffee, Moon, Apple, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

interface DiaryEntry {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string | null;
  image_url: string | null;
  ai_analysis: string | null;
  rating: number | null;
  logged_at: string;
  created_at: string;
}

const mealTypeLabels = {
  breakfast: { label: 'Café da manhã', icon: Coffee },
  lunch: { label: 'Almoço', icon: Utensils },
  dinner: { label: 'Jantar', icon: Moon },
  snack: { label: 'Lanche', icon: Apple }
};

const FoodDiary = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('food_diary')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error loading diary:', error);
      toast.error('Erro ao carregar diário');
    } else {
      setEntries(data as DiaryEntry[]);
    }
    setIsLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeAndSave = async () => {
    if (!user || (!selectedImage && !description.trim())) {
      toast.error('Adicione uma foto ou descrição');
      return;
    }

    setIsAnalyzing(true);
    let aiAnalysis = null;
    let rating = null;

    // Se tem imagem, analisar com IA
    if (selectedImage) {
      try {
        const { data, error } = await supabase.functions.invoke('nutrition-ai', {
          body: {
            message: 'Analise esta refeição',
            imageBase64: selectedImage,
            type: 'analyze_image'
          }
        });

        if (!error && data.response) {
          aiAnalysis = data.response;
          // Tentar extrair nota da resposta
          const ratingMatch = data.response.match(/nota[:\s]+(\d+)/i);
          if (ratingMatch) {
            rating = parseInt(ratingMatch[1]);
          }
        }
      } catch (error) {
        console.error('Error analyzing:', error);
      }
    }

    // Salvar entrada
    const { error } = await supabase
      .from('food_diary')
      .insert({
        user_id: user.id,
        meal_type: mealType,
        description: description.trim() || null,
        image_url: selectedImage,
        ai_analysis: aiAnalysis,
        rating: rating
      });

    if (error) {
      toast.error('Erro ao salvar refeição');
      console.error(error);
    } else {
      toast.success('Refeição registrada!');
      setSelectedImage(null);
      setDescription('');
      setIsAdding(false);
      loadEntries();
    }
    setIsAnalyzing(false);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('food_diary')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir');
    } else {
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Excluído');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  // Agrupar por data
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = entry.logged_at;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, DiaryEntry[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Registrar Refeição
        </Button>
      ) : (
        <div className="glass-card p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display tracking-wider">Nova Refeição</h3>
            <Button variant="ghost" size="sm" onClick={() => {
              setIsAdding(false);
              setSelectedImage(null);
              setDescription('');
            }}>
              Cancelar
            </Button>
          </div>

          {/* Meal Type */}
          <Select value={mealType} onValueChange={(v) => setMealType(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de refeição" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(mealTypeLabels).map(([key, { label, icon: Icon }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Image */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {selectedImage ? (
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Refeição" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setSelectedImage(null)}
              >
                Remover
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-32 flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-muted-foreground" />
              <span className="text-muted-foreground">Tirar foto da refeição</span>
            </Button>
          )}

          {/* Description */}
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva sua refeição (opcional)..."
            rows={2}
          />

          {/* Save */}
          <Button 
            onClick={analyzeAndSave} 
            className="w-full"
            disabled={isAnalyzing || (!selectedImage && !description.trim())}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              'Salvar e Analisar'
            )}
          </Button>
        </div>
      )}

      {/* Entries */}
      {Object.keys(groupedEntries).length === 0 ? (
        <div className="text-center py-8 glass-card">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma refeição registrada ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            Registre suas refeições para acompanhar sua alimentação
          </p>
        </div>
      ) : (
        Object.entries(groupedEntries).map(([date, dayEntries]) => (
          <div key={date}>
            <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-3">
              {formatDate(date)}
            </h3>
            <div className="space-y-3">
              {dayEntries.map((entry) => {
                const MealIcon = mealTypeLabels[entry.meal_type].icon;
                return (
                  <div key={entry.id} className="glass-card p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <MealIcon className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">
                          {mealTypeLabels[entry.meal_type].label}
                        </span>
                        {entry.rating && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-medium">{entry.rating}/10</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-muted-foreground h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {entry.image_url && (
                      <img 
                        src={entry.image_url} 
                        alt="Refeição" 
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}

                    {entry.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {entry.description}
                      </p>
                    )}

                    {entry.ai_analysis && (
                      <div className="bg-primary/5 rounded-lg p-3 mt-2">
                        <p className="text-xs font-medium text-primary mb-1">Análise da IA</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {entry.ai_analysis}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FoodDiary;
