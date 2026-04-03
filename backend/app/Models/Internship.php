<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Internship extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'department',
        'start_date',
        'end_date',
        'positions',
        'status',
        'requirements',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'positions' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(InternshipApplication::class);
    }

    public function worklogs(): HasMany
    {
        return $this->hasMany(WeeklyWorklog::class);
    }

    public function finalReports(): HasMany
    {
        return $this->hasMany(FinalReport::class);
    }

    public function finalSlides(): HasMany
    {
        return $this->hasMany(FinalSlide::class);
    }
}
