<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Tag;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('test:fetch')->dailyAt(time: '23:49');

$tags = Tag::all();

foreach ($tags as $tag) {
    Schedule::command("news:process {$tag->tag_id}")
        ->dailyAt('21:16')
        ->timezone('America/Managua')
        ->withoutOverlapping();
}