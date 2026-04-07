<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seen_congrats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('interview_id');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'interview_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seen_congrats');
    }
};
