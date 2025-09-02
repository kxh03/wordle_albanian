import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { normalizeAlbanian, isValidAlbanianWord } from '@/utils/albanian';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy } from 'lucide-react';
import { KeyboardOverlay } from '@/components/game/KeyboardOverlay';
import { GameHeader } from '@/components/game/GameHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { encryptPayload } from '@/utils/crypto';

export function CreateGame() {
  const [word, setWord] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [gameLink, setGameLink] = useState('');
  const { toast } = useToast();
  const { config, t, language } = useLanguage();

  // Handle on-screen Albanian keyboard input for the word field
  const handleVirtualKey = useCallback((key: string) => {
    if (key === 'BACKSPACE') {
      setWord(prev => prev.slice(0, Math.max(0, prev.length - 1)));
      return;
    }
    if (key === 'ENTER') {
      // ignore ENTER on create screen
      return;
    }
    // Append letter if space available
    setWord(prev => (prev.length < 5 ? (prev + key).toUpperCase() : prev));
  }, []);

  // Allow only Backspace/Delete from physical keyboard on the word field
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Only affect when focused within this page
      const active = document.activeElement as HTMLElement | null;
      const isWordFieldActive = active && active.id === 'word';
      if (!isWordFieldActive) return;

      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toUpperCase();
      if (key === 'BACKSPACE' || key === 'DELETE') {
        // We manage deletion ourselves to keep state in sync
        event.preventDefault();
        setWord(prev => prev.slice(0, Math.max(0, prev.length - 1)));
      } else {
        // Block any other physical typing
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Note: We no longer expose raw JSON via Base64; we encrypt the payload.

  const handleCreateGame = async () => {
    const normalizedWord = config.normalizeFunction(word);
    
    if (!config.isValidWordFunction(normalizedWord)) {
      toast({
        title: t.invalidWord,
        description: t.pleaseEnterValidWord,
        variant: 'destructive'
      });
      return;
    }

    if (!creatorName.trim()) {
      toast({
        title: t.nameMissing,
        description: t.pleaseEnterName,
        variant: 'destructive'
      });
      return;
    }

    // Create an encrypted self-contained payload so the link works without localStorage
    const payload = {
      word: normalizedWord,
      creatorName: creatorName.trim(),
      createdAt: Date.now(),
      language: config.code
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
        variant: 'destructive'
      });
    }
  };

  const shareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `me llafe - ${t.challengeFrom} ${creatorName}`,
          text: `${creatorName} ${language === 'english' ? 'challenged you to a wordle game!' : 'ju sfidoi në një lojë me llafe!'}`,
          url: gameLink
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-subtle flex flex-col overflow-hidden overscroll-none">
      <GameHeader title="" showFriendsButton={false} />

      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 pb-0">
        <Card className="w-full max-w-md touch-none" onTouchMove={(e) => e.preventDefault()}>
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">
              {t.createGameForFriends}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word">{t.enterFiveLetterWord}</Label>
              <Input
                id="word"
                value={word}
                onChange={() => { /* input editing disabled; use on-screen keyboard */ }}
                maxLength={5}
                placeholder="FJALË"
                className="text-center text-lg font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">{t.yourName}</Label>
              <Input
                id="name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder={language === 'english' ? 'Enter your name' : 'Shkruaj emrin'}
              />
            </div>

            {!gameLink ? (
              <Button 
                onClick={handleCreateGame} 
                className="w-full"
                disabled={word.length !== 5 || !creatorName.trim()}
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

      {/* Single bottom-fixed keyboard overlay via portal */}
      <KeyboardOverlay
        onKeyPress={handleVirtualKey}
        letterStates={new Map()}
        disabled={false}
      />
    </div>
  );
}