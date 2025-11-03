<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('saved_news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->foreignId('news_id')->constrained('news', 'new_id')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'news_id']); // prevent duplicates
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_news');
    }
};
