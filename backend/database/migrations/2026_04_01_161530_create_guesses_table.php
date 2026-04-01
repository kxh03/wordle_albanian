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
        Schema::create('guesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('daily_game_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('friend_game_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('word_id')->nullable()->constrained('words')->nullOnDelete();
            $table->string('guess', 5);
            $table->json('result');
            $table->unsignedTinyInteger('guess_number');
            $table->timestamps();
            $table->index(['daily_game_id', 'guess_number']);
            $table->index(['friend_game_id', 'guess_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guesses');
    }
};
