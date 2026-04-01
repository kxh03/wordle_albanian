<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guess extends Model
{
    protected $fillable = [
        'user_id',
        'daily_game_id',
        'friend_game_id',
        'word_id',
        'guess',
        'result',
        'guess_number',
    ];

    protected function casts(): array
    {
        return [
            'result' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dailyGame(): BelongsTo
    {
        return $this->belongsTo(DailyGame::class);
    }

    public function friendGame(): BelongsTo
    {
        return $this->belongsTo(FriendGame::class);
    }
}
