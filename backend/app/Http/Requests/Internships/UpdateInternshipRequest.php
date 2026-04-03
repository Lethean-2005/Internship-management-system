<?php

namespace App\Http\Requests\Internships;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInternshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['sometimes', 'exists:companies,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'department' => ['nullable', 'string', 'max:255'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'positions' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:open,closed,in_progress,completed'],
            'requirements' => ['nullable', 'string'],
        ];
    }
}
