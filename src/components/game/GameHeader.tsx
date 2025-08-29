import { Button } from '@/components/ui/button';
import { RotateCcw, Users, Home, HelpCircle, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader as UISheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface GameHeaderProps {
  title: string;
  onReset?: () => void;
  showHomeButton?: boolean;
  showFriendsButton?: boolean;
  creatorName?: string;
  onHelpClick?: () => void;
  onStatsClick?: () => void;
  rightSlot?: React.ReactNode;
}

export function GameHeader({ 
  title, 
  onReset, 
  showHomeButton = true, 
  showFriendsButton = true,
  creatorName,
  onHelpClick,
  onStatsClick,
  rightSlot
}: GameHeaderProps) {
  return (
    <header 
      className="w-full p-0 touch-none"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow">
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="lg" className="text-[hsl(var(--primary-foreground))] hover:bg-white/10">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-[hsl(var(--primary))] text-white">
              <UISheetHeader>
                <SheetTitle className="flex items-center gap-3 text-white">
                  <img src="/assets/6ml_final_1.png" alt="me llafe" className="h-12 md:h-14 w-44 md:w-64 object-contain" />
                </SheetTitle>
              </UISheetHeader>
              <nav className="mt-4 space-y-2 text-white">
                <Link to="/" className="block px-3 py-2 rounded hover:bg-white/10">Faqja kryesore</Link>
                <Link to="/daily" className="block px-3 py-2 rounded hover:bg-white/10">Fjala e Ditës</Link>
                <Link to="/game" className="block px-3 py-2 rounded hover:bg-white/10">Lojë e Lirë</Link>
                <Link to="/friends" className="block px-3 py-2 rounded hover:bg-white/10">Sfido Miqtë</Link>
                {onReset && (
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-white/10" onClick={onReset}>Rivendos Lojën</button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          {showHomeButton && (
            <Link to="/">
              <Button variant="ghost" size="lg" className="text-[hsl(var(--primary-foreground))] hover:bg-white/10">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>

        <div className="text-center">
          <div className="flex items-center gap-3">
            <img src="/assets/6ml_final_1.png" alt="me llafe" className="h-10 md:h-12 lg:h-14 w-40 md:w-56 lg:w-72 object-contain" />
            {title && (
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[hsl(var(--primary-foreground))]">
                {title}
              </h1>
            )}
          </div>
          {creatorName && (
            <p className="text-sm text-muted-foreground mt-1">
              Krijuar nga {creatorName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rightSlot}
          {onHelpClick && (
            <Button 
              variant="ghost" 
              size="lg"
              onClick={onHelpClick}
              className="text-[hsl(var(--primary-foreground))] hover:bg-white/10"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          )}
          {showFriendsButton && (
            <Link to="/friends">
              <Button variant="ghost" size="lg" className="text-[hsl(var(--primary-foreground))] hover:bg-white/10">
                <Users className="w-5 h-5" />
              </Button>
            </Link>
          )}
          {onReset && (
            <Button variant="ghost" size="lg" onClick={onReset} className="text-[hsl(var(--primary-foreground))] hover:bg-white/10">
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}