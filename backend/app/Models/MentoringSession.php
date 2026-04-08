<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MentoringSession extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tutor_id',
        'intern_id',
        'internship_id',
        'title',
        'scheduled_date',
        'scheduled_time',
        'duration_minutes',
        'location',
        'meeting_link',
        'type',
        'status',
        'cancel_reason',
        'agenda',
        'notes',
        'action_items',
        'intern_feedback',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'duration_minutes' => 'integer',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function intern(): BelongsTo
    {
        return $this->belongsTo(User::class, 'intern_id');
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }
}
