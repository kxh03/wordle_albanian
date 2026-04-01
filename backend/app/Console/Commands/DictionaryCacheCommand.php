<?php

namespace App\Console\Commands;

use App\Services\WordCacheService;
use Illuminate\Console\Command;

class DictionaryCacheCommand extends Command
{
    protected $signature = 'dictionary:cache';

    protected $description = 'Rebuild Laravel cache for all dictionary languages (words_sq, words_en)';

    public function handle(WordCacheService $wordCacheService): int
    {
        $wordCacheService->warmAll();
        $this->info('Dictionary caches rebuilt for sq and en.');

        return self::SUCCESS;
    }
}
