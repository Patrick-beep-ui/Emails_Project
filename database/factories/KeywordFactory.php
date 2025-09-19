<?php

namespace Database\Factories;

use App\Models\Keyword;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\Factory;

class KeywordFactory extends Factory
{
    protected $model = Keyword::class;

    public function definition(): array
    {
        return [
            'content' => $this->faker->word(),
            'tag_id'  => Tag::factory()
        ];
    }
}
