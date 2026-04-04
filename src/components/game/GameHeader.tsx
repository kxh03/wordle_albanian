import { Button } from '@/components/ui/button';
import { RotateCcw, Users, Home, HelpCircle, Menu, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader as UISheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

interface GameHeaderProps {
  title: string;
  onReset?: () => void;
  showHomeButton?: boolean;
  showFriendsButton?: boolean;
  creatorName?: string;
  onHelpClick?: () => void;
  onStatsClick?: () => void;
  rightSlot?: React.ReactNode;
  /** Current win streak (authenticated daily). Omit when logged out. */
  streakCount?: number;
}

export function GameHeader({ 
  title, 
  onReset, 
  showHomeButton = true, 
  showFriendsButton = true,
  creatorName,
  onHelpClick,
  onStatsClick,
  rightSlot,
  streakCount,
}: GameHeaderProps) {
  const { language, setLanguage, t, config } = useLanguage();
  const { user, isAuthenticated, logout, logoutState } = useAuth();
  
  return (
    <header 
      className="w-full shrink-0 p-0 touch-none relative"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-gradient-hero text-[hsl(var(--primary-foreground))] shadow-header relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-50" />
        
        <div className="flex items-center gap-1 relative z-10">
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
                {isAuthenticated && user && (
                  <span className="block px-3 py-2 text-sm opacity-90 border-t border-white/10 mt-2 pt-2">
                    {user.name}
                  </span>
                )}
                {isAuthenticated ? (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 disabled:opacity-50"
                    disabled={logoutState.isPending}
                    onClick={() => void logout()}
                  >
                    {t.logout}
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-2 rounded hover:bg-white/10">{t.login}</Link>
                    <Link to="/register" className="block px-3 py-2 rounded hover:bg-white/10">{t.register}</Link>
                  </>
                )}
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

        <div className="text-center flex-1 min-w-0 relative z-10">
          <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
            <img 
              src="/assets/6ml_final_1.png" 
              alt="me llafe" 
              className="h-6 sm:h-8 md:h-11 lg:h-12 w-24 sm:w-32 md:w-52 lg:w-64 object-contain drop-shadow-sm"
            />
            {title && (
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-[hsl(var(--primary-foreground))] drop-shadow-sm">
                {title}
              </h1>
            )}
          </div>
          {creatorName && (
            <div className="mt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm bg-white/15 text-[hsl(var(--primary-foreground))]/95 backdrop-blur-sm border border-white/10 shadow-sm">
                {t.challengeFrom} {creatorName}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 relative z-10">
          {streakCount !== undefined && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] border border-white/10"
              title={language === 'english' ? 'Win streak' : 'Seri fitimesh'}
            >
              <Flame className="w-3.5 h-3.5" />
              {streakCount}
            </span>
          )}
          {rightSlot}
          
          {/* Language Switcher */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'albanian' ? 'english' : 'albanian')}
              className="text-[hsl(var(--primary-foreground))] hover:bg-white/15 sm:size-lg px-1 sm:px-2 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              title={t.language}
            >
              <span className="text-sm sm:text-base drop-shadow-sm">
                {config.flag || (language === 'albanian' ? '🇦🇱' : '🇺🇸')}
              </span>
            </Button>
          </div>
          
          {onHelpClick && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onHelpClick}
              className="text-[hsl(var(--primary-foreground))] hover:bg-white/15 sm:size-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
            </Button>
          )}
          {showFriendsButton && (
            <Link to="/friends">
              <Button variant="ghost" size="sm" className="text-[hsl(var(--primary-foreground))] hover:bg-white/15 sm:size-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
              </Button>
            </Link>
          )}
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-[hsl(var(--primary-foreground))] hover:bg-white/15 sm:size-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}