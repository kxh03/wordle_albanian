import { Button } from '@/components/ui/button';
import { RotateCcw, Users, Home, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      className="w-full max-w-2xl mx-auto p-4 touch-none"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showHomeButton && (
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            {title}
          </h1>
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
              size="sm"
              onClick={onHelpClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          )}
          {/* Statistics button removed */}
          {showFriendsButton && (
            <Link to="/friends">
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}