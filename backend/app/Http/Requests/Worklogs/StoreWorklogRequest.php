<?php

namespace App\Http\Requests\Worklogs;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorklogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'internship_id' => ['required', 'exists:internships,id'],
            'week_number' => ['required', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'tasks_completed' => ['required', 'string'],
            'challenges' => ['nullable', 'string'],
            'plans_next_week' => ['nullable', 'string'],
            'hours_worked' => ['nullable', 'numeric', 'min:0', 'max:99999'],
        ];
    }
}
