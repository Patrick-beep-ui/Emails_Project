<?php

namespace Tests\Feature\API;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Tag;

class UsersTest extends TestCase {
    use RefreshDatabase;

    public function test_get_users() {
        $user = User::factory()->create([
            'first_name' => 'TestUser1',
            'last_name'  => 'LastName1',
            'email' => 'user@email.com',
            'role' => 'user'
        ]);

        $response = $this->getJson('/api/users');

        if ($response->status() !== 201) {
            dump($response->json()); 
        }
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'users' => [
                         '*' => ['user_id', 'first_name', 'last_name', 'email', 'role']
                     ]
                 ])
                 ->assertJsonFragment([
                     'email' => 'user@email.com'
                 ]);
    }

    public function test_add_user() {
        // Payload form structure
        $payload = [
            'first_name' => 'NewUser',
            'last_name'  => 'LastName',
            'email' => 'user@email.com'
        ];

        $response = $this->postJson('/api/users/add', $payload);

        if ($response->status() !== 201) {
            dump($response->json()); 
        }

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'user' => ['user_id', 'first_name', 'last_name', 'email', 'role']
                ])
                ->assertJsonFragment(['email' => $payload['email']]);

        // Check it was created in the database
        $this->assertDatabaseHas('users', [
            'email' => $payload['email'],
            'first_name' => 'NewUser',
        ]);

    }

    public function test_return_validation_error_when_email_exists() {
        User::factory()->create([
            'email' => 'existing@example.com'
        ]);

        $payload = [
            'first_name' => 'Alice',
            'last_name'  => 'Dup',
            'email'      => 'existing@example.com'
        ];

        $response = $this->postJson('/api/users/add', $payload);

        if ($response->status() !== 201) {
            dump($response->json()); 
        }

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Validation error',
                 ])
                 ->assertJsonStructure(['errors' => ['email']]);
    }
}