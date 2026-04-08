<?php

namespace App\Http\Requests\MentoringSessions;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMentoringSessionRequest extends FormRequest
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
            'intern_id' => ['sometimes', 'exists:users,id'],
            'internship_id' => ['nullable', 'exists:internships,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'scheduled_date' => ['sometimes', 'date'],
            'scheduled_time' => ['sometimes', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'location' => ['nullable', 'string', 'max:500'],
            'meeting_link' => ['nullable', 'string', 'max:500'],
            'type' => ['sometimes', 'in:in_person,online,hybrid'],
            'agenda' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'action_items' => ['nullable', 'string'],
        ];
    }
}
