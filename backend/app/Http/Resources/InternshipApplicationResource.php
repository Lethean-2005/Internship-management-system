<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InternshipApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'applied_at' => $this->applied_at,
            'reviewed_at' => $this->reviewed_at,
            'notes' => $this->notes,
            'internship' => new InternshipResource($this->whenLoaded('internship')),
            'user' => new UserResource($this->whenLoaded('user')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
