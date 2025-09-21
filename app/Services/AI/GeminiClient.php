<?php

namespace App\Services\AI;

use App\Contracts\AIClientInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiClient implements AIClientInterface
{
    public function generate(string $prompt): array
    {
        $apiKey = config('services.gemini.key');
    
        $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-goog-api-key' => $apiKey,
            ])
            ->withoutVerifying() // ⚠️ only for dev
            ->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);
    
        $json = $response->json() ?? [];

        Log::info('Gemini raw response:', $json);
    
        $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
        return [
            'text' => $text,
            'modelVersion' => $json['modelVersion'] ?? null,
            'responseId' => $json['responseId'] ?? null,
            'usageMetadata' => $json['usageMetadata'] ?? null,
            //'raw' => $json, // raw for debugging
        ];
    }
    
}
