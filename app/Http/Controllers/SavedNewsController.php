<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\News;
use Exception;

class SavedNewsController extends Controller
{
    public function saveNews(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'news_id' => 'required|exists:news,new_id',
        ]);

        try {
            $user = User::findOrFail($request->user_id);

            if ($user->savedNews()->where('news_id', $request->news_id)->exists()) {
                return response()->json(['message' => 'News already saved'], 200);
            }

            $user->savedNews()->attach($request->news_id);

            return response()->json(['message' => 'News saved successfully'], 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function unsaveNews(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'news_id' => 'required|exists:news,new_id',
        ]);

        try {
            $user = User::findOrFail($request->user_id);
            $user->savedNews()->detach($request->news_id);

            return response()->json(['message' => 'News removed from saved list'], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getSavedNews($userId)
    {
        try {
            $user = User::with(['savedNews.sources'])->findOrFail($userId);
            return response()->json([
                'success' => true,
                'saved_news' => $user->savedNews()->orderBy('published_at', 'desc')->paginate(20)
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching saved news',
                'error' => $e->getMessage()
            ]);
        }
    }
}
