<?php

namespace App\Http\Requests\Contacts;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supervisor_id' => ['required', 'exists:users,id'],
            'internship_id' => ['nullable', 'exists:internships,id'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ];
    }
}
