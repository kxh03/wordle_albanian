import { useEffect, useState } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { AlbanianKeyboard } from '@/components/game/AlbanianKeyboard';
import { GameHeader } from '@/components/game/GameHeader';
import { useWordleGame } from '@/hooks/useWordleGame';
import { ensureDictionaryLoaded, getFiveLetterTermsSync } from '@/utils/dictionary';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Game() {
  const { toast, dismiss } = useToast();
  const { t, language, config } = useLanguage();

  const pickRandom = () => {
    const terms = getFiveLetterTermsSync();
    if (!terms || terms.length === 0) {
      // Use real fallback words from the dictionaries while full dictionary loads
      const fallbackWords = language === 'english' 
        ? ['ABOUT', 'HOUSE', 'WORLD', 'MUSIC', 'HAPPY', 'LIGHT', 'HEART', 'WATER', 'PEACE', 'DREAM']
        : ['ANDEJ', 'DIÇKA', 'KËTEJ', 'MJAFT', 'SEPSE', 'SIPËR', 'TEPËR', 'TUTJE', 'KREJT', 'PRANË'];
      return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
    }
    return terms[Math.floor(Math.random() * terms.length)];
  };

  const [targetWord, setTargetWord] = useState<string>(() => pickRandom());
  const { gameState, isRevealing, isWordCompleteAnimating, handleKeyPress, resetGame, invalidReason, getTargetWord } = useWordleGame(targetWord);

  // Start dictionary loading in background without blocking the UI
  useEffect(() => {
    // Start loading dictionary but don't wait for it
    ensureDictionaryLoaded(config.code, config.normalizeFunction);
  }, [config.code, config.normalizeFunction]);

  // Only update word when language changes, not when dictionary loads
  useEffect(() => {
    const newWord = pickRandom();
    setTargetWord(newWord);
    resetGame(newWord);
  }, [language]); // Only depend on language, not dictionary loading

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with browser shortcuts or form inputs
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

    // Capture printable characters as they are produced by the OS/IME (e.g., Alt codes)
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

  // Show game result
  useEffect(() => {
    if (invalidReason === 'not_in_dictionary') {
      toast({
        title: language === 'english' ? 'Not in word list' : 'Nuk është në listën e fjalëve',
        description: language === 'english' ? 'Please enter a valid 5-letter word.' : 'Ju lutemi shkruani një fjalë të vlefshme me 5 shkronja.',
      });
    } else if (invalidReason === null) {
      // Dismiss any existing toasts when invalid reason is cleared
      dismiss();
    }
    if (gameState.gameStatus === 'won') {
      toast({
        title: t.congratulations,
        description: language === 'english' 
          ? `You found the word "${getTargetWord()}" in ${gameState.currentRow + 1} attempts!`
          : `E gjetët fjalën "${getTargetWord()}" në ${gameState.currentRow + 1} përpjekje!`,
      });
    } else if (gameState.gameStatus === 'lost') {
      toast({
        title: t.betterLuck,
        description: language === 'english'
          ? `The word was "${getTargetWord()}". Try again!`
          : `Fjala ishte "${getTargetWord()}". Provo sërish!`,
      });
    }
  }, [gameState.gameStatus, gameState.currentRow, invalidReason, toast, getTargetWord]);

  return (
    <div className="min-h-screen h-screen bg-gradient-subtle flex flex-col overflow-hidden overscroll-none" style={{ minHeight: '100vh', height: '100vh' }}>
      <GameHeader 
        title="" 
        onReset={() => {
          const w = pickRandom();
          setTargetWord(w);
          resetGame(w);
        }}
      />
      
      <main 
        className="flex-1 flex flex-col items-center justify-start max-w-lg mx-auto w-full px-2 sm:px-4 py-2 sm:py-4 touch-none"
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault() as unknown as void}
        style={{ paddingBottom: '140px' }}
      >
        <div className="animate-float mt-2 sm:mt-4 mb-6 sm:mb-8">
          <GameBoard 
            gameState={gameState} 
            revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
            getTargetWord={getTargetWord}
            isWordCompleteAnimating={isWordCompleteAnimating}
          />
        </div>
        
        {gameState.gameStatus !== 'playing' && (
          <div className="mt-8 text-center space-y-4 animate-bounce-in">
            <div className="glass rounded-2xl p-6 shadow-card">
              <Button 
                onClick={() => {
                  const w = pickRandom();
                  setTargetWord(w);
                  resetGame(w);
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
      
      <div className="pb-6">
        <AlbanianKeyboard
          onKeyPress={handleKeyPress}
          letterStates={gameState.letterStates}
          disabled={gameState.gameStatus !== 'playing'}
        />
      </div>
    </div>
  );
}