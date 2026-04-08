<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MentoringSessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tutor_id' => $this->tutor_id,
            'intern_id' => $this->intern_id,
            'internship_id' => $this->internship_id,
            'title' => $this->title,
            'scheduled_date' => $this->scheduled_date->format('Y-m-d'),
            'scheduled_time' => $this->scheduled_time,
            'duration_minutes' => $this->duration_minutes,
            'location' => $this->location,
            'meeting_link' => $this->meeting_link,
            'type' => $this->type,
            'status' => $this->status,
            'cancel_reason' => $this->cancel_reason,
            'agenda' => $this->agenda,
            'notes' => $this->notes,
            'action_items' => $this->action_items,
            'intern_feedback' => $this->intern_feedback,
            'tutor' => new UserResource($this->whenLoaded('tutor')),
            'intern' => new UserResource($this->whenLoaded('intern')),
            'internship' => new InternshipResource($this->whenLoaded('internship')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
