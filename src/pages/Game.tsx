import { useEffect, useState, useCallback } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { GameScreenKeyboard } from '@/components/game/GameScreenKeyboard';
import { GameHeader } from '@/components/game/GameHeader';
import { useWordleGame } from '@/hooks/useWordleGame';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { postGamesFree, toApiLanguage } from '@/lib/api';
import { Flame, Timer } from 'lucide-react';

export default function Game() {
  const { toast, dismiss } = useToast();
  const { t, language, config } = useLanguage();
  const apiLang = toApiLanguage(language);

  const [targetToken, setTargetToken] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hardMode, setHardMode] = useState<boolean>(() => localStorage.getItem('wordle_hard_mode') === 'true');
  const [timedMode, setTimedMode] = useState<boolean>(() => localStorage.getItem('wordle_timed_mode') === 'true');
  const [timedSeconds, setTimedSeconds] = useState<number>(() => {
    const raw = localStorage.getItem('wordle_timed_seconds');
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return 60;
    return Math.max(15, Math.min(600, Math.floor(parsed)));
  });

  const {
    gameState,
    isRevealing,
    isWordCompleteAnimating,
    handleKeyPress,
    resetGame,
    invalidReason,
    getTargetWord,
    timeLeft,
  } =
    useWordleGame('?????', undefined, {
      mode: 'api',
      apiLanguage: apiLang,
      targetToken,
      hardMode,
      timedMode,
      timeLimitSeconds: timedSeconds,
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
    localStorage.setItem('wordle_hard_mode', String(hardMode));
  }, [hardMode]);

  useEffect(() => {
    localStorage.setItem('wordle_timed_mode', String(timedMode));
  }, [timedMode]);

  useEffect(() => {
    localStorage.setItem('wordle_timed_seconds', String(timedSeconds));
  }, [timedSeconds]);

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
    if (invalidReason?.code === 'not_in_dictionary') {
      toast({
        title: language === 'english' ? 'Word not in dictionary' : 'Kjo fjalë nuk është në fjalorin tonë. Ju lutemi provoni një fjalë tjetër.',
        description:
          language === 'english'
            ? 'Please enter a valid 5-letter word.'
            : 'Ju lutemi shkruani një fjalë të vlefshme me 5 shkronja.',
      });
    } else if (invalidReason?.code === 'hard_mode_position') {
      toast({
        title: language === 'english' ? 'Must use revealed hints' : 'Duhet të përdorësh ndihmat e zbuluara',
        description:
          language === 'english'
            ? `Letter ${invalidReason.letter} must be in position ${invalidReason.position}.`
            : `Shkronja ${invalidReason.letter} duhet të jetë në pozicionin ${invalidReason.position}.`,
      });
    } else if (invalidReason?.code === 'hard_mode_letter') {
      toast({
        title: language === 'english' ? 'Must use revealed hints' : 'Duhet të përdorësh ndihmat e zbuluara',
        description:
          language === 'english'
            ? `Guess must contain letter ${invalidReason.letter}.`
            : `Fjala duhet të përmbajë shkronjën ${invalidReason.letter}.`,
      });
    } else if (invalidReason?.code === 'must_use_revealed_hints') {
      toast({
        title: language === 'english' ? 'Must use revealed hints' : 'Duhet të përdorësh ndihmat e zbuluara',
      });
    } else if (invalidReason?.code === 'time_up') {
      toast({
        title: language === 'english' ? "Time's up!" : 'Koha mbaroi!',
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
        <div className="px-2 pt-2 pb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={hardMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHardMode((prev) => !prev)}
              className="h-8 px-3"
            >
              <Flame className="w-4 h-4 mr-1" />
              {language === 'english' ? 'Hard Mode' : 'Mënyra e vështirë'}
            </Button>
            <Button
              variant={timedMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimedMode((prev) => !prev)}
              className="h-8 px-3"
            >
              <Timer className="w-4 h-4 mr-1" />
              {language === 'english' ? 'Timed' : 'Me kohë'}
            </Button>
            {timedMode && (
              <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2 h-8">
                <span className="text-xs text-muted-foreground">
                  {language === 'english' ? 'Sec' : 'Sek'}
                </span>
                <input
                  type="number"
                  min={15}
                  max={600}
                  step={5}
                  value={timedSeconds}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (!Number.isFinite(next)) return;
                    setTimedSeconds(Math.max(15, Math.min(600, Math.floor(next))));
                  }}
                  className="w-16 bg-transparent text-sm font-medium outline-none"
                  aria-label={language === 'english' ? 'Timer seconds' : 'Sekondat e kohëmatësit'}
                />
              </div>
            )}
          </div>
          {timedMode && (
            <div className={`text-sm font-semibold ${timeLeft <= 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
              ⏱️ {timeLeft}s
            </div>
          )}
        </div>

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
