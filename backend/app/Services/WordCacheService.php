<?php

namespace App\Services;

use App\Models\Word;
use Illuminate\Support\Facades\Cache;

/**
 * In-memory dictionary cache: O(1) lookup via Laravel cache store (APC/redis/file).
 * Keys: words_sq, words_en — each value is [normalized => display_word].
 */
class WordCacheService
{
    public const KEY_SQ = 'words_sq';

    public const KEY_EN = 'words_en';

    public function keyForLanguage(string $language): string
    {
        return match ($language) {
            Word::LANG_SQ => self::KEY_SQ,
            Word::LANG_EN => self::KEY_EN,
            default => 'words_'.$language,
        };
    }

    /**
     * @return array<string, string> normalized_word => canonical uppercase word (as stored)
     */
    public function getMap(string $language): array
    {
        $key = $this->keyForLanguage($language);

        return Cache::rememberForever($key, function () use ($language): array {
            return Word::query()
                ->where('language', $language)
                ->pluck('word', 'normalized_word')
                ->all();
        });
    }

    public function hasNormalized(string $language, string $normalizedWord): bool
    {
        return isset($this->getMap($language)[$normalizedWord]);
    }

    /**
     * Random display word: pick random key from map (no ORDER BY RANDOM()).
     */
    public function randomDisplayWord(string $language): ?string
    {
        $map = $this->getMap($language);
        if ($map === []) {
            return null;
        }

        $normalized = array_rand($map);

        return $map[$normalized];
    }

    public function count(string $language): int
    {
        return count($this->getMap($language));
    }

    public function forget(string $language): void
    {
        Cache::forget($this->keyForLanguage($language));
    }

    public function forgetAll(): void
    {
        foreach ([Word::LANG_SQ, Word::LANG_EN] as $lang) {
            $this->forget($lang);
        }
    }

    /**
     * Load or refresh cache from DB for one language.
     */
    public function warmLanguage(string $language): void
    {
        $this->forget($language);
        $this->getMap($language);
    }

    public function warmAll(): void
    {
        foreach ([Word::LANG_SQ, Word::LANG_EN] as $lang) {
            $this->warmLanguage($lang);
        }
    }
}
