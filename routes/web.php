<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Home'));
Route::get('/users', fn() => Inertia::render('Users'));


// Views
Route::get('/login', fn() => Inertia::render('Login'));
Route::get('/dashboard', fn() => Inertia::render('Dashboard'));
Route::get('/set-password', fn() => Inertia::render('SetPassword'));