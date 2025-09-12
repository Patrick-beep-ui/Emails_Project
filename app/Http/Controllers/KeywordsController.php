<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Keyword;
use App\Models\Tag;
use Illuminate\Support\Facades\Validator;
use Exception;

class KeywordsController extends Controller
{

    public function readJSON() {
        $path = app_path('Models/keywords.json');
        $keywordsJson = file_get_contents($path);
        $keywordsArr = json_decode($keywordsJson, true);

        if(!is_array($keywordsArr)) {
            return response()->json([
                'success' => false,
                'message' => 'Inavlid JSON format'
            ]);
        }

        // Returns planned array with all keywords
        //return array_merge(...array_values($keywordsArr));

        return $keywordsArr;

    } 

    public function addKeywordsFromJSON() {
        try {
            $keywordsArr = $this->readJSON(); 
    
            // validation
            foreach ($keywordsArr as $category => $keywords) {
                $validator = Validator::make(['keywords' => $keywords], [
                    'keywords' => 'required|array',
                    'keywords.*' => 'string|min:2|max:255'
                ]);
    
                if ($validator->fails()) {
                    return response()->json([
                        'success' => false,
                        'category' => $category,
                        'errors' => $validator->errors(),
                    ], 422);
                }
                
                $tag = Tag::firstOrCreate(
                    ['name' => $category],
                    ['description' => $category]
                );

                foreach ($keywords as $keyword) {
                    Keyword::firstOrCreate(
                        [
                            'tag_id'  => $tag->tag_id,
                            'content' => $keyword
                        ]
                    );
                }
            }
    
            return response()->json([
                'message' => 'Keywords and Categories Added Succesfully', 
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting users',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    
    public function showKeywords() {
        try {
            $tags = Tag::all();

            return response()->json([
                'tags' => $tags
            ]);
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting keywords',
                'error' => $e->getMessage()
            ]);
        }
    }
}
