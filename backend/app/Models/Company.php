<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'website',
        'industry',
        'description',
        'contact_person',
        'contact_phone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function internships(): HasMany
    {
        return $this->hasMany(Internship::class);
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(CompanyInterview::class);
    }
}
