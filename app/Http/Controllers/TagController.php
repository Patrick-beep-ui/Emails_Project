<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;
use Exception;

class TagController extends Controller
{
    public function showTags() {
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

    public function keywordsTagsInfo() {
        try {
            $tags = Tag::whereHas('keywords')
                        ->withCount('keywords')
                        ->with('keywords:keyword_id,content,tag_id') // Include the keyword names
                        ->get(['tag_id', 'name', 'description']);
    
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

    public function getUserTags($userId)
    {
        try {
            $tags = Tag::whereHas('userTags', function($query) use ($userId) {
                            $query->where('user_tags.user_id', $userId);
                        })
                        ->withCount('keywords')
                        ->with('keywords:keyword_id,content,tag_id')
                        ->with(['userTags' => function($query) use ($userId) {
                            $query->where('user_tags.user_id', $userId)
                                  ->withPivot('is_active', 'is_pending'); 
                        }])
                        ->get(['tag_id', 'name', 'description']);
    
            // Flatten the pivot info
            $tags = $tags->map(function($tag) {
                $pivot = $tag->userTags->first()?->pivot;
                return [
                    'tag_id' => $tag->tag_id,
                    'name' => $tag->name,
                    'description' => $tag->description,
                    'keywords_count' => $tag->keywords_count,
                    'is_active' => $pivot?->is_active ?? 0,
                    'is_pending' => $pivot?->is_pending ?? 0,
                    'keywords' => $tag->keywords,
                ];
            });
    
            return response()->json([
                'tags' => $tags
            ]);
        } catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting user tags',
                'error' => $e->getMessage()
            ]);
        }
    }
    
    
}
