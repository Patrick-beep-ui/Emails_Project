<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $primaryKey = 'new_id';
    protected $fillable = ['source_id','title', 'tag_name', 'description', 'url', 'published_at'];

    public function sources() {
        return $this->belongsTo(Source::class, 'source_id', 'source_id');
    }

    public function emails() {
        return $this->belongsToMany(Email::class, 'emails_content', 'news_id', 'email_id')
                    ->withTimestamps();
    }

    public function savedByUsers(){
        return $this->belongsToMany(User::class, 'saved_news', 'news_id', 'user_id')->withTimestamps();
    }

}
