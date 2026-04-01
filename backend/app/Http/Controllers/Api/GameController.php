<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Game\StartGameRequest;
use App\Http\Requests\Game\SubmitGuessRequest;
use App\Services\GameEngineService;
use App\Services\GameWordService;
use App\Services\WordNormalizationService;
use App\Services\WordValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Crypt;

class GameController extends Controller
{
    public function __construct(
        private readonly GameWordService $gameWordService,
        private readonly WordValidationService $wordValidationService,
        private readonly GameEngineService $gameEngineService,
        private readonly WordNormalizationService $normalizationService
    ) {
    }

    public function daily(StartGameRequest $request): JsonResponse
    {
        $language = $request->string('language')->toString();
        $date = $request->input('date', Carbon::now()->toDateString());
        $word = $this->gameWordService->getDailyWord($language, $date);

        return response()->json([
            'date' => $date,
            'language' => $language,
            'target_token' => Crypt::encryptString($word),
            'word_hash' => hash('sha256', "{$word}:{$date}:{$language}"),
        ]);
    }

    public function free(StartGameRequest $request): JsonResponse
    {
        $language = $request->string('language')->toString();
        $word = $this->gameWordService->getRandomWord($language);

        return response()->json([
            'language' => $language,
            'target_token' => Crypt::encryptString($word),
            'word_hash' => hash('sha256', "{$word}:{$language}"),
        ]);
    }

    public function submitGuess(SubmitGuessRequest $request): JsonResponse
    {
        $language = $request->string('language')->toString();
        $guess = mb_strtoupper($request->string('guess')->toString(), 'UTF-8');
        $target = mb_strtoupper(
            Crypt::decryptString($request->string('target_token')->toString()),
            'UTF-8'
        );

        if (! $this->wordValidationService->exists($language, $guess)) {
            return response()->json(['message' => 'Word not in dictionary.'], 422);
        }

        $result = $this->gameEngineService->evaluate($guess, $target);
        $isWin = $this->normalizationService->normalize($guess) === $this->normalizationService->normalize($target);

        $payload = [
            'result' => $result,
            'is_win' => $isWin,
        ];

        $isLastRow = $request->boolean('is_last_row');
        if ($isWin || ($isLastRow && ! $isWin)) {
            $payload['target_word'] = $target;
        }

        return response()->json($payload);
    }
}
