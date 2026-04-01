<?php

namespace App\Repositories;

use App\Models\Word;
use App\Services\WordCacheService;

class WordRepository
{
    public function __construct(private readonly WordCacheService $wordCacheService)
    {
    }

    public function upsertByLanguage(string $language, array $rows): int
    {
        $now = now();
        $payload = array_map(static fn (array $row): array => [
            'word' => $row['word'],
            'normalized_word' => $row['normalized_word'],
            'language' => $language,
            'created_at' => $now,
        ], $rows);

        if ($payload === []) {
            return 0;
        }

        Word::query()->upsert(
            $payload,
            ['normalized_word', 'language'],
            ['word']
        );

        $this->wordCacheService->forget($language);

        return count($payload);
    }

    public function existsByNormalized(string $language, string $normalizedWord): bool
    {
        return $this->wordCacheService->hasNormalized($language, $normalizedWord);
    }

    public function countByLanguage(string $language): int
    {
        return $this->wordCacheService->count($language);
    }
}
