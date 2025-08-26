import { useEffect } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { AlbanianKeyboard } from '@/components/game/AlbanianKeyboard';
import { GameHeader } from '@/components/game/GameHeader';
import { useWordleGame } from '@/hooks/useWordleGame';
import { getRandomWord } from '@/utils/albanian';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function Game() {
  const { toast } = useToast();
  const targetWord = getRandomWord();
  const { gameState, isRevealing, handleKeyPress, resetGame } = useWordleGame(targetWord);

  // Handle keyboard events
  useEffect(() => {
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
  }, [handleKeyPress]);

  // Show game result
  useEffect(() => {
    if (gameState.gameStatus === 'won') {
      toast({
        title: 'Urime! 🎉',
        description: `E gjetët fjalën "${gameState.targetWord}" në ${gameState.currentRow + 1} përpjekje!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      toast({
        title: 'Më keq sot! 😅',
        description: `Fjala ishte "${gameState.targetWord}". Provo sërish!`,
      });
    }
  }, [gameState.gameStatus, gameState.targetWord, gameState.currentRow, toast]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <GameHeader 
        title="Wordle Shqip" 
        onReset={() => resetGame(getRandomWord())}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4">
        <GameBoard 
          gameState={gameState} 
          revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
        />
        
        {gameState.gameStatus !== 'playing' && (
          <div className="mt-6 text-center space-y-4">
            <Button 
              onClick={() => resetGame(getRandomWord())} 
              size="lg"
              className="px-8"
            >
              Lojë e Re
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