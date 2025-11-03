<?php

namespace App\Http\Controllers;

use App\Services\QueryBuilderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Tag;
use App\Models\Keyword;
use App\Models\CcRecipient;
use App\Models\PasswordResetToken;

use App\Mail\UserInviteMail;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\SetPasswordMail;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
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
            $users = User::select('user_id', 'first_name', 'last_name', 'email', 'role')
                ->with(['tags' => function ($query) {
                    $query->wherePivot('is_active', 1)
                          ->select('tags.tag_id', 'tags.name'); 
                }])
                ->get()
                ->map(function ($user) {
                    return [
                        'user_id'    => $user->user_id,
                        'first_name' => $user->first_name,
                        'last_name'  => $user->last_name,
                        'email'      => $user->email,
                        'role'       => $user->role,
                        'tags'       => $user->tags->map(function ($tag) {
                            return [
                                'tag_id' => $tag->tag_id,
                                'name'   => $tag->name,
                                'status' => 'active', // because we filtered is_active
                            ];
                        })->values(), // clean array
                    ];
                });
    
            return response()->json([
                'users' => $users
            ], 200);
    
        } catch (Exception $e) {
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
            'tags'       => 'sometimes|array',
            'tags.*'     => 'integer|exists:tags,tag_id'
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
                //'password'   => bycrypt(bin2hex(random_bytes(8))), // Random 16 char password
                'password'   => bcrypt('password'), // Temporary fixed password
                'role'       => 'user'
            ]);

            if ($request->has('tags')) {
                $user->tags()->attach($request->tags, ['is_active' => 1]);
            }

            $this->sendInviteEmail($user->user_id);
    
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
        try {
            $user = User::find($userId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
    
            $name = $user->first_name;
            $link = url("/users");

            $recipients = CcRecipient::where('user_id', $userId)->get();

            $ccEmails = $recipients->pluck('email_address')->toArray();
    
            Mail::to($user->email)->send(new UserInviteMail($name, $link, $ccEmails));
    
            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully'
            ], 200);
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending email',
                'error'   => $e->getMessage()
            ], 500);
        }
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

            // Articles received in the last 7 days
            $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->startOfDay();
            $endOfWeek   = Carbon::now()->endOfWeek(Carbon::SUNDAY)->endOfDay();
            
            $newsThisWeek = DB::table('news as n')
                ->join('emails_content as ec', 'ec.news_id', '=', 'n.new_id')
                ->join('emails as e', 'e.email_id', '=', 'ec.email_id')
                ->join('users as u', 'e.recipient', '=', 'u.user_id')
                ->where('u.user_id', $userId)
                ->whereBetween('n.created_at', [$startOfWeek, $endOfWeek])
                ->distinct()
                ->count('n.new_id');
            

            return response()->json([
                'stats' => [
                    'activeSubscriptions' => $activeSubscriptions,
                    'availableTags' => $availableTags,
                    'keywordsTracked' => $keywordsTracked,
                    'newsThisWeek' => $newsThisWeek,
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
    public function showTagRequests() {
        try {
            $requests = DB::table('user_tags')
                ->join('users', 'user_tags.user_id', '=', 'users.user_id')
                ->join('tags', 'user_tags.tag_id', '=', 'tags.tag_id')
                ->where('user_tags.is_pending', 1)
                ->get([
                    'user_tags.id',
                    'tags.tag_id',
                    'tags.name',
                    'tags.description',
                    'users.user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'user_tags.created_at',
                ]);
    
            return response()->json([
                'requests' => $requests
            ]);
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting tag requests',
                'error' => $e->getMessage()
            ]);
        }
    }
    
    public function sendInviteEmail($userId)
    {
        try {
            $user = User::findOrFail($userId);

            // Create token
            $token = Str::random(64);
    
            PasswordResetToken::updateOrCreate(
                ['user_id' => $user->user_id],
                ['token' => $token, 'created_at' => now()]
            );
    
            $url = config('app.url') . "/set-password?token={$token}"; 
            // 👆 Example frontend route: http://localhost:5173/set-password?token=xxxx
    
            Mail::to($user->email)->send(new SetPasswordMail($user, $url));
    
            return response()->json(['message' => 'Set password email sent successfully']);
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending invite email',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function setPassword(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
                'password' => 'required|string|min:8',
            ]);
    
            $record = PasswordResetToken::where('token', $request->token)->first();
    
            if (!$record || Carbon::parse($record->created_at)->addHours(24)->isPast()) {
                return response()->json(['message' => 'Invalid or expired token'], 400);
            }
    
            $user = User::find($record->user_id);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }
    
            $user->update(['password' => Hash::make($request->password)]);
    
            // Delete the token after use
            $record->delete();
    
            return response()->json(['message' => 'Password updated successfully']);
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending updating password',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

}
