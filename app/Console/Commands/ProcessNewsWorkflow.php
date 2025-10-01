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

class ProcessNewsWorkflow extends Command
{
    protected $signature = 'news:process {tagId}';
    protected $description = 'Runs the news processing workflow sequentially for a given tag';

    protected PromptController $promptController;
    protected NewsController $newsController;

    public function __construct(PromptController $promptController, NewsController $newsController)
    {
        parent::__construct();
        $this->promptController = $promptController;
        $this->newsController = $newsController;
    }

    /**
     * Retry helper for critical steps
     */
    protected function retry(callable $fn, int $attempts = 3, int $delaySeconds = 5)
    {
        $lastException = null;
        for ($i = 0; $i < $attempts; $i++) {
            try {
                return $fn();
            } catch (Exception $e) {
                $lastException = $e;
                $this->warn("Attempt " . ($i + 1) . " failed: " . $e->getMessage());
                sleep($delaySeconds);
            }
        }
        throw $lastException;
    }

    public function handle()
    {
        $maxAttempts = 5;    // Max attempts for entire workflow
        $delaySeconds = 10;  // Delay between retries
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            try {
                $attempt++;
                $this->info("Workflow attempt $attempt");

                $tagId = $this->argument('tagId');
                $tagTitle = Tag::find($tagId)->name ?? 'Top News';

                $this->info("Starting workflow for tag: $tagTitle (ID: $tagId)");

                // -----------------------
                // Optimize Queries
                // -----------------------
                $this->info("Optimizing queries...");
                $optimizedQueries = $this->retry(fn() => $this->promptController->optimizeModule($tagId));
                if (is_array($optimizedQueries) && isset($optimizedQueries['optimizedQueries'])) {
                    $optimizedQueries = $optimizedQueries['optimizedQueries'];
                }
                $this->info("Optimized queries: " . implode(', ', array_slice($optimizedQueries, 0, 5)) . "...");

                // -----------------------
                // Search News
                // -----------------------
                $this->info("Searching news...");
                $searchResults = $this->retry(fn() => $this->promptController->searchNewsModule($tagId));
                $newsResults = $searchResults['newsResults'] ?? $searchResults;
                $this->info("Fetched " . count($newsResults) . " news results");

                if (empty($newsResults)) {
                    $this->warn("No news found. Workflow aborted.");
                    return;
                }

                // -----------------------
                // Clean / Deduplicate
                // -----------------------
                $this->info("Cleaning news...");
                $cleanResponse = $this->retry(fn() => $this->promptController->cleanNewsModule($newsResults, $optimizedQueries));
                $cleanNews = $cleanResponse['list'][0]['news'] ?? [];
                $this->info("Cleaned news count: " . count($cleanNews));

                if (empty($cleanNews)) {
                    $this->warn("No clean news after deduplication. Workflow aborted.");
                    return;
                }

                // -----------------------
                // Translate
                // -----------------------
                $this->info("Translating news...");
                $translatedResponse = $this->retry(fn() => $this->promptController->translateNewsModule($cleanNews));
                $translatedNews = $translatedResponse['list'][0]['news'] ?? [];
                $this->info("Translated news count: " . count($translatedNews));

                if (empty($translatedNews)) {
                    $this->warn("Translation returned no news. Workflow aborted.");
                    return;
                }

                // -----------------------
                // Filter & Summarize
                // -----------------------
                $this->info("Filtering and summarizing articles...");
                $finalArticles = $this->retry(fn() => $this->promptController->filterAndSummarizeModule($translatedNews));
                $this->info("Final verified & summarized articles: " . count($finalArticles));

                if (empty($finalArticles)) {
                    $this->warn("No articles to send after filtering. Workflow aborted.");
                    return;
                }

                // Preview articles
                foreach ($finalArticles as $i => $article) {
                    $this->line("[$i] {$article['title']} ({$article['link']})");
                }

                // -----------------------
                // Generate HTML content
                // -----------------------
                $htmlContent = $this->promptController->generateNewsHtml($finalArticles, $tagTitle);

                // -----------------------
                // Fetch subscribed users
                // -----------------------
                $userEmails = User::whereHas('tags', function ($query) use ($tagId) {
                    $query->where('tags.tag_id', $tagId)
                        ->where('user_tags.is_active', 1);
                })->pluck('email')->toArray();

                $this->info("Sending emails to: " . implode(', ', $userEmails));

                foreach ($userEmails as $email) {
                    Mail::to($email)->send(new SendNewsEmail($htmlContent, $tagTitle));
                }

                $this->info("Emails queued to " . count($userEmails) . " subscribed users.");

                // -----------------------
                // Store news & email records
                // -----------------------

                $newsAdd = $this->newsController->storeNews($finalArticles, $userEmails, $tagTitle);
                if ($newsAdd['success']) {
                    $this->info("News and emails stored successfully");
                } else {
                    $errorMessage = $newsAdd['error'] ?? (isset($newsAdd['errors']) ? implode(', ', $newsAdd['errors']) : ($newsAdd['message'] ?? 'Unknown error'));
                    $this->error("Failed storing news: " . $errorMessage);
                }

                $this->info("Workflow completed successfully for tag $tagTitle");
                return; // success, stop retrying

            } catch (Exception $e) {
                $this->error("Workflow failed on attempt $attempt: " . $e->getMessage());

                if ($attempt < $maxAttempts) {
                    $this->warn("Retrying entire workflow in {$delaySeconds}s...");
                    sleep($delaySeconds);
                } else {
                    $this->error("Max attempts reached. Workflow aborted.");
                    // Optionally send alert email or log for monitoring
                }
            }
        }
    }
}
