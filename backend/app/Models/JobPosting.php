<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPosting extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'company_name',
        'location',
        'location_link',
        'type',
        'description',
        'requirements',
        'benefits',
        'department',
        'positions',
        'start_date',
        'end_date',
        'application_deadline',
        'contact_email',
        'status',
        'created_by',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'positions' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'application_deadline' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
