<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Home'));
Route::get('/about', fn() => Inertia::render('Test'));
Route::get('/user', fn() => Inertia::render('User'));
Route::get('/quant', fn() => Inertia::render('Quant'));