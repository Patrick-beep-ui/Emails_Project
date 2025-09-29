<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Services\QueryBuilderService;
use App\Services\GoogleSearchService;
use App\Models\Prompt;
use App\Services\AIService;
use App\Models\Tag;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;

use Exception;

use App\Jobs\ProcessNewsModule;
class PromptController extends Controller
{

    protected AIService $ai;
    protected QueryBuilderService $queryBuilder;

    protected GoogleSearchService $googleSearch;

    public function __construct(AIService $ai, QueryBuilderService $queryBuilder, GoogleSearchService $googleSearch)
    {
        $this->ai = $ai;
        $this->queryBuilder = $queryBuilder;
        $this->googleSearch = $googleSearch;
    }

    public function readJSON() {
        try {
            $path = app_path('Models/prompts.json');
            $propmptsJson = file_get_contents($path);
            $promptsArr = json_decode($propmptsJson, true);

            if(!is_array($promptsArr)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inavlid JSON format'
                ]);
            }

            return $promptsArr;
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting users',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function addPromptsFromJSON() {
        try {
            $prompts = $this->readJSON();

            if (!is_array($prompts)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid prompt array format'
                ]);
            }

            DB::beginTransaction();

        foreach ($prompts as $moduleName => $content) {
            Prompt::updateOrCreate(
                ['module' => $moduleName], 
                ['content' => $content]   
            );
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Prompts imported successfully'
        ]);
        }   
        catch(Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error adding prompts to DB',
                'error' => $e->getMessage()
        ], 500);
        }
    }

    public function showPropmts() {
        try {
            $prompts = Prompt::all();

            return response()->json([
                'propmts' => $prompts
            ], 201);
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting propmts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sortModule() {
        try {
            $result = $this->ai->run('Sort_DeDuplicate_Contextualize_News', [
                'topic' => 'Laravel Contracts',
                'tone'  => 'friendly'
            ]);
    
            dd($result);
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error testing AI',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   public function optimizeModule($tagId)
    {
        set_time_limit(0);
        try {
            $optimizedQueries = [];
            $tag = Tag::findOrFail($tagId);
            //$tags = Tag::with('keywords')->get();

            // Get keywords
            $keywords = $tag->keywords()->pluck('content')->toArray();
            
            /*
            $keywords = $tags->pluck('keywords.*.content') // nested pluck
                 ->flatten()                  // flatten the nested arrays
                 ->toArray();
            */

            // Group keywords
            $groupedQueries = $this->queryBuilder->groupKeywords($keywords, 10);

            // Prepare final query string for prompt
            //$queryString = implode(" OR ", array_column($groupedQueries, 'query'));

            // Run the  prompt and send to Gemini
            //$result = $this->ai->run('Optimize_Queries_For_Browser_Search', [
                //'query' => $groupedQueries
            //]);

            foreach ($groupedQueries as $group) {
                $result = $this->ai->run('Optimize_Queries_For_Browser_Search', [
                    'query' => $group['query']
                ]);
                $optimizedQueries[] = $result['text'];
            }

            //return response()->json([
            //    'result' => $result,
            //    'optimizedQueries' => $optimizedQueries
            //]);

            return $optimizedQueries;

        } catch (Exception $e) {
            //return response()->json([
              //  'success' => false,
              //  'message' => 'Error optimizing prompt',
              //  'error' => $e->getMessage()
            //], 500);

            info("Optimize error: ".$e->getMessage());
            return [];
        }
    }

    public function searchNewsModule($tagId) {
        set_time_limit(0);
        //set_time_limit(120);
        try {
            $optimizedQueries = $this->optimizeModule($tagId);

            $newsResults = $this->googleSearch->runMultipleSearch($optimizedQueries, 10);

            //return response()->json([
            //    'queries' => $optimizedQueries,
            //    'news'    => $newsResults
            //], 200);

            return [
                'newsResults'      => $newsResults,
                'optimizedQueries' => $optimizedQueries,
            ];

        }
        catch(Exception $e) {
            //return response()->json([
              //  'success' => false,
              //  'message' => 'Error searching news',
               // 'error' => $e->getMessage()
            //], 500);

            info("Optimize error: ".$e->getMessage());
            return [];
        }
    }

    

    public function cleanNewsModule(array $newsResults, array $keywordGroups): array {
        set_time_limit(120);
        try {
            $today = Carbon::now();
            //$newsResults = $this->searchNewsModule($tagId);
            //$keywordGroups = $this->optimizeModule($tagId);

            // Filter by Keyword
            $filtered = array_filter($newsResults, function ($article) use ($keywordGroups) {
                $title = strtolower($article['title'] ?? '');
                $snippet = strtolower($article['snippet'] ?? '');
        
                foreach ($keywordGroups as $group) {
                    foreach ($this->extractKeywordsFromGroup($group) as $keyword) {
                        $keyword = strtolower($keyword);
                        if (str_contains($title, $keyword) || str_contains($snippet, $keyword)) {
                            return true;
                        }
                    }
                }
                return false;
            });

            // Deduplicate by URL
            $unique = [];
            foreach ($filtered as $article) {
                $link = $article['link'];
                if (!isset($unique[$link])) {
                    $unique[$link] = $article;
                }
            }
            $unique = array_values($unique);

            // Sorting by Relevance
            usort($unique, function($a, $b)use ($keywordGroups, $today) {
                $dateA = $this->parseRelativeDate($a['snippet'], $today);
                $dateB = $this->parseRelativeDate($b['snippet'], $today);

                if ($dateA != $dateB) {
                    return $dateB <=> $dateA; 
                }

                $relA = $this->calculateRelevance($a, $keywordGroups);
                $relB = $this->calculateRelevance($b, $keywordGroups);

                return $relB <=> $relA;
            });

            return [
                "list" => [
                    [
                        "news" => array_map(fn($a) => [
                            "title"       => $a['title'],
                            "link"        => $a['link'],
                            "displayLink" => $a['displayLink'],
                            "snippet"     => $a['snippet'],
                        ], $unique)
                    ]
                ]
            ];

        }
        catch(Exception $e) {
            //return response()->json([
             //   'success' => false,
             //   'message' => 'Error cleaning news',
             //   'error' => $e->getMessage()
            //], 500);

            info("Clean error: ".$e->getMessage());
            return [];
        }
    }

    public function translateNewsModule(array $cleanNews)
    {
        try {
            $result = $this->ai->run('Translate_Title_And_Snippets', [
                'news' => $cleanNews
            ], 180);
    
            $rawText = $result['text'];
    
            // strip markdown fences like ```json ... ```
            $rawText = preg_replace('/^```(?:json)?|```$/m', '', trim($rawText));
    
            Log::info("Cleaned AI translation response: " . $rawText);
    
            $decoded = json_decode($rawText, true);
    
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Invalid JSON returned from translation: " . json_last_error_msg());
            }
    
            // Normalize structure
            if (isset($decoded['list'][0]['news'])) {
                return $decoded;
            } elseif (isset($decoded[0]['title'])) {
                // Wrap into expected structure
                return [
                    'list' => [
                        [ 'news' => $decoded ]
                    ]
                ];
            } else {
                throw new Exception("Unexpected JSON structure from AI");
            }
        } catch (Exception $e) {
            info("Translation Failed: ".$e->getMessage());
            Log::error("Translation failed: " . $e->getMessage());
            return [
                'list' => [
                    [ 'news' => [] ]
                ]
            ];
        }
    }

    public function filterAndSummarizeModule(array $translatedNews)
    {
        set_time_limit(0);
        try {
            $result = $this->ai->run('Filter_True_Articles_And_Generate_Summary', [
                'news' => $translatedNews
            ], 0);

            $rawText = $result['text'];

            // strip code fences if AI wraps JSON
            $rawText = preg_replace('/^```(?:json)?|```$/m', '', trim($rawText));
            Log::info("Cleaned AI filter/summary response: " . $rawText);

            $decoded = json_decode($rawText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Invalid JSON from summary step: " . json_last_error_msg());
            }

            if (isset($decoded['processed_news'])) {
                return $decoded['processed_news'];
            } else {
                throw new Exception("Unexpected structure: missing 'processed_news'");
            }

        } catch (Exception $e) {
            info("Summary error: ".$e->getMessage());
            Log::error("Summary step failed: " . $e->getMessage());
            return [];
        }
    }


    public function viewCleanNews($tagId)
    {
        $optimizedQueries = $this->optimizeModule($tagId);
        $raw = $this->searchNewsModule($tagId);
    
        $newsResults = $raw['newsResults'] ?? [];
        $optimizedQueries = $raw['optimizedQueries'] ?? [];
    
        $cleanResponse = $this->cleanNewsModule($newsResults, $optimizedQueries);
    
        return response()->json([
            'tagId'      => $tagId,
            'clean_news' => $cleanResponse,
            'queries'    => $optimizedQueries,
            'raw_news'  => $newsResults,
        ]);
    }
    

    // Testing Sending Emails
    public function generateNewsHtml(array $finalArticles, string $newsTitle = 'Top News'): string
    {
        $fechaHoy = now()->format('l, F j, Y'); // "Friday, September 23, 2025"
        $content = "";
        $index = 1;

        foreach ($finalArticles as $item) {
            $title = $item['title'] ?? '';
            $snippet = $item['snippet'] ?? '';
            $link = $item['link'] ?? '#';
            $displayLink = $item['displayLink'] ?? '';
            $summary = $item['summary'] ?? $snippet; // fallback to snippet if summary missing

            $content .= "
            <div style=\"background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); display: flex; flex-direction: column; height: 100%; margin-bottom: 1rem;\">
                <div style=\"padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;\">
                    <div style=\"display: inline-block; width: 32px; height: 32px; background-color: #2563eb; color: white; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold; margin-bottom: 1rem;\">{$index}</div>
                    <h2 style=\"font-size: 1.25rem; margin-bottom: 0.1rem; color: #1e293b;\">{$title}</h2>
                    <h3 style=\"font-size: 1.0rem; margin-bottom: 0.75rem; color: gray;\">Source: {$displayLink}</h3>
                    <p style=\"color: #64748b; margin-bottom: 1.25rem; flex-grow: 1;\">{$summary}</p>
                    <a href=\"{$link}\" target=\"_blank\" rel=\"noopener\" style=\"display: inline-block; padding: 0.5rem 1rem; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; text-align: center; margin-top: auto; transition: background-color 0.2s ease;\" onmouseover=\"this.style.backgroundColor='#1e40af'\" onmouseout=\"this.style.backgroundColor='#2563eb'\">Read More</a>
                </div>
            </div>
            ";
            $index++;
        }

        $html = "
        <!DOCTYPE html>
        <html lang=\"en\">
        <head>
            <meta charset=\"UTF-8\" />
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
            <title>Top News</title>
        </head>
        <body style=\"background-color: #f8fafc; color: #1e293b; line-height: 1.6; padding: 2rem 1rem; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\">
            <div style=\"max-width: 1200px; margin: 0 auto;\">
                <header style=\"text-align: center; margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0;\">
                    <h1 style=\"font-size: 2.25rem; color: #2563eb; margin-bottom: 0.5rem;\">{$newsTitle}s</h1>
                    <div style=\"color: #64748b; font-size: 1rem; margin-bottom: 1rem;\">{$fechaHoy}</div>
                </header>

                <div style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;\">
                    {$content}
                </div>

                <footer style=\"text-align: center; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.875rem;\">
                    <p>© 2025 AI Keiser University. All rights reserved.</p>
                </footer>
            </div>
        </body>
        </html>
        ";

        return $html;
    }






    // Helper functions
    private function extractDomain($url) {
        $host = parse_url($url, PHP_URL_HOST);
        return preg_replace('/^www\./', '', $host);
    }

    private function parseRelativeDate(string $snippet, Carbon $today): Carbon
    {
        if (preg_match('/(\d+)\s+hours?\s+ago/', $snippet, $m)) {
            return $today->copy()->subHours((int)$m[1]);
        }
        if (preg_match('/(\d+)\s+days?\s+ago/', $snippet, $m)) {
            return $today->copy()->subDays((int)$m[1]);
        }
        // fallback = today
        return $today;
        }

    private function extractKeywordsFromGroup(string $group): array
    {
        // Example: Nicaragua ("Ortega Murillo" OR "Daniel Ortega")
        preg_match_all('/"([^"]+)"/', $group, $matches);
        return $matches[1] ?? [];
    }


    private function calculateRelevance(array $article, array $keywordGroups): int {
        $title = strtolower($article['title']);
        $snippet = strtolower($article['snippet']);
        $score = 0;

        foreach($keywordGroups as $group) {
            foreach($this->extractKeywordsFromGroup($group) as $keyword) {
                if (str_contains($title, strtolower($keyword)) || str_contains($snippet, strtolower($keyword))) {
                    $score ++; 
                    break;
                }
            }
        }

        return $score;
    }

    /*
    public function cleanNewsModule($tagId)
    {
        // Queue the job instead of running it immediately
        ProcessNewsModule::dispatch($tagId);

        return response()->json([
            'status' => 'processing',
            'message' => 'News processing has been queued and will run asynchronously.'
        ], 202);
    }   
    */
}
