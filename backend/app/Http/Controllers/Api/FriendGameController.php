<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FriendGame\CreateFriendGameRequest;
use App\Models\FriendGame;
use App\Services\WordValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class FriendGameController extends Controller
{
    public function __construct(private readonly WordValidationService $wordValidationService)
    {
    }

    public function store(CreateFriendGameRequest $request): JsonResponse
    {
        $language = $request->string('language')->toString();
        $word = mb_strtoupper($request->string('word')->toString(), 'UTF-8');

        if (! $this->wordValidationService->exists($language, $word)) {
            return response()->json(['message' => 'Word is not in dictionary.'], 422);
        }

        $game = FriendGame::query()->create([
            'user_id' => $request->user()->id,
            'language' => $language,
            'encrypted_word' => Crypt::encryptString($word),
            'creator_name' => $request->string('creator_name')->toString(),
            'share_code' => (string) Str::uuid(),
        ]);

        return response()->json([
            'id' => $game->id,
            'share_code' => $game->share_code,
        ], 201);
    }
}
