<?php

namespace Tests\Feature\API;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Tag;

class UserTagsTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_returns_tags_for_a_valid_user()
    {
        $user = User::factory()->create();
        $tags = Tag::factory()->count(3)->create();

        // Attach tags to user via pivot
        $user->tags()->attach($tags->pluck('tag_id'));

        $response = $this->getJson("/api/users/tags/{$user->user_id}");

        // Debug
        //dd($response->json());

        if ($response->status() !== 201) {
            dump($response->json()); // <-- prints 'error' message from controller
        }

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'tags' => [
                         '*' => ['tag_id', 'name', 'description']
                     ]
                 ])
                 ->assertJsonFragment([
                     'tag_id' => $tags->first()->tag_id
                 ]);
    }

    /** @test */
    public function it_returns_validation_error_for_invalid_user_id()
    {
        // Act: call endpoint with invalid user id
        $response = $this->getJson('/api/users/tags/9999');

        // Assert: status 422 because of validation
        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Validation error'
                 ]);
    }
}
