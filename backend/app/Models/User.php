<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'phone',
        'department',
        'avatar',
        'cover',
        'is_active',
        'company_name',
        'position',
        'allowance',
        'tutor_id',
        'supervisor_name',
        'generation',
        'email_verified_at',
        'verification_code',
        'verification_code_sent_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verification_code_sent_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
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

    public function sentContacts(): HasMany
    {
        return $this->hasMany(SupervisorContact::class, 'user_id');
    }

    public function receivedContacts(): HasMany
    {
        return $this->hasMany(SupervisorContact::class, 'supervisor_id');
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(CompanyInterview::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(InternshipApplication::class);
    }
}
