<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DictionaryController;
use App\Http\Controllers\Api\FriendGameController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\WordController;
use App\Http\Middleware\EnsureLanguageHeader;
use Illuminate\Support\Facades\Route;

Route::get('/dictionary/meta', [DictionaryController::class, 'meta']);
Route::get('/dictionary/random', [DictionaryController::class, 'random']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/words/count', [WordController::class, 'count']);

    Route::post('/friends/games', [FriendGameController::class, 'store']);
});

Route::middleware([EnsureLanguageHeader::class])->group(function (): void {
    Route::post('/dictionary/validate', [DictionaryController::class, 'validateWord']);

    Route::post('/games/daily', [GameController::class, 'daily']);
    Route::post('/games/free', [GameController::class, 'free']);
    Route::post('/games/submit', [GameController::class, 'submitGuess']);
});
