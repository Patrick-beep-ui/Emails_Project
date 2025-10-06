<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CcRecipient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


use Exception;

class CCRecipientsController extends Controller
{
    public function show($userId) {
        try {
            $recipients = CcRecipient::where('user_id', $userId)->get();

            return response()->json([
                'recipients' => $recipients
            ]);
        }
        catch(Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting user cc recipients',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function add(Request $request) {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,user_id|integer',
                'recipients' => 'required|array|min:0', // allow empty array to remove all
                'recipients.*.email_address' => 'required|email|max:255'
            ]);
    
            if($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fields validation failed',
                    'errors' => $validator->errors() 
                ], 422);
            }
    
            DB::beginTransaction();
    
            // Extract requested emails from the array of objects
            $requestedEmails = array_map(fn($r) => $r['email_address'], $request->recipients);
    
            $existing = CcRecipient::where('user_id', $request->user_id)
                                    ->pluck('email_address')
                                    ->toArray();
    
            // Determine which emails to add and which to remove
            $toAdd = array_diff($requestedEmails, $existing);     // Request emails not in DB
            $toRemove = array_diff($existing, $requestedEmails);  // DB emails not in Request
    
            // Add new emails
            foreach ($toAdd as $email) {
                CcRecipient::create([
                    'user_id' => $request->user_id,
                    'email_address' => $email
                ]);
            }
    
            // Remove deleted emails
            if (!empty($toRemove)) {
                CcRecipient::where('user_id', $request->user_id)
                           ->whereIn('email_address', $toRemove)
                           ->delete();
            }
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'CC recipients updated successfully'
            ], 201);
    
        } catch(Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating CC recipients',
                'error' => $e->getMessage()
            ]);
        }
    }
    
}
