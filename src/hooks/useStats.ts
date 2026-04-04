import { useQuery } from '@tanstack/react-query';
import { fetchUserStats } from '@/api/daily';
import type { ApiLanguage } from '@/lib/api';

export function useStats(language: ApiLanguage, enabled: boolean) {
  return useQuery({
    queryKey: ['stats', language],
    queryFn: () => fetchUserStats(language),
    enabled,
    staleTime: 30_000,
  });
}
