<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupervisorContact extends Model
{
    protected $fillable = [
        'user_id',
        'supervisor_id',
        'internship_id',
        'subject',
        'message',
        'reply',
        'replied_at',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'replied_at' => 'datetime',
            'is_read' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }
}
