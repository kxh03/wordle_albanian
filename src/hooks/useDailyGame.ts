import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchDailyState,
  postDailyGuess,
  type DailyGameState,
  type DailyGuessResponse,
} from '@/api/daily';
import type { ApiLanguage } from '@/lib/api';

export const dailyGameQueryKey = (language: ApiLanguage, date: string) =>
  ['daily', language, date] as const;

export function useDailyGame(language: ApiLanguage, date: string, enabled: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dailyGameQueryKey(language, date),
    queryFn: () => fetchDailyState(language, date),
    enabled,
    staleTime: 30_000,
  });

  const guessMutation = useMutation({
    mutationFn: ({ guess, playDate }: { guess: string; playDate: string }) =>
      postDailyGuess(language, guess, playDate),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: dailyGameQueryKey(language, variables.playDate) });
      void queryClient.invalidateQueries({ queryKey: ['stats', language] });
      void queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });

  return {
    ...query,
    guess: guessMutation.mutateAsync,
    guessState: guessMutation,
  };
}

export type { DailyGameState, DailyGuessResponse };
