<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\KeywordsController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\PromptController;



Route::prefix('/users')->group(function() {
    Route::get('/', [UserController::class, 'users']);
    Route::post('/add', [UserController::class, 'add']);

    Route::get('/tags/{id}', [UserController::class, 'tags']);
});

Route::get('/test', function() {
    return response()->json(['message' => 'Endpoint Working']);
});

//Route::get('/keywords', [KeywordsController::class, 'addKeywords']);

// Tags Routes
Route::prefix('/tags')->group(function () {
    Route::get('/', [TagController::class, 'showTags']);
});

// Keywords Routes
Route::prefix('/keywords')->group(function () {
    Route::get('/', [KeywordsController::class, 'showKeywordsList']);
    Route::get('/{tag}', [KeywordsController::class, 'showKeywordsByTag']);
    Route::get('/group/{tagId}', [KeywordsController::class, 'groupKeywords']);
    Route::post('/addJson', [KeywordsController::class, 'addKeywordsFromJSON']);
});

//Propmts Routes
Route::prefix('/propmts')->group(function() {
    Route::get('/', [PromptController::class, 'showPropmts']);
    //Route::get('/add', [PromptController::class, 'addPromptsFromJSON']);
});