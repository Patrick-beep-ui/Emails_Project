<?php

namespace App\Services;

use App\Contracts\AIClientInterface;
use App\Models\Prompt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected AIClientInterface $client;

    public function __construct(AIClientInterface $client)
    {
        $this->client = $client;
    }

    public function run(string $module, array $params)
    {
        $prompt = Prompt::where('module', $module)->firstOrFail();

        $content = $prompt->content;
        foreach ($params as $key => $value) {
            $encoded = is_array($value) ? json_encode($value) : $value;
            $content = str_replace('{{ $json.' . $key . ' }}', $encoded, $content);
        }

        if (!Storage::exists('prompts')) {
            Storage::makeDirectory('prompts');
        }
        $filename = 'prompts/final_prompt_' . now()->format('Y_m_d_H_i_s') . '.txt';
        Storage::put($filename, $content);

        Log::info("Final prompt from AI Service: " . $content);

        return $this->client->generate($content);
    }
}
