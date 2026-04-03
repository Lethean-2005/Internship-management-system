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
            'user_id' => $this->user_id,
            'company_id' => $this->company_id,
            'company_name' => $this->company_name,
            'interview_date' => $this->getRawOriginal('interview_date'),
            'location' => $this->location,
            'type' => $this->type,
            'employment' => $this->employment,
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
