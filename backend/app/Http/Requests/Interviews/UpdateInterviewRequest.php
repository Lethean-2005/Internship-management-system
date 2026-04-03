<?php

namespace App\Http\Requests\Interviews;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'interview_date' => ['sometimes', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'in:onsite,online,phone'],
            'status' => ['nullable', 'in:scheduled,completed,cancelled,no_show'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
