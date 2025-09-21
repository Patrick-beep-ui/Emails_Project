<?php

namespace App\Services\AI;

use App\Models\Prompt;
use App\Services\QueryBuilderService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class GeminiService
{
    protected $client;
    protected $queryBuilder;

    public function __construct(GeminiClient $client, QueryBuilderService $queryBuilder)
    {
        $this->client = $client;
        $this->queryBuilder = $queryBuilder;
    }

    /**
     * Run a prompt module with parameters
     */
    public function run(string $module, array $data = []): array
    {
        $prompt = Prompt::where('module', $module)->first();

        if (!$prompt) {
            throw new Exception("Prompt module {$module} not found.");
        }

        $content = $prompt->content;

        // Fill parameters placeholders
        foreach ($data as $key => $value) {
            // Make sure the key matches the placeholder
            $content = str_replace('{{ $json.' . $key . ' }}', $value, $content);
        }

        if (!Storage::exists('prompts')) {
            Storage::makeDirectory('prompts');
        }

        $filename = 'prompts/final_prompt_' . now()->format('Y_m_d_H_i_s') . '.txt';
        Storage::put($filename, $content);

        // Send to Gemini
        return $this->client->generate($content);
    }
}
