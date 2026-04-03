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
            'user_id' => ['sometimes', 'exists:users,id'],
            'company_name' => ['sometimes', 'string', 'max:255'],
            'interview_date' => ['sometimes', 'date'],
            'location' => ['nullable', 'string', 'max:2000'],
            'type' => ['nullable', 'in:onsite,online,hybrid'],
            'employment' => ['nullable', 'in:internship,probation,staff,contract'],
            'status' => ['nullable', 'in:scheduled,completed,cancelled,no_show'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
