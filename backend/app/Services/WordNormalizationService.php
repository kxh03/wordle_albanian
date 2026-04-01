<?php

namespace App\Services;

class WordNormalizationService
{
    public function normalize(string $word): string
    {
        $upper = mb_strtoupper(trim($word), 'UTF-8');

        return str_replace(['Ë', 'Ç'], ['E', 'C'], $upper);
    }
}
