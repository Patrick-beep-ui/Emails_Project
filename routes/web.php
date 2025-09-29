<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Home'));
Route::get('/users', fn() => Inertia::render('User'));
Route::get('/users/add', fn() => Inertia::render('AddUser'));


// Views
Route::get('/login', fn() => Inertia::render('Login'));
Route::get('/dashboard', fn() => Inertia::render('Dashboard'));