<?php

namespace App\Services;

class GameEngineService
{
    public function __construct(private readonly WordNormalizationService $normalizationService)
    {
    }

    /**
     * Evaluate guess vs target using normalized letters so C/Ç and E/Ë match fairly.
     *
     * @return list<string>
     */
    public function evaluate(string $guess, string $target): array
    {
        $guessNorm = $this->normalizationService->normalize($guess);
        $targetNorm = $this->normalizationService->normalize($target);

        $guessChars = preg_split('//u', $guessNorm, -1, PREG_SPLIT_NO_EMPTY);
        $targetChars = preg_split('//u', $targetNorm, -1, PREG_SPLIT_NO_EMPTY);

        $length = min(count($guessChars), count($targetChars), 5);
        $result = array_fill(0, $length, 'incorrect');
        $remaining = [];

        for ($i = 0; $i < $length; $i++) {
            if ($guessChars[$i] === $targetChars[$i]) {
                $result[$i] = 'correct';
                continue;
            }

            $remaining[$targetChars[$i]] = ($remaining[$targetChars[$i]] ?? 0) + 1;
        }

        for ($i = 0; $i < $length; $i++) {
            if ($result[$i] === 'correct') {
                continue;
            }

            $char = $guessChars[$i];
            if (($remaining[$char] ?? 0) > 0) {
                $result[$i] = 'partial';
                $remaining[$char]--;
            }
        }

        return $result;
    }
}
