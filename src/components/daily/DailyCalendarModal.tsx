import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isSameMonth,
  startOfMonth,
  startOfToday,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCalendar } from '@/hooks/useCalendar';
import type { ApiLanguage } from '@/lib/api';
import { cn } from '@/lib/utils';

type DailyCalendarModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: ApiLanguage;
  uiLang: 'albanian' | 'english';
  onSelectDate: (date: Date) => void;
};

export function DailyCalendarModal({
  open,
  onOpenChange,
  language,
  uiLang,
  onSelectDate,
}: DailyCalendarModalProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const monthKey = format(cursor, 'yyyy-MM');
  const { data: days = [], isLoading } = useCalendar(language, monthKey, open);

  const byDate = useMemo(() => {
    const m = new Map<string, (typeof days)[0]>();
    for (const d of days) {
      m.set(d.date, d);
    }
    return m;
  }, [days]);

  const gridDays = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const weekLabels = uiLang === 'english' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh', 'Di'];

  const title =
    uiLang === 'english'
      ? format(cursor, 'MMMM yyyy')
      : format(cursor, 'LLLL yyyy');

  const today = startOfToday();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 pr-8">
            <span>{title}</span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCursor((c) => startOfMonth(subMonths(c, 1)))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCursor((c) => startOfMonth(addMonths(c, 1)))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {uiLang === 'english' ? 'Loading…' : 'Duke u ngarkuar…'}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
              {weekLabels.map((w) => (
                <div key={w} className="font-medium">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {gridDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const entry = byDate.get(key);
                const future = isAfter(day, today);
                const muted = !isSameMonth(day, cursor);

                let cellClass = 'bg-transparent border border-border/40';
                if (entry?.status === 'won') {
                  cellClass = 'bg-emerald-600/90 text-white border-emerald-700';
                } else if (entry?.status === 'lost') {
                  cellClass = 'bg-muted text-foreground border-border';
                }

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={future}
                    onClick={() => {
                      if (future) return;
                      onSelectDate(day);
                      onOpenChange(false);
                    }}
                    className={cn(
                      'aspect-square rounded-md text-xs font-medium transition-opacity flex items-center justify-center',
                      cellClass,
                      future && 'opacity-30 cursor-not-allowed',
                      muted && 'opacity-40'
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {uiLang === 'english'
                ? 'Green: won · Gray: lost · Empty: not played'
                : 'E gjelbër: fituar · Gri: humbur · Zbrazët: nuk u luajt'}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
