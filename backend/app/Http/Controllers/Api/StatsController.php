<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyGame;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function __construct(
        private readonly StreakService $streakService
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $stats = $this->streakService->ensureStats($user);

        $base = DailyGame::query()->where('user_id', $user->id);

        $totalGames = (clone $base)->where('is_completed', true)->count();
        $totalWins = (clone $base)->where('is_completed', true)->where('is_won', true)->count();

        return response()->json([
            'current_streak' => $stats->current_streak,
            'max_streak' => $stats->max_streak,
            'total_wins' => $totalWins,
            'total_games' => $totalGames,
        ]);
    }
}
