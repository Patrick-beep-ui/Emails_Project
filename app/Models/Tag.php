<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $primaryKey = 'tag_id';
    public $timestamps = false;
    protected $fillable = ['name', 'description'];

    public function keywords() {
        return $this->hasMany(Keyword::class, 'tag_id', 'tag_id');
    }

    public function userTags() {
        return $this->belongsToMany(User::class, 'user_tags', 'tag_id', 'user_id')
                    ->withTimestamps();
    }
}
