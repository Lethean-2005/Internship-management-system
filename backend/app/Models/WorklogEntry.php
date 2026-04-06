<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorklogEntry extends Model
{
    protected $fillable = [
        'weekly_worklog_id',
        'entry_date',
        'time_slot',
        'activities',
        'difficulties',
        'solutions',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
        ];
    }

    public function worklog(): BelongsTo
    {
        return $this->belongsTo(WeeklyWorklog::class, 'weekly_worklog_id');
    }
}
