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
  const { toast } = useToast();
  const { t, language, config } = useLanguage();

  useEffect(() => {
    ensureDictionaryLoaded(config.code, config.normalizeFunction);
  }, [config.code, config.normalizeFunction]);

  const pickRandom = () => {
    const terms = getFiveLetterTermsSync();
    if (!terms || terms.length === 0) return language === 'english' ? 'WORDS' : 'FJALË';
    return terms[Math.floor(Math.random() * terms.length)];
  };

  const [targetWord, setTargetWord] = useState<string>(() => pickRandom());
  const { gameState, isRevealing, handleKeyPress, resetGame, invalidReason, getTargetWord } = useWordleGame(targetWord);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'BACKSPACE' || key === 'DELETE') {
        handleKeyPress('BACKSPACE');
      } else if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key.length === 1) {
        const normalized = config.normalizeFunction(key);
        if (config.alphabet.includes(normalized)) {
          handleKeyPress(normalized);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, config]);

  // Show game result
  useEffect(() => {
    if (invalidReason === 'not_in_dictionary') {
      toast({
        title: language === 'english' ? 'Not in word list' : 'Nuk është në listën e fjalëve',
        description: language === 'english' ? 'Please enter a valid 5-letter word.' : 'Ju lutemi shkruani një fjalë të vlefshme me 5 shkronja.',
      });
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
    <div className="min-h-screen h-screen bg-gradient-subtle flex flex-col overflow-hidden overscroll-none">
      <GameHeader 
        title="" 
        onReset={() => {
          const w = pickRandom();
          setTargetWord(w);
          resetGame(w);
        }}
      />
      
      <main 
        className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 touch-none"
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault() as unknown as void}
      >
        <GameBoard 
          gameState={gameState} 
          revealingRow={isRevealing ? gameState.currentRow - 1 : undefined}
          getTargetWord={getTargetWord}
        />
        
        {gameState.gameStatus !== 'playing' && (
          <div className="mt-6 text-center space-y-4">
            <Button 
                onClick={() => {
                  const w = pickRandom();
                  setTargetWord(w);
                  resetGame(w);
                }} 
                size="lg"
                className="px-8"
              >
                {t.newGame}
              </Button>
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