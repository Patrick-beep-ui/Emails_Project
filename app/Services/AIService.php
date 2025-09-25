<?php

namespace App\Services;

use App\Contracts\AIClientInterface;
use App\Models\Prompt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\In;

class AIService
{
    protected AIClientInterface $client;

    public function __construct(AIClientInterface $client)
    {
        $this->client = $client;
    }

    public function run(string $module, array $params, int $timeout = 30): array
    {
        $prompt = Prompt::where('module', $module)->firstOrFail();

        $content = $prompt->content;
        foreach ($params as $key => $value) {
            $encoded = is_array($value) ? json_encode($value) : $value;

            $content = str_replace('{{ $json.' . $key . ' }}', $encoded, $content);
            $content = str_replace('{{ JSON.stringify($json.' . $key . ') }}', $encoded, $content);
            $content = str_replace('{{ $' . $key . ' }}', $encoded, $content);
        }

        // Remove unreplaced placeholders to avoid polluting final prompt
        $content = preg_replace('/{{.*?}}/', '', $content);


        if (!Storage::exists('prompts')) {
            Storage::makeDirectory('prompts');
        }
        $filename = 'prompts/final_prompt_' . now()->format('Y_m_d_H_i_s') . '.txt';
        Storage::put($filename, $content);

        Log::info("Final prompt from AI Service: " . $content);

        return $this->client->generate($content, $timeout);
    }
}
