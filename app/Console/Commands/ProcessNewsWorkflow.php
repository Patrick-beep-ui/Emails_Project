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
        $this->newsController   = $newsController;
    }

    public function handle()
    {
        $tagId = $this->argument('tagId');
        $tagTitle = Tag::find($tagId)->name ?? 'Top News';

        $this->info("Starting workflow for tag: $tagTitle (ID: $tagId)");

        try {
            // -----------------------
            // Optimize Queries
            // -----------------------
            $this->info("Optimizing queries...");
            $optimizedQueries = $this->promptController->optimizeModule($tagId);
            if (is_array($optimizedQueries) && isset($optimizedQueries['optimizedQueries'])) {
                $optimizedQueries = $optimizedQueries['optimizedQueries'];
            }
            $this->info("Optimized queries: " . implode(', ', array_slice($optimizedQueries, 0, 5)) . "...");

            // -----------------------
            // Search News
            // -----------------------
            $this->info("Searching news...");
            $searchResults = $this->promptController->searchNewsModule($tagId);
            $newsResults   = $searchResults['newsResults'] ?? $searchResults;
            $this->info("Fetched " . count($newsResults) . " news results");

            if (empty($newsResults)) {
                $this->warn("No news found. Workflow aborted.");
                return;
            }

            // -----------------------
            // Clean / Deduplicate
            // -----------------------
            $this->info("Cleaning news...");
            $cleanResponse = $this->promptController->cleanNewsModule($newsResults, $optimizedQueries);
            $cleanNews     = $cleanResponse['list'][0]['news'] ?? [];
            $this->info("Cleaned news count: " . count($cleanNews));

            if (empty($cleanNews)) {
                $this->warn("No clean news. Aborted.");
                return;
            }

            // -----------------------
            // Translate
            // -----------------------
            $this->info("Translating news...");
            $translatedResponse = $this->promptController->translateNewsModule($cleanNews);
            $translatedNews     = $translatedResponse['list'][0]['news'] ?? [];
            $this->info("Translated news count: " . count($translatedNews));

            if (empty($translatedNews)) {
                $this->warn("Translation returned no news. Aborted.");
                return;
            }

            // -----------------------
            // Filter & Summarize
            // -----------------------
            $this->info("Filtering and summarizing...");
            $finalArticles = $this->promptController->filterAndSummarizeModule($translatedNews);
            $this->info("Final verified & summarized: " . count($finalArticles));

            if (empty($finalArticles)) {
                $this->warn("No articles to send. Aborted.");
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

            $this->info("Emails queued to " . count($userEmails) . " users.");

            // -----------------------
            // Store news & email records
            // -----------------------
            $newsAdd = $this->newsController->storeNews($finalArticles, $userEmails, $tagTitle);
            if ($newsAdd['success']) {
                $this->info("News stored successfully.");
            } else {
                $this->error("Failed storing news: " . ($newsAdd['error'] ?? 'Unknown error'));
            }

            $this->info("Workflow completed for tag $tagTitle");

        } catch (Exception $e) {
            $this->error("Workflow failed: " . $e->getMessage());
            throw $e; // let the Job retry
        }
    }
}
