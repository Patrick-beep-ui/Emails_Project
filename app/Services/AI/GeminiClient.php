<?php

namespace App\Services\AI;

use App\Contracts\AIClientInterface;
use Illuminate\Support\Facades\Http;

class GeminiClient implements AIClientInterface
{
    public function generate(string $prompt): array
    {
        $apiKey = config('services.gemini.key');

        $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-goog-api-key' => $apiKey,
            ])
            ->withoutVerifying() // Development only
            ->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

        // Return as array
        $json = $response->json() ?? [];

        $text = $json['candidates'][0]['content'][0]['text'] ?? '';

        return [
            'text' => $text,
            'modelVersion' => $json['modelVersion'] ?? null,
            'responseId' => $json['responseId'] ?? null,
            'usageMetadata' => $json['usageMetadata'] ?? null,
        ];
    }
}
