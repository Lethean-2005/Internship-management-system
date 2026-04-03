<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyInterviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'interview_date' => $this->interview_date,
            'location' => $this->location,
            'type' => $this->type,
            'status' => $this->status,
            'notes' => $this->notes,
            'result' => $this->result,
            'feedback' => $this->feedback,
            'user' => new UserResource($this->whenLoaded('user')),
            'company' => new CompanyResource($this->whenLoaded('company')),
            'internship' => new InternshipResource($this->whenLoaded('internship')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
