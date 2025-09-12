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
}
