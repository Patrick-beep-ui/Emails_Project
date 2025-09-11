<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $primaryKey = 'news_id';
    protected $fillable = ['source_id','title', 'description', 'url', 'published_at'];

    public function sources() {
        return $this->belongsTo(Source::class, 'source_id', 'source_id');
    }

    public function emails() {
        return $this->belongsToMany(Email::class, 'emails_content', 'new_id', 'email_id')
                    ->withTimestamps();
    }
}
