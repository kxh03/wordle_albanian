import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { GameScreenKeyboard } from '@/components/game/GameScreenKeyboard';
import { GameHeader } from '@/components/game/GameHeader';
import { useWordleGame } from '@/hooks/useWordleGame';
import { useToast } from '@/hooks/use-toast';
import { CustomGame } from '@/types/game';
import { decryptPayload } from '@/utils/crypto';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { postDictionaryValidate, toApiLanguage } from '@/lib/api';
import type { Language } from '@/types/language';

export default function FriendsGame() {
  const { gameId } = useParams();
  const { toast, dismiss } = useToast();
  const { t } = useLanguage();
  const [customGame, setCustomGame] = useState<CustomGame | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!gameId) {
      setNotFound(true);
      return;
    }

    decryptPayload(gameId).then((maybe) => {
      const parsed = maybe as { word?: string; creatorName?: string; createdAt?: number; language?: string } | null;
      if (parsed && parsed.word && parsed.creatorName) {
        setCustomGame({
          id: gameId,
          word: parsed.word,
          creatorName: parsed.creatorName,
          createdAt: parsed.createdAt || Date.now(),
          language: parsed.language || 'albanian',
        });
        return;
      }

      const gameData = localStorage.getItem(`game-${gameId}`);
      if (gameData) {
        try {
          const legacy = JSON.parse(gameData);
          setCustomGame({
            id: gameId,
            word: legacy.word,
            creatorName: legacy.creatorName,
            createdAt: legacy.createdAt,
            language: legacy.language || 'albanian',
          });
          return;
        } catch (_e) {
          /* ignore */
        }
      }
      setNotFound(true);
    });
  }, [gameId]);

  const uiLang = (customGame?.language || 'albanian') as Language;
  const apiLang = toApiLanguage(uiLang);

  const { gameState, isRevealing, isWordCompleteAnimating, handleKeyPress, getTargetWord, invalidReason } = useWordleGame(
    customGame?.word || 'FJALE',
    gameId,
    {
      mode: 'local',
      apiLanguage: apiLang,
      validateGuess: (g) => postDictionaryValidate(apiLang, g),
    }
  );

  useEffect(() => {
    if (!customGame) return;

    const gameLanguage = customGame.language || 'albanian';
    const languageConfig =
      gameLanguage === 'english'
        ? {
            alphabet: [
              'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
              'V', 'W', 'X', 'Y', 'Z',
            ],
            normalizeFunction: (text: string) => text.toUpperCase().trim(),
          }
        : {
            alphabet: [
              'A', 'B', 'C', 'Ç', 'D', 'DH', 'E', 'Ë', 'F', 'G', 'GJ', 'H', 'I', 'J', 'K', 'L', 'LL', 'M', 'N', 'NJ',
              'O', 'P', 'Q', 'R', 'RR', 'S', 'SH', 'T', 'TH', 'U', 'V', 'X', 'XH', 'Y', 'Z', 'ZH',
            ],
            normalizeFunction: (text: string) => text.toUpperCase().normalize('NFC').trim(),
          };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      if (event.target && (event.target as HTMLElement).tagName === 'INPUT') return;

      const key = event.key.toUpperCase();

      if (key === 'BACKSPACE' || key === 'DELETE') {
        event.preventDefault();
        handleKeyPress('BACKSPACE');
      } else if (key === 'ENTER') {
        event.preventDefault();
        handleKeyPress('ENTER');
      } else if (key.length === 1 && !event.altKey) {
        const normalized = languageConfig.normalizeFunction(key);
        if (languageConfig.alphabet.includes(normalized)) {
          event.preventDefault();
          handleKeyPress(normalized);
        }
      }
    };

    const handleKeyPressEvent = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      if (event.target && (event.target as HTMLElement).tagName === 'INPUT') return;
      const key = event.key;
      if (key && key.length === 1) {
        const normalized = languageConfig.normalizeFunction(key);
        if (languageConfig.alphabet.includes(normalized)) {
          event.preventDefault();
          handleKeyPress(normalized);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keypress', handleKeyPressEvent);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keypress', handleKeyPressEvent);
    };
  }, [handleKeyPress, customGame]);

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
  }, [gameState.gameStatus, gameState.currentRow, customGame, toast, getTargetWord, t]);

  useEffect(() => {
    if (!customGame) return;
    if (invalidReason?.code === 'not_in_dictionary') {
      toast({
        title: customGame.language === 'english' ? 'Word not in dictionary' : 'Kjo fjalë nuk është në fjalorin tonë. Ju lutemi provoni një fjalë tjetër.',
        description:
          customGame.language === 'english'
            ? 'Please enter a valid 5-letter word.'
            : 'Ju lutemi shkruani një fjalë të vlefshme me 5 shkronja.',
      });
    } else if (invalidReason === null) {
      dismiss();
    }
  }, [invalidReason, customGame, toast, dismiss]);

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
    <div className="h-dvh min-h-0 flex flex-col overflow-hidden bg-gradient-subtle overscroll-contain">
      <GameHeader
        title=""
        showFriendsButton={false}
        creatorName={customGame.creatorName}
      />

      <div className="flex-1 min-h-0 flex flex-col w-full max-w-lg mx-auto">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden px-2 py-0.5">
            <GameBoard
              compactLayout
              gameState={gameState}
              revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
              getTargetWord={getTargetWord}
              isWordCompleteAnimating={isWordCompleteAnimating}
            />
          </div>

          {gameState.gameStatus !== 'playing' && (
            <div className="shrink-0 max-h-[min(40dvh,340px)] overflow-y-auto overscroll-contain border-t border-border/50 px-2 py-2 text-center space-y-3 bg-background/80">
              {gameState.gameStatus === 'won' && (
                <div className="animate-victory-bounce w-full max-w-sm mx-auto">
                  <div className="glass rounded-2xl p-3 sm:p-4 shadow-card animate-celebration-pulse relative">
                    <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 animate-bounce">🎉</div>
                    <h2 className="text-lg sm:text-xl font-bold text-correct mb-1">{t.youWon}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t.youGuessedWord} {customGame.creatorName}!
                    </p>
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      <div
                        className="absolute top-0 left-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-confetti"
                        style={{ animationDelay: '0s' }}
                      />
                      <div
                        className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full animate-confetti"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <div
                        className="absolute top-0 left-3/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-confetti"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {gameState.gameStatus === 'lost' && (
                <div className="animate-bounce-in">
                  <div className="glass rounded-2xl p-3 sm:p-4 shadow-card">
                    <div className="text-3xl mb-2">😅</div>
                    <h2 className="text-base sm:text-lg font-bold text-primary mb-1">{t.betterLuckNextTime}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t.theWordWas} &quot;<span className="font-bold text-primary">{getTargetWord()}</span>&quot;
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 sm:gap-3 justify-center animate-bounce-in" style={{ animationDelay: '0.15s' }}>
                <Button
                  onClick={() => {
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

                    const shareText =
                      customGame.language === 'english'
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
              </div>

              <div className="glass rounded-xl p-2 shadow-sm">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {customGame.language === 'english'
                    ? `Challenge from ${customGame.creatorName}`
                    : `Sfida nga ${customGame.creatorName}`}
                </p>
              </div>
            </div>
          )}
        </div>

        <GameScreenKeyboard
          onKeyPress={handleKeyPress}
          letterStates={gameState.letterStates}
          disabled={gameState.gameStatus !== 'playing'}
        />
      </div>
    </div>
  );
}
