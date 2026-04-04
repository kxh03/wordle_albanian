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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'sq' | 'en'>('sq');
  const { register, registerState } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email, password, preferred_language: preferredLanguage });
      toast.success(language === 'english' ? 'Account created!' : 'Llogaria u krijua!');
      navigate('/daily');
    } catch (err: unknown) {
      let msg = language === 'english' ? 'Could not register.' : 'Regjistrimi dështoi.';
      if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string; errors?: Record<string, string[]> };
        if (typeof data?.message === 'string') {
          msg = data.message;
        } else if (data?.errors) {
          const first = Object.values(data.errors)[0]?.[0];
          if (first) msg = first;
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
            <CardTitle>{t.register}</CardTitle>
            <CardDescription>
              {language === 'english'
                ? 'Create an account to save streaks and history.'
                : 'Krijoni llogari për të ruajtur seritë dhe historikun.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{language === 'english' ? 'Name' : 'Emri'}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
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
                  {language === 'english' ? 'Password (min 8)' : 'Fjalëkalimi (min 8)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {language === 'english' ? 'Preferred play language' : 'Gjuha e lojës'}
                </Label>
                <Select
                  value={preferredLanguage}
                  onValueChange={(v) => setPreferredLanguage(v as 'sq' | 'en')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sq">Shqip (sq)</SelectItem>
                    <SelectItem value="en">English (en)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={registerState.isPending}>
                {registerState.isPending
                  ? language === 'english'
                    ? 'Creating account…'
                    : 'Duke u krijuar…'
                  : t.register}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                {t.login}
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
