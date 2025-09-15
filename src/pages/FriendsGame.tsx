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
import { Button } from '@/components/ui/button';
import { Share2, RotateCcw } from 'lucide-react';

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

  // Handle keyboard events - allow full keyboard input for friends games too
  useEffect(() => {
    if (!customGame) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with browser shortcuts or form inputs
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target && (event.target as HTMLElement).tagName === 'INPUT') return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'BACKSPACE' || key === 'DELETE') {
        event.preventDefault();
        handleKeyPress('BACKSPACE');
      } else if (key === 'ENTER') {
        event.preventDefault();
        handleKeyPress('ENTER');
      } else if (key.length === 1) {
        // For friends games, we need to determine the language from the game
        const gameLanguage = customGame.language || 'albanian';
        const languageConfig = gameLanguage === 'english' ? 
          { alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], normalizeFunction: (text: string) => text.toUpperCase().trim() } :
          { alphabet: ['A', 'B', 'C', 'Ç', 'D', 'DH', 'E', 'Ë', 'F', 'G', 'GJ', 'H', 'I', 'J', 'K', 'L', 'LL', 'M', 'N', 'NJ', 'O', 'P', 'Q', 'R', 'RR', 'S', 'SH', 'T', 'TH', 'U', 'V', 'X', 'XH', 'Y', 'Z', 'ZH'], normalizeFunction: (text: string) => text.toUpperCase().normalize('NFC').trim() };
        
        const normalized = languageConfig.normalizeFunction(key);
        if (languageConfig.alphabet.includes(normalized)) {
          event.preventDefault();
          handleKeyPress(normalized);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
        {/* Game completion celebration */}
        {gameState.gameStatus === 'won' && (
          <div className="mb-4 text-center animate-victory-bounce">
            <div className="glass rounded-2xl p-6 shadow-card animate-celebration-pulse">
              <div className="text-5xl mb-3 animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold text-correct mb-2">
                {t.youWon}
              </h2>
              <p className="text-base text-muted-foreground">
                {t.youGuessedWord} {customGame.creatorName}!
              </p>
              {/* Confetti effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-confetti" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-confetti" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-400 rounded-full animate-confetti" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute top-0 left-1/3 w-2 h-2 bg-red-400 rounded-full animate-confetti" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute top-0 left-2/3 w-2 h-2 bg-purple-400 rounded-full animate-confetti" style={{ animationDelay: '0.8s' }}></div>
              </div>
            </div>
          </div>
        )}

        {gameState.gameStatus === 'lost' && (
          <div className="mb-4 text-center animate-bounce-in">
            <div className="glass rounded-2xl p-5 shadow-card">
              <div className="text-4xl mb-3">😅</div>
              <h2 className="text-xl font-bold text-primary mb-2">
                {t.betterLuckNextTime}
              </h2>
              <p className="text-base text-muted-foreground">
                {t.theWordWas} "<span className="font-bold text-primary">{getTargetWord()}</span>"
              </p>
            </div>
          </div>
        )}

        <div className={gameState.gameStatus === 'playing' ? 'animate-float' : ''}>
          <GameBoard 
            gameState={gameState} 
            revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
            getTargetWord={getTargetWord}
          />
        </div>

        {/* Action buttons for completed games */}
        {gameState.gameStatus !== 'playing' && (
          <div className="mt-6 text-center space-y-3 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => {
                  // Share results
                  const attempts = gameState.gameStatus === 'won' ? gameState.currentRow + 1 : 'X';
                  let grid = '';
                  for (let row = 0; row < Math.min(gameState.currentRow + 1, 6); row++) {
                    for (let col = 0; col < 5; col++) {
                      const letter = gameState.board[row][col];
                      if (!letter) continue;
                      
                      if (letter === getTargetWord()[col]) {
                        grid += '🟩';
                      } else if (getTargetWord().includes(letter)) {
                        grid += '🟨';
                      } else {
                        grid += '⬛';
                      }
                    }
                    grid += '\n';
                  }

                  const shareText = customGame.language === 'english' 
                    ? `I ${gameState.gameStatus === 'won' ? 'solved' : 'tried'} ${customGame.creatorName}'s word challenge!\n${attempts}/6\n\n${grid}\n#WordleChallenge`
                    : `${gameState.gameStatus === 'won' ? 'E zgjidha' : 'E provova'} sfidën e ${customGame.creatorName}!\n${attempts}/6\n\n${grid}\n#SfidaFjalesh`;
                  
                  if (navigator.share) {
                    navigator.share({ text: shareText });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    toast({
                      title: customGame.language === 'english' ? 'Copied!' : 'U kopjua!',
                      description: customGame.language === 'english' ? 'Results copied to clipboard.' : 'Rezultatet u kopjuan.',
                    });
                  }
                }}
                size="sm"
                variant="outline"
                className="flex-1 max-w-32"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {customGame.language === 'english' ? 'Share' : 'Ndaj'}
              </Button>
              
              <Button 
                onClick={() => resetGame(customGame.word)}
                size="sm"
                variant="outline"
                className="flex-1 max-w-32"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {customGame.language === 'english' ? 'Try Again' : 'Provo Sërish'}
              </Button>
            </div>
          </div>
        )}

        {/* Challenge info */}
        <div className="mt-4 text-center">
          <div className="glass rounded-xl p-3 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {customGame.language === 'english' 
                ? `Challenge from ${customGame.creatorName}`
                : `Sfida nga ${customGame.creatorName}`
              }
            </p>
          </div>
        </div>
      </main>
      
      <KeyboardOverlay
        onKeyPress={handleKeyPress}
        letterStates={gameState.letterStates}
        disabled={gameState.gameStatus !== 'playing'}
      />
    </div>
  );
}