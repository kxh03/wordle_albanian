import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameStatistics } from '@/hooks/useGameStatistics';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: GameStatistics;
  onReset: () => void;
}

export function StatisticsModal({ isOpen, onClose, statistics, onReset }: StatisticsModalProps) {
  const maxGuesses = Math.max(...Object.values(statistics.guessDistribution), 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Statistikat
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center">
                  {statistics.gamesPlayed}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-center text-sm text-muted-foreground">Lojëra</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center text-primary">
                  {statistics.winPercentage}%
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-center text-sm text-muted-foreground">Fitore</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-1">
                  <TrendingUp className="w-5 h-5" />
                  {statistics.currentStreak}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-center text-sm text-muted-foreground">Rresht</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-1">
                  <Award className="w-5 h-5" />
                  {statistics.maxStreak}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-center text-sm text-muted-foreground">Rekord</p>
              </CardContent>
            </Card>
          </div>

          {/* Guess Distribution */}
          {Object.keys(statistics.guessDistribution).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Shpërndarja e Përpjekjeve
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const count = statistics.guessDistribution[num] || 0;
                  const percentage = maxGuesses > 0 ? (count / maxGuesses) * 100 : 0;
                  
                  return (
                    <div key={num} className="flex items-center gap-2">
                      <span className="w-4 text-sm font-mono">{num}</span>
                      <div className="flex-1 bg-muted rounded-sm h-6 relative overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(percentage, count > 0 ? 10 : 0)}%` }}
                        >
                          {count > 0 && (
                            <span className="text-xs font-bold text-primary-foreground">
                              {count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onReset} className="flex-1">
              Rivendos Statistikat
            </Button>
            <Button onClick={onClose} className="flex-1">
              Mbyll
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}