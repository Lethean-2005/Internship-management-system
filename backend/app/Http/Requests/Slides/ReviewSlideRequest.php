<?php

namespace App\Http\Requests\Slides;

use Illuminate\Foundation\Http\FormRequest;

class ReviewSlideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:approved,rejected'],
            'feedback' => ['nullable', 'string'],
        ];
    }
}
