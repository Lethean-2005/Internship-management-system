<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyInterview extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'company_id',
        'company_name',
        'employment',
        'internship_id',
        'interview_date',
        'location',
        'type',
        'status',
        'notes',
        'result',
        'feedback',
    ];

    protected function casts(): array
    {
        return [
            'interview_date' => 'immutable_datetime',
        ];
    }

    public function isInterviewPast(): bool
    {
        return $this->interview_date->lessThanOrEqualTo(now());
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }
}
