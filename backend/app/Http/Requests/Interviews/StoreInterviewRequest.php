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
            'company_id' => ['nullable', 'exists:companies,id'],
            'company_name' => ['required', 'string', 'max:255'],
            'internship_id' => ['nullable', 'exists:internships,id'],
            'interview_date' => ['required', 'date'],
            'location' => ['nullable', 'string', 'max:2000'],
            'type' => ['nullable', 'in:onsite,online,hybrid'],
            'employment' => ['nullable', 'in:internship,probation,staff,contract'],
            'status' => ['nullable', 'in:scheduled,completed,cancelled,no_show'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
