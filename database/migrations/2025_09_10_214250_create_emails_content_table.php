<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('emails_content', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_id')->constrained('emails', 'email_id')->cascadeOnDelete();
            $table->foreignId('news_id')->constrained('news', 'new_id')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emails_content');
    }
};
