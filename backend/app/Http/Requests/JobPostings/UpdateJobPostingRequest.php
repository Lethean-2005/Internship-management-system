<?php

namespace App\Http\Requests\JobPostings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobPostingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'company_name' => ['sometimes', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'location_link' => ['nullable', 'url', 'max:500'],
            'type' => ['nullable', 'string', 'in:internship,full-time,part-time'],
            'description' => ['nullable', 'string'],
            'requirements' => ['nullable', 'string'],
            'benefits' => ['nullable', 'string'],
            'department' => ['nullable', 'string', 'max:255'],
            'positions' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'application_deadline' => ['nullable', 'date'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'status' => ['nullable', 'string', 'in:open,closed'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
