<?php

namespace App\Http\Requests\Game;

use Illuminate\Foundation\Http\FormRequest;

class SubmitGuessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'language' => ['required', 'in:sq,en'],
            'guess' => ['required', 'string', 'size:5'],
            'target_token' => ['required', 'string'],
            'is_last_row' => ['sometimes', 'boolean'],
            'hard_mode' => ['sometimes', 'boolean'],
            'time_up' => ['sometimes', 'boolean'],
            'correct_positions' => ['sometimes', 'array'],
            'correct_positions.*' => ['string', 'size:1'],
            'required_letters' => ['sometimes', 'array'],
            'required_letters.*' => ['string', 'size:1'],
        ];
    }
}
