<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CcRecipient extends Model
{
    use HasFactory;
    protected $fillable = ['email_address', 'user_id'];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
