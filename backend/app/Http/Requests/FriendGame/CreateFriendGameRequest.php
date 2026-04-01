<?php

namespace App\Http\Requests\FriendGame;

use App\Models\Word;
use Illuminate\Foundation\Http\FormRequest;

class CreateFriendGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'language' => ['required', 'in:'.Word::LANG_SQ.','.Word::LANG_EN],
            'word' => ['required', 'string', 'size:5'],
            'creator_name' => ['required', 'string', 'max:255'],
        ];
    }
}
