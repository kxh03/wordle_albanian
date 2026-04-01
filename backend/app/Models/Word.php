<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Word extends Model
{
    public const LANG_SQ = 'sq';
    public const LANG_EN = 'en';

    public $timestamps = false;

    protected $fillable = [
        'word',
        'normalized_word',
        'language',
        'created_at',
    ];

    public function dailyGames(): HasMany
    {
        return $this->hasMany(DailyGame::class);
    }
}
