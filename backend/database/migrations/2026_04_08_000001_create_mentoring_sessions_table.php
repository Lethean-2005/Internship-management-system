<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentoring_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('intern_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('internship_id')->nullable()->constrained('internships')->nullOnDelete();
            $table->string('title');
            $table->date('scheduled_date');
            $table->string('scheduled_time', 5);
            $table->unsignedSmallInteger('duration_minutes')->default(30);
            $table->string('location')->nullable();
            $table->string('meeting_link')->nullable();
            $table->string('type')->default('in_person');
            $table->string('status')->default('scheduled');
            $table->text('agenda')->nullable();
            $table->text('notes')->nullable();
            $table->text('action_items')->nullable();
            $table->text('intern_feedback')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentoring_sessions');
    }
};
