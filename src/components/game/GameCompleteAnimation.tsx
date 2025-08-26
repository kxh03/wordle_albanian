import { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface GameCompleteAnimationProps {
  isWon: boolean;
  attempts: number;
  isVisible: boolean;
}

export function GameCompleteAnimation({ isWon, attempts, isVisible }: GameCompleteAnimationProps) {
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    if (isVisible && isWon) {
      const timer = setTimeout(() => setShowStars(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isWon]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {isWon && (
        <>
          {/* Main trophy animation */}
          <div className="animate-bounce-in">
            <div className="bg-primary/20 backdrop-blur-sm rounded-full p-8 animate-glow">
              <Trophy className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          {/* Floating stars */}
          {showStars && (
            <>
              {[...Array(6)].map((_, i) => (
                <Star
                  key={i}
                  className={`absolute w-6 h-6 text-yellow-400 animate-ping`}
                  style={{
                    top: `${30 + Math.random() * 40}%`,
                    left: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 200}ms`,
                    animationDuration: '2s'
                  }}
                />
              ))}
              
              {/* Sparkles */}
              {[...Array(12)].map((_, i) => (
                <Sparkles
                  key={`sparkle-${i}`}
                  className={`absolute w-4 h-4 text-primary animate-pulse`}
                  style={{
                    top: `${10 + Math.random() * 80}%`,
                    left: `${10 + Math.random() * 80}%`,
                    animationDelay: `${i * 150}ms`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}