<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\KeywordsController;
use App\Http\Controllers\TagController;

Route::get('/users', [UserController::class, 'users']);

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
    Route::get('/', [KeywordsController::class, 'showKeywords']);
});