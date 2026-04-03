<?php

namespace App\Http\Requests\Roles;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:roles'],
            'slug' => ['required', 'string', 'max:255', 'unique:roles'],
            'description' => ['nullable', 'string'],
        ];
    }
}
