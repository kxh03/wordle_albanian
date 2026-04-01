<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\WordRepository;
use Illuminate\Http\JsonResponse;

class WordController extends Controller
{
    public function __construct(private readonly WordRepository $wordRepository)
    {
    }

    public function count(): JsonResponse
    {
        $lang = request()->query('lang', 'sq');
        if (! in_array($lang, ['sq', 'en'], true)) {
            $lang = 'sq';
        }

        return response()->json([
            'language' => $lang,
            'count' => $this->wordRepository->countByLanguage($lang),
        ]);
    }
}
