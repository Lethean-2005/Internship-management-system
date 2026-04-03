<?php

namespace App\Http\Requests\Interviews;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'result' => ['required', 'in:passed,failed,pending'],
            'feedback' => ['nullable', 'string'],
        ];
    }
}
