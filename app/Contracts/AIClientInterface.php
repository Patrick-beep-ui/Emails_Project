<?php

namespace App\Contracts;

interface AIClientInterface
{
    /**
     * Generate text using the AI model.
     *
     * @param string $prompt
     * @param int $timeout
     * @return array
     */
    public function generate(string $prompt, int $timeout = 30): array;
}
