import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Flame, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos');
          } else {
            toast.error('Erro ao entrar: ' + error.message);
          }
          return;
        }
        toast.success('Bem-vindo de volta!');
        navigate('/');
      } else {
        if (!name.trim()) {
          toast.error('Digite seu nome');
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este email já está cadastrado');
          } else {
            toast.error('Erro ao criar conta: ' + error.message);
          }
          return;
        }
        toast.success('Conta criada! Vamos treinar!');
        navigate('/');
      }
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Flame className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl tracking-wider text-gradient-fire">
            CONSTÂNCIA
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Entre para continuar' : 'Crie sua conta'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="text-sm text-muted-foreground">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="mt-1.5 h-12 bg-card border-border"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1.5 h-12 bg-card border-border"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm text-muted-foreground">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="mt-1.5 h-12 bg-card border-border"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <Button
            type="submit"
            variant="fire"
            size="lg"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              'Entrar'
            ) : (
              'Criar Conta'
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? (
              <>
                Não tem conta?{' '}
                <span className="text-primary font-medium">Criar agora</span>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <span className="text-primary font-medium">Entrar</span>
              </>
            )}
          </button>
        </div>

        {/* Motivation */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          "A dor da disciplina é melhor que a dor do arrependimento."
        </p>
      </div>
    </div>
  );
};

export default Auth;
