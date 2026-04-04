import { useQuery } from '@tanstack/react-query';
import { fetchDailyCalendar } from '@/api/daily';
import type { ApiLanguage } from '@/lib/api';

export function useCalendar(language: ApiLanguage, month: string, enabled: boolean) {
  return useQuery({
    queryKey: ['calendar', language, month],
    queryFn: () => fetchDailyCalendar(language, month),
    enabled,
    staleTime: 60_000,
  });
}
