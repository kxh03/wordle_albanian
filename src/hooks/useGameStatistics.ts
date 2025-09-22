import { useState, useEffect } from 'react';

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  winPercentage: number;
  guessDistribution: Record<number, number>;
}

export function useGameStatistics() {
  const [statistics, setStatistics] = useState<GameStatistics>(() => {
    const saved = localStorage.getItem('wordle-statistics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse statistics');
      }
    }
    
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      winPercentage: 0,
      guessDistribution: {}
    };
  });

  const updateStatistics = (won: boolean, attempts?: number) => {
    setStatistics(prev => {
      const newStats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: won ? prev.gamesWon + 1 : prev.gamesWon,
        currentStreak: won ? prev.currentStreak + 1 : 0,
        guessDistribution: { ...prev.guessDistribution }
      };

      if (won && attempts) {
        newStats.guessDistribution[attempts] = (newStats.guessDistribution[attempts] || 0) + 1;
      }

      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      newStats.winPercentage = newStats.gamesPlayed > 0 
        ? Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100) 
        : 0;

      // Save to localStorage
      localStorage.setItem('wordle-statistics', JSON.stringify(newStats));
      
      return newStats;
    });
  };

  const resetStatistics = () => {
    const emptyStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      winPercentage: 0,
      guessDistribution: {}
    };
    setStatistics(emptyStats);
    localStorage.setItem('wordle-statistics', JSON.stringify(emptyStats));
  };

  return {
    statistics,
    updateStatistics,
    resetStatistics
  };
}