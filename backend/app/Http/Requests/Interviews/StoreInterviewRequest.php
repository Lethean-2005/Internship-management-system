<?php

namespace App\Http\Requests\Interviews;

use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'company_id' => ['required', 'exists:companies,id'],
            'internship_id' => ['nullable', 'exists:internships,id'],
            'interview_date' => ['required', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'in:onsite,online,phone'],
            'status' => ['nullable', 'in:scheduled,completed,cancelled,no_show'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
