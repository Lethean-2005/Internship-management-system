<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisorContactResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'message' => $this->message,
            'reply' => $this->reply,
            'replied_at' => $this->replied_at,
            'is_read' => $this->is_read,
            'user' => new UserResource($this->whenLoaded('user')),
            'supervisor' => new UserResource($this->whenLoaded('supervisor')),
            'internship' => new InternshipResource($this->whenLoaded('internship')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
