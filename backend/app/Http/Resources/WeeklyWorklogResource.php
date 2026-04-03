<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WeeklyWorklogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'week_number' => $this->week_number,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'tasks_completed' => $this->tasks_completed,
            'challenges' => $this->challenges,
            'plans_next_week' => $this->plans_next_week,
            'hours_worked' => $this->hours_worked,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at,
            'reviewed_at' => $this->reviewed_at,
            'feedback' => $this->feedback,
            'user' => new UserResource($this->whenLoaded('user')),
            'internship' => new InternshipResource($this->whenLoaded('internship')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
