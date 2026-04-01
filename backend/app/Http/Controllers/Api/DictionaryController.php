<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\WordRepository;
use App\Services\GameWordService;
use App\Services\WordValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DictionaryController extends Controller
{
    public function meta(WordRepository $wordRepository): JsonResponse
    {
        return response()->json([
            'sq_count' => $wordRepository->countByLanguage('sq'),
            'en_count' => $wordRepository->countByLanguage('en'),
        ]);
    }

    public function random(Request $request, GameWordService $gameWordService): JsonResponse
    {
        $lang = $request->query('lang', $request->header('X-Language'));
        if (! in_array($lang, ['sq', 'en'], true)) {
            return response()->json([
                'message' => 'Provide ?lang=sq|en or X-Language header.',
            ], 400);
        }

        $word = $gameWordService->getRandomWord($lang);

        return response()->json([
            'language' => $lang,
            'word' => $word,
        ]);
    }

    public function validateWord(Request $request, WordValidationService $wordValidationService): JsonResponse
    {
        $request->validate([
            'guess' => ['required', 'string', 'size:5'],
        ]);

        $language = $request->string('language')->toString();
        $guess = mb_strtoupper($request->string('guess')->toString(), 'UTF-8');

        return response()->json([
            'valid' => $wordValidationService->exists($language, $guess),
        ]);
    }
}
