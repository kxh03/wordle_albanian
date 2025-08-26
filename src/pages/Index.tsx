import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Play, Users, Info, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
          Wordle Shqip
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Loja e fjalëve më e dashur në botë, tani në gjuhën shqipe!
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
                <CardTitle className="text-2xl">Fjala e Ditës</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Një fjalë e re çdo ditë. E njëjta fjalë për të gjithë!
                </p>
                <Button size="lg" className="w-full">
                  Luaj Sot
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
                <CardTitle className="text-2xl">Lojë e Lirë</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Luaj sa herë të duash me fjalë të rastësishme!
                </p>
                <Button size="lg" variant="outline" className="w-full">
                  Fillo Lojën
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
                <CardTitle className="text-2xl">Sfido Miqtë</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Krijo lojëra të personalizuara dhe sfido miqtë tuaj!
                </p>
                <Button size="lg" variant="outline" className="w-full">
                  Krijo Lojë
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Si të luash
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-correct rounded-md flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  A
                </div>
                <h3 className="font-semibold mb-2">E saktë</h3>
                <p className="text-sm text-muted-foreground">
                  Shkronja është në vendin e duhur
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-partial rounded-md flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  B
                </div>
                <h3 className="font-semibold mb-2">Pjesërisht</h3>
                <p className="text-sm text-muted-foreground">
                  Shkronja është në fjalë por jo në vendin e duhur
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-incorrect rounded-md flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  C
                </div>
                <h3 className="font-semibold mb-2">Gabim</h3>
                <p className="text-sm text-muted-foreground">
                  Shkronja nuk është në fjalë
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center py-8 text-muted-foreground">
        <p>© 2024 Wordle Shqip - Krijuar me ❤️ për komunitetin shqiptar</p>
      </footer>
    </div>
  );
};

export default Index;
