<?php

namespace Tests\Feature\API;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Tag;
use App\Models\Keyword;

class KeywordsTest extends TestCase
{
    use RefreshDatabase;

    public function test_fetch_all_keywords()
    {
        $tag = Tag::factory()->create(['name' => 'Category1']);
        Keyword::factory()->create([
            'tag_id' => $tag->tag_id,
            'content' => 'Keyword1'
        ]);

        $response = $this->getJson('/api/keywords');

        if ($response->status() !== 201) {
            dump($response->json()); // <-- prints 'error' message from controller
        }

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'Category1']);
    }

    public function test_add_keywords_from_json()
    {
        $jsonContent = ["Category1" => ["Keyword1", "Keyword2"]];
        file_put_contents(app_path('Models/keywords.json'), json_encode($jsonContent));

        $response = $this->postJson('/api/keywords/addJson');

        if ($response->status() !== 201) {
            dump($response->json()); // <-- prints 'error' message from controller
        }

        $response->assertStatus(201)
                 ->assertJson(['message' => 'Keywords and Categories Added Succesfully']);
    }
}
