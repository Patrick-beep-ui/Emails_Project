<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PasswordResetToken extends Model
{
    protected $table = 'password_reset_tokens';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'token',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
