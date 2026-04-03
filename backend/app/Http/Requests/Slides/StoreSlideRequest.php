<?php

namespace App\Http\Requests\Slides;

use Illuminate\Foundation\Http\FormRequest;

class StoreSlideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'internship_id' => ['nullable', 'exists:internships,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'presentation_date' => ['nullable', 'date'],
            'slide_link' => ['nullable', 'string', 'max:2000'],
            'deadline' => ['nullable', 'date'],
        ];
    }
}
