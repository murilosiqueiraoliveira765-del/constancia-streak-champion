import { useState, useRef, useEffect } from 'react';
import { Send, Camera, X, Loader2, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

const NutritionAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar histórico ao montar
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  // Scroll para o final quando mensagens mudarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading chat history:', error);
      return;
    }

    if (data) {
      setMessages(data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        image: msg.image_url || undefined
      })));
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string, imageUrl?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role,
        content,
        image_url: imageUrl || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    return data?.id;
  };

  const clearHistory = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao limpar histórico');
      return;
    }

    setMessages([]);
    toast.success('Histórico limpo');
  };

  const sendMessage = async (text?: string, imageBase64?: string) => {
    const messageText = text || input.trim();
    if (!messageText && !imageBase64) return;

    const userContent = imageBase64 ? 'Analisando minha refeição...' : messageText;
    
    const userMessage: Message = {
      role: 'user',
      content: userContent,
      image: imageBase64
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    // Salvar mensagem do usuário
    const userMsgId = await saveMessage('user', userContent, imageBase64);
    if (userMsgId) {
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 ? { ...msg, id: userMsgId } : msg
      ));
    }

    try {
      const { data, error } = await supabase.functions.invoke('nutrition-ai', {
        body: {
          message: messageText,
          imageBase64: imageBase64,
          type: imageBase64 ? 'analyze_image' : 'chat'
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };

      // Salvar resposta do assistente
      const assistantMsgId = await saveMessage('assistant', data.response);
      
      setMessages(prev => [...prev, { ...assistantMessage, id: assistantMsgId || undefined }]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = () => {
    if (selectedImage) {
      sendMessage('Analise esta refeição', selectedImage);
    }
  };

  const suggestedQuestions = [
    'O que comer antes do treino?',
    'Como ganhar massa muscular?',
    'Alimentos ricos em proteína',
    'Café da manhã ideal'
  ];

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display tracking-wider">NutriIA</h3>
            <p className="text-xs text-muted-foreground">Seu assistente de nutrição</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground">
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm mb-4">
              Pergunte sobre nutrição ou tire uma foto da sua refeição para análise!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                ${msg.role === 'user' ? 'bg-primary' : 'bg-muted'}
              `}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className={`
                max-w-[80%] rounded-2xl p-3
                ${msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-sm' 
                  : 'bg-muted rounded-bl-sm'}
              `}>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Refeição" 
                    className="rounded-lg mb-2 max-h-40 object-cover"
                  />
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="h-20 rounded-lg object-cover"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-destructive-foreground" />
            </button>
          </div>
          <Button 
            size="sm" 
            className="ml-2"
            onClick={analyzeImage}
            disabled={isLoading}
          >
            Analisar
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre nutrição..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NutritionAI;
