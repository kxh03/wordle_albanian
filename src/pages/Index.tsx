import { Button } from "@/components/ui/button";
import { GameHeader } from "@/components/game/GameHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Play, Users, Info, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <GameHeader title="" showFriendsButton={true} />
      <header className="text-center py-8">
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          {t.mainTagline}
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12 relative z-10">
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] glass">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-primary/20 transition-colors duration-200">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t.daily}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                {t.dailyDescription}
              </p>
              <Button 
                size="lg" 
                className="w-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => navigate('/daily')}
              >
                {t.playToday}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] glass">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-primary/20 transition-colors duration-200">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t.freeGame}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                {t.freeGameDescription}
              </p>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl hover:bg-primary hover:text-primary-foreground cursor-pointer"
                onClick={() => navigate('/game')}
              >
                {t.startGame}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] glass">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-primary/20 transition-colors duration-200">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t.friends}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                {t.friendsDescription}
              </p>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl hover:bg-primary hover:text-primary-foreground cursor-pointer"
                onClick={() => navigate('/friends')}
              >
                {t.createGameButton}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {t.howToPlay}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-correct rounded-md flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  A
                </div>
                <h3 className="font-semibold mb-2">{t.correct}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.correctDescription}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-partial rounded-md flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  B
                </div>
                <h3 className="font-semibold mb-2">{t.partial}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.partialDescription}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-incorrect rounded-md flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  C
                </div>
                <h3 className="font-semibold mb-2">{t.wrong}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.wrongDescription}
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4 space-y-3">
              <div>
                <h3 className="font-semibold">🔥 {language === 'english' ? 'Hard Mode' : 'Mënyra e Vështirë'}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'english'
                    ? 'Green letters must stay in the same position, and yellow letters must be used in the next guesses.'
                    : 'Shkronjat jeshile duhet të mbeten në të njëjtin pozicion, ndërsa shkronjat e verdha duhet të përdoren në tentativat e radhës.'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">⏱️ {language === 'english' ? 'Timed Mode' : 'Mënyra me Kohë'}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'english'
                    ? 'You choose your own time limit in seconds before starting. When time reaches zero, the game is lost and the word is revealed.'
                    : 'Lojtari vendos vetë kohën në sekonda para nisjes. Kur koha shkon në zero, loja humbet dhe zbulohet fjala.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center py-8 text-muted-foreground">
        <p>© 2025 6 Llafe</p>
      </footer>
    </div>
  );
};

export default Index;
