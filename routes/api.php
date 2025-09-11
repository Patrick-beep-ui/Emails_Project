<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;

Route::get('/users', [UserController::class, 'users']);

Route::get('/test', function() {
    return response()->json(['message' => 'Endpoint Working']);
});

