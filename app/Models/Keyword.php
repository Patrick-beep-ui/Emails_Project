<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Keyword extends Model
{
    use HasFactory;

    protected $primaryKey = 'keyword_id';
    public $timestamps = false;
    protected $fillable = ['content', 'tag_id'];

    public function tags() {
        return $this->belongsTo(Tag::class, 'tag_id', 'tag_id');
    }
}
