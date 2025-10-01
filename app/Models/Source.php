<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    use HasFactory;
    protected $primaryKey = 'source_id';
    public $timestamps = false;
    protected $fillable = ['source_domain'];

    public function users() {
        return $this->belongsToMany(User::class, 'user_sources', 'source_id', 'user_id')
                    ->withTimestamps();
    }

    public function news() {
        return $this->hasMany(News::class, 'source_id', 'source_id');
    }
}
