<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'department' => $this->department,
            'avatar' => $this->avatar,
            'is_active' => $this->is_active,
            'company_name' => $this->company_name,
            'position' => $this->position,
            'allowance' => $this->allowance,
            'tutor_id' => $this->tutor_id,
            'tutor' => new UserResource($this->whenLoaded('tutor')),
            'supervisor_name' => $this->supervisor_name,
            'generation' => $this->generation,
            'role' => new RoleResource($this->whenLoaded('role')),
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
