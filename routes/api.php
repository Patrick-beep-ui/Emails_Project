<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\KeywordsController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\CCRecipientsController;
use App\Http\Controllers\SavedNewsController;

// Login Routes
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::prefix('/users')->group(function() {
    // Users Crud
    Route::get('/', [UserController::class, 'users']);
    Route::post('/add', [UserController::class, 'add']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'delete']);


    Route::get('/tags/{id}', [UserController::class, 'tags']);
    Route::get('/user/stats/{id}', [UserController::class, 'getDashboardStats']);
    Route::get('/subscriptions/requests', [UserController::class, 'showTagRequests']);

    //test sending email
    Route::get('/send-email/{userId}', [UserController::class, 'sendEmail']);
    Route::get('/send-invite/{userId}', [UserController::class, 'sendInviteEmail']);
    Route::post('/set-password', [UserController::class, 'setPassword']);

});

Route::get('/test', function() {
    return response()->json(['message' => 'Endpoint Working']);
});

//Route::get('/keywords', [KeywordsController::class, 'addKeywords']);

// Tags Routes
Route::prefix('/tags')->group(function () {
    Route::get('/', [TagController::class, 'showTags']);
    Route::get('/info', [TagController::class, 'keywordsTagsInfo']);
    Route::get('/user/{userId}', [TagController::class, 'getUserTags']);
    Route::post('/subscription/request', [TagController::class, 'requestSubscription']);
    Route::post('/subscription/approve', [TagController::class, 'approveSubscription']);
    Route::post('/subscription/reject/{requestId}', [TagController::class, 'rejectSubscription']);
    Route::post('/toggle-status', [TagController::class, 'toggleTagStatus']);
});

// Keywords Routes
Route::prefix('/keywords')->group(function () {
    Route::get('/', [KeywordsController::class, 'showKeywordsList']);
    Route::get('/{tag}', [KeywordsController::class, 'showKeywordsByTag']);
    Route::get('/group/{tagId}', [KeywordsController::class, 'groupKeywords']);
    Route::post('/addJson', [KeywordsController::class, 'addKeywordsFromJSON']);
});

//Propmts Routes
Route::prefix('/prompts')->group(function() {
    Route::get('/', [PromptController::class, 'showPropmts']);
    //Route::get('/add', [PromptController::class, 'addPromptsFromJSON']);
    Route::get('/testAI', [PromptController::class, 'sortModule']);
    Route::get('/optimize/{tagId}', [PromptController::class, 'optimizeModule'] );
    Route::get('/search/{tagId}', [PromptController::class, 'searchNewsModule'] );
    Route::get('/generate/{tagId}', [PromptController::class, 'cleanNewsModule'] );
    Route::get('/view-clean/{tagId}', [PromptController::class, 'viewCleanNews']);
});


// News Routes
Route::prefix('/news')->group(function() {
    Route::get('/user/{userId}', [NewsController::class, 'getUserNews'] );
});

// CC Recipients
Route::prefix('/recipients')->group(function() {
    Route::get('/{userId}', [CCRecipientsController::class, 'show']);
    Route::post('/add', [CCRecipientsController::class, 'add']);
});

//Saved News
Route::prefix('saved-news')->group(function () {
    Route::post('/save', [SavedNewsController::class, 'saveNews']);
    Route::post('/unsave', [SavedNewsController::class, 'unsaveNews']);
    Route::get('/user/{userId}', [SavedNewsController::class, 'getSavedNews']);
});
