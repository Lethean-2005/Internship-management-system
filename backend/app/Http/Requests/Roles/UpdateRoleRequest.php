<?php

namespace App\Http\Requests\Roles;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('roles')->ignore($this->route('role'))],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('roles')->ignore($this->route('role'))],
            'description' => ['nullable', 'string'],
        ];
    }
}
