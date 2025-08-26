import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameTile } from './GameTile';
import { HelpCircle, Target, Keyboard, Trophy } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Si të Luash
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Game Rules */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Objektivi</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gjej fjalën e fshehtë shqipe me 5 shkronja në maksimum 6 përpjekje.
              </p>
            </CardContent>
          </Card>

          {/* How to Play */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Keyboard className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Si të Luash</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Shkruaj një fjalë me 5 shkronja dhe shtyp ENTER</p>
                <p>• Ngjyrat e kuadrateve do të ndryshojnë për të treguar sa afër je</p>
                <p>• Ke 6 mundësi për të gjetur fjalën e saktë</p>
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold mb-3">Shembuj</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex gap-1 mb-2">
                    <GameTile letter="S" state="correct" />
                    <GameTile letter="H" state="unused" />
                    <GameTile letter="Q" state="unused" />
                    <GameTile letter="I" state="unused" />
                    <GameTile letter="P" state="unused" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>S</strong> është në pozicionin e duhur.
                  </p>
                </div>

                <div>
                  <div className="flex gap-1 mb-2">
                    <GameTile letter="L" state="unused" />
                    <GameTile letter="U" state="partial" />
                    <GameTile letter="L" state="unused" />
                    <GameTile letter="E" state="unused" />
                    <GameTile letter="Z" state="unused" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>U</strong> është në fjalë por në pozicion të gabuar.
                  </p>
                </div>

                <div>
                  <div className="flex gap-1 mb-2">
                    <GameTile letter="T" state="unused" />
                    <GameTile letter="J" state="unused" />
                    <GameTile letter="E" state="unused" />
                    <GameTile letter="T" state="unused" />
                    <GameTile letter="R" state="incorrect" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>R</strong> nuk është në fjalën e fshehtë.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Albanian Letters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold mb-3">Shkronja Shqipe</h3>
              <p className="text-sm text-muted-foreground">
                Përdor shkronjat e alfabetit shqip: A, B, C, Ç, D, DH, E, Ë, F, G, GJ, H, I, J, K, L, LL, M, N, NJ, O, P, Q, R, RR, S, SH, T, TH, U, V, X, XH, Y, Z, ZH
              </p>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Këshilla</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Fillo me fjalë që kanë shumë zanore (si HOUSE, IDEAL)</p>
                <p>• Përdor informacionin nga përgjigjet e mëparshme</p>
                <p>• Mendoni për fjalët e zakonshme shqipe</p>
                <p>• Mos harroni shkronjat speciale shqipe: Ç, Ë, GJ, NJ, etj.</p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={onClose} className="w-full">
            Filloj të Luaj!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}