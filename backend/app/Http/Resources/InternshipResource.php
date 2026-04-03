<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InternshipResource extends JsonResource
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
            'department' => $this->department,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'positions' => $this->positions,
            'status' => $this->status,
            'requirements' => $this->requirements,
            'company' => new CompanyResource($this->whenLoaded('company')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'applications' => InternshipApplicationResource::collection($this->whenLoaded('applications')),
            'applications_count' => $this->when(isset($this->applications_count), $this->applications_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
