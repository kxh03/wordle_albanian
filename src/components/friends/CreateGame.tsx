import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { normalizeAlbanian, isValidAlbanianWord } from '@/utils/albanian';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy } from 'lucide-react';

export function CreateGame() {
  const [word, setWord] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [gameLink, setGameLink] = useState('');
  const { toast } = useToast();

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

    // Generate game ID and link (in a real app, this would be stored in a database)
    const gameId = btoa(`${normalizedWord}-${creatorName}-${Date.now()}`).replace(/[/+=]/g, '');
    const link = `${window.location.origin}/friends/${gameId}`;
    
    // Store game data in localStorage (in a real app, use backend)
    localStorage.setItem(`game-${gameId}`, JSON.stringify({
      word: normalizedWord,
      creatorName: creatorName.trim(),
      createdAt: Date.now()
    }));

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
          title: `Wordle Shqip - Sfida nga ${creatorName}`,
          text: `${creatorName} ju sfidoi në një lojë Wordle në shqip!`,
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
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            Krijo Lojë për Miqtë
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Shkruaj një fjalë me 5 shkronja</Label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value.toUpperCase())}
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
  );
}