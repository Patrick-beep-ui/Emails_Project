<?php

namespace App\Services;

use App\Models\Prompt;
use Illuminate\Support\Facades\Http;

class GeminiService
{
    public function run(string $module, array $params)
    {
        // 1. Get the prompt template from DB
        $prompt = Prompt::where('module', $module)->firstOrFail();

        // 2. Inject dynamic parameters into the content
        $content = $prompt->content;
        foreach ($params as $key => $value) {
            // JSON encode complex values if needed
            $encoded = is_array($value) ? json_encode($value) : $value;
            $content = str_replace('{{'.$key.'}}', $encoded, $content);
        }

        // 3. Send to Gemini (pseudo-code — replace with actual Gemini API call)
        $response = Http::withToken(config('services.gemini.key'))
            ->post('https://gemini.googleapis.com/v1/models/text:generate', [
                'prompt' => $content,
            ]);

        return $response->json();
    }
}