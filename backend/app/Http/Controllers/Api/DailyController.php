<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Daily\DailyGuessRequest;
use App\Models\DailyGame;
use App\Services\DailyGameService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Throwable;

class DailyController extends Controller
{
    public function __construct(
        private readonly DailyGameService $dailyGameService
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $language = $request->string('language')->toString();
        $date = $request->query('date', Carbon::today()->toDateString());

        try {
            $game = $this->dailyGameService->getOrCreateGame($user, $language, $date);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }

        return response()->json($this->dailyGameService->formatGameState($game));
    }

    public function guess(DailyGuessRequest $request): JsonResponse
    {
        $user = $request->user();
        $language = $request->string('language')->toString();
        $date = $request->input('date', Carbon::today()->toDateString());
        $guess = $request->string('guess')->toString();

        try {
            $out = $this->dailyGameService->submitGuess($user, $language, $date, $guess);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }

        if (isset($out['error'])) {
            return response()->json(['message' => $out['error']], $out['http_code']);
        }

        return response()->json($out);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $language = $request->string('language')->toString();

        $rows = DailyGame::query()
            ->where('user_id', $user->id)
            ->where('language', $language)
            ->where('is_completed', true)
            ->orderByDesc('game_date')
            ->limit(400)
            ->get(['game_date', 'is_won', 'attempts_used']);

        $data = $rows->map(fn (DailyGame $g) => [
            'date' => $g->game_date->toDateString(),
            'is_won' => $g->is_won,
            'attempts' => $g->attempts_used,
        ])->values()->all();

        return response()->json($data);
    }

    public function calendar(Request $request): JsonResponse
    {
        $user = $request->user();
        $language = $request->string('language')->toString();
        $month = $request->query('month', Carbon::now()->format('Y-m'));

        if (! preg_match('/^\d{4}-\d{2}$/', $month)) {
            return response()->json(['message' => 'Invalid month. Use YYYY-MM.'], 422);
        }

        [$year, $mon] = array_map('intval', explode('-', $month));
        $start = Carbon::createFromDate($year, $mon, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $games = DailyGame::query()
            ->where('user_id', $user->id)
            ->where('language', $language)
            ->whereBetween('game_date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->keyBy(fn (DailyGame $g) => $g->game_date->toDateString());

        $out = [];
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $key = $d->toDateString();
            $game = $games->get($key);
            if ($game === null) {
                $out[] = [
                    'date' => $key,
                    'status' => 'not_played',
                    'attempts' => null,
                ];
                continue;
            }

            if (! $game->is_completed) {
                $out[] = [
                    'date' => $key,
                    'status' => 'not_played',
                    'attempts' => $game->attempts_used,
                ];
                continue;
            }

            $out[] = [
                'date' => $key,
                'status' => $game->is_won ? 'won' : 'lost',
                'attempts' => $game->attempts_used,
            ];
        }

        return response()->json($out);
    }
}
