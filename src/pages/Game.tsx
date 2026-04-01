import { useEffect, useState, useCallback } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { KeyboardOverlay } from '@/components/game/KeyboardOverlay';
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
    <div
      className="min-h-screen bg-gradient-subtle flex flex-col overflow-y-auto"
      style={{ minHeight: '100vh' }}
    >
      <GameHeader
        title=""
        onReset={() => {
          void loadSession();
        }}
      />

      <main
        className="flex-1 flex flex-col items-center justify-start max-w-lg mx-auto w-full px-2 sm:px-4 py-2 sm:py-4"
        style={{ paddingBottom: '140px' }}
      >
        {loadError && (
          <p className="text-destructive text-sm mb-4 text-center px-4">{loadError}</p>
        )}
        {!targetToken && !loadError && (
          <p className="text-muted-foreground text-sm mb-4">{t.loading}</p>
        )}
        {targetToken && (
          <div className="animate-float mt-2 sm:mt-4 mb-6 sm:mb-8">
            <GameBoard
              gameState={gameState}
              revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
              getTargetWord={getTargetWord}
              isWordCompleteAnimating={isWordCompleteAnimating}
            />
          </div>
        )}

        {targetToken && gameState.gameStatus === 'lost' && (
          <div className="mb-6 text-center">
            <div className="glass rounded-2xl p-4 sm:p-5 shadow-card">
              <div className="text-4xl mb-3">😅</div>
              <h2 className="text-lg sm:text-xl font-bold text-primary mb-1">
                {language === 'english' ? 'Better luck next time!' : 'Më keq këtë herë!'}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {language === 'english' ? 'The word was' : 'Fjala ishte'}{' '}
                <span className="font-bold text-primary">{getTargetWord()}</span>
              </p>
            </div>
          </div>
        )}

        {targetToken && gameState.gameStatus !== 'playing' && (
          <div className="mt-8 text-center space-y-4 animate-bounce-in">
            <div className="glass rounded-2xl p-6 shadow-card">
              <Button
                onClick={() => {
                  void loadSession();
                }}
                size="lg"
                className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {t.newGame}
              </Button>
            </div>
          </div>
        )}
      </main>

      {targetToken && (
        <KeyboardOverlay
          onKeyPress={handleKeyPress}
          letterStates={gameState.letterStates}
          disabled={gameState.gameStatus !== 'playing'}
        />
      )}
    </div>
  );
}
