<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DailyController;
use App\Http\Controllers\Api\DictionaryController;
use App\Http\Controllers\Api\FriendGameController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\WordController;
use App\Http\Middleware\EnsureLanguageHeader;
use Illuminate\Support\Facades\Route;

Route::get('/dictionary/meta', [DictionaryController::class, 'meta']);
Route::get('/dictionary/random', [DictionaryController::class, 'random']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::get('/words/count', [WordController::class, 'count']);

    Route::post('/friends/games', [FriendGameController::class, 'store']);

    Route::middleware([EnsureLanguageHeader::class])->group(function (): void {
        Route::get('/daily', [DailyController::class, 'show']);
        Route::post('/daily/guess', [DailyController::class, 'guess']);
        Route::get('/daily/history', [DailyController::class, 'history']);
        Route::get('/daily/calendar', [DailyController::class, 'calendar']);
        Route::get('/stats', [StatsController::class, 'show']);
    });
});

Route::middleware([EnsureLanguageHeader::class])->group(function (): void {
    Route::post('/dictionary/validate', [DictionaryController::class, 'validateWord']);

    Route::post('/games/daily', [GameController::class, 'daily']);
    Route::post('/games/free', [GameController::class, 'free']);
    Route::post('/games/submit', [GameController::class, 'submitGuess']);
});
