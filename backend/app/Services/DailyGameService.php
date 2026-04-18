<?php

namespace App\Services;

use App\Models\DailyGame;
use App\Models\Guess;
use App\Models\User;
use App\Models\Word;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DailyGameService
{
    private const MAX_ATTEMPTS = 6;

    public function __construct(
        private readonly GameWordService $gameWordService,
        private readonly WordNormalizationService $normalizationService,
        private readonly WordValidationService $wordValidationService,
        private readonly GameEngineService $gameEngineService,
        private readonly StreakService $streakService
    ) {
    }

    public function getOrCreateGame(User $user, string $language, string $date): DailyGame
    {
        $game = DailyGame::query()
            ->where('user_id', $user->id)
            ->where('language', $language)
            ->whereDate('game_date', $date)
            ->first();

        if ($game !== null) {
            return $game;
        }

        $displayWord = $this->gameWordService->getDailyWord($language, $date);
        if ($displayWord === null || $displayWord === '') {
            throw new RuntimeException('Daily word unavailable for this date.');
        }

        $wordId = $this->resolveWordId($language, $displayWord);
        if ($wordId === null) {
            throw new RuntimeException('Dictionary not ready for this language.');
        }

        return DailyGame::query()->create([
            'user_id' => $user->id,
            'word_id' => $wordId,
            'game_date' => $date,
            'language' => $language,
            'is_completed' => false,
            'is_won' => false,
            'attempts_used' => 0,
        ]);
    }

    public function resolveWordId(string $language, string $displayWord): ?int
    {
        $upper = mb_strtoupper($displayWord, 'UTF-8');
        $normalized = $this->normalizationService->normalize($upper);

        $word = Word::query()
            ->where('language', $language)
            ->where('normalized_word', $normalized)
            ->first();

        if ($word !== null) {
            return $word->id;
        }

        return Word::query()
            ->where('language', $language)
            ->orderBy('id')
            ->value('id');
    }

    /**
     * @return array{error: string, http_code: int}|array{result: list<string>, is_won: bool, attempts_left: int, is_completed: bool, target_word?: string}
     */
    public function submitGuess(User $user, string $language, string $date, string $guess): array
    {
        $guessUpper = mb_strtoupper(trim($guess), 'UTF-8');

        if (mb_strlen($guessUpper) !== 5) {
            return [
                'error' => 'Guess must be exactly 5 letters.',
                'http_code' => 422,
            ];
        }

        if (! $this->wordValidationService->exists($language, $guessUpper)) {
            return [
                'error' => 'Word not in dictionary.',
                'http_code' => 422,
            ];
        }

        $game = $this->getOrCreateGame($user, $language, $date);

        if ($game->is_completed) {
            return [
                'error' => 'This daily puzzle is already completed.',
                'http_code' => 422,
            ];
        }

        $game->load('word');
        $targetWord = $game->word?->word;
        if ($targetWord === null || $targetWord === '') {
            return [
                'error' => 'Game data error.',
                'http_code' => 500,
            ];
        }

        $targetUpper = mb_strtoupper($targetWord, 'UTF-8');
        $result = $this->gameEngineService->evaluate($guessUpper, $targetUpper);
        $isWin = $this->normalizationService->normalize($guessUpper)
            === $this->normalizationService->normalize($targetUpper);

        $nextAttemptNumber = $game->attempts_used + 1;
        $isLastAttempt = $nextAttemptNumber >= self::MAX_ATTEMPTS;
        $shouldComplete = $isWin || $isLastAttempt;

        return DB::transaction(function () use (
            $user,
            $game,
            $guessUpper,
            $result,
            $isWin,
            $nextAttemptNumber,
            $shouldComplete,
            $targetUpper,
            $date
        ): array {
            Guess::query()->create([
                'user_id' => $user->id,
                'daily_game_id' => $game->id,
                'friend_game_id' => null,
                'word_id' => $game->word_id,
                'guess' => $guessUpper,
                'result' => $result,
                'guess_number' => $nextAttemptNumber,
            ]);

            $game->attempts_used = $nextAttemptNumber;
            if ($nextAttemptNumber === 1) {
                $this->streakService->onDailyPlayed(
                    $user,
                    Carbon::parse($date)
                );
            }

            $payload = [
                'result' => $result,
                'is_won' => $isWin,
                'attempts_left' => max(0, self::MAX_ATTEMPTS - $nextAttemptNumber),
                'is_completed' => false,
            ];

            if ($shouldComplete) {
                $game->is_completed = true;
                $game->is_won = $isWin;
                $game->completed_at = now();
                $game->save();

                $payload['is_completed'] = true;
                $payload['is_won'] = $isWin;
                $payload['attempts_left'] = max(0, self::MAX_ATTEMPTS - $nextAttemptNumber);
                $payload['target_word'] = $targetUpper;
            } else {
                $game->save();
            }

            return $payload;
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function formatGameState(DailyGame $game, bool $revealUnplayedAnswer = false): array
    {
        $game->load(['guesses' => fn ($q) => $q->orderBy('guess_number'), 'word']);

        $guesses = $game->guesses->map(fn (Guess $g) => [
            'guess' => $g->guess,
            'result' => $g->result,
            'guess_number' => $g->guess_number,
        ])->values()->all();

        $answer = null;
        if ($game->is_completed && $game->word) {
            $answer = mb_strtoupper($game->word->word, 'UTF-8');
        } elseif ($revealUnplayedAnswer && ! $game->is_completed && $game->attempts_used === 0 && $game->word) {
            $answer = mb_strtoupper($game->word->word, 'UTF-8');
        }

        return [
            'date' => $game->game_date->toDateString(),
            'language' => $game->language,
            'attempts' => $game->attempts_used,
            'attempts_left' => max(0, self::MAX_ATTEMPTS - $game->attempts_used),
            'is_completed' => $game->is_completed,
            'is_won' => $game->is_won,
            'guesses' => $guesses,
            'target_word' => $answer,
        ];
    }
}
