<?php

namespace App\Jobs;

use App\Models\Tag;
use App\Services\AIService;
use App\Services\QueryBuilderService;
use App\Services\GoogleSearchService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessNewsModule implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $tagId;
    protected AIService $ai;
    protected QueryBuilderService $queryBuilder;
    protected GoogleSearchService $googleSearch;

    public function __construct(int $tagId)
    {
        $this->tagId = $tagId;
        // Services cannot be injected via constructor for queued jobs; will inject in handle()
    }

    public function handle(AIService $ai, QueryBuilderService $queryBuilder, GoogleSearchService $googleSearch)
    {
        $this->ai = $ai;
        $this->queryBuilder = $queryBuilder;
        $this->googleSearch = $googleSearch;

        try {
            $tag = Tag::findOrFail($this->tagId);

            // 1. Optimize queries
            $keywords = $tag->keywords()->pluck('content')->toArray();
            $groupedQueries = $this->queryBuilder->groupKeywords($keywords, 10);
            $optimizedQueries = [];
            foreach ($groupedQueries as $group) {
                $result = $this->ai->run('Optimize_Queries_For_Browser_Search', [
                    'query' => $group['query']
                ]);
                $optimizedQueries[] = $result['text'];
            }

            // 2. Run Google search
            $newsResults = $this->googleSearch->runMultipleSearch($optimizedQueries, 10);

            // 3. Clean & contextualize
            $cleanNews = $this->ai->run('Sort_Deduplicate_Contextualize_News', [
                'news'     => $newsResults,
                'today'    => now()->toDateString(),
                'keywords' => $optimizedQueries
            ]);

            // 4. Save or log the results somewhere
            // For example, save to database:
            // TagResult::create(['tag_id' => $this->tagId, 'result' => $cleanNews]);

        } catch (Exception $e) {
            // handle errors, maybe log
            Log::error("Error processing news module for tag {$this->tagId}: {$e->getMessage()}");
        }
    }
}
