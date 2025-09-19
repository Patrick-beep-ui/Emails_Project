<?php

namespace Database\Factories;

use App\Models\Email;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmailFactory extends Factory
{
    protected $model = Email::class;

    public function definition(): array
    {
        return [
            'subject' => $this->faker->sentence(),
            'message' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['draft','scheduled','sent']),
            'scheduled_at' => $this->faker->optional()->dateTimeBetween('+1 days', '+1 month'),
            'recipient' => User::factory()
        ];
    }
}

