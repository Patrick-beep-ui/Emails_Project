<?php

namespace App\Http\Controllers;

use App\Services\QueryBuilderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Tag;
use App\Models\Keyword;
use App\Mail\UserInviteMail;
use Illuminate\Support\Facades\Mail;
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

    public function sendEmail($userId) {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $name = $user->first_name;
        $link = url("/users");

        Mail::to($user->email)->send(new UserInviteMail($name, $link));

        return response()->json([
            'success' => true,
            'message' => 'Email sent successfully'
        ], 200);
    }

    public function getDashboardStats($userId)
    {
        try {
            // Active subscriptions
            $activeSubscriptions = Tag::whereHas('userTags', function($query) use ($userId) {
                $query->where('user_tags.user_id', $userId)
                      ->where('is_active', 1);
            })->count();
            

            // Available tags
            $availableTags = Tag::count();

            // Keywords tracked across all user's active tags
            $keywordsTracked = Keyword::whereHas('tags.userTags', function($query) use ($userId) {
                $query->where('user_tags.user_id', $userId)
                      ->where('is_active', 1);
            })->count();

            /*
            // Articles this week (last 7 days)
            $articlesThisWeek = DB::table('articles')
                ->whereBetween('created_at', [now()->subDays(7), now()])
                ->count();
            */

            return response()->json([
                'stats' => [
                    'activeSubscriptions' => $activeSubscriptions,
                    'availableTags' => $availableTags,
                    'keywordsTracked' => $keywordsTracked,
                    //'articlesThisWeek' => $articlesThisWeek,
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard stats',
                'error' => $e->getMessage(),
            ]);
        }
    }

}
