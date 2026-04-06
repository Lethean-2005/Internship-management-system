<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WeeklyWorklog extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'internship_id',
        'week_number',
        'start_date',
        'end_date',
        'tasks_completed',
        'challenges',
        'plans_next_week',
        'hours_worked',
        'status',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'feedback',
        'tutor_topics',
        'reflections',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'hours_worked' => 'decimal:1',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(WorklogEntry::class)->orderBy('entry_date')->orderByRaw("CASE WHEN time_slot = 'morning' THEN 0 ELSE 1 END");
    }
}
