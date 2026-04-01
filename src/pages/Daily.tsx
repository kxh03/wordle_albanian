import { useEffect, useState, useCallback, useRef } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { GameHeader } from '@/components/game/GameHeader';
import { HelpModal } from '@/components/game/HelpModal';
import { KeyboardOverlay } from '@/components/game/KeyboardOverlay';
import { useWordleGame } from '@/hooks/useWordleGame';
import {
  getTodayDateString,
  getFormattedDate,
  isNewDay,
  markTodayAsPlayed,
  getDateString,
  formatDate,
} from '@/utils/dailyWord';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Trophy, Share2, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useLanguage } from '@/contexts/LanguageContext';
import { postGamesDaily, toApiLanguage, type ApiLanguage } from '@/lib/api';

type DailySessionProps = {
  gameId: string;
  targetToken: string;
  apiLang: ApiLanguage;
  hasPlayedToday: boolean;
  onGameFinished: () => void;
};

function DailySession({ gameId, targetToken, apiLang, hasPlayedToday, onGameFinished }: DailySessionProps) {
  const { toast, dismiss } = useToast();
  const { language, t, config } = useLanguage();
  const { gameState, isRevealing, isWordCompleteAnimating, handleKeyPress, invalidReason, getTargetWord } =
    useWordleGame('?????', gameId, {
      mode: 'api',
      apiLanguage: apiLang,
      targetToken,
    });

  useEffect(() => {
    if (hasPlayedToday) return;

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
  }, [handleKeyPress, hasPlayedToday, config]);

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

  const completionHandled = useRef(false);

  useEffect(() => {
    if (hasPlayedToday || completionHandled.current) return;
    if (gameState.gameStatus === 'won') {
      completionHandled.current = true;
      const attempts = gameState.currentRow + 1;
      const completionData = {
        attempts,
        completedAt: Date.now(),
        completed: true,
      };

      localStorage.setItem(`daily-completed-${getTodayDateString()}-${language}`, JSON.stringify(completionData));

      onGameFinished();

      toast({
        title: language === 'english' ? 'Congratulations! 🎉' : 'Urime! 🎉',
        description:
          language === 'english'
            ? `You found today's word in ${attempts} attempts!`
            : `E gjetët fjalën e sotme në ${attempts} përpjekje!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      completionHandled.current = true;
      const completionData = {
        attempts: 6,
        completedAt: Date.now(),
        failed: true,
        completed: true,
      };

      localStorage.setItem(`daily-completed-${getTodayDateString()}-${language}`, JSON.stringify(completionData));

      onGameFinished();

      toast({
        title: language === 'english' ? 'Better luck next time! 😅' : 'Më keq sot! 😅',
        description:
          language === 'english'
            ? `Today's word was "${getTargetWord()}". Come back tomorrow for a new challenge!`
            : `Fjala e sotme ishte "${getTargetWord()}". Kthehuni nesër për një sfidë të re!`,
      });
    }
  }, [gameState.gameStatus, gameState.currentRow, toast, getTargetWord, language, hasPlayedToday, onGameFinished]);

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
        ? `Wordle English ${getTodayDateString()}\n${attempts}/6\n\n${grid}\n#WordleEnglish`
        : `Wordle Shqip ${getTodayDateString()}\n${attempts}/6\n\n${grid}\n#WordleShqip`;

    if (navigator.share) {
      navigator.share({
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: language === 'english' ? 'Copied!' : 'U kopjua!',
        description: language === 'english' ? 'Results copied to clipboard.' : 'Rezultatet u kopjuan në clipboard.',
      });
    }
  }, [gameState, getTargetWord, language, toast]);

  return (
    <>
      <main
        className="flex-1 flex flex-col items-center justify-start max-w-lg mx-auto w-full px-2 sm:px-4 py-2 sm:py-4 gap-1 sm:gap-2"
        style={{ paddingBottom: '140px' }}
      >
        {hasPlayedToday ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 w-full">
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                {language === 'english' ? "Today's Word Completed!" : 'Fjala e Ditës Përfunduar!'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'english' ? "Here's how you found it:" : 'Ja si e gjetët:'}
              </p>
            </div>

            <div className="mt-2 sm:mt-4 mb-6 sm:mb-2">
              <GameBoard
                gameState={gameState}
                revealingRow={undefined}
                getTargetWord={getTargetWord}
                isWordCompleteAnimating={isWordCompleteAnimating}
              />
            </div>

            {gameState.gameStatus === 'lost' && (
              <div className="mb-6 text-center">
                <div className="glass rounded-2xl p-4 sm:p-5 shadow-card">
                  <div className="text-4xl mb-3">😅</div>
                  <h2 className="text-lg sm:text-xl font-bold text-primary mb-1">
                    {language === 'english' ? 'You did not find today\'s word.' : 'Nuk e gjetët fjalën e ditës.'}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {language === 'english' ? 'Today\'s word was' : 'Fjala e sotme ishte'}{' '}
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

            <p className="text-sm text-muted-foreground">{t.comeBackTomorrow}</p>
          </div>
        ) : (
          <>
            <div className="mt-2 sm:mt-4 mb-6 sm:mb-8">
              <GameBoard
                gameState={gameState}
                revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
                getTargetWord={getTargetWord}
                isWordCompleteAnimating={isWordCompleteAnimating}
              />
            </div>

            {gameState.gameStatus !== 'playing' && (
              <div className="mt-4 sm:mt-6 text-center space-y-3 sm:space-y-4">
                {gameState.gameStatus === 'won' && (
                  <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="text-base sm:text-lg font-semibold text-primary">
                      {t.congratulations} {gameState.currentRow + 1}/6
                    </span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3">
                  <Button onClick={shareResults} size="sm" className="flex-1 sm:size-lg">
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t.share}
                  </Button>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground">{t.comeBackTomorrow}</p>
              </div>
            )}
          </>
        )}
      </main>

      {!hasPlayedToday && (
        <KeyboardOverlay
          onKeyPress={handleKeyPress}
          letterStates={gameState.letterStates}
          disabled={gameState.gameStatus !== 'playing'}
        />
      )}

    </>
  );
}

export default function Daily() {
  const { t, language } = useLanguage();
  const apiLang = toApiLanguage(language);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [targetToken, setTargetToken] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const playDateStr = selectedDate ? getDateString(selectedDate) : getTodayDateString();
  const gameId = `daily-${playDateStr}-${language}`;

  const onGameFinished = useCallback(() => {
    setHasPlayedToday(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSessionError(null);
    (async () => {
      try {
        const s = await postGamesDaily(apiLang, playDateStr);
        if (!cancelled) {
          setTargetToken(s.target_token);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setTargetToken(null);
          setSessionError(e instanceof Error ? e.message : 'Could not load daily puzzle');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language, playDateStr, apiLang]);

  useEffect(() => {
    const completedToday = localStorage.getItem(`daily-completed-${getTodayDateString()}-${language}`);
    setHasPlayedToday(!!completedToday);

    if (isNewDay()) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('daily-game-') && !key.includes(getTodayDateString())) {
          localStorage.removeItem(key);
        }
      });
      markTodayAsPlayed();
    }
  }, [language]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col overflow-y-auto" style={{ minHeight: '100vh' }}>
      <GameHeader
        title=""
        showFriendsButton={true}
        showHomeButton={true}
        onHelpClick={() => setShowHelp(true)}
        rightSlot={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Calendar className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarUI
                mode="single"
                selected={selectedDate ?? new Date()}
                onSelect={(date) => {
                  if (!date) return;
                  setSelectedDate(date);
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        }
      />

      <div className="w-full max-w-lg mx-auto px-2 sm:px-4 mb-2 sm:mb-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <div>
                <p className="font-semibold text-sm sm:text-base">{t.todaysWord}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedDate ? formatDate(selectedDate, language) : getFormattedDate(language)}
                </p>
              </div>
            </div>
            {hasPlayedToday && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-xs sm:text-sm font-medium">{t.completed}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {sessionError && (
        <p className="text-center text-destructive text-sm px-4 mb-2">{sessionError}</p>
      )}

      {!targetToken && !sessionError && (
        <p className="text-center text-muted-foreground text-sm mb-4">{t.loading}</p>
      )}

      {targetToken && (
        <DailySession
          key={gameId}
          gameId={gameId}
          targetToken={targetToken}
          apiLang={apiLang}
          hasPlayedToday={hasPlayedToday}
          onGameFinished={onGameFinished}
        />
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
