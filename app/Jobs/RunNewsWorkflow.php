<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;

class RunNewsWorkflow implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tagId;

    // Retry job up to 3 times
    public int $tries = 3;

    // Exponential backoff (seconds)
    public $backoff = [30, 60, 120];

    public function __construct(int $tagId)
    {
        $this->tagId = $tagId;
    }

    public function handle()
    {
        Artisan::call('news:process-all');
    }
}
