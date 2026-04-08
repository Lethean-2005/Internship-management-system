<?php

namespace App\Http\Requests\MentoringSessions;

use Illuminate\Foundation\Http\FormRequest;

class StoreMentoringSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'intern_id' => ['required', 'exists:users,id'],
            'internship_id' => ['nullable', 'exists:internships,id'],
            'title' => ['required', 'string', 'max:255'],
            'scheduled_date' => ['required', 'date'],
            'scheduled_time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'location' => ['nullable', 'string', 'max:500'],
            'meeting_link' => ['nullable', 'string', 'max:500'],
            'type' => ['required', 'in:in_person,online,hybrid'],
            'agenda' => ['nullable', 'string'],
        ];
    }
}
