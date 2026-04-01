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
        ];
    }
}
