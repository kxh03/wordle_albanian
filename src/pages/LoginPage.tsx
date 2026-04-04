import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameHeader } from '@/components/game/GameHeader';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginState } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success(language === 'english' ? 'Welcome back!' : 'Mirë se u kthyet!');
      navigate('/daily');
    } catch (err: unknown) {
      let msg =
        language === 'english' ? 'Invalid email or password.' : 'Email ose fjalëkalim i gabuar.';
      if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string; errors?: Record<string, string[]> };
        if (typeof data?.message === 'string') {
          msg = data.message;
        }
      }
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-subtle flex flex-col">
      <GameHeader title="" showFriendsButton />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader>
            <CardTitle>{t.login}</CardTitle>
            <CardDescription>
              {language === 'english'
                ? 'Sign in to sync daily progress and streaks.'
                : 'Hyni për të sinkronizuar progresin dhe seritë.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === 'english' ? 'Password' : 'Fjalëkalimi'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginState.isPending}>
                {loginState.isPending
                  ? language === 'english'
                    ? 'Signing in…'
                    : 'Duke u futur…'
                  : t.login}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                {t.register}
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
