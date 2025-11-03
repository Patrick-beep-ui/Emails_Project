<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
    use HasFactory, Notifiable;

    protected $primaryKey = 'user_id';
    public $timestamps = false; 
    protected $fillable = [
        'first_name', 'last_name', 'email', 'password', 'role'
    ];

    protected $hidden = ['password'];

    //Relations 
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'user_tags', 'user_id', 'tag_id')
                    ->withPivot('is_active', 'is_pending')
                    ->withTimestamps();
    }

    public function sources() {
        return $this->belongsToMany(Source::class, 'user_sources', 'user_id', 'source_id')
                    ->withTimestamps();
    }

    public function emails() {
        return $this->hasMany(Email::class, 'recipient', 'user_id');
    }

    public function ccRecipients() {
        return $this->hasMany(CcRecipient::class, 'user_id', 'user_id');
    }

    public function savedNews(){
        return $this->belongsToMany(News::class, 'saved_news', 'user_id', 'news_id')->withTimestamps();
    }

}
