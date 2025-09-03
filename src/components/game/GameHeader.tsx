import { Button } from '@/components/ui/button';
import { RotateCcw, Users, Home, HelpCircle, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader as UISheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/types/language';

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
  const { language, setLanguage, t, config } = useLanguage();
  
  return (
    <header 
      className="w-full p-0 touch-none"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow">
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-[hsl(var(--primary-foreground))] hover:bg-white/10 sm:size-lg">
                <Menu className="w-4 h-4 sm:w-6 sm:h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-[hsl(var(--primary))] text-white">
              <UISheetHeader>
                <SheetTitle className="flex items-center gap-3 text-white">
                  <img src="/assets/6ml_final_1.png" alt="me llafe" className="h-12 md:h-14 w-44 md:w-64 object-contain" />
                </SheetTitle>
              </UISheetHeader>
              <nav className="mt-4 space-y-2 text-white">
                <Link to="/" className="block px-3 py-2 rounded hover:bg-white/10">{t.home}</Link>
                <Link to="/daily" className="block px-3 py-2 rounded hover:bg-white/10">{t.daily}</Link>
                <Link to="/game" className="block px-3 py-2 rounded hover:bg-white/10">{t.freeGame}</Link>
                <Link to="/friends" className="block px-3 py-2 rounded hover:bg-white/10">{t.friends}</Link>
                {onReset && (
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-white/10" onClick={onReset}>{t.resetGame}</button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          {showHomeButton && (
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-[hsl(var(--primary-foreground))] hover:bg-white/10 sm:size-lg">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          )}
        </div>

        <div className="text-center flex-1 min-w-0">
          <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
            <img 
              src="/assets/6ml_final_1.png" 
              alt="me llafe" 
              className="h-6 sm:h-8 md:h-11 lg:h-12 w-24 sm:w-32 md:w-52 lg:w-64 object-contain"
            />
            {title && (
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-[hsl(var(--primary-foreground))]">
                {title}
              </h1>
            )}
          </div>
          {creatorName && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-white/10 text-[hsl(var(--primary-foreground))]/90">
                {t.challengeFrom} {creatorName}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {rightSlot}
          
          {/* Language Switcher */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'albanian' ? 'english' : 'albanian')}
              className="text-[hsl(var(--primary-foreground))] hover:bg-white/10 sm:size-lg px-1 sm:px-2"
              title={t.language}
            >
              <span className="text-sm sm:text-base">
                {config.flag || (language === 'albanian' ? '🇦🇱' : '🇺🇸')}
              </span>
            </Button>
          </div>
          
          {onHelpClick && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onHelpClick}
              className="text-[hsl(var(--primary-foreground))] hover:bg-white/10 sm:size-lg"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
          {showFriendsButton && (
            <Link to="/friends">
              <Button variant="ghost" size="sm" className="text-[hsl(var(--primary-foreground))] hover:bg-white/10 sm:size-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          )}
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-[hsl(var(--primary-foreground))] hover:bg-white/10 sm:size-lg">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}