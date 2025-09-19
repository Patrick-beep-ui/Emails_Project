<?php

namespace Database\Factories;

use App\Models\News;
use App\Models\Source;
use Illuminate\Database\Eloquent\Factories\Factory;

class NewsFactory extends Factory
{
    protected $model = News::class;

    public function definition(): array
    {
        return [
            'source_id' => Source::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'url' => $this->faker->unique()->url(),
            'published_at' => $this->faker->dateTime()
        ];
    }
}

