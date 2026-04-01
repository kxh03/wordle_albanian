<?php

namespace App\Services;

class GameWordService
{
    public function __construct(private readonly WordCacheService $wordCacheService)
    {
    }

    public function getDailyWord(string $language, string $date): ?string
    {
        $word = $this->dailyDisplayWord($language, "{$date}:{$language}");

        return $word ?? $this->fallbackWord($language);
    }

    public function getRandomWord(string $language): ?string
    {
        return $this->wordCacheService->randomDisplayWord($language) ?? $this->fallbackWord($language);
    }

    private function dailyDisplayWord(string $language, string $seed): ?string
    {
        $map = $this->wordCacheService->getMap($language);
        if ($map === []) {
            return null;
        }

        $keys = array_keys($map);
        sort($keys, SORT_STRING);
        $index = abs(crc32($seed)) % count($keys);

        return $map[$keys[$index]] ?? null;
    }

    private function fallbackWord(string $language): ?string
    {
        $fallback = [
            'sq' => ['LIBER', 'SHPIA', 'DJATH'],
            'en' => ['HOUSE', 'APPLE', 'BRAIN'],
        ];

        return $fallback[$language][array_rand($fallback[$language])] ?? null;
    }
}
