import { useEffect, useState, useCallback } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { GameScreenKeyboard } from '@/components/game/GameScreenKeyboard';
import { GameHeader } from '@/components/game/GameHeader';
import { useWordleGame } from '@/hooks/useWordleGame';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { postGamesFree, toApiLanguage } from '@/lib/api';

export default function Game() {
  const { toast, dismiss } = useToast();
  const { t, language, config } = useLanguage();
  const apiLang = toApiLanguage(language);

  const [targetToken, setTargetToken] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { gameState, isRevealing, isWordCompleteAnimating, handleKeyPress, resetGame, invalidReason, getTargetWord } =
    useWordleGame('?????', undefined, {
      mode: 'api',
      apiLanguage: apiLang,
      targetToken,
    });

  const loadSession = useCallback(async () => {
    setTargetToken(null);
    setLoadError(null);
    try {
      const s = await postGamesFree(apiLang);
      setTargetToken(s.target_token);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Could not start game');
    }
  }, [apiLang]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (targetToken) {
      resetGame();
    }
  }, [targetToken, resetGame]);

  useEffect(() => {
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
        const normalized = config.normalizeFunction(key);
        if (config.alphabet.includes(normalized)) {
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
        const normalized = config.normalizeFunction(key);
        if (config.alphabet.includes(normalized)) {
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
  }, [handleKeyPress, config]);

  useEffect(() => {
    if (invalidReason === 'not_in_dictionary') {
      toast({
        title: language === 'english' ? 'Word not in dictionary' : 'Fjalë nuk është në fjalorë',
        description:
          language === 'english'
            ? 'Please enter a valid 5-letter word.'
            : 'Ju lutemi shkruani një fjalë të vlefshme me 5 shkronja.',
      });
    } else if (invalidReason === null) {
      dismiss();
    }
    if (gameState.gameStatus === 'won') {
      toast({
        title: t.congratulations,
        description:
          language === 'english'
            ? `You found the word "${getTargetWord()}" in ${gameState.currentRow + 1} attempts!`
            : `E gjetët fjalën "${getTargetWord()}" në ${gameState.currentRow + 1} përpjekje!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      toast({
        title: t.betterLuck,
        description:
          language === 'english'
            ? `The word was "${getTargetWord()}". Try again!`
            : `Fjala ishte "${getTargetWord()}". Provo sërish!`,
      });
    }
  }, [gameState.gameStatus, gameState.currentRow, invalidReason, toast, getTargetWord, dismiss, t, language]);

  return (
    <div className="h-dvh min-h-0 flex flex-col overflow-hidden bg-gradient-subtle">
      <GameHeader
        title=""
        onReset={() => {
          void loadSession();
        }}
      />

      <div className="flex-1 min-h-0 flex flex-col w-full max-w-lg mx-auto">
        {!targetToken ? (
          <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 text-center">
            {loadError && <p className="text-destructive text-sm mb-4">{loadError}</p>}
            {!loadError && <p className="text-muted-foreground text-sm">{t.loading}</p>}
          </main>
        ) : (
          <>
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
                <div className="shrink-0 max-h-[min(42dvh,320px)] overflow-y-auto overscroll-contain border-t border-border/50 px-3 py-2 text-center space-y-3 bg-background/80">
                  {gameState.gameStatus === 'lost' && (
                    <div className="glass rounded-2xl p-4 shadow-card">
                      <div className="text-3xl mb-2">😅</div>
                      <h2 className="text-base sm:text-lg font-bold text-primary mb-1">
                        {language === 'english' ? 'Better luck next time!' : 'Më keq këtë herë!'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {language === 'english' ? 'The word was' : 'Fjala ishte'}{' '}
                        <span className="font-bold text-primary">{getTargetWord()}</span>
                      </p>
                    </div>
                  )}

                  <div className="glass rounded-2xl p-4 shadow-card animate-bounce-in">
                    <Button
                      onClick={() => {
                        void loadSession();
                      }}
                      size="lg"
                      className="px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {t.newGame}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <GameScreenKeyboard
              onKeyPress={handleKeyPress}
              letterStates={gameState.letterStates}
              disabled={gameState.gameStatus !== 'playing'}
            />
          </>
        )}
      </div>
    </div>
  );
}
