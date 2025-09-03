import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { KeyboardOverlay } from '@/components/game/KeyboardOverlay';
import { GameHeader } from '@/components/game/GameHeader';
import { useWordleGame } from '@/hooks/useWordleGame';
import { useToast } from '@/hooks/use-toast';
import { CustomGame } from '@/types/game';
import { decryptPayload } from '@/utils/crypto';
import { useLanguage } from '@/contexts/LanguageContext';

// legacy base64 decoder removed; we now use encrypted payloads

export default function FriendsGame() {
  const { gameId } = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [customGame, setCustomGame] = useState<CustomGame | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load game data
  useEffect(() => {
    if (!gameId) {
      setNotFound(true);
      return;
    }

    decryptPayload(gameId).then((maybe) => {
      const parsed = maybe as any;
      if (parsed && parsed.word && parsed.creatorName) {
        setCustomGame({
          id: gameId,
          word: parsed.word,
          creatorName: parsed.creatorName,
          createdAt: parsed.createdAt || Date.now(),
          language: parsed.language || 'albanian'
        });
        return;
      }

      // Fallback to legacy localStorage
      const gameData = localStorage.getItem(`game-${gameId}`);
      if (gameData) {
        try {
          const legacy = JSON.parse(gameData);
          setCustomGame({
            id: gameId,
            word: legacy.word,
            creatorName: legacy.creatorName,
            createdAt: legacy.createdAt,
            language: legacy.language || 'albanian'
          });
          return;
        } catch (_e) {}
      }
      setNotFound(true);
    });
  }, [gameId]);

  const { gameState, isRevealing, handleKeyPress, resetGame, getTargetWord } = useWordleGame(
    customGame?.word || 'FJALE',
    gameId
  );

  // Ensure the target word is set after async load of customGame
  useEffect(() => {
    if (customGame?.word) {
      resetGame(customGame.word);
    }
  }, [customGame?.word, resetGame]);

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
        title: t.youWon,
        description: `${t.youGuessedWord} ${customGame.creatorName}'s word!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      toast({
        title: t.betterLuckNextTime,
        description: `${t.theWordWas} ${customGame.creatorName} was "${getTargetWord()}".`,
      });
    }
  }, [gameState.gameStatus, gameState.currentRow, customGame, toast, getTargetWord]);

  if (notFound) {
    return <Navigate to="/friends" replace />;
  }

  if (!customGame) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-subtle flex flex-col overflow-hidden overscroll-none">
      <GameHeader 
        title="" 
        onReset={() => resetGame(customGame.word)}
        showFriendsButton={false}
        creatorName={customGame.creatorName}
      />
      
      <main 
        className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-2 sm:px-4 touch-none"
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault() as unknown as void}
      >
        <GameBoard 
          gameState={gameState} 
          revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
          getTargetWord={getTargetWord}
        />
        
        {/* Removed retry button for friends mode */}
      </main>
      
      <KeyboardOverlay
        onKeyPress={handleKeyPress}
        letterStates={gameState.letterStates}
        disabled={gameState.gameStatus !== 'playing'}
      />
    </div>
  );
}