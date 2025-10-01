<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    use HasFactory;
    protected $primaryKey = 'email_id';
    protected $fillable = ['subject', 'message', 'status', 'scheduled_at', 'recipient'];

    public function users() {
        return $this->belongsTo(User::class, 'recipient', 'user_id');
    }

    public function news() {
        return $this->belongsToMany(News::class, 'emails_content', 'email_id', 'news_id')
                    ->withTimestamps();
    }
}
