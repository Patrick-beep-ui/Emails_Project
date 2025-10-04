<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\NewsController;
use App\Mail\SendNewsEmail;
use Illuminate\Support\Facades\Mail;
use App\Models\Tag;
use App\Models\User;
use Exception;

class ProcessAllNewsWorkflows extends Command
{
    protected $signature = 'news:process-all';
    protected $description = 'Runs the news workflow for all tags and sends one email per user with all their news.';

    protected PromptController $promptController;
    protected NewsController $newsController;

    public function __construct(PromptController $promptController, NewsController $newsController)
    {
        parent::__construct();
        $this->promptController = $promptController;
        $this->newsController   = $newsController;
    }

    /**
     * Retry helper for a full tag workflow
     */
    protected function retryTagWorkflow(callable $fn, int $attempts = 3, int $delaySeconds = 5)
    {
        $lastException = null;
        for ($i = 0; $i < $attempts; $i++) {
            try {
                return $fn();
            } catch (Exception $e) {
                $lastException = $e;
    
                // Detect 429
                if (str_contains($e->getMessage(), 'RESOURCE_EXHAUSTED')) {
                    $this->warn("Quota hit, waiting 60s before retry...");
                    sleep(60);
                } else {
                    $this->warn("Attempt " . ($i + 1) . " failed: " . $e->getMessage());
                    sleep($delaySeconds);
                }
            }
        }
        throw $lastException;
    }
    

    public function handle()
    {
        $this->info("Fetching all tags...");
        $tags = Tag::all();

        // Accumulator: user email → list of articles
        $userNewsAccumulator = [];

        foreach ($tags as $tag) {
            $this->info("Processing tag: {$tag->name} (ID: {$tag->tag_id})");

            try {
                $finalArticles = $this->retryTagWorkflow(function () use ($tag) {
                    // 1. Optimize
                    $optimizedQueries = $this->promptController->optimizeModule($tag->tag_id);
                    if (is_array($optimizedQueries) && isset($optimizedQueries['optimizedQueries'])) {
                        $optimizedQueries = $optimizedQueries['optimizedQueries'];
                    }

                    // 2. Search
                    $searchResults = $this->promptController->searchNewsModule($tag->tag_id);
                    $newsResults   = $searchResults['newsResults'] ?? $searchResults;
                    if (empty($newsResults)) {
                        throw new Exception("No news results found");
                    }

                    // 3. Clean
                    $cleanResponse = $this->promptController->cleanNewsModule($newsResults, $optimizedQueries);
                    $cleanNews     = $cleanResponse['list'][0]['news'] ?? [];
                    if (empty($cleanNews)) {
                        throw new Exception("No clean news found");
                    }

                    // 4. Translate
                    $translatedResponse = $this->promptController->translateNewsModule($cleanNews);
                    $translatedNews     = $translatedResponse['list'][0]['news'] ?? [];
                    if (empty($translatedNews)) {
                        throw new Exception("No translated news found");
                    }

                    // 5. Filter & Summarize
                    $finalArticles = $this->promptController->filterAndSummarizeModule($translatedNews);
                    if (empty($finalArticles)) {
                        throw new Exception("No final articles after filtering");
                    }

                    return $finalArticles;
                });

                // -----------------------
                // Accumulate news per user
                // -----------------------
                $userEmails = User::whereHas('tags', function ($query) use ($tag) {
                    $query->where('tags.tag_id', $tag->tag_id)
                          ->where('user_tags.is_active', 1);
                })->pluck('email')->toArray();

                foreach ($userEmails as $email) {
                    if (!isset($userNewsAccumulator[$email])) {
                        $userNewsAccumulator[$email] = [];
                    }
                    // merge avoiding duplicates
                    foreach ($finalArticles as $article) {
                        $existingLinks = array_column($userNewsAccumulator[$email], 'link');
                        if (!in_array($article['link'], $existingLinks)) {
                            $userNewsAccumulator[$email][] = $article;
                        }
                    }
                }

                // Optional: persist tag news
                $this->newsController->storeNews($finalArticles, $userEmails, $tag->name);

                $this->info("Tag {$tag->name} processed with " . count($finalArticles) . " articles");

            } catch (Exception $e) {
                $this->error("Failed for tag {$tag->name} after retries: " . $e->getMessage());
            }
        }

        // -----------------------
        // Send consolidated emails
        // -----------------------
        $this->info("Sending consolidated emails to users...");

        foreach ($userNewsAccumulator as $email => $articles) {
            if (empty($articles)) continue;

            $htmlContent = $this->promptController->generateNewsHtml($articles, "Top News");
            Mail::to($email)->send(new SendNewsEmail($htmlContent, "Top News"));

            $this->info("Email sent to $email with " . count($articles) . " articles.");
        }

        $this->info("All workflows completed. Total users emailed: " . count($userNewsAccumulator));
    }
}
