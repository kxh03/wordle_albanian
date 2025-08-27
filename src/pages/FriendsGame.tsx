import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { KeyboardOverlay } from '@/components/game/KeyboardOverlay';
import { GameHeader } from '@/components/game/GameHeader';
import { useWordleGame } from '@/hooks/useWordleGame';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CustomGame } from '@/types/game';

export default function FriendsGame() {
  const { gameId } = useParams();
  const { toast } = useToast();
  const [customGame, setCustomGame] = useState<CustomGame | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load game data
  useEffect(() => {
    if (!gameId) {
      setNotFound(true);
      return;
    }
    // Try self-contained base64url payload in the URL first
    try {
      const base64 = gameId.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      const parsed = JSON.parse(json);
      if (parsed && parsed.word && parsed.creatorName) {
        setCustomGame({
          id: gameId,
          word: parsed.word,
          creatorName: parsed.creatorName,
          createdAt: parsed.createdAt || Date.now()
        });
        return;
      }
    } catch (_e) {
      // fall through to localStorage fallback
    }

    const gameData = localStorage.getItem(`game-${gameId}`);
    if (gameData) {
      try {
        const parsed = JSON.parse(gameData);
        setCustomGame({
          id: gameId,
          word: parsed.word,
          creatorName: parsed.creatorName,
          createdAt: parsed.createdAt
        });
        return;
      } catch (_e) {}
    }
    setNotFound(true);
  }, [gameId]);

  const { gameState, isRevealing, handleKeyPress, resetGame } = useWordleGame(
    customGame?.word || 'FJALE',
    gameId
  );

  // Handle keyboard events (only allow Backspace/Delete from physical keyboard)
  useEffect(() => {
    if (!customGame) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'BACKSPACE' || key === 'DELETE') {
        handleKeyPress('BACKSPACE');
      } else {
        // Ignore all other physical keys; use on-screen Albanian keyboard instead
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, customGame]);

  // Show game result
  useEffect(() => {
    if (!customGame) return;

    if (gameState.gameStatus === 'won') {
      toast({
        title: 'Urime! 🎉',
        description: `E gjetët fjalën e ${customGame.creatorName} në ${gameState.currentRow + 1} përpjekje!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      toast({
        title: 'Më keq sot! 😅',
        description: `Fjala e ${customGame.creatorName} ishte "${gameState.targetWord}". Provo sërish!`,
      });
    }
  }, [gameState.gameStatus, gameState.targetWord, gameState.currentRow, customGame, toast]);

  if (notFound) {
    return <Navigate to="/friends" replace />;
  }

  if (!customGame) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Duke ngarkuar lojën...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-subtle flex flex-col overflow-hidden overscroll-none">
      <GameHeader 
        title="Wordle Shqip" 
        creatorName={customGame.creatorName}
        onReset={() => resetGame(customGame.word)}
        showFriendsButton={false}
      />
      
      <main 
        className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 touch-none"
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault() as unknown as void}
      >
        <GameBoard 
          gameState={gameState} 
          revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
        />
        
        {gameState.gameStatus !== 'playing' && (
          <div className="mt-6 text-center space-y-4">
            <Button 
              onClick={() => resetGame(customGame.word)} 
              size="lg"
              className="px-8"
            >
              Provo Sërish
            </Button>
          </div>
        )}
      </main>
      
      <KeyboardOverlay
        onKeyPress={handleKeyPress}
        letterStates={gameState.letterStates}
        disabled={gameState.gameStatus !== 'playing'}
      />
    </div>
  );
}