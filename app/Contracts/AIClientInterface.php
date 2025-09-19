<?php

namespace App\Contracts;

interface AIClientInterface
{
    /**
     * Generate text using the AI model.
     *
     * @param string $prompt
     * @return array
     */
    public function generate(string $prompt): array;
}
