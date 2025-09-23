<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class GoogleSearchService {
    protected string $apiKey;
    protected string $searchEngineId;

    public function __construct() {
        $this->apiKey = config('services.google.key');
        $this->searchEngineId = config('services.google.cx');
    }

      /**
        * Search Google Custom Search API with a single query.
     */

    public function search(string $query, int $numResults = 10): array {
        try {
            $response = Http::withOptions([
                'verify' => false,   // dev only, see earlier note
                'timeout' => 10,     // max seconds to wait
                'connect_timeout' => 5   // max seconds to establish connection
                ]) 
            ->get('https://www.googleapis.com/customsearch/v1', [
                'key' => $this->apiKey,
                'cx'  => $this->searchEngineId,
                'q'   => $query,
                'num' => $numResults,
            ]);

            $json = $response->json();

            if (!isset($json['items'])) {
                Log::warning("No items found for query: {$query}", $json);
                return [];
            }

            return array_map(function ($item) {
                return [
                    'title'       => $item['title'] ?? '',
                    'link'        => $item['link'] ?? '',
                    'displayLink' => $item['displayLink'] ?? '',
                    'snippet'     => $item['snippet'] ?? '',
                ];
            }, $json['items']);

        }
        catch(Exception $e) {
            Log::error("Google Search API error: " . $e->getMessage());
            return [];
        }
    }

    /**
        * Run multiple queries sequentially and merge results.
     */

    public function runMultipleSearch(array $queries, int $numResultsPerQuery = 10): array {
       try {
        $allResults = [];

        foreach($queries as $query) {
            $results = $this->search($query, $numResultsPerQuery);
            $allResults = array_merge($allResults, $results);
        }

        return $allResults;
       }
       catch(Exception $e) {
              Log::error("Error running multiple queries: " . $e->getMessage());
              return [];
       }
    }
}