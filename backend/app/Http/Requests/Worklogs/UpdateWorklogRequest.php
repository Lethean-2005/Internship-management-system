<?php

namespace App\Http\Requests\Worklogs;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorklogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'week_number' => ['sometimes', 'integer', 'min:1'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'tasks_completed' => ['sometimes', 'string'],
            'challenges' => ['nullable', 'string'],
            'plans_next_week' => ['nullable', 'string'],
            'hours_worked' => ['nullable', 'numeric', 'min:0', 'max:99999'],
        ];
    }
}
