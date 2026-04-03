<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinalSlideResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'file_path' => $this->file_path ? '/storage/' . $this->file_path : null,
            'presentation_date' => $this->presentation_date?->toDateString(),
            'status' => $this->status,
            'submitted_at' => $this->submitted_at,
            'reviewed_at' => $this->reviewed_at,
            'feedback' => $this->feedback,
            'slide_link' => $this->slide_link,
            'deadline' => $this->deadline,
            'user' => new UserResource($this->whenLoaded('user')),
            'internship' => new InternshipResource($this->whenLoaded('internship')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
