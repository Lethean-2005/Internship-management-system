<?php

namespace App\Http\Requests\Worklogs;

use Illuminate\Foundation\Http\FormRequest;

class ReviewWorklogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:approved,reviewed,rejected'],
            'feedback' => ['nullable', 'string'],
        ];
    }
}
