<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinalSlide extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'internship_id',
        'title',
        'description',
        'file_path',
        'presentation_date',
        'status',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'feedback',
    ];

    protected function casts(): array
    {
        return [
            'presentation_date' => 'date',
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
}
