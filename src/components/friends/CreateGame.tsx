import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy } from 'lucide-react';
import { GameScreenKeyboard } from '@/components/game/GameScreenKeyboard';
import { GameHeader } from '@/components/game/GameHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { encryptPayload } from '@/utils/crypto';
import { postDictionaryValidate, toApiLanguage } from '@/lib/api';

export function CreateGame() {
  const [word, setWord] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [gameLink, setGameLink] = useState('');
  const [isWordValid, setIsWordValid] = useState<boolean | null>(null);
  const [nameFieldFocused, setNameFieldFocused] = useState(false);
  const { toast } = useToast();
  const { config, t, language } = useLanguage();
  const apiLang = toApiLanguage(language);

  useEffect(() => {
    if (word.length !== 5) {
      setIsWordValid(null);
      return;
    }
    let cancelled = false;
    void postDictionaryValidate(apiLang, word).then((ok) => {
      if (!cancelled) setIsWordValid(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [word, apiLang]);

  const handleVirtualKey = useCallback(
    (key: string) => {
      if (key === 'BACKSPACE') {
        setWord((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
        return;
      }
      if (key === 'ENTER') {
        return;
      }
      setWord((prev) => {
        if (prev.length >= 5) return prev;
        const next = (prev + key).toUpperCase().normalize('NFC');
        return next.slice(0, 5);
      });
    },
    []
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const isWordFieldActive = active && active.id === 'word';
      if (!isWordFieldActive) return;

      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toUpperCase();

      if (key === 'BACKSPACE' || key === 'DELETE') {
        event.preventDefault();
        setWord((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
      } else if (key.length === 1) {
        const normalized = config.normalizeFunction(key);
        if (config.alphabet.includes(normalized)) {
          event.preventDefault();
          setWord((prev) => (prev.length < 5 ? (prev + normalized).toUpperCase() : prev));
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [config]);

  const handleCreateGame = async () => {
    const normalizedWord = config.normalizeFunction(word);

    if (normalizedWord.length !== 5) {
      toast({
        title: t.invalidWord,
        description: language === 'english' ? 'Word must be exactly 5 letters.' : 'Fjala duhet të ketë saktësisht 5 shkronja.',
        variant: 'destructive',
      });
      return;
    }

    const ok = await postDictionaryValidate(apiLang, word);
    if (!ok) {
      toast({
        title: t.invalidWord,
        description: t.pleaseEnterValidWord,
        variant: 'destructive',
      });
      return;
    }

    if (!creatorName.trim()) {
      toast({
        title: t.nameMissing,
        description: t.pleaseEnterName,
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      word: normalizedWord,
      creatorName: creatorName.trim(),
      createdAt: Date.now(),
      language: config.code,
    };
    const gameId = await encryptPayload(payload);
    const link = `${window.location.origin}/friends/${gameId}`;

    setGameLink(link);

    toast({
      title: t.gameCreated,
      description: t.nowShareLink,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(gameLink);
      toast({
        title: t.copied,
        description: t.linkCopied,
      });
    } catch (err) {
      toast({
        title: t.error,
        description: t.couldNotCopy,
        variant: 'destructive',
      });
    }
  };

  const shareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `me llafe - ${t.challengeFrom} ${creatorName}`,
          text: `${creatorName} ${language === 'english' ? 'challenged you to a wordle game!' : 'ju sfidoi në një lojë me llafe!'}`,
          url: gameLink,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="h-dvh min-h-0 flex flex-col overflow-hidden overscroll-none bg-gradient-subtle">
      <GameHeader title="" showFriendsButton={false} />

      <div className="flex-1 min-h-0 flex flex-col w-full max-w-lg mx-auto px-2 sm:px-3">
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex items-start justify-center py-2 sm:py-3">
        <Card className="w-full max-w-md shrink-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">{t.createGameForFriends}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word">{t.enterFiveLetterWord}</Label>
              <div className="relative">
                <Input
                  id="word"
                  value={word}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    const normalized = config.normalizeFunction(value);
                    setWord(normalized.slice(0, 5));
                  }}
                  maxLength={5}
                  placeholder={language === 'english' ? 'CRANE' : 'FJALË'}
                  className={`text-center text-lg font-mono ${
                    word.length === 5
                      ? isWordValid === true
                        ? 'border-green-500 bg-green-50'
                        : isWordValid === false
                          ? 'border-red-500 bg-red-50'
                          : ''
                      : ''
                  }`}
                />
                {word.length === 5 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isWordValid === true ? (
                      <span className="text-green-500 text-xl">✓</span>
                    ) : isWordValid === false ? (
                      <span className="text-red-500 text-xl">✗</span>
                    ) : (
                      <span className="text-gray-400 text-sm">...</span>
                    )}
                  </div>
                )}
              </div>
              {word.length === 5 && isWordValid === false && (
                <p className="text-sm text-red-600">
                  {language === 'english'
                    ? 'This word is not in our dictionary. Please try another word.'
                    : 'Kjo fjalë nuk është në fjalorin tonë. Ju lutemi provoni një fjalë tjetër.'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t.yourName}</Label>
              <Input
                id="name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                onFocus={() => setNameFieldFocused(true)}
                onBlur={() => setNameFieldFocused(false)}
                placeholder={language === 'english' ? 'Enter your name' : 'Shkruaj emrin'}
              />
            </div>

            {!gameLink ? (
              <Button
                onClick={handleCreateGame}
                className="w-full"
                disabled={word.length !== 5 || !creatorName.trim() || isWordValid !== true}
              >
                {t.createGame}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-xs text-muted-foreground">{language === 'english' ? 'Your link:' : 'Lidhja juaj:'}</Label>
                  <p className="text-sm font-mono break-all mt-1">{gameLink}</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    {language === 'english' ? 'Copy' : 'Kopjo'}
                  </Button>
                  <Button onClick={shareGame} className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    {t.share}
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setWord('');
                    setCreatorName('');
                    setGameLink('');
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  {language === 'english' ? 'Create another game' : 'Krijo tjetër lojë'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {!gameLink && !nameFieldFocused && (
          <GameScreenKeyboard onKeyPress={handleVirtualKey} letterStates={new Map()} disabled={false} />
        )}
      </div>
    </div>
  );
}
