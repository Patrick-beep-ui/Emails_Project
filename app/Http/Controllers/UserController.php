<?php

namespace App\Http\Controllers;

use App\Services\QueryBuilderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Exception;

class UserController extends Controller
{

    protected $queryBuilder;

    public function __construct(QueryBuilderService $queryBuilder)
    {
        $this->queryBuilder = $queryBuilder;
    }

    public function users()
    {
        try {
            // Traer todos los usuarios con columnas específicas
            $users = User::select('user_id', 'first_name', 'last_name', 'email', 'role')->get();

            return response()->json([
                'users' => $users
            ], 200);

        } catch (Exception $e) {
            // Capturar cualquier error y devolver mensaje
            return response()->json([
                'success' => false,
                'message' => 'Error getting users',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function add(Request $request)
    {
        $usersData = $request->all();
    
        $validator = Validator::make($usersData, [
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }
    
        DB::beginTransaction();
        try {
            $user = User::create([
                'first_name' => $usersData['first_name'],
                'last_name'  => $usersData['last_name'],
                'email'      => $usersData['email'],
                //'password'   => bcrypt($usersData['password']),
                'password'   => 'test-password',
                'role'       => 'user'
            ]);
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'User added successfully',
                'user'    => $user
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error adding user',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function tags($userId) {
        try {
            $validator = Validator::make(['userId' => $userId], [
                'userId' => 'required|integer|exists:users,user_id'
            ]);

            if( $validator->fails() ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Bring tags associated with the user
            $tags = $user->tags()->select('tags.tag_id', 'name', 'description')->get();

            return response()->json([
                'tags'    => $tags
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting user tags',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function testQueryBuilder(Request $request) {
        $query = User::query();

        $users = $this->queryBuilder->build($query, $request->only('role','email'))->get();

        return response()->json([
            'users' => $users
        ], 200);
    }

    public function groupKeywords($tagId) {
        try {
            $validator = Validator::make(['tagId' => $tagId], [
                'tagId' => 'required|integer|exists:tags,tag_id'
            ]);

            if( $validator->fails() ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $user = User::find($tagId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tag not found'
                ], 404);
            }

            // Bring keywords associated with the tag
            $keywords = $user->keywords()->pluck('keyword')->toArray();

            $groupedQueries = $this->queryBuilder->groupKeywords($keywords, 10);

            return response()->json([
                'queries'    => $groupedQueries
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error grouping keywords',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
