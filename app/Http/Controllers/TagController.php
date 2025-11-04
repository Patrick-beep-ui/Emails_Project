<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Tag;
use App\Models\User;
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

    public function requestSubscription(Request $request) {
        try  {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer|exists:users,user_id',
                'tag_id' => 'required|integer|exists:tags,tag_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tag = Tag::find($request->tag_id);
            if (!$tag) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tag not found'
                ], 404);
            }

            // Check if subscription already exists
            $existingSubscription = $tag->userTags()->where('user_tags.user_id', $request->user_id)->first();
            if ($existingSubscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription already exists or is pending'
                ], 409);
            }

            DB::beginTransaction();

            // Create pending subscription
            $tag->userTags()->attach($request->user_id, ['is_active' => 0, 'is_pending' => 1]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Subscription request sent successfully'
            ]);
        }
        catch(Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error requesting subscription',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function approveSubscription(Request $request) {
        try  {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer|exists:users,user_id',
                'tag_id' => 'required|integer|exists:tags,tag_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tag = Tag::find($request->tag_id);
            if (!$tag) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tag not found'
                ], 404);
            }

            // Check if subscription exists
            $existingSubscription = $tag->userTags()->where('user_tags.user_id', $request->user_id)->first();
            if (!$existingSubscription || $existingSubscription->pivot->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending subscription found to approve'
                ], 404);
            }

            DB::beginTransaction();

            // Approve subscription
            $tag->userTags()->updateExistingPivot($request->user_id, ['is_active' => 1, 'is_pending' => 0]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Subscription approved successfully'
            ]);
        }
        catch(Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error approving subscription',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function rejectSubscription($requestId)
    {
        try {
            // Find the pivot row by ID
            $subscription = DB::table('user_tags')->where('id', $requestId)->first();
    
            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription request not found'
                ], 404);
            }
    
            // Ensure it’s a pending subscription before deleting
            if (!$subscription->is_pending) {
                return response()->json([
                    'success' => false,
                    'message' => 'This subscription is not pending and cannot be rejected'
                ], 400);
            }
    
            DB::beginTransaction();
    
            // Delete the pivot record
            DB::table('user_tags')->where('id', $requestId)->delete();
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'Subscription request rejected successfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting subscription',
                'error' => $e->getMessage()
            ]);
        }
    }
    

    public function toggleTagStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer|exists:users,user_id',
                'tag_id' => 'required|integer|exists:tags,tag_id',
                'is_active' => 'required|boolean'
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            $tag = Tag::find($request->tag_id);
            if (!$tag) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tag not found'
                ], 404);
            }
    
            // Check if subscription exists
            $subscription = $tag->userTags()->where('user_tags.user_id', $request->user_id)->first();
            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription not found'
                ], 404);
            }
    
            // Update subscription
            $tag->userTags()->updateExistingPivot($request->user_id, [
                'is_active' => $request->is_active,
                'is_pending' => 0
            ]);
    
            return response()->json([
                'success' => true,
                'message' => $request->is_active ? 'Tag activated successfully' : 'Tag deactivated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating subscription',
                'error' => $e->getMessage()
            ]);
        }
    }
    

    
}
