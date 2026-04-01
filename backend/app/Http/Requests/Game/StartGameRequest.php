<?php

namespace App\Http\Requests\Game;

use App\Models\Word;
use Illuminate\Foundation\Http\FormRequest;

class StartGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'language' => ['required', 'in:'.Word::LANG_SQ.','.Word::LANG_EN],
            'date' => ['nullable', 'date_format:Y-m-d'],
        ];
    }
}
