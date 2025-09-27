<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\PromptController;
use App\Mail\SendNewsEmail;
use Illuminate\Support\Facades\Mail;
use App\Models\Tag;
use Exception;

class ProcessNewsWorkflow extends Command
{
    protected $signature = 'news:process {tagId}';
    protected $description = 'Runs the news processing workflow sequentially for a given tag';

    protected PromptController $promptController;

    public function __construct(PromptController $promptController)
    {
        parent::__construct();
        $this->promptController = $promptController;
    }

    public function handle()
    {
        $tagId = $this->argument('tagId');
        $this->info("Starting workflow for tag ID: $tagId");

        try {
            $this->info("Optimizing queries...");
            $optimizedQueries = $this->promptController->optimizeModule($tagId);
            
            // If the controller returns a JSON response, unwrap it:
            if (is_array($optimizedQueries) && isset($optimizedQueries['optimizedQueries'])) {
                $optimizedQueries = $optimizedQueries['optimizedQueries'];
            }

            $this->info("Optimized queries: " . implode(', ', array_slice($optimizedQueries, 0, 5)) . "...");

            // Search News
            $this->info("Searching news...");
            $searchResults = $this->promptController->searchNewsModule($tagId);
            if (isset($searchResults['newsResults'])) {
                $newsResults = $searchResults['newsResults'];
            } else {
                $newsResults = $searchResults;
            }

            $this->info("Fetched " . count($newsResults) . " news results");


            // Clean / Deduplicate
            $this->info("Cleaning news...");
            
            $cleanResponse = $this->promptController->cleanNewsModule($newsResults, $optimizedQueries);
            
            if (isset($cleanResponse['list'][0]['news'])) {
                $cleanNews = $cleanResponse['list'][0]['news'];
            } else {
                $cleanNews = [];
            }
            
            $this->info("Cleaned news count: " . count($cleanNews));

            foreach ($cleanNews as $article) {
                $this->line("- [{$article['displayLink']}] {$article['title']}");
                $this->line("  Link: {$article['link']}");
                $this->line("  Snippet: {$article['snippet']}");
                $this->line(str_repeat('-', 80));
            }

            // Translate Module
            $this->info("Translating news...");
            $translatedResponse = $this->promptController->translateNewsModule($cleanNews);

            if (isset($translatedResponse['list'][0]['news'])) {
                $translatedNews = $translatedResponse['list'][0]['news'];
            } else {
                $translatedNews = [];
            }

            $this->info("Translated news count: " . count($translatedNews));

            //Show preview
            foreach ($translatedNews as $article) {
                $this->line("- [{$article['displayLink']}] {$article['title']}");
                $this->line("  Link: {$article['link']}");
                $this->line("  Snippet: {$article['snippet']}");
                $this->line(str_repeat('-', 80));
            }

            $this->info("Filtering and summarizing articles...");
            $finalArticles = $this->promptController->filterAndSummarizeModule($translatedNews);

            $this->info("Final verified & summarized articles: " . count($finalArticles));

            $tagTitle = Tag::find($tagId)->name ?? 'Top News';

            $htmlContent = $this->promptController->generateNewsHtml($finalArticles, $tagTitle);
            Mail::to('P.SolisObregon@student.keiseruniversity.edu')->send(new SendNewsEmail($htmlContent, $tagTitle));

        } catch (Exception $e) {
            $this->error("Error during workflow: " . $e->getMessage());
        }
    }
}
