import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { AlbanianKeyboard } from '@/components/game/AlbanianKeyboard';
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

    const gameData = localStorage.getItem(`game-${gameId}`);
    if (!gameData) {
      setNotFound(true);
      return;
    }

    try {
      const parsed = JSON.parse(gameData);
      setCustomGame({
        id: gameId,
        word: parsed.word,
        creatorName: parsed.creatorName,
        createdAt: parsed.createdAt
      });
    } catch (error) {
      setNotFound(true);
    }
  }, [gameId]);

  const { gameState, isRevealing, handleKeyPress, resetGame } = useWordleGame(
    customGame?.word || 'FJALE',
    gameId
  );

  // Handle keyboard events
  useEffect(() => {
    if (!customGame) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'BACKSPACE' || key === 'DELETE') {
        handleKeyPress('BACKSPACE');
      } else if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (/^[A-ZËÇGJ]$/.test(key)) {
        handleKeyPress(key);
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
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <GameHeader 
        title="Wordle Shqip" 
        creatorName={customGame.creatorName}
        onReset={() => resetGame(customGame.word)}
        showFriendsButton={false}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4">
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
      
      <div className="pb-6">
        <AlbanianKeyboard
          onKeyPress={handleKeyPress}
          letterStates={gameState.letterStates}
          disabled={gameState.gameStatus !== 'playing'}
        />
      </div>
    </div>
  );
}