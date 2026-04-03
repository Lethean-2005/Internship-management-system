<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'industry' => $this->industry,
            'description' => $this->description,
            'contact_person' => $this->contact_person,
            'contact_phone' => $this->contact_phone,
            'is_active' => $this->is_active,
            'internships_count' => $this->when(isset($this->internships_count), $this->internships_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
