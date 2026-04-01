<?php

namespace App\Services;

use App\Models\Word;
use App\Repositories\WordRepository;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class WordImportService
{
    public function __construct(
        private readonly WordRepository $wordRepository,
        private readonly WordNormalizationService $normalizationService,
        private readonly WordCacheService $wordCacheService
    ) {
    }

    public function importAll(): array
    {
        $result = [];
        foreach ([Word::LANG_SQ, Word::LANG_EN] as $lang) {
            $result[$lang] = $this->importByLanguage($lang);
        }

        $this->wordCacheService->warmAll();

        return $result;
    }

    public function importByLanguage(string $language): int
    {
        $path = "dictionaries/{$language}.json";

        try {
            $raw = $this->readDictionaryFile($path);
            $decoded = json_decode($raw, true, 2147483647, JSON_THROW_ON_ERROR);
            $extracted = $this->extractWords($decoded);
            $rows = $this->filterAndNormalize($extracted);

            return $this->wordRepository->upsertByLanguage($language, $rows);
        } catch (Throwable $e) {
            Log::error('Dictionary import failed', [
                'language' => $language,
                'path' => $path,
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function readDictionaryFile(string $path): string
    {
        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->get($path);
        }

        $legacyPath = storage_path("app/{$path}");
        if (File::exists($legacyPath)) {
            return File::get($legacyPath);
        }

        throw new RuntimeException("Dictionary not found: {$path}");
    }

    private function extractWords(array $items): array
    {
        $words = [];
        foreach ($items as $item) {
            if (is_string($item)) {
                $words[] = $item;
                continue;
            }

            if (is_array($item) && isset($item['word']) && is_string($item['word'])) {
                $words[] = $item['word'];
            }
        }

        return $words;
    }

    private function filterAndNormalize(array $words): array
    {
        $rows = [];
        foreach ($words as $word) {
            $trimmed = trim($word);
            $normalized = $this->normalizationService->normalize($trimmed);

            if (mb_strlen($normalized, 'UTF-8') !== 5) {
                continue;
            }

            $rows[$normalized] = [
                'word' => mb_strtoupper($trimmed, 'UTF-8'),
                'normalized_word' => $normalized,
            ];
        }

        return array_values($rows);
    }
}
