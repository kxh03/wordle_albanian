<?php

namespace App\Http\Requests\Daily;

use Illuminate\Foundation\Http\FormRequest;

class DailyGuessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'guess' => ['required', 'string', 'regex:/^[\p{L}]{5}$/u'],
            'date' => ['sometimes', 'date_format:Y-m-d'],
        ];
    }

    public function messages(): array
    {
        return [
            'guess.regex' => 'The guess must be exactly 5 letters.',
        ];
    }
}
