<?php

namespace App\Services;

use App\Contracts\AIClientInterface;
use App\Models\Prompt;

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
            $content = str_replace('{{'.$key.'}}', $encoded, $content);
        }

        return $this->client->generate($content);
    }
}
