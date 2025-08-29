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

export function CreateGame() {
  const [word, setWord] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [gameLink, setGameLink] = useState('');
  const { toast } = useToast();

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

  const base64UrlEncode = (json: string) => {
    // Encode JSON safely for Unicode characters
    const utf8 = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    const b64 = btoa(utf8)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    return b64;
  };

  const handleCreateGame = () => {
    const normalizedWord = normalizeAlbanian(word);
    
    if (!isValidAlbanianWord(normalizedWord)) {
      toast({
        title: 'Fjalë e pavlefshme',
        description: 'Ju lutemi shkruani një fjalë të vlefshme shqipe me 5 shkronja.',
        variant: 'destructive'
      });
      return;
    }

    if (!creatorName.trim()) {
      toast({
        title: 'Emri mungon',
        description: 'Ju lutemi shkruani emrin tuaj.',
        variant: 'destructive'
      });
      return;
    }

    // Create a self-contained base64url JSON payload so the link works without localStorage
    const payload = {
      word: normalizedWord,
      creatorName: creatorName.trim(),
      createdAt: Date.now()
    };
    const gameId = base64UrlEncode(JSON.stringify(payload));
    const link = `${window.location.origin}/friends/${gameId}`;

    setGameLink(link);
    
    toast({
      title: 'Loja u krijua!',
      description: 'Tani mund të ndani lidhjen me miqtë tuaj.',
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(gameLink);
      toast({
        title: 'U kopjua!',
        description: 'Lidhja u kopjua në clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Gabim',
        description: 'Nuk mundëm të kopjojmë lidhjen.',
        variant: 'destructive'
      });
    }
  };

  const shareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `me llafe - Sfida nga ${creatorName}`,
          text: `${creatorName} ju sfidoi në një lojë me llafe!`,
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

      <div className="flex-1 flex items-center justify-center p-4 pb-0">
        <Card className="w-full max-w-md touch-none" onTouchMove={(e) => e.preventDefault()}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Krijo Lojë për Miqtë
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word">Shkruaj një fjalë me 5 shkronja</Label>
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
              <Label htmlFor="name">Emri juaj</Label>
              <Input
                id="name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Shkruaj emrin"
              />
            </div>

            {!gameLink ? (
              <Button 
                onClick={handleCreateGame} 
                className="w-full"
                disabled={word.length !== 5 || !creatorName.trim()}
              >
                Krijo Lojën
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-xs text-muted-foreground">Lidhja juaj:</Label>
                  <p className="text-sm font-mono break-all mt-1">{gameLink}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Kopjo
                  </Button>
                  <Button onClick={shareGame} className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Ndaj
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
                  Krijo tjetër lojë
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