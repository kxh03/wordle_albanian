import { Button } from "@/components/ui/button";
import { GameHeader } from "@/components/game/GameHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Play, Users, Info, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <GameHeader title="" showFriendsButton={true} />
      <header className="text-center py-8">
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          {t.mainTagline}
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/daily">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t.daily}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t.dailyDescription}
                </p>
                <Button size="lg" className="w-full">
                  {t.playToday}
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/game">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t.freeGame}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t.freeGameDescription}
                </p>
                <Button size="lg" variant="outline" className="w-full">
                  {t.startGame}
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/friends">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t.friends}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t.friendsDescription}
                </p>
                <Button size="lg" variant="outline" className="w-full">
                  {t.createGameButton}
                </Button>
              </CardContent>
            </Link>
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
