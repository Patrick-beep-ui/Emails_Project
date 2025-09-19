<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tag;

class UserTagSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $tags  = Tag::all(); 

        foreach ($users as $user) {
            // pick random tag IDs (1–3)
            $randomTags = $tags->random(rand(1, 3))->pluck('tag_id');

            // attach them to the pivot (user_tags)
            $user->tags()->syncWithoutDetaching($randomTags);
        }
    }
}
