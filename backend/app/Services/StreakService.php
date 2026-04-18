<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserStat;
use Illuminate\Support\Carbon;

class StreakService
{
    public function ensureStats(User $user): UserStat
    {
        return UserStat::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['current_streak' => 0, 'max_streak' => 0]
        );
    }

    /**
     * Called once per day on the first daily guess attempt.
     */
    public function onDailyPlayed(User $user, Carbon $gameDate): void
    {
        $stats = $this->ensureStats($user);
        $playDate = $gameDate->copy()->startOfDay();
        $lastPlayed = $stats->last_played_date?->copy()->startOfDay();

        if ($lastPlayed !== null) {
            $dayDiff = $playDate->diffInDays($lastPlayed, false);

            // Same day: already counted.
            if ($dayDiff === 0) {
                return;
            }

            // Ignore out-of-order past-day replays for streak progression.
            if ($dayDiff < 0) {
                return;
            }

            if ($dayDiff === 1) {
                $stats->current_streak = $stats->current_streak + 1;
            } else {
                // Missed at least two days: restart from today's play.
                $stats->current_streak = 1;
            }
        } else {
            $stats->current_streak = 1;
        }

        if ($stats->current_streak > $stats->max_streak) {
            $stats->max_streak = $stats->current_streak;
        }

        $stats->last_played_date = $playDate->toDateString();
        $stats->save();
    }
}
