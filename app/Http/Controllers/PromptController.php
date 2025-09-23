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
use Exception;

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
        try {
            $optimizedQueries = [];
            $tag = Tag::findOrFail($tagId);

            // Get keywords
            $keywords = $tag->keywords()->pluck('content')->toArray();

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
            return response()->json([
                'success' => false,
                'message' => 'Error optimizing prompt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function searchNewsModule($tagId) {
        try {
            $optimizedQueries = $this->optimizeModule($tagId);

            $newsResults = $this->googleSearch->runMultipleSearch($optimizedQueries, 10);

            return response()->json([
                'queries' => $optimizedQueries,
                'news'    => $newsResults
            ], 200);

        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching news',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
}
