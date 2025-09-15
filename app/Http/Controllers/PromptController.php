<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Prompt;
use Exception;

class PromptController extends Controller
{
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
}
