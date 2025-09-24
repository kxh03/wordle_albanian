import { useEffect, useState } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { AlbanianKeyboard } from '@/components/game/AlbanianKeyboard';
import { GameHeader } from '@/components/game/GameHeader';
import { HelpModal } from '@/components/game/HelpModal';
import { KeyboardOverlay } from '@/components/game/KeyboardOverlay';
import { useWordleGame } from '@/hooks/useWordleGame';
// import { useGameStatistics } from '@/hooks/useGameStatistics';
import { getDailyWord, getFormattedDate, isNewDay, markTodayAsPlayed, getTodayDateString, getWordForDate, formatDate } from '@/utils/dailyWord';
import { ensureDictionaryLoaded } from '@/utils/dictionary';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Trophy, Share2, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Daily() {
  const { toast } = useToast();
  const { language, t, config } = useLanguage();
  const [dailyWord, setDailyWord] = useState(() => getDailyWord(language));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  // const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isWinAnimating, setIsWinAnimating] = useState(false);
  
  const gameId = `daily-${getTodayDateString()}-${language}`;
  const { gameState, isRevealing, isWordCompleteAnimating, handleKeyPress, resetGame, invalidReason, getTargetWord } = useWordleGame(dailyWord, gameId);
  
  // Handle language switching and dictionary loading
  useEffect(() => {
    ensureDictionaryLoaded(config.code, config.normalizeFunction).then(() => {
      const newWord = getDailyWord(language);
      if (newWord !== dailyWord) {
        setDailyWord(newWord);
        resetGame(newWord);
      }
    });
  }, [language, config.code, config.normalizeFunction, resetGame, dailyWord]);
  
  // Statistics removed
  // Check if player has already completed today's puzzle
  useEffect(() => {
    const completedToday = localStorage.getItem(`daily-completed-${getTodayDateString()}-${language}`);
    setHasPlayedToday(!!completedToday);
    
    // Clear old daily data if it's a new day
    if (isNewDay()) {
      // Clear previous daily game states
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('daily-game-') && !key.includes(getTodayDateString())) {
          localStorage.removeItem(key);
        }
      });
      markTodayAsPlayed();
    }
  }, [language]);

  // Handle keyboard events
  useEffect(() => {
    if (hasPlayedToday) return; // Don't listen for keyboard events if already completed

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
        const normalized = config.normalizeFunction(key);
        if (config.alphabet.includes(normalized)) {
          event.preventDefault();
          handleKeyPress(normalized);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, hasPlayedToday, config]);

  // Show invalid guess message, game result and mark as completed
  useEffect(() => {
    if (invalidReason === 'not_in_dictionary') {
      toast({
        title: language === 'english' ? 'Not in word list' : 'Nuk është në listën e fjalëve',
        description: language === 'english' ? 'Please enter a valid 5-letter word.' : 'Ju lutemi shkruani një fjalë të vlefshme me 5 shkronja.',
      });
    }
    if (gameState.gameStatus === 'won') {
      const attempts = gameState.currentRow + 1;
      const completionData = {
        attempts,
        completedAt: Date.now(),
        // Don't store the actual word for security
        completed: true
      };
      
      localStorage.setItem(`daily-completed-${getTodayDateString()}-${language}`, JSON.stringify(completionData));
      setHasPlayedToday(true);
      // statistics removed
      
      // Trigger win animation
      setIsWinAnimating(true);
      setTimeout(() => setIsWinAnimating(false), 2000);
      
      toast({
        title: language === 'english' ? 'Congratulations! 🎉' : 'Urime! 🎉',
        description: language === 'english' 
          ? `You found today's word in ${attempts} attempts!`
          : `E gjetët fjalën e sotme në ${attempts} përpjekje!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      const completionData = {
        attempts: 6,
        completedAt: Date.now(),
        // Don't store the actual word for security
        failed: true,
        completed: true
      };
      
      localStorage.setItem(`daily-completed-${getTodayDateString()}-${language}`, JSON.stringify(completionData));
      setHasPlayedToday(true);
      // statistics removed
      
      toast({
        title: language === 'english' ? 'Better luck next time! 😅' : 'Më keq sot! 😅',
        description: language === 'english'
          ? `Today's word was "${getTargetWord()}". Come back tomorrow for a new challenge!`
          : `Fjala e sotme ishte "${getTargetWord()}". Kthehuni nesër për një sfidë të re!`,
      });
    }
  }, [gameState.gameStatus, gameState.currentRow, invalidReason, toast, getTargetWord]);

  const shareResults = () => {
    const attempts = gameState.gameStatus === 'won' ? gameState.currentRow + 1 : 'X';
    const date = getFormattedDate();
    
    let grid = '';
    for (let row = 0; row < Math.min(gameState.currentRow + (gameState.gameStatus !== 'playing' ? 1 : 0), 6); row++) {
      for (let col = 0; col < 5; col++) {
        const letter = gameState.board[row][col];
        if (!letter) continue;
        
        if (letter === gameState.targetWord[col]) {
          grid += '🟩';
        } else if (gameState.targetWord.includes(letter)) {
          grid += '🟨';
        } else {
          grid += '⬛';
        }
      }
      grid += '\n';
    }

    const shareText = language === 'english' 
      ? `Wordle English ${getTodayDateString()}\n${attempts}/6\n\n${grid}\n#WordleEnglish`
      : `Wordle Shqip ${getTodayDateString()}\n${attempts}/6\n\n${grid}\n#WordleShqip`;
    
    if (navigator.share) {
      navigator.share({
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: language === 'english' ? 'Copied!' : 'U kopjua!',
        description: language === 'english' 
          ? 'Results copied to clipboard.'
          : 'Rezultatet u kopjuan në clipboard.',
      });
    }
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-subtle flex flex-col overflow-hidden overscroll-none" style={{ minHeight: '100vh', height: '100vh' }}>
      <GameHeader 
        title=""
        showFriendsButton={true}
        showHomeButton={true}
        onHelpClick={() => setShowHelp(true)}
        // onStatsClick removed
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
                  const word = getWordForDate(date, language);
                  setDailyWord(word);
                  resetGame(word);
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        }
      />
      
      {/* Daily Info */}
      <div className="w-full max-w-lg mx-auto px-2 sm:px-4 mb-2 sm:mb-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <div>
                <p className="font-semibold text-sm sm:text-base">{t.todaysWord}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{selectedDate ? formatDate(selectedDate, language) : getFormattedDate(language)}</p>
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
      
      <main 
        className="flex-1 flex flex-col items-center justify-start max-w-lg mx-auto w-full px-2 sm:px-4 py-2 sm:py-4 gap-1 sm:gap-2 touch-none"
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault() as unknown as void}
        style={{ paddingBottom: '140px' }}
      >
        {hasPlayedToday ? (
          // Show completed game board when user has already played today
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                {language === 'english' ? 'Today\'s Word Completed!' : 'Fjala e Ditës Përfunduar!'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'english' ? 'Here\'s how you found it:' : 'Ja si e gjetët:'}
              </p>
            </div>
            
            {/* Show the completed game board */}
            <div className="touch-none mt-2 sm:mt-4 mb-6 sm:mb-2" onTouchMove={(e) => e.preventDefault()}>
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
                    {language === 'english' ? 'Today\'s word was' : 'Fjala e sotme ishte'} "<span className="font-bold text-primary">{getTargetWord()}</span>"
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={shareResults}
                size="lg"
                className="px-6"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t.share}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {t.comeBackTomorrow}
            </p>
          </div>
        ) : (
          // Show active game when user hasn't played today
          <>
            <div className="touch-none mt-2 sm:mt-4 mb-6 sm:mb-8" onTouchMove={(e) => e.preventDefault()}>
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
                  <Button 
                    onClick={shareResults}
                    size="sm"
                    className="flex-1 sm:size-lg"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t.share}
                  </Button>
                </div>
                
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t.comeBackTomorrow}
                </p>
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
      
      {/* Modals */}
      
      <HelpModal 
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}