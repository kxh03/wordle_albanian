import { useEffect, useCallback, useRef } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { GameScreenKeyboard } from '@/components/game/GameScreenKeyboard';
import { useWordleGame, type ServerDailySnapshot, type ServerGuessResponse } from '@/hooks/useWordleGame';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTodayDateString } from '@/utils/dailyWord';
import type { ApiLanguage } from '@/lib/api';
import type { DailyGameState } from '@/api/daily';

function dtoToSnapshot(dto: DailyGameState): ServerDailySnapshot {
  return {
    guesses: dto.guesses.map((g) => ({ guess: g.guess, result: g.result })),
    answer: dto.target_word,
    status: dto.is_completed ? (dto.is_won ? 'won' : 'lost') : 'playing',
  };
}

type AuthenticatedDailySessionProps = {
  playDateStr: string;
  apiLang: ApiLanguage;
  dto: DailyGameState;
  readOnlyArchive: boolean;
  submitGuess: (params: { guess: string; playDate: string }) => Promise<unknown>;
  guessPending: boolean;
};

export function AuthenticatedDailySession({
  playDateStr,
  apiLang,
  dto,
  readOnlyArchive,
  submitGuess,
  guessPending,
}: AuthenticatedDailySessionProps) {
  const { toast, dismiss } = useToast();
  const { language, t, config } = useLanguage();
  const gameId = `server-daily-${playDateStr}-${apiLang}`;
  const snapshot = dtoToSnapshot(dto);

  const { gameState, isRevealing, isWordCompleteAnimating, handleKeyPress, invalidReason, getTargetWord } =
    useWordleGame('?????', gameId, {
      mode: 'server-daily',
      apiLanguage: apiLang,
      serverSnapshot: snapshot,
      serverSubmitGuess: async (guess) => {
        const res = await submitGuess({ guess, playDate: playDateStr });
        return res as ServerGuessResponse;
      },
    });

  const completedView = dto.is_completed || gameState.gameStatus !== 'playing';

  useEffect(() => {
    if (readOnlyArchive || completedView) return;

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
  }, [handleKeyPress, readOnlyArchive, completedView, config]);

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
  }, [invalidReason, toast, dismiss, language]);

  const completionHandled = useRef(dto.is_completed);

  useEffect(() => {
    if (readOnlyArchive || completionHandled.current) return;
    if (gameState.gameStatus === 'won') {
      completionHandled.current = true;
      toast({
        title: language === 'english' ? 'Congratulations! 🎉' : 'Urime! 🎉',
        description:
          language === 'english'
            ? `You found the word in ${gameState.currentRow + 1} attempts!`
            : `E gjetët fjalën në ${gameState.currentRow + 1} përpjekje!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      completionHandled.current = true;
      toast({
        title: language === 'english' ? 'Better luck next time! 😅' : 'Më keq këtë herë! 😅',
        description:
          language === 'english'
            ? `The word was "${getTargetWord()}".`
            : `Fjala ishte "${getTargetWord()}".`,
      });
    }
  }, [gameState.gameStatus, gameState.currentRow, toast, getTargetWord, language, readOnlyArchive]);

  const shareResults = useCallback(() => {
    const attempts = gameState.gameStatus === 'won' ? gameState.currentRow + 1 : 'X';
    const tw = getTargetWord();
    let grid = '';
    for (
      let row = 0;
      row < Math.min(gameState.currentRow + (gameState.gameStatus !== 'playing' ? 1 : 0), 6);
      row++
    ) {
      for (let col = 0; col < 5; col++) {
        const letter = gameState.board[row][col];
        if (!letter) continue;

        if (letter === tw[col]) {
          grid += '🟩';
        } else if (tw.includes(letter)) {
          grid += '🟨';
        } else {
          grid += '⬛';
        }
      }
      grid += '\n';
    }

    const shareText =
      language === 'english'
        ? `me llafe (daily) ${playDateStr}\n${attempts}/6\n\n${grid}`
        : `me llafe (ditore) ${playDateStr}\n${attempts}/6\n\n${grid}`;

    if (navigator.share) {
      void navigator.share({ text: shareText });
    } else {
      void navigator.clipboard.writeText(shareText);
      toast({
        title: language === 'english' ? 'Copied!' : 'U kopjua!',
        description:
          language === 'english' ? 'Results copied to clipboard.' : 'Rezultatet u kopjuan në clipboard.',
      });
    }
  }, [gameState, getTargetWord, language, toast, playDateStr]);

  if (readOnlyArchive && !dto.is_completed) {
    return (
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 text-center text-muted-foreground">
        <p className="text-sm">
          {language === 'english'
            ? 'No completed game on this date.'
            : 'Nuk ka lojë të përfunduar në këtë datë.'}
        </p>
      </main>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full min-w-0">
      {completedView ? (
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col items-center justify-start max-w-lg mx-auto w-full px-2 sm:px-4 py-2 gap-2">
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 w-full min-h-0 py-4">
            <div className="mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                {playDateStr === getTodayDateString()
                  ? language === 'english'
                    ? "Today's puzzle"
                    : 'Sfida e ditës'
                  : language === 'english'
                    ? 'Past puzzle'
                    : 'Sfida e kaluar'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'english' ? 'Your result:' : 'Rezultati juaj:'}
              </p>
            </div>

            <div className="my-2">
              <GameBoard
                gameState={gameState}
                revealingRow={undefined}
                getTargetWord={getTargetWord}
                isWordCompleteAnimating={isWordCompleteAnimating}
                compactLayout
              />
            </div>

            {gameState.gameStatus === 'lost' && (
              <div className="mb-4 text-center">
                <div className="glass rounded-2xl p-4 sm:p-5 shadow-card">
                  <div className="text-4xl mb-3">😅</div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {language === 'english' ? 'The word was' : 'Fjala ishte'}{' '}
                    <span className="font-bold text-primary">{getTargetWord()}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={shareResults} size="lg" className="px-6">
                <Share2 className="w-4 h-4 mr-2" />
                {t.share}
              </Button>
            </div>

            {playDateStr === getTodayDateString() && (
              <p className="text-sm text-muted-foreground">{t.comeBackTomorrow}</p>
            )}
          </div>
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
              <div className="shrink-0 max-h-[min(40dvh,280px)] overflow-y-auto overscroll-contain border-t border-border/50 px-3 py-2 text-center space-y-2 sm:space-y-3 bg-background/80">
                {gameState.gameStatus === 'won' && (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="text-sm sm:text-base font-semibold text-primary">
                      {t.congratulations} {gameState.currentRow + 1}/6
                    </span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <Button onClick={shareResults} size="sm" className="px-5">
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t.share}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">{t.comeBackTomorrow}</p>
              </div>
            )}
          </div>

          <GameScreenKeyboard
            onKeyPress={handleKeyPress}
            letterStates={gameState.letterStates}
            disabled={gameState.gameStatus !== 'playing' || guessPending || readOnlyArchive}
          />
        </>
      )}
    </div>
  );
}
