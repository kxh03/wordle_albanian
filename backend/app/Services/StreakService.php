<?php

namespace App\Services;

use App\Models\DailyGame;
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
     * Called once when a daily game is marked completed (win or loss).
     */
    public function onDailyCompleted(User $user, Carbon $gameDate, bool $won): void
    {
        $stats = $this->ensureStats($user);
        $dateStr = $gameDate->toDateString();

        if ($won) {
            $yesterday = $gameDate->copy()->subDay()->toDateString();
            $wonYesterday = DailyGame::query()
                ->where('user_id', $user->id)
                ->whereDate('game_date', $yesterday)
                ->where('is_completed', true)
                ->where('is_won', true)
                ->exists();

            if ($wonYesterday) {
                $stats->current_streak = $stats->current_streak + 1;
            } else {
                $stats->current_streak = 1;
            }

            if ($stats->current_streak > $stats->max_streak) {
                $stats->max_streak = $stats->current_streak;
            }
        } else {
            $stats->current_streak = 0;
        }

        $stats->last_played_date = $dateStr;
        $stats->save();
    }
}
