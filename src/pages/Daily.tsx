import { useEffect, useState } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { AlbanianKeyboard } from '@/components/game/AlbanianKeyboard';
import { GameHeader } from '@/components/game/GameHeader';
import { HelpModal } from '@/components/game/HelpModal';
import { KeyboardOverlay } from '@/components/game/KeyboardOverlay';
import { useWordleGame } from '@/hooks/useWordleGame';
// import { useGameStatistics } from '@/hooks/useGameStatistics';
import { getDailyWord, getFormattedDate, isNewDay, markTodayAsPlayed, getTodayDateString, getWordForDate, formatDate } from '@/utils/dailyWord';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Trophy, Share2, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';

export default function Daily() {
  const { toast } = useToast();
  const [dailyWord, setDailyWord] = useState(() => getDailyWord());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  // const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isWinAnimating, setIsWinAnimating] = useState(false);
  
  const gameId = `daily-${getTodayDateString()}`;
  const { gameState, isRevealing, handleKeyPress, resetGame } = useWordleGame(dailyWord, gameId);
  // Statistics removed

  // Check if player has already completed today's puzzle
  useEffect(() => {
    const completedToday = localStorage.getItem(`daily-completed-${getTodayDateString()}`);
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
  }, []);

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

  // Show game result and mark as completed
  useEffect(() => {
    if (gameState.gameStatus === 'won') {
      const attempts = gameState.currentRow + 1;
      const completionData = {
        attempts,
        completedAt: Date.now(),
        // Don't store the actual word for security
        completed: true
      };
      
      localStorage.setItem(`daily-completed-${getTodayDateString()}`, JSON.stringify(completionData));
      setHasPlayedToday(true);
      // statistics removed
      
      // Trigger win animation
      setIsWinAnimating(true);
      setTimeout(() => setIsWinAnimating(false), 2000);
      
      toast({
        title: 'Urime! 🎉',
        description: `E gjetët fjalën e sotme në ${attempts} përpjekje!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      const completionData = {
        attempts: 6,
        completedAt: Date.now(),
        // Don't store the actual word for security
        failed: true,
        completed: true
      };
      
      localStorage.setItem(`daily-completed-${getTodayDateString()}`, JSON.stringify(completionData));
      setHasPlayedToday(true);
      // statistics removed
      
      toast({
        title: 'Më keq sot! 😅',
        description: `Fjala e sotme ishte "${gameState.targetWord}". Kthehuni nesër për një sfidë të re!`,
      });
    }
  }, [gameState.gameStatus, gameState.targetWord, gameState.currentRow, toast]);

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

    const shareText = `Wordle Shqip ${getTodayDateString()}\n${attempts}/6\n\n${grid}\n#WordleShqip`;
    
    if (navigator.share) {
      navigator.share({
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'U kopjua!',
        description: 'Rezultatet u kopjuan në clipboard.',
      });
    }
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-subtle flex flex-col overflow-hidden overscroll-none">
      <GameHeader 
        title="Wordle Shqip - Dita"
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
                  const word = getWordForDate(date);
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
      <div className="w-full max-w-lg mx-auto px-4 mb-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">Fjala e Sotme</p>
                <p className="text-sm text-muted-foreground">{selectedDate ? formatDate(selectedDate) : getFormattedDate()}</p>
              </div>
            </div>
            {hasPlayedToday && (
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Përfunduar</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <main 
        className="flex-1 flex flex-col items-center justify-start max-w-lg mx-auto w-full px-4 gap-2 touch-none"
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault() as unknown as void}
      >
        <div className="touch-none" onTouchMove={(e) => e.preventDefault()}>
          <GameBoard 
            gameState={gameState} 
            revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
          />
        </div>
        
        {gameState.gameStatus !== 'playing' && (
          <div className="mt-6 text-center space-y-4">
            {gameState.gameStatus === 'won' && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  Përkrahje! {gameState.currentRow + 1}/6
                </span>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={shareResults}
                size="lg"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Ndaj
              </Button>
              {/* Statistics button removed */}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Kthehuni nesër për një fjalë të re!
            </p>
          </div>
        )}
      </main>
      
      <KeyboardOverlay
        onKeyPress={handleKeyPress}
        letterStates={gameState.letterStates}
        disabled={gameState.gameStatus !== 'playing'}
      />
      
      {/* Modals */}
      
      <HelpModal 
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}