<?php

namespace App\Services;

use App\Repositories\WordRepository;

class WordValidationService
{
    public function __construct(
        private readonly WordRepository $wordRepository,
        private readonly WordNormalizationService $normalizationService
    ) {
    }

    public function exists(string $language, string $word): bool
    {
        $normalized = $this->normalizationService->normalize($word);

        return $this->wordRepository->existsByNormalized($language, $normalized);
    }
}
